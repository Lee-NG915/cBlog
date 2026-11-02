import contextlib
import copy
import importlib.util
import io
import json
import os
from pathlib import Path
import socket
import ssl
import tempfile
import unittest
from unittest.mock import patch
import urllib.error

SPEC = importlib.util.spec_from_file_location("cblog_draft", Path(__file__).parents[1] / "scripts/cblog_draft.py")
c = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(c)
PNG = b"\x89PNG\r\n\x1a\n" + b"mock-image-bytes"
BASE = "https://draft.example.test/api/v1/automation"
TOKEN = "synthetic-test-secret-never-real"

class Response(io.BytesIO):
    def __enter__(self):
        return self
    def __exit__(self, *args):
        self.close()

class HTTPService:
    """Exercise urllib Request/HTTPError and server-side idempotency without networking."""
    def __init__(self):
        self.notes, self.assets, self.mutations, self.calls = {}, {}, {}, []
        self.lose_receipts, self.bad_asset, self.bad_body = 0, False, False
        self.reject_put = None
        self.versions = 0

    def error(self, req, code, status=409):
        raise urllib.error.HTTPError(req.full_url, status, code, {}, io.BytesIO(c.canonical({"error": {"code": code, "message": TOKEN}})))

    def open(self, req, timeout=None):
        self.calls.append((req.method, req.full_url, req.data, dict(req.headers)))
        assert req.headers["Authorization"] == "Bearer " + TOKEN
        path = req.full_url[len(BASE):]
        if req.method == "GET" and path == "/capabilities":
            value = {"service": "cblog-draft-automation", "version": 1, "mode": "draft-only"}
        elif req.method == "GET" and path.startswith("/assets/"):
            raw = self.assets[path.split("/")[-1]]
            return Response(b"corrupt" if self.bad_asset else raw)
        elif req.method == "POST" and path == "/assets":
            raw = req.data
            sha = c.digest(raw)
            self.assets[sha] = raw
            value = {"id": sha, "url": "/api/v1/assets/" + sha, "readback_url": "/api/v1/automation/assets/" + sha, "mime": "image/png", "bytes": len(raw), "sha256": sha}
        elif req.method == "GET" and path.startswith("/drafts/"):
            key = path.split("/")[-1]
            if key not in self.notes:
                self.error(req, "NOT_FOUND", 404)
            value = copy.deepcopy(self.notes[key])
            if self.bad_body:
                value["body"] += "unexpected"
        elif req.method == "PUT" and path.startswith("/drafts/"):
            if self.reject_put:
                self.error(req, self.reject_put)
            payload = json.loads(req.data)
            key = path.split("/")[-1]
            mutation = payload["clientMutationId"]
            if mutation in self.mutations:
                old_payload, value = self.mutations[mutation]
                if old_payload != payload:
                    self.error(req, "IDEMPOTENCY_CONFLICT")
            else:
                version = self.notes.get(key, {}).get("version", 0)
                if payload["expectedVersion"] != version:
                    self.error(req, "CONFLICT")
                value = {k: v for k, v in payload.items() if k not in ("expectedVersion", "clientMutationId")}
                value.update({"sourceKey": key, "id": "note-test", "version": version + 1, "state": "draft", "visibility": "owner", "body_sha256": c.digest(value["body"].encode()), "admin_url": "https://draft.example.test/#view=library&note=note-test"})
                self.notes[key] = value
                self.mutations[mutation] = (payload, copy.deepcopy(value))
                self.versions += 1
            if self.lose_receipts:
                self.lose_receipts -= 1
                raise TimeoutError("server receipt lost; " + TOKEN)
        elif req.method == "GET" and path == "/groups":
            value = [{"id": "ai-engineering", "name": "AI 工程"}]
        elif req.method == "GET" and path.startswith("/drafts?"):
            return Response(c.canonical({"data": list(self.notes.values()), "nextCursor": None}))
        else:
            raise AssertionError("Unexpected route: " + req.method + " " + path)
        return Response(c.canonical({"data": value}))

class ImportTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.md = self.root / "article.md"
        self.md.write_text("# 中文技术文档 🚀\n\n正文不压缩。\n\n| 指标 | 值 |\n| --- | --- |\n| 完整性 | 100% |\n\n```mermaid\nflowchart LR\nA --> B\n```\n", encoding="utf-8")
        self.manifest = self.root / "manifest.json"
        self.http = HTTPService()
        self.api = c.API(BASE, TOKEN, attempts=1, sleeper=lambda _: None)
        self.api.opener = self.http

    def plan(self, **kwargs):
        return c.make_plan(self.md, "中文标题", "example-skill", "ai-engineering", ["Skill", "技术"], **kwargs)

    def run_import(self, **kwargs):
        return c.import_draft(self.api, self.plan(), self.manifest, **kwargs)

    def assert_code(self, code, function):
        with self.assertRaises(c.DraftError) as caught:
            function()
        self.assertEqual(caught.exception.code, code)

    def test_utf8_body_exact_and_repeat_does_not_create_revision(self):
        original = self.md.read_bytes()
        self.assertEqual(self.run_import()["status"], "verified")
        self.assertFalse(self.run_import()["changed"])
        self.assertEqual(self.http.notes["example-skill"]["body"].encode(), original)
        self.assertEqual(self.http.versions, 1)
        self.assertEqual(self.manifest.stat().st_mode & 0o777, 0o600)
        self.assertNotIn(TOKEN, self.manifest.read_text())
        self.assertTrue(all("publish" not in url and method in ("GET", "PUT") for method, url, _, _ in self.http.calls))

    def test_local_relative_reference_html_images_and_remote_preservation(self):
        image = self.root / "figure (1).png"
        image.write_bytes(PNG)
        self.md.write_text('![示意](<figure (1).png> "图注")\n![第二张][fig]\n[fig]: <figure (1).png>\n<img src="figure%20(1).png">\n![外链](https://images.example.test/demo.png)\n[普通链接](https://example.test/page)\n`![code](missing.png)`\n```md\n![example](missing.png)\n```\n', encoding="utf-8")
        plan = self.plan()
        self.assertEqual(len(plan["assets"]), 1)
        self.assertEqual(len(plan["occurrences"]), 3)
        self.assertEqual(len(plan["external_images"]), 1)
        self.run_import()
        body = self.http.notes["example-skill"]["body"]
        self.assertEqual(body.count("/api/v1/assets/"), 3)
        self.assertIn('"图注"', body)
        self.assertIn("https://images.example.test/demo.png", body)
        self.assertIn("[普通链接](https://example.test/page)", body)
        self.assertIn("![code](missing.png)", body)
        self.assertEqual(sum(x[0] == "POST" for x in self.http.calls), 1)
        self.assertTrue(all(url.startswith(BASE + "/") for _, url, _, _ in self.http.calls))

    def test_lost_receipt_resumes_same_mutation_after_restart(self):
        self.http.lose_receipts = 1
        self.assert_code("NETWORK_TIMEOUT", self.run_import)
        before = json.loads(self.manifest.read_text())
        mutation = before["pending"]["payload"]["clientMutationId"]
        self.assertEqual(self.http.versions, 1)
        self.assertEqual(self.run_import()["version"], 1)
        puts = [json.loads(data) for method, _, data, _ in self.http.calls if method == "PUT"]
        self.assertEqual({p["clientMutationId"] for p in puts}, {mutation})
        self.assertEqual(self.http.versions, 1)
        self.assertNotIn("pending", json.loads(self.manifest.read_text()))

    def test_bounded_retry_reuses_identical_bytes(self):
        self.api.attempts = 3
        self.http.lose_receipts = 2
        self.run_import()
        puts = [data for method, _, data, _ in self.http.calls if method == "PUT"]
        self.assertEqual(len(puts), 3)
        self.assertEqual(len(set(puts)), 1)
        self.assertEqual(self.http.versions, 1)

    def test_changed_pending_input_stops_without_new_write(self):
        self.http.lose_receipts = 1
        self.assert_code("NETWORK_TIMEOUT", self.run_import)
        self.md.write_text("新的正文", encoding="utf-8")
        count = len(self.http.calls)
        self.assert_code("PENDING_INPUT_CHANGED", self.run_import)
        self.assertTrue(all(x[0] == "GET" for x in self.http.calls[count:]))

    def test_manual_changes_preserved_until_explicit_reviewed_version(self):
        self.run_import()
        self.http.notes["example-skill"].update(version=2, body="人工修改", body_sha256=c.digest("人工修改".encode()))
        self.md.write_text("已合并人工修改后的正文", encoding="utf-8")
        self.assert_code("VERSION_REVIEW_REQUIRED", self.run_import)
        self.assertEqual(self.http.notes["example-skill"]["body"], "人工修改")
        self.assertEqual(self.run_import(expected_version=2)["version"], 3)

    def test_missing_manifest_wont_adopt_existing_draft(self):
        self.run_import()
        self.manifest.unlink()
        self.assert_code("VERSION_REVIEW_REQUIRED", self.run_import)
        self.assertEqual(self.http.versions, 1)

    def test_published_source_is_not_reverted(self):
        self.run_import()
        self.http.notes["example-skill"].update(state="published", visibility="public")
        self.assert_code("NOT_DRAFT", self.run_import)
        self.assertEqual(self.http.versions, 1)

    def test_historically_published_draft_is_not_writable(self):
        self.run_import()
        self.http.notes["example-skill"].update(writable=False)
        self.assert_code("NOT_DRAFT", self.run_import)
        self.assertEqual(self.http.versions, 1)

    def test_title_trims_match_api_without_changing_body(self):
        plan = c.make_plan(self.md, "  中文标题  ", "example-skill")
        self.assertEqual(plan["fields"]["title"], "中文标题")
        self.assertEqual(plan["fields"]["body"].encode(), self.md.read_bytes())

    def test_historical_replay_receipt_is_not_current_readback(self):
        self.http.lose_receipts = 1
        self.assert_code("NETWORK_TIMEOUT", self.run_import)
        self.http.notes["example-skill"].update(version=2, body="后台人工新内容", body_sha256=c.digest("后台人工新内容".encode()))
        self.assert_code("READBACK_CONFLICT", self.run_import)
        self.assertEqual(self.http.notes["example-skill"]["body"], "后台人工新内容")
        self.assertNotIn("verified", json.loads(self.manifest.read_text()))
        self.md.write_text("合并人工新内容", encoding="utf-8")
        self.assertEqual(self.run_import(expected_version=2)["version"], 3)

    def test_readback_asset_failure_prevents_article_write(self):
        (self.root / "image.png").write_bytes(PNG)
        self.md.write_text("![图](image.png)", encoding="utf-8")
        self.http.bad_asset = True
        self.assert_code("ASSET_MISMATCH", self.run_import)
        self.assertFalse(self.http.notes)

    def test_cross_origin_manifest_rejected(self):
        c.Manifest(self.manifest, "https://other.example.test/api/v1/automation", "example-skill").save()
        self.assert_code("MANIFEST_MISMATCH", self.run_import)
        self.assertFalse(self.http.notes)
        self.assertEqual(self.http.calls, [])

    def test_cached_asset_display_url_must_still_match_verified_bytes(self):
        (self.root / "image.png").write_bytes(PNG)
        self.md.write_text("![图](image.png)", encoding="utf-8")
        self.run_import()
        manifest = json.loads(self.manifest.read_text())
        manifest["assets"][c.digest(PNG)]["url"] = "https://external.example.test/changed.png"
        self.manifest.write_text(json.dumps(manifest))
        self.assert_code("UNSAFE_ASSET_URL", self.run_import)
        self.assertEqual(self.http.versions, 1)

    def test_date_readback_compares_same_instant(self):
        fields = {"body": "完整正文", "display_published_at": "2026-11-02T18:00:00+08:00"}
        remote = {**fields, "sourceKey": "example-skill", "state": "draft", "visibility": "owner", "version": 1, "body_sha256": c.digest(fields["body"].encode()), "display_published_at": "2026-11-02T10:00:00.000Z"}
        c.verify_draft(remote, fields, "example-skill", 1)
        remote["display_published_at"] = "2026-11-02T11:00:00.000Z"
        self.assert_code("READBACK_MISMATCH", lambda: c.verify_draft(remote, fields, "example-skill", 1))

    def test_definite_conflict_can_resume_after_review(self):
        self.http.reject_put = "CONFLICT"
        self.assert_code("CONFLICT", self.run_import)
        self.assertIn("rejected", json.loads(self.manifest.read_text())["pending"])
        self.http.reject_put = None
        self.md.write_text("合并后的新正文", encoding="utf-8")
        self.assertEqual(self.run_import(expected_version=0)["version"], 1)

    def test_invalid_images_and_source_keys_fail_offline(self):
        self.assert_code("INVALID_SOURCE_KEY", lambda: c.make_plan(self.md, "标题", "../escape"))
        self.md.write_text("![图](missing.png)", encoding="utf-8")
        self.assert_code("IMAGE_NOT_FOUND", self.plan)
        self.assertEqual(self.http.calls, [])

    def test_plan_has_no_token_or_network_dependency(self):
        with patch.object(c, "load_token", side_effect=AssertionError("token accessed")), patch.object(c.API, "request", side_effect=AssertionError("network used")), contextlib.redirect_stdout(io.StringIO()) as out:
            code = c.main(["plan", "--markdown", str(self.md), "--title", "标题", "--source-key", "example-skill"])
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out.getvalue())["mode"], "offline-plan")

    def test_token_file_permissions_and_environment_precedence(self):
        token_file = self.root / "token"
        token_file.write_text(TOKEN)
        token_file.chmod(0o644)
        with patch.dict(os.environ, {}, clear=True):
            self.assert_code("TOKEN_PERMISSIONS", lambda: c.load_token(token_file))
            token_file.chmod(0o600)
            self.assertEqual(c.load_token(token_file), TOKEN)
        with patch.dict(os.environ, {"CBLOG_DRAFT_TOKEN": TOKEN}, clear=True):
            self.assertEqual(c.load_token(self.root / "missing"), TOKEN)

    def test_redirect_rejected_and_cross_origin_assets_rejected(self):
        self.assertIsNone(c.NoRedirect().redirect_request(None, None, 302, "", {}, "https://other.example.test"))
        self.assert_code("UNSAFE_ASSET_URL", lambda: self.api.safe_asset_url("https://other.example.test/api/v1/assets/" + "a" * 64))
        self.assert_code("INVALID_BASE_URL", lambda: c.base_url("http://external.example.test"))
        self.assert_code("INVALID_BASE_URL", lambda: c.base_url("https://user:secret@example.test"))

    def test_remote_error_never_echoes_token(self):
        self.http.reject_put = "CONFLICT"
        with patch.dict(os.environ, {"CBLOG_DRAFT_TOKEN": TOKEN}), patch.object(c.urllib.request, "build_opener", return_value=self.http), contextlib.redirect_stderr(io.StringIO()) as err, contextlib.redirect_stdout(io.StringIO()) as out:
            code = c.main(["--base-url", BASE, "import", "--markdown", str(self.md), "--title", "标题", "--source-key", "example-skill", "--manifest", str(self.manifest)])
        self.assertEqual(code, 2)
        self.assertNotIn(TOKEN, err.getvalue() + out.getvalue() + self.manifest.read_text())

if __name__ == "__main__":
    unittest.main()
