#!/usr/bin/env python3
"""Local, single-coordinator ledger. No network, token access, or LLM execution."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import sqlite3
import sys
import time
import uuid
from urllib.parse import urlsplit


class GateError(Exception):
    pass


def require(condition, message):
    if not condition:
        raise GateError(message)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def digest(value):
    return hashlib.sha256(value).hexdigest()


def identifier(value):
    require(isinstance(value, str) and re.fullmatch(r"[a-z0-9](?:[a-z0-9_-]{0,98}[a-z0-9])?", value), "Invalid stable identifier")
    return value


def role_name(value):
    require(isinstance(value, str) and bool(value.strip()), "Record a nonempty actual role name")
    return value


def file_record(path, base):
    p = Path(path).expanduser()
    p = (base / p if not p.is_absolute() else p).resolve()
    require(p.is_file(), "Evidence or artifact file is missing")
    return {"path": str(p), "sha256": digest(p.read_bytes())}


def file_current(record):
    p = Path(record["path"])
    return p.is_file() and digest(p.read_bytes()) == record["sha256"]


def draft_helpers():
    # Only offline parsing/validation is reused; never construct API or load_token.
    p = Path(__file__).resolve().parents[2] / "cblog-draft-publish/scripts/cblog_draft.py"
    require(p.is_file(), "Install sibling cblog-draft-publish before freezing packages")
    spec = importlib.util.spec_from_file_location("cblog_draft_offline", p)
    module = importlib.util.module_from_spec(spec)
    previous = sys.dont_write_bytecode
    try:
        sys.dont_write_bytecode = True
        spec.loader.exec_module(module)
    finally:
        sys.dont_write_bytecode = previous
    return module


SCHEMA = """
CREATE TABLE IF NOT EXISTS cases(id TEXT PRIMARY KEY, title TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS artifacts(
 id TEXT NOT NULL, version INTEGER NOT NULL, case_id TEXT NOT NULL REFERENCES cases(id),
 kind TEXT NOT NULL, file TEXT NOT NULL, producers TEXT NOT NULL, deps TEXT NOT NULL,
 task_id TEXT, generation INTEGER, PRIMARY KEY(id,version));
CREATE TABLE IF NOT EXISTS tasks(
 id TEXT PRIMARY KEY, case_id TEXT NOT NULL REFERENCES cases(id), stage TEXT NOT NULL,
 inputs TEXT NOT NULL, depends_on TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'ready',
 generation INTEGER NOT NULL DEFAULT 0, worker TEXT, lease_until REAL,
 claimed_inputs TEXT, claimed_tasks TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS reviews(
 seq INTEGER PRIMARY KEY, case_id TEXT NOT NULL REFERENCES cases(id), stage TEXT NOT NULL,
 reviewer TEXT NOT NULL, verdict TEXT NOT NULL, refs TEXT NOT NULL, report TEXT NOT NULL,
 checks TEXT NOT NULL, package_id TEXT, package_sha256 TEXT, created_at REAL NOT NULL);
CREATE TABLE IF NOT EXISTS packages(
 seq INTEGER PRIMARY KEY, id TEXT UNIQUE NOT NULL, case_id TEXT NOT NULL REFERENCES cases(id),
 payload TEXT NOT NULL, sha256 TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS receipts(
 seq INTEGER PRIMARY KEY, package_id TEXT NOT NULL REFERENCES packages(id), kind TEXT NOT NULL,
 note_id TEXT NOT NULL, version INTEGER NOT NULL, body_sha256 TEXT NOT NULL,
 evidence TEXT NOT NULL, created_at REAL NOT NULL);
CREATE TABLE IF NOT EXISTS ui_reviews(
 seq INTEGER PRIMARY KEY, receipt_seq INTEGER NOT NULL REFERENCES receipts(seq),
 reviewer TEXT NOT NULL, report TEXT NOT NULL, checks TEXT NOT NULL, created_at REAL NOT NULL);
CREATE TABLE IF NOT EXISTS upload_session(
 singleton INTEGER PRIMARY KEY CHECK(singleton=1), id TEXT NOT NULL, package_id TEXT NOT NULL,
 kind TEXT NOT NULL, operator TEXT NOT NULL, state TEXT NOT NULL, started_at REAL NOT NULL,
 recovery_report TEXT);
PRAGMA user_version=1;
"""

CHECKS = {
    "content": {"evidence", "technical", "privacy", "oral"},
    "visual": {"opened_images", "semantics", "privacy", "desktop", "mobile"},
    "package": {"rendered", "links", "formatting", "metadata"},
    "ui": {"desktop", "mobile", "images", "content", "private_draft"},
}


class Ledger:
    def __init__(self, path, initialize=False, clock=time.time):
        self.clock = clock
        path = Path(path)
        if initialize:
            path.parent.mkdir(parents=True, exist_ok=True)
        require(initialize or path.is_file(), "Initialize the ledger first")
        # The ledger contains private source paths and evidence; never commit it.
        previous = os.umask(0o077)
        try:
            self.db = sqlite3.connect(path, timeout=10)
            os.chmod(path, 0o600)
        finally:
            os.umask(previous)
        self.db.row_factory = sqlite3.Row
        self.db.execute("PRAGMA foreign_keys=ON")
        version = self.db.execute("PRAGMA user_version").fetchone()[0]
        require(version in (0, 1), "Unsupported ledger version")
        if initialize:
            self.db.executescript(SCHEMA)
        else:
            require(version == 1, "Not an initialized pipeline ledger")

    def close(self):
        self.db.close()

    def one(self, sql, args=()):
        row = self.db.execute(sql, args).fetchone()
        require(row is not None, "Referenced ledger record does not exist")
        return dict(row)

    def case(self, case_id):
        return self.one("SELECT * FROM cases WHERE id=?", (case_id,))

    def assert_case_mutable(self, case_id):
        locked = self.db.execute("SELECT 1 FROM upload_session u JOIN packages p ON p.id=u.package_id WHERE p.case_id=?", (case_id,)).fetchone()
        require(not locked, "Resolve the outstanding upload before changing this case's artifacts, reviews or package")

    def artifact(self, artifact_id):
        return self.one("SELECT * FROM artifacts WHERE id=? ORDER BY version DESC LIMIT 1", (artifact_id,))

    def ref(self, artifact_id, case_id, visiting=None):
        visiting = set() if visiting is None else visiting
        require(artifact_id not in visiting, "Artifact dependency cycle")
        visiting = visiting | {artifact_id}
        a = self.artifact(artifact_id)
        require(a["case_id"] == case_id, "Cross-case artifact reference")
        require(file_current(json.loads(a["file"])), "Artifact bytes changed or disappeared; register a new immutable version")
        if a["task_id"]:
            t = self.one("SELECT * FROM tasks WHERE id=?", (a["task_id"],))
            require(t["state"] == "done" and t["generation"] == a["generation"], "Artifact belongs to a superseded or unfinished task")
            self.validate_claimed_inputs(t, visiting)
        for dep in json.loads(a["deps"]):
            require(self.ref(dep["id"], case_id, visiting) == dep, "Artifact input version changed; rebuild dependent output")
        return {"id": a["id"], "version": a["version"], "sha256": json.loads(a["file"])["sha256"]}

    def refs(self, ids, case_id):
        require(isinstance(ids, list) and len(ids) == len(set(ids)), "Artifact IDs must be a unique list")
        return [self.ref(i, case_id) for i in sorted(ids)]

    def check_refs(self, refs, case_id):
        for ref in refs:
            require(self.ref(ref["id"], case_id) == ref, "Input or review version is stale")

    def producers(self, refs):
        result = set()
        for ref in refs:
            row = self.one("SELECT * FROM artifacts WHERE id=? AND version=?", (ref["id"], ref["version"]))
            result.update(json.loads(row["producers"]))
            result.update(self.producers(json.loads(row["deps"])))
        return result

    def dependency_ids(self, refs):
        result = set()
        for ref in refs:
            result.add(ref["id"])
            row = self.one("SELECT deps FROM artifacts WHERE id=? AND version=?", (ref["id"], ref["version"]))
            result.update(self.dependency_ids(json.loads(row["deps"])))
        return result

    def add_artifact(self, s, base, case_id=None, task=None):
        case_id = case_id or s["case_id"]
        self.case(case_id)
        aid = identifier(s["id"])
        kind = s["kind"]
        require(kind in {"source", "evidence", "claims", "article", "script", "image", "visual_source", "report"}, "Unknown artifact kind")
        producers = s["producers"]
        require(isinstance(producers, list) and producers, "Name actual producers")
        for producer in producers:
            role_name(producer)
        if task:
            require(task["worker"] in producers, "Task worker must be recorded as a producer")
        deps = self.refs(s.get("dependencies", []), case_id)
        require(aid not in self.dependency_ids(deps), "Artifact dependency cycle")
        f = file_record(s["path"], base)
        prior = self.db.execute("SELECT * FROM artifacts WHERE id=? ORDER BY version DESC LIMIT 1", (aid,)).fetchone()
        version = 1
        if prior:
            require(prior["case_id"] == case_id and prior["kind"] == kind, "Stable artifact identity cannot be rebound")
            # Attribution is cumulative: a small edit cannot erase an author's conflict.
            producers = sorted(set(producers) | set(json.loads(prior["producers"])))
            if (json.loads(prior["file"]) == f and json.loads(prior["deps"]) == deps
                    and set(json.loads(prior["producers"])) == set(producers)
                    and prior["task_id"] == (task["id"] if task else None)
                    and prior["generation"] == (task["generation"] if task else None)):
                return {"id": aid, "version": prior["version"], "sha256": f["sha256"]}
            version = prior["version"] + 1
        for row in self.db.execute("SELECT file FROM artifacts"):
            old = json.loads(row["file"])
            require(old["path"] != f["path"], "Use a new immutable output path for each artifact version")
        self.assert_case_mutable(case_id)
        self.db.execute("INSERT INTO artifacts VALUES(?,?,?,?,?,?,?,?,?)", (
            aid, version, case_id, kind, canonical(f), canonical(sorted(set(producers))), canonical(deps),
            task["id"] if task else None, task["generation"] if task else None))
        return {"id": aid, "version": version, "sha256": f["sha256"]}

    def validate_claimed_inputs(self, task, visiting=None):
        replaced = {row["id"] for row in self.db.execute("SELECT id FROM artifacts WHERE task_id=? AND generation=?", (task["id"], task["generation"]))} if task["state"] == "done" else set()
        checked = set()
        def check_task_dependencies(t):
            for dep in json.loads(t["claimed_tasks"] or "[]"):
                row = self.one("SELECT state,generation FROM tasks WHERE id=?", (dep["id"],))
                require(row["state"] == "done" and row["generation"] == dep["generation"], "Upstream task was reopened")
        def check_input(ref, ancestry=None):
            ancestry = set() if ancestry is None else ancestry
            key = (ref["id"], ref["version"])
            require(key not in ancestry, "Historical input dependency cycle")
            if key in checked:
                return
            latest = self.artifact(ref["id"])
            if ref["id"] in replaced and latest["version"] > ref["version"]:
                # All drafts replaced together remain exact historical inputs. Their
                # old internal edges are not edges to the new output versions.
                old = self.one("SELECT * FROM artifacts WHERE id=? AND version=?", (ref["id"], ref["version"]))
                require(file_current(json.loads(old["file"])), "Historical edit input changed")
                if old["task_id"]:
                    origin = self.one("SELECT * FROM tasks WHERE id=?", (old["task_id"],))
                    require(origin["state"] == "done" and origin["generation"] == old["generation"], "Historical input's producer task was reopened or superseded")
                    check_task_dependencies(origin)
                    for prior_input in json.loads(origin["claimed_inputs"] or "[]"):
                        check_input(prior_input, ancestry | {key})
                for dep in json.loads(old["deps"]):
                    check_input(dep, ancestry | {key})
            else:
                require(self.ref(ref["id"], task["case_id"], visiting) == ref, "Task input changed after claim")
            checked.add(key)
        for ref in json.loads(task["claimed_inputs"] or "[]"):
            check_input(ref)
        check_task_dependencies(task)

    def claimed(self, s, completion=True):
        task = self.one("SELECT * FROM tasks WHERE id=?", (s["task_id"],))
        require(task["state"] == "running" and task["worker"] == s["worker"]
                and task["generation"] == s["generation"] and (not completion or task["lease_until"] > self.clock()),
                "Claim expired or superseded; late output is not current")
        if completion:
            self.validate_claimed_inputs(task)
        return task

    def check_review(self, case_id, stage, required, package=None):
        if package:
            row = self.db.execute("SELECT * FROM reviews WHERE package_id=? AND stage=? ORDER BY seq DESC LIMIT 1", (package["id"], stage)).fetchone()
        else:
            row = self.db.execute("SELECT * FROM reviews WHERE case_id=? AND stage=? ORDER BY seq DESC LIMIT 1", (case_id, stage)).fetchone()
        require(row is not None and row["verdict"] == "passed", "Missing passed independent " + stage + " review")
        refs = json.loads(row["refs"])
        self.check_refs(refs, case_id)
        require({r["id"] for r in required} <= {r["id"] for r in refs}, "Review does not cover the full required set")
        require(file_current(json.loads(row["report"])), "Review report changed or disappeared")
        role_name(row["reviewer"])
        require(row["reviewer"] not in self.producers(refs), "Reviewer participated in reviewed production")
        if package:
            require(row["package_sha256"] == package["sha256"], "Package review does not bind the frozen payload")
        return row["seq"]

    def package(self, package_id):
        p = self.one("SELECT * FROM packages WHERE id=?", (package_id,))
        p["payload"] = json.loads(p["payload"])
        return p

    def check_package(self, package_id, approval=True):
        p = self.package(package_id)
        latest = self.one("SELECT id FROM packages WHERE case_id=? ORDER BY seq DESC LIMIT 1", (p["case_id"],))
        require(latest["id"] == package_id, "A newer frozen package supersedes this package")
        data = p["payload"]
        require(digest(canonical(data).encode()) == p["sha256"], "Frozen payload checksum mismatch")
        self.check_refs(data["refs"], p["case_id"])
        # Re-resolve Markdown image references at the upload boundary. A symlink
        # can change target while both the Markdown and registered old image stay
        # byte-identical. Artifact hashes alone do not detect that drift.
        helper = draft_helpers()
        for plan in data["plans"].values():
            fields = plan["fields"]
            try:
                current = helper.make_plan(plan["markdown"], fields["title"], plan["sourceKey"],
                                           fields.get("topic_id"), fields.get("tags"), fields.get("display_published_at"))
            except helper.DraftError:
                raise GateError("Current upload plan cannot be read or validated; restore or rebuild this package") from None
            require(current == plan, "Current image references or upload plan differ from the frozen package")
        core = self.refs(list(data["artifacts"].values()), p["case_id"])
        self.check_review(p["case_id"], "content", core)
        if data["assets"]:
            self.check_review(p["case_id"], "visual", self.refs(data["assets"] + [data["artifacts"]["claims"]], p["case_id"]))
        if approval:
            self.check_review(p["case_id"], "package", data["refs"], p)
        return p

    def latest_receipt(self, package_id, kind):
        r = self.one("SELECT * FROM receipts WHERE package_id=? AND kind=? ORDER BY seq DESC LIMIT 1", (package_id, kind))
        require(all(file_current(f) for f in json.loads(r["evidence"])), "Receipt evidence changed; recapture into immutable files")
        return r

    def valid_ui(self, receipt, package):
        row = self.one("SELECT * FROM ui_reviews WHERE receipt_seq=? ORDER BY seq DESC LIMIT 1", (receipt["seq"],))
        require(file_current(json.loads(row["report"])), "UI report changed or disappeared")
        role_name(row["reviewer"])
        require(row["reviewer"] not in self.producers(package["payload"]["refs"]), "Final reviewer participated in production")
        return row

    def package_status(self, package_id):
        p = self.package(package_id)
        result = {"package_id": p["id"], "case_id": p["case_id"], "sha256": p["sha256"], "machine": {}, "ui": {}}
        try:
            self.check_package(package_id)
        except GateError as error:
            return {**result, "state": "needs_revalidation", "reason": str(error)}
        for kind in ("article", "script"):
            try:
                r = self.latest_receipt(package_id, kind)
                result["machine"][kind] = {"note_id": r["note_id"], "version": r["version"]}
                self.valid_ui(r, p)
                result["ui"][kind] = True
            except GateError:
                pass
        n = len(result["machine"])
        result["state"] = "delivered" if len(result["ui"]) == 2 else ("pending_ui" if n == 2 else "partial_saved" if n == 1 else "ready_to_upload")
        if self.db.execute("SELECT 1 FROM upload_session WHERE package_id=?", (package_id,)).fetchone():
            result["state"] = "upload_result_pending"
        return result

    def execute(self, command, s=None, base=None):
        s, base = s or {}, base or Path.cwd()
        self.db.execute("BEGIN IMMEDIATE")
        try:
            result = self._execute(command, s, base)
            self.db.commit()
            return result
        except Exception:
            self.db.rollback()
            raise

    def _execute(self, command, s, base):
        if command == "init":
            return {"schema_version": 1, "network_operations": False}
        if command == "case-add":
            cid = identifier(s["id"])
            require(isinstance(s["title"], str) and s["title"].strip(), "Case title is required")
            old = self.db.execute("SELECT * FROM cases WHERE id=?", (cid,)).fetchone()
            require(not old or old["title"] == s["title"], "Existing case differs; do not rebind stable IDs")
            self.db.execute("INSERT OR IGNORE INTO cases VALUES(?,?)", (cid, s["title"]))
            return {"id": cid, "source_keys": {k: cid + "-" + k for k in ("article", "script")}}
        if command == "artifact-add":
            return self.add_artifact(s, base)
        if command == "task-add":
            self.case(s["case_id"])
            tid = identifier(s["id"])
            inputs = s.get("inputs", [])
            self.refs(inputs, s["case_id"])
            deps = s.get("depends_on", [])
            for dep in deps:
                t = self.one("SELECT * FROM tasks WHERE id=?", (dep,))
                require(t["case_id"] == s["case_id"], "Cross-case task dependency")
            self.db.execute("INSERT INTO tasks(id,case_id,stage,inputs,depends_on) VALUES(?,?,?,?,?)", (tid, s["case_id"], s["stage"], canonical(inputs), canonical(deps)))
            return {"task_id": tid, "state": "ready"}
        if command == "task-claim":
            t = self.one("SELECT * FROM tasks WHERE id=?", (s["task_id"],))
            require(t["state"] in ("ready", "rework", "retry_wait") or (t["state"] == "running" and t["lease_until"] <= self.clock()), "Task is not claimable")
            seconds = s.get("lease_seconds", 3600)
            role_name(s["worker"])
            require(isinstance(seconds, int) and 1 <= seconds <= 86400, "Invalid lease")
            refs = self.refs(json.loads(t["inputs"]), t["case_id"])
            deps = []
            for dep in json.loads(t["depends_on"]):
                d = self.one("SELECT * FROM tasks WHERE id=?", (dep,))
                require(d["state"] == "done", "Upstream task is unfinished")
                self.validate_claimed_inputs(d)
                deps.append({"id": dep, "generation": d["generation"]})
            generation, until = t["generation"] + 1, self.clock() + seconds
            self.db.execute("UPDATE tasks SET state='running',generation=?,worker=?,lease_until=?,claimed_inputs=?,claimed_tasks=?,note=NULL WHERE id=?", (generation, s["worker"], until, canonical(refs), canonical(deps), t["id"]))
            return {"task_id": t["id"], "worker": s["worker"], "generation": generation, "lease_until": until, "inputs": refs}
        if command in ("task-finish", "task-stop"):
            t = self.claimed(s, completion=command == "task-finish")
            if command == "task-stop":
                require(s["state"] in ("blocked", "rework", "retry_wait") and s["reason"], "Explain why the task stopped")
                self.db.execute("UPDATE tasks SET state=?,note=?,lease_until=NULL WHERE id=?", (s["state"], s["reason"], t["id"]))
                return {"task_id": t["id"], "state": s["state"]}
            self.db.execute("UPDATE tasks SET state='done',lease_until=NULL WHERE id=?", (t["id"],))
            submitted = s.get("outputs", [])
            replaced = {output["id"] for output in submitted}
            require(len(replaced) == len(submitted), "A completion cannot output the same artifact twice")
            def external_dependencies(ids, seen=None):
                seen = set() if seen is None else seen
                result = set()
                for aid in ids:
                    if aid in replaced:
                        require(aid not in seen, "Historical replacement dependency cycle")
                        prior = self.artifact(aid)
                        result.update(external_dependencies([r["id"] for r in json.loads(prior["deps"])], seen | {aid}))
                    else:
                        result.add(aid)
                return result
            # Prepare the entire replacement group before promoting any member.
            # For dependencies on newly produced peers, use separate ordered tasks.
            prepared = []
            inherited_producers = self.producers(json.loads(t["claimed_inputs"] or "[]"))
            for output in submitted:
                deps = set(output.get("dependencies", [])) | set(json.loads(t["inputs"]))
                prepared.append({**output, "dependencies": sorted(external_dependencies(deps)),
                                 "producers": sorted(set(output["producers"]) | inherited_producers)})
            outputs = []
            for output in prepared:
                outputs.append(self.add_artifact(output, base, t["case_id"], t))
            return {"task_id": t["id"], "state": "done", "outputs": outputs}
        if command == "task-requeue":
            t = self.one("SELECT * FROM tasks WHERE id=?", (s["task_id"],))
            self.assert_case_mutable(t["case_id"])
            require(t["state"] != "running" and s["reason"], "Stop active work before reopening, and record a reason")
            self.db.execute("UPDATE tasks SET state='ready',note=? WHERE id=?", (s["reason"], t["id"]))
            return {"task_id": t["id"], "state": "ready"}
        if command == "review-add":
            stage, verdict = s["stage"], s["verdict"]
            require(stage in ("content", "visual", "package") and verdict in ("passed", "rework", "blocked"), "Invalid review stage or verdict")
            package = self.check_package(s["package_id"], False) if stage == "package" else None
            case_id = package["case_id"] if package else s["case_id"]
            self.assert_case_mutable(case_id)
            refs = package["payload"]["refs"] if package else self.refs(s["artifact_ids"], case_id)
            role_name(s["reviewer"])
            require(refs and s["reviewer"] not in self.producers(refs), "Reviewer must be independent of all reviewed producers")
            if verdict == "passed":
                require(not s.get("blockers") and all(s.get("checks", {}).get(k) is True for k in CHECKS[stage]), "Passed review needs every required check and no blockers")
            report = file_record(s["report_path"], base)
            cur = self.db.execute("INSERT INTO reviews(case_id,stage,reviewer,verdict,refs,report,checks,package_id,package_sha256,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)", (case_id, stage, s["reviewer"], verdict, canonical(refs), canonical(report), canonical(s.get("checks", {})), package["id"] if package else None, package["sha256"] if package else None, self.clock()))
            return {"review_id": cur.lastrowid, "verdict": verdict, "refs": refs}
        if command == "freeze":
            return self.freeze(s)
        if command == "package-check":
            p = self.check_package(s["package_id"])
            return {"package_id": p["id"], "sha256": p["sha256"], "upload_ready": True, "payload": p["payload"]}
        if command == "receipt-add":
            return self.add_receipt(s, base)
        if command == "ui-add":
            p = self.check_package(s["package_id"])
            self.assert_case_mutable(p["case_id"])
            role_name(s["reviewer"])
            r = self.latest_receipt(p["id"], s["kind"])
            require(s["note_id"] == r["note_id"] and s["version"] == r["version"], "UI evidence does not match the latest machine readback")
            require(s["reviewer"] not in self.producers(p["payload"]["refs"]), "Final reviewer participated in production")
            require(all(s.get("checks", {}).get(k) is True for k in CHECKS["ui"]), "UI checks are incomplete")
            report = file_record(s["report_path"], base)
            self.db.execute("INSERT INTO ui_reviews(receipt_seq,reviewer,report,checks,created_at) VALUES(?,?,?,?,?)", (r["seq"], s["reviewer"], canonical(report), canonical(s["checks"]), self.clock()))
            return self.package_status(p["id"])
        if command in ("upload-begin", "upload-end"):
            return self.upload_session(command, s, base)
        if command == "status":
            cases = [self.case(s["case_id"])] if s.get("case_id") else [dict(r) for r in self.db.execute("SELECT * FROM cases ORDER BY id")]
            for case in cases:
                case["tasks"] = [dict(r) for r in self.db.execute("SELECT id,stage,state,generation,worker,lease_until,note FROM tasks WHERE case_id=? ORDER BY id", (case["id"],))]
                latest = self.db.execute("SELECT id FROM packages WHERE case_id=? ORDER BY seq DESC LIMIT 1", (case["id"],)).fetchone()
                case["delivery"] = self.package_status(latest["id"]) if latest else {"state": "not_frozen"}
            session = self.db.execute("SELECT * FROM upload_session").fetchone()
            return {"cases": cases, "upload_session": dict(session) if session else None, "scope": "Local evidence only; no fresh remote requests performed"}
        raise GateError("Unknown command")

    def freeze(self, s):
        cid, pid = s["case_id"], identifier(s["id"])
        self.case(cid)
        artifacts = s["artifacts"]
        require(set(artifacts) == {"article", "script", "evidence", "claims"}, "Freeze requires article, script, evidence and claims")
        for kind, aid in artifacts.items():
            require(self.artifact(aid)["kind"] == kind, "Wrong artifact kind")
        assets = s.get("assets", [])
        for aid in assets:
            require(self.artifact(aid)["kind"] == "image", "Only final image artifacts belong in assets")
        refs = self.refs(list(artifacts.values()) + assets, cid)
        self.check_review(cid, "content", self.refs(list(artifacts.values()), cid))
        if assets:
            self.check_review(cid, "visual", self.refs(assets + [artifacts["claims"]], cid))
        target = s["target"]
        require(set(target) <= {"base_url", "topic_id", "tags", "display_published_at"}, "Unexpected target fields")
        parts = urlsplit(target["base_url"])
        require(parts.scheme == "https" and parts.hostname and not parts.username and not parts.password
                and not parts.query and not parts.fragment and parts.path == "/api/v1/automation", "Use an explicit HTTPS automation API target")
        helper = draft_helpers()
        plans = {}
        registered = {json.loads(self.artifact(a)["file"])["sha256"]: json.loads(self.artifact(a)["file"])["path"] for a in assets}
        used = set()
        for kind in ("article", "script"):
            a = self.artifact(artifacts[kind])
            plan = helper.make_plan(json.loads(a["file"])["path"], s["titles"][kind], cid + "-" + kind,
                                    target.get("topic_id"), target.get("tags", []), target.get("display_published_at"))
            # First version supports fully archived local images; no false external-image guarantee.
            require(not plan["external_images"], "Archive external images with authorization before freezing; this gate supports local assets only")
            for sha, asset in plan["assets"].items():
                require(registered.get(sha) == asset["path"], "Referenced image is absent from the reviewed asset set")
                used.add(sha)
            plans[kind] = plan
        require(used == set(registered), "Remove unused assets from this package or reference them in a deliverable")
        data = {"artifacts": artifacts, "assets": sorted(assets), "refs": refs, "target": target, "plans": plans}
        sha = digest(canonical(data).encode())
        old = self.db.execute("SELECT * FROM packages WHERE id=?", (pid,)).fetchone()
        require(not old or (old["case_id"] == cid and old["sha256"] == sha), "Frozen package ID is immutable; use a new package ID, keep case/source keys")
        if not old:
            self.assert_case_mutable(cid)
        self.db.execute("INSERT OR IGNORE INTO packages(id,case_id,payload,sha256) VALUES(?,?,?,?)", (pid, cid, canonical(data), sha))
        return {"package_id": pid, "sha256": sha, "state": "awaiting_package_review", "source_keys": {k: v["sourceKey"] for k, v in plans.items()}}

    def add_receipt(self, s, base):
        p = self.check_package(s["package_id"])
        require(s["kind"] in ("article", "script"), "Invalid deliverable kind")
        plan = p["payload"]["plans"][s["kind"]]
        records = [file_record(s[k], base) for k in ("cli_manifest_path", "cli_receipt_path", "readback_path")]
        manifest, receipt, remote = [json.loads(Path(f["path"]).read_text()) for f in records]
        remote = remote.get("data", remote)
        require(manifest.get("schema") == 1 and manifest.get("base_url") == p["payload"]["target"]["base_url"]
                and manifest.get("sourceKey") == plan["sourceKey"] and "pending" not in manifest, "Manifest target/source mismatch or unresolved mutation")
        verified = manifest.get("verified", {})
        require(verified.get("input_sha256") == plan["input_sha256"] and verified.get("verified_at"), "CLI did not verify this frozen input")
        require(receipt.get("status") == "verified" and receipt.get("sourceKey") == plan["sourceKey"], "Not a verified CLI receipt")
        body = plan["fields"]["body"]
        assets = manifest.get("assets", {})
        for sha, asset in plan["assets"].items():
            entry = assets.get(sha, {})
            require(entry.get("sha256") == sha and entry.get("id") == sha and entry.get("bytes") == asset["bytes"] and entry.get("mime") == asset["mime"], "Manifest image differs from frozen bytes")
            for field, expected_path in (("url", "/api/v1/assets/" + sha), ("readback_url", "/api/v1/automation/assets/" + sha)):
                parts = urlsplit(entry.get(field, ""))
                target = urlsplit(manifest["base_url"])
                require(parts.path == expected_path and not parts.query and not parts.fragment and not parts.username
                        and (not parts.netloc and not parts.scheme or (parts.scheme, parts.netloc) == (target.scheme, target.netloc)), "Manifest image URL is not the expected same-origin asset")
        for occurrence in reversed(plan["occurrences"]):
            body = body[:occurrence["start"]] + assets[occurrence["sha256"]]["url"] + body[occurrence["end"]:]
        fields = {**plan["fields"], "body": body}
        require(verified.get("fields") == fields, "Verified fields differ from the frozen package after asset URL substitution")
        version = verified.get("version")
        require(isinstance(version, int) and not isinstance(version, bool) and version > 0 and receipt.get("version") == version, "CLI receipt version differs from manifest")
        draft_helpers().verify_draft(remote, fields, plan["sourceKey"], version)
        require(remote.get("id") and remote.get("id") == verified.get("id")
                and remote["body_sha256"] == verified.get("body_sha256") == receipt.get("body_sha256"), "Machine readback identity or body differs")
        cur = self.db.execute("INSERT INTO receipts(package_id,kind,note_id,version,body_sha256,evidence,created_at) VALUES(?,?,?,?,?,?,?)", (p["id"], s["kind"], remote["id"], version, remote["body_sha256"], canonical(records), self.clock()))
        return {"receipt_id": cur.lastrowid, **self.package_status(p["id"])}

    def upload_session(self, command, s, base):
        existing = self.db.execute("SELECT * FROM upload_session").fetchone()
        if command == "upload-begin":
            self.check_package(s["package_id"])
            role_name(s["operator"])
            require(s["kind"] in ("article", "script"), "Invalid upload kind")
            if existing:
                require((existing["package_id"], existing["kind"], existing["operator"]) == (s["package_id"], s["kind"], s["operator"]), "Another upload is outstanding; lease expiry never releases it")
                require(s.get("previous_process_stopped") is True, "Before resuming, establish that the previous upload process has stopped")
                proof = file_record(s["recovery_report_path"], base)
                self.db.execute("UPDATE upload_session SET state='active',recovery_report=? WHERE singleton=1", (canonical(proof),))
                return {"session_id": existing["id"], "resumed": True, "instruction": "Resume original CLI manifest and pending mutation; never change source key"}
            sid = str(uuid.uuid4())
            self.db.execute("INSERT INTO upload_session VALUES(1,?,?,?,?,?,?,NULL)", (sid, s["package_id"], s["kind"], s["operator"], "active", self.clock()))
            return {"session_id": sid, "resumed": False}
        require(existing and existing["id"] == s["session_id"] and existing["operator"] == s["operator"], "Upload session ownership mismatch")
        if s["outcome"] == "verified":
            self.check_package(existing["package_id"])
            receipt = self.latest_receipt(existing["package_id"], existing["kind"])
            require(receipt["created_at"] >= existing["started_at"], "Record this upload's readback before releasing the session")
            self.db.execute("DELETE FROM upload_session")
            return {"released": True}
        if s["outcome"] == "not_started":
            require(s.get("no_request_sent") is True and existing["state"] == "active" and not existing["recovery_report"], "Only a confirmed not-started operation may be cancelled; resumed uncertain requests require readback")
            file_record(s["report_path"], base)
            self.db.execute("DELETE FROM upload_session")
            return {"released": True}
        require(s["outcome"] == "uncertain", "Unknown upload outcome")
        self.db.execute("UPDATE upload_session SET state='uncertain' WHERE singleton=1")
        return {"released": False, "state": "uncertain"}


COMMANDS = ("case-add", "artifact-add", "task-add", "task-claim", "task-finish", "task-stop", "task-requeue",
            "review-add", "freeze", "receipt-add", "ui-add", "upload-begin", "upload-end")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", required=True, help="Private local SQLite ledger; only the coordinator writes it")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("init")
    for name in COMMANDS:
        sub.add_parser(name).add_argument("--spec", required=True, help="UTF-8 JSON; file paths resolve from this file's directory")
    sub.add_parser("status").add_argument("--case", dest="case_id")
    sub.add_parser("package-check").add_argument("--package", dest="package_id", required=True)
    args = parser.parse_args(argv)
    ledger = None
    try:
        base, data = Path.cwd(), {}
        if getattr(args, "spec", None):
            path = Path(args.spec).resolve()
            base, data = path.parent, json.loads(path.read_text())
            require(isinstance(data, dict), "Spec must be an object")
        for name in ("case_id", "package_id"):
            if getattr(args, name, None):
                data[name] = getattr(args, name)
        ledger = Ledger(args.db, initialize=args.command == "init")
        print(json.dumps(ledger.execute(args.command, data, base), ensure_ascii=False, indent=2))
        return 0
    except GateError as error:
        print(json.dumps({"error": "GATE_REJECTED", "message": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 2
    except (OSError, ValueError, KeyError, TypeError, sqlite3.Error):
        print('{"error":"INVALID_INPUT","message":"Malformed input, conflicting record, or unreadable local file; preserve the ledger."}', file=sys.stderr)
        return 2
    except Exception as error:
        # Sibling offline validator uses its own typed errors. Do not dump local contents.
        if hasattr(error, "code"):
            print(json.dumps({"error": "DRAFT_PLAN_REJECTED", "code": error.code}), file=sys.stderr)
            return 2
        raise
    finally:
        if ledger:
            ledger.close()


if __name__ == "__main__":
    raise SystemExit(main())
