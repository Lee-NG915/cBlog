import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("pipeline", Path(__file__).parents[1] / "scripts/pipeline.py")
pipeline = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(pipeline)


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.now = 1000.0
        self.db_path = self.root / "private.sqlite"
        self.ledger = pipeline.Ledger(self.db_path, initialize=True, clock=lambda: self.now)
        self.run_cmd("case-add", id="case-a", title="A synthetic technical case")
        self.counter = 0

    def tearDown(self):
        self.ledger.close()
        self.tmp.cleanup()

    def run_cmd(self, command, **data):
        return self.ledger.execute(command, data, self.root)

    def write(self, name, data):
        self.counter += 1
        p = self.root / f"{self.counter}-{name}"
        p.write_bytes(data if isinstance(data, bytes) else data.encode())
        return str(p)

    def add(self, aid, kind, text="synthetic evidence", producers=None, deps=None):
        p = self.write(aid + ".md", text)
        return self.run_cmd("artifact-add", id=aid, case_id="case-a", kind=kind, path=p,
                            producers=producers or ["author"], dependencies=deps or [])

    def review(self, stage, ids=None, verdict="passed", reviewer="critic", **extra):
        args = {"stage": stage, "reviewer": reviewer, "verdict": verdict,
                "checks": {k: True for k in pipeline.CHECKS[stage]}, "report_path": self.write("review.md", "Actual checks and limitations."), **extra}
        if stage != "package":
            args.update(case_id="case-a", artifact_ids=ids)
        return self.run_cmd("review-add", **args)

    def package(self, image=False, approved=True):
        self.add("evidence", "evidence", producers=["researcher"])
        self.add("claims", "claims", deps=["evidence"])
        image_path = None
        if image:
            # The existing offline CLI checks this PNG header. No real service is contacted.
            image_path = self.write("diagram.png", b"\x89PNG\r\n\x1a\n" + b"synthetic fixture")
            self.run_cmd("artifact-add", id="image", case_id="case-a", kind="image", path=image_path,
                         producers=["artist"], dependencies=["claims"])
        body = "# A\n\nAn explicit synthetic example.\n" + (f"![Diagram]({image_path})\n" if image else "")
        self.add("article", "article", body, deps=["claims"])
        self.add("script", "script", "# Spoken example\nFull reasoning.", deps=["claims"])
        ids = ["article", "script", "evidence", "claims"]
        self.review("content", ids)
        if image:
            self.review("visual", ["image", "claims"])
        self.freeze_spec = {"id": "package-a", "case_id": "case-a", "artifacts": {k: k for k in ids},
                            "assets": ["image"] if image else [], "titles": {"article": "Article", "script": "Script"},
                            "target": {"base_url": "https://blog.example/api/v1/automation", "topic_id": "engineering", "tags": ["Skill"]}}
        result = self.run_cmd("freeze", **self.freeze_spec)
        if approved:
            self.review("package", package_id="package-a")
        return result

    def receipt_spec(self, kind, version=1, state="draft"):
        plan = self.ledger.package("package-a")["payload"]["plans"][kind]
        assets = {}
        for sha, a in plan["assets"].items():
            assets[sha] = {"id": sha, "sha256": sha, "bytes": a["bytes"], "mime": a["mime"],
                           "url": "/api/v1/assets/" + sha, "readback_url": "/api/v1/automation/assets/" + sha}
        body = plan["fields"]["body"]
        for o in reversed(plan["occurrences"]):
            body = body[:o["start"]] + assets[o["sha256"]]["url"] + body[o["end"]:]
        fields = {**plan["fields"], "body": body}
        sha = pipeline.digest(body.encode())
        verified = {"id": "note-" + kind, "version": version, "fields": fields, "input_sha256": plan["input_sha256"],
                    "body_sha256": sha, "verified_at": "2026-01-01T00:00:00Z"}
        manifest = {"schema": 1, "base_url": "https://blog.example/api/v1/automation", "sourceKey": plan["sourceKey"], "assets": assets, "verified": verified}
        receipt = {"status": "verified", "changed": True, "sourceKey": plan["sourceKey"], "version": version, "body_sha256": sha}
        remote = {**fields, "sourceKey": plan["sourceKey"], "id": "note-" + kind, "version": version, "body_sha256": sha,
                  "state": state, "visibility": "owner", "writable": True}
        return {"package_id": "package-a", "kind": kind, "cli_manifest_path": self.write("manifest.json", json.dumps(manifest)),
                "cli_receipt_path": self.write("receipt.json", json.dumps(receipt)), "readback_path": self.write("readback.json", json.dumps({"data": remote}))}

    def ui(self, kind, version=1, reviewer="viewer"):
        return self.run_cmd("ui-add", package_id="package-a", kind=kind, reviewer=reviewer, note_id="note-" + kind,
                            version=version, report_path=self.write("ui.md", "Checked actual desktop and mobile rendering."),
                            checks={k: True for k in pipeline.CHECKS["ui"]})

    def test_cli_roundtrip_and_private_permissions(self):
        spec = self.write("case.json", json.dumps({"id": "case-b", "title": "Second case"}))
        with contextlib.redirect_stdout(io.StringIO()) as out:
            self.assertEqual(pipeline.main(["--db", str(self.db_path), "case-add", "--spec", spec]), 0)
        self.assertEqual(json.loads(out.getvalue())["source_keys"]["article"], "case-b-article")
        self.assertEqual(self.db_path.stat().st_mode & 0o777, 0o600)
        self.ledger.close()
        self.ledger = pipeline.Ledger(self.db_path, clock=lambda: self.now)
        self.assertEqual(len(self.run_cmd("status")["cases"]), 2)

    def test_claim_generation_rejects_late_worker(self):
        self.run_cmd("task-add", id="write", case_id="case-a", stage="writing")
        first = self.run_cmd("task-claim", task_id="write", worker="first", lease_seconds=10)
        self.now += 11
        second = self.run_cmd("task-claim", task_id="write", worker="second", lease_seconds=10)
        self.assertEqual(second["generation"], first["generation"] + 1)
        with self.assertRaises(pipeline.GateError):
            self.run_cmd("task-finish", task_id="write", worker="first", generation=first["generation"], outputs=[])
        self.run_cmd("task-finish", task_id="write", worker="second", generation=second["generation"], outputs=[])

    def test_second_connection_cannot_claim_active_task(self):
        self.run_cmd("task-add", id="write", case_id="case-a", stage="writing")
        self.run_cmd("task-claim", task_id="write", worker="first")
        other = pipeline.Ledger(self.db_path, clock=lambda: self.now)
        try:
            with self.assertRaises(pipeline.GateError):
                other.execute("task-claim", {"task_id": "write", "worker": "second"})
        finally:
            other.close()

    def test_changed_input_rejects_completion_atomically(self):
        self.add("source", "source")
        self.run_cmd("task-add", id="write", case_id="case-a", stage="writing", inputs=["source"])
        t = self.run_cmd("task-claim", task_id="write", worker="writer")
        self.add("source", "source", "updated source")
        with self.assertRaises(pipeline.GateError):
            self.run_cmd("task-finish", task_id="write", worker="writer", generation=t["generation"], outputs=[])
        self.assertEqual(self.ledger.one("SELECT state FROM tasks WHERE id='write'")["state"], "running")
        self.assertEqual(self.run_cmd("task-stop", task_id="write", worker="writer", generation=t["generation"],
                                      state="rework", reason="Input changed")["state"], "rework")

    def test_output_inherits_inputs_and_reopened_upstream_invalidates_it(self):
        self.add("source", "source")
        self.run_cmd("task-add", id="write", case_id="case-a", stage="writing", inputs=["source"])
        t = self.run_cmd("task-claim", task_id="write", worker="writer")
        self.run_cmd("task-finish", task_id="write", worker="writer", generation=t["generation"],
                     outputs=[{"id": "article", "kind": "article", "path": self.write("article.md", "draft"), "producers": ["writer"]}])
        self.assertEqual(json.loads(self.ledger.artifact("article")["deps"])[0]["id"], "source")
        self.run_cmd("task-requeue", task_id="write", reason="New evidence requires rewriting")
        with self.assertRaises(pipeline.GateError):
            self.ledger.ref("article", "case-a")

    def test_edit_task_can_supersede_its_old_draft_without_cycle(self):
        self.add("source", "source")
        self.add("article", "article", "version one", deps=["source"])
        self.run_cmd("task-add", id="revise", case_id="case-a", stage="writing", inputs=["article"])
        t = self.run_cmd("task-claim", task_id="revise", worker="editor")
        self.run_cmd("task-finish", task_id="revise", worker="editor", generation=t["generation"],
                     outputs=[{"id": "article", "kind": "article", "path": self.write("v2.md", "version two"), "producers": ["editor"]}])
        self.assertEqual(self.ledger.ref("article", "case-a")["version"], 2)
        self.assertEqual(set(json.loads(self.ledger.artifact("article")["producers"])), {"author", "editor"})
        self.add("source", "source", "new source")
        with self.assertRaises(pipeline.GateError):
            self.ledger.ref("article", "case-a")

    def test_edit_task_replaces_article_and_script_as_one_group(self):
        self.add("evidence", "evidence", producers=["researcher"])
        self.add("article", "article", "first article", producers=["article-writer"], deps=["evidence"])
        self.add("script", "script", "first script", producers=["script-writer"], deps=["article"])
        self.run_cmd("task-add", id="revise-both", case_id="case-a", stage="writing", inputs=["article", "script"])
        t = self.run_cmd("task-claim", task_id="revise-both", worker="editor")
        result = self.run_cmd("task-finish", task_id="revise-both", worker="editor", generation=t["generation"],
                             outputs=[{"id": kind, "kind": kind, "path": self.write(kind + "-v2.md", "revised " + kind),
                                       "producers": ["editor"]} for kind in ("article", "script")])
        self.assertEqual(len(result["outputs"]), 2)
        for kind in ("article", "script"):
            self.assertEqual(self.ledger.ref(kind, "case-a")["version"], 2)
            self.assertEqual([r["id"] for r in json.loads(self.ledger.artifact(kind)["deps"])], ["evidence"])
            self.assertTrue({"article-writer", "script-writer", "editor"} <= set(json.loads(self.ledger.artifact(kind)["producers"])))
        claimed = json.loads(self.ledger.one("SELECT claimed_inputs FROM tasks WHERE id='revise-both'")["claimed_inputs"])
        self.assertEqual({(r["id"], r["version"]) for r in claimed}, {("article", 1), ("script", 1)})
        self.add("evidence", "evidence", "changed evidence", producers=["researcher"])
        for kind in ("article", "script"):
            with self.assertRaises(pipeline.GateError):
                self.ledger.ref(kind, "case-a")

    def test_multiple_edit_rounds_preserve_original_producer_task_validity(self):
        self.add("source", "source")
        self.run_cmd("task-add", id="original-write", case_id="case-a", stage="writing", inputs=["source"])
        claim = self.run_cmd("task-claim", task_id="original-write", worker="writer")
        self.run_cmd("task-finish", task_id="original-write", worker="writer", generation=claim["generation"],
                     outputs=[{"id":"article", "kind":"article", "path":self.write("first.md", "article one"), "producers":["writer"]}])
        self.add("script", "script", "script one", deps=["article"])
        for n in (2, 3):
            tid = "edit-" + str(n)
            self.run_cmd("task-add", id=tid, case_id="case-a", stage="writing", inputs=["article", "script"])
            claim = self.run_cmd("task-claim", task_id=tid, worker="editor")
            self.run_cmd("task-finish", task_id=tid, worker="editor", generation=claim["generation"],
                         outputs=[{"id":kind, "kind":kind, "path":self.write(kind+str(n)+".md", "revision "+str(n)), "producers":["editor"]} for kind in ("article", "script")])
            for kind in ("article", "script"):
                self.assertEqual(self.ledger.ref(kind, "case-a")["version"], n)
        self.run_cmd("task-requeue", task_id="original-write", reason="Reopen upstream production")
        for kind in ("article", "script"):
            with self.assertRaises(pipeline.GateError):
                self.ledger.ref(kind, "case-a")

    def test_artifacts_are_immutable_and_dependency_cycles_rejected(self):
        self.add("source", "source")
        self.add("claims", "claims", deps=["source"])
        with self.assertRaises(pipeline.GateError):
            self.add("source", "source", "cycle", deps=["claims"])
        path = json.loads(self.ledger.artifact("claims")["file"])["path"]
        Path(path).write_text("changed in place")
        with self.assertRaises(pipeline.GateError):
            self.ledger.ref("claims", "case-a")
        with self.assertRaises(pipeline.GateError):
            self.run_cmd("artifact-add", id="claims", case_id="case-a", kind="claims", path=path, producers=["author"])

    def test_self_review_and_incomplete_checks_rejected(self):
        self.add("article", "article")
        with self.assertRaises(pipeline.GateError):
            self.review("content", ["article"], reviewer="author")
        with self.assertRaises(pipeline.GateError):
            self.review("content", ["article"], checks={"privacy": True})

    def test_package_requires_independent_frozen_payload_review(self):
        self.package(approved=False)
        with self.assertRaises(pipeline.GateError):
            self.run_cmd("package-check", package_id="package-a")
        self.review("package", package_id="package-a")
        self.assertTrue(self.run_cmd("package-check", package_id="package-a")["upload_ready"])

    def test_new_input_invalidates_dependent_reviews_and_package(self):
        self.package()
        self.add("evidence", "evidence", "new evidence", producers=["researcher"])
        status = self.run_cmd("status", case_id="case-a")["cases"][0]["delivery"]
        self.assertEqual(status["state"], "needs_revalidation")

    def test_later_rejection_overrides_earlier_pass(self):
        self.package()
        self.review("content", ["article", "script", "evidence", "claims"], verdict="rework")
        with self.assertRaises(pipeline.GateError):
            self.run_cmd("package-check", package_id="package-a")

    def test_frozen_id_cannot_change_target(self):
        self.package()
        self.freeze_spec["target"]["tags"] = ["Changed"]
        with self.assertRaises(pipeline.GateError):
            self.run_cmd("freeze", **self.freeze_spec)

    def test_new_package_supersedes_older_upload_permission(self):
        self.package()
        self.run_cmd("freeze", **{**self.freeze_spec, "id": "package-b"})
        with self.assertRaises(pipeline.GateError):
            self.run_cmd("package-check", package_id="package-a")
        self.review("package", package_id="package-b")
        self.assertTrue(self.run_cmd("package-check", package_id="package-b")["upload_ready"])

    def test_image_symlink_retarget_is_rejected_before_upload(self):
        self.package(image=True)
        original = Path(json.loads(self.ledger.artifact("image")["file"])["path"])
        link = self.root / "concept.png"
        link.symlink_to(original)
        self.add("article", "article", "# Article\n![Diagram](concept.png)", deps=["claims"])
        self.review("content", ["article", "script", "evidence", "claims"])
        self.run_cmd("freeze", **{**self.freeze_spec, "id": "package-b"})
        self.review("package", package_id="package-b")
        self.assertTrue(self.run_cmd("package-check", package_id="package-b")["upload_ready"])
        for data in (original.read_bytes(), b"\x89PNG\r\n\x1a\nother synthetic image"):
            target = Path(self.write("replacement.png", data))
            link.unlink()
            link.symlink_to(target)
            with self.assertRaises(pipeline.GateError):
                self.run_cmd("package-check", package_id="package-b")
            with self.assertRaises(pipeline.GateError):
                self.run_cmd("upload-begin", package_id="package-b", kind="article", operator="coordinator")
        link.unlink()
        link.symlink_to(self.root / "missing.png")
        self.run_cmd("case-add", id="case-b", title="Another independent case")
        status = self.run_cmd("status")
        self.assertEqual(status["cases"][0]["delivery"]["state"], "needs_revalidation")
        self.assertEqual(status["cases"][1]["delivery"]["state"], "not_frozen")

    def test_two_drafts_partial_machine_and_ui_are_distinct(self):
        self.package(image=True)
        r = self.run_cmd("receipt-add", **self.receipt_spec("article"))
        self.assertEqual(r["state"], "partial_saved")
        r = self.run_cmd("receipt-add", **self.receipt_spec("script"))
        self.assertEqual(r["state"], "pending_ui")
        self.assertEqual(self.ui("article")["state"], "pending_ui")
        self.assertEqual(self.ui("script")["state"], "delivered")
        self.run_cmd("receipt-add", **self.receipt_spec("article", version=2))
        self.assertEqual(self.run_cmd("status")["cases"][0]["delivery"]["state"], "pending_ui")

    def test_machine_readback_rejects_live_or_tampered_body(self):
        self.package()
        with self.assertRaises(Exception) as caught:
            self.run_cmd("receipt-add", **self.receipt_spec("article", state="published"))
        self.assertEqual(caught.exception.code, "NOT_DRAFT")
        s = self.receipt_spec("article")
        p = Path(s["readback_path"])
        d = json.loads(p.read_text())
        d["data"]["body"] += "tampered"
        p.write_text(json.dumps(d))
        with self.assertRaises(Exception) as caught:
            self.run_cmd("receipt-add", **s)
        self.assertEqual(caught.exception.code, "READBACK_MISMATCH")
        self.assertEqual(self.ledger.db.execute("SELECT count(*) FROM receipts").fetchone()[0], 0)

    def test_manifest_pending_or_foreign_target_cannot_be_verified(self):
        self.package()
        for changes in ({"pending": {"payload": {}}}, {"pending": {}}, {"base_url": "https://other.example/api/v1/automation"}):
            s = self.receipt_spec("article")
            p = Path(s["cli_manifest_path"])
            d = json.loads(p.read_text())
            d.update(changes)
            p.write_text(json.dumps(d))
            with self.assertRaises(pipeline.GateError):
                self.run_cmd("receipt-add", **s)

    def test_ui_reviewer_must_be_independent_and_match_version(self):
        self.package()
        self.run_cmd("receipt-add", **self.receipt_spec("article"))
        with self.assertRaises(pipeline.GateError):
            self.ui("article", reviewer="author")
        with self.assertRaises(pipeline.GateError):
            self.ui("article", version=2)

    def test_blank_or_non_string_role_names_never_approve_delivery(self):
        self.package()
        self.run_cmd("receipt-add", **self.receipt_spec("article"))
        for reviewer in ("", "   ", None, 123):
            with self.assertRaises(pipeline.GateError):
                self.ui("article", reviewer=reviewer)
            with self.assertRaises(pipeline.GateError):
                self.review("content", ["article", "script", "evidence", "claims"], reviewer=reviewer)
        self.assertEqual(self.ledger.db.execute("SELECT count(*) FROM ui_reviews").fetchone()[0], 0)

    def test_upload_session_does_not_expire_or_release_uncertain_result(self):
        self.package()
        session = self.run_cmd("upload-begin", package_id="package-a", kind="article", operator="coordinator")
        self.run_cmd("upload-end", session_id=session["session_id"], operator="coordinator", outcome="uncertain")
        self.now += 90000
        with self.assertRaises(pipeline.GateError):
            self.run_cmd("upload-begin", package_id="package-a", kind="script", operator="coordinator")
        with self.assertRaises(pipeline.GateError):
            self.run_cmd("upload-begin", package_id="package-a", kind="article", operator="coordinator")
        resumed = self.run_cmd("upload-begin", package_id="package-a", kind="article", operator="coordinator",
                               previous_process_stopped=True, recovery_report_path=self.write("recovery.md", "Old process is stopped; original pending manifest retained."))
        self.assertEqual(resumed["session_id"], session["session_id"])
        self.run_cmd("receipt-add", **self.receipt_spec("article"))
        self.assertTrue(self.run_cmd("upload-end", session_id=session["session_id"], operator="coordinator", outcome="verified")["released"])

    def test_outstanding_upload_preserves_recovery_inputs_and_cannot_claim_delivery(self):
        self.package()
        for kind in ("article", "script"):
            self.run_cmd("receipt-add", **self.receipt_spec(kind))
            self.ui(kind)
        self.run_cmd("upload-begin", package_id="package-a", kind="article", operator="coordinator")
        self.assertEqual(self.run_cmd("status")["cases"][0]["delivery"]["state"], "upload_result_pending")
        with self.assertRaises(pipeline.GateError):
            self.run_cmd("freeze", **{**self.freeze_spec, "id": "package-b"})
        with self.assertRaises(pipeline.GateError):
            self.add("evidence", "evidence", "new evidence")
        with self.assertRaises(pipeline.GateError):
            self.ui("article")


if __name__ == "__main__":
    unittest.main()
