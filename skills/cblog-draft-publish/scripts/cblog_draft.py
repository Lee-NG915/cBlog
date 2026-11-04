#!/usr/bin/env python3
"""Draft-only cBlog importer. Python standard library; no browser or cookies."""
from __future__ import annotations
import argparse
import contextlib
import datetime as dt
import hashlib
import http.client
import io
import ipaddress
import json
import os
from pathlib import Path
import re
import socket
import ssl
import stat
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

DEFAULT_BASE = "https://color-notes-admin-preview.donghaili915.workers.dev/api/v1/automation"
USER_AGENT = "cblog-draft-publish/1.0"
DEFAULT_TOKEN_FILE = "~/.config/cblog/draft-api-token"
MAX_ASSET, MAX_BODY = 1048576, 262144
KEY_RE = re.compile(r"[a-z0-9](?:[a-z0-9_-]{0,118}[a-z0-9])?\Z")
DEFAULT_API_HOST = urllib.parse.urlsplit(DEFAULT_BASE).hostname
DOH_HOST = "cloudflare-dns.com"
DOH_BOOTSTRAP_IPS = ("1.1.1.1", "1.0.0.1")

class DraftError(Exception):
    def __init__(self, code, message, status=None):
        super().__init__(message)
        self.code, self.message, self.status = code, message, status

def digest(value):
    return hashlib.sha256(value).hexdigest()

def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")

def base_url(value):
    p = urllib.parse.urlsplit(value)
    local = p.hostname in ("localhost", "127.0.0.1", "::1")
    if (p.scheme != "https" and not (p.scheme == "http" and local)) or not p.hostname or p.username or p.password or p.query or p.fragment:
        raise DraftError("INVALID_BASE_URL", "API 地址必须为 HTTPS 且不含账号、查询参数或片段。")
    if p.path.rstrip("/") not in ("", "/api/v1/automation"):
        raise DraftError("INVALID_BASE_URL", "API 路径须为 /api/v1/automation 或仅提供站点 origin。")
    return urllib.parse.urlunsplit((p.scheme, p.netloc, "/api/v1/automation", "", ""))

def load_token(token_file=None):
    token = os.environ.get("CBLOG_DRAFT_TOKEN")
    if not token:
        p = Path(token_file or DEFAULT_TOKEN_FILE).expanduser()
        try:
            fd = os.open(p, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
            with os.fdopen(fd, "r", encoding="utf-8") as f:
                s = os.fstat(f.fileno())
                if not stat.S_ISREG(s.st_mode) or stat.S_IMODE(s.st_mode) != 0o600 or s.st_uid != os.getuid():
                    raise DraftError("TOKEN_PERMISSIONS", "令牌文件必须由当前用户拥有，且权限为 0600。")
                token = f.read(4097).strip()
        except DraftError:
            raise
        except (OSError, UnicodeError):
            raise DraftError("TOKEN_UNAVAILABLE", "无法读取专用令牌；请配置 CBLOG_DRAFT_TOKEN 或权限 0600 的令牌文件。") from None
    if not token or len(token) > 4096 or any(c.isspace() for c in token):
        raise DraftError("INVALID_TOKEN", "专用令牌为空或格式不正确。")
    return token

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def network_reason(error):
    """Return fixed diagnostics only: never include exception text, URL or headers."""
    reason = error.reason if isinstance(error, urllib.error.URLError) else error
    if isinstance(reason, ssl.SSLCertVerificationError):
        return "TLS_VERIFY_FAILED", "TLS 证书验证失败；请检查可信 CA 和网络环境，不要关闭证书验证。"
    if isinstance(reason, ssl.SSLError):
        return "TLS_ERROR", "TLS 握手失败。"
    if isinstance(reason, socket.gaierror):
        return "DNS_FAILURE", "域名解析失败。"
    if isinstance(reason, (TimeoutError, socket.timeout)):
        return "NETWORK_TIMEOUT", "网络连接或响应读取超时。"
    if isinstance(reason, ConnectionRefusedError):
        return "CONNECTION_REFUSED", "网络连接被拒绝。"
    if isinstance(reason, (ConnectionResetError, http.client.RemoteDisconnected)):
        return "CONNECTION_RESET", "网络连接被重置或提前关闭。"
    return "NETWORK_UNCERTAIN", "网络连接未完成。"

class PinnedHTTPSConnection(http.client.HTTPSConnection):
    """Connect to a validated address while preserving certificate hostname and SNI."""
    def __init__(self, hostname, address, port=443, timeout=15):
        context = ssl.create_default_context()
        if not context.check_hostname or context.verify_mode != ssl.CERT_REQUIRED:
            raise DraftError("TLS_CONFIGURATION", "HTTPS 必须启用主机名和证书验证。")
        super().__init__(hostname, port=port, timeout=timeout, context=context)
        self.address = address

    def connect(self):
        if self._tunnel_host:
            raise DraftError("PROXY_UNSUPPORTED", "固定解析连接不允许代理隧道。")
        raw = socket.create_connection((self.address, self.port), self.timeout, self.source_address)
        try:
            self.sock = self._context.wrap_socket(raw, server_hostname=self.host)
        except BaseException:
            raw.close()
            raise

def doh_addresses(document, hostname):
    """Accept A records only for the requested name or its explicit CNAME chain."""
    query = hostname.rstrip(".").lower()
    if not isinstance(document, dict) or document.get("Status") != 0:
        raise DraftError("DNS_RESPONSE_INVALID", "安全 DNS 未返回成功的解析结果。")
    questions = document.get("Question", [])
    if not any(isinstance(q, dict) and q.get("type") == 1 and str(q.get("name", "")).rstrip(".").lower() == query for q in questions):
        raise DraftError("DNS_RESPONSE_INVALID", "安全 DNS 回包与查询主机不一致。")
    answers = document.get("Answer", [])
    if not isinstance(answers, list) or len(answers) > 64:
        raise DraftError("DNS_RESPONSE_INVALID", "安全 DNS 回包格式不正确。")
    allowed = {query}
    for _ in range(8):
        before = len(allowed)
        for record in answers:
            if isinstance(record, dict) and record.get("type") == 5 and str(record.get("name", "")).rstrip(".").lower() in allowed:
                alias = str(record.get("data", "")).rstrip(".").lower()
                if re.fullmatch(r"[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?", alias):
                    allowed.add(alias)
        if len(allowed) == before:
            break
    result = []
    for record in answers:
        if not isinstance(record, dict) or record.get("type") != 1 or str(record.get("name", "")).rstrip(".").lower() not in allowed:
            continue
        try:
            address = ipaddress.IPv4Address(record.get("data", ""))
        except (ValueError, TypeError):
            raise DraftError("DNS_RESPONSE_INVALID", "安全 DNS 返回了无效 IPv4 地址。") from None
        if not address.is_global or address.is_multicast or address.is_reserved or address.is_unspecified:
            raise DraftError("DNS_ADDRESS_REJECTED", "安全 DNS 返回了非公网地址，已拒绝连接。")
        if str(address) not in result:
            result.append(str(address))
    if not result:
        raise DraftError("DNS_NO_ADDRESS", "安全 DNS 没有返回当前 API 主机的公网 IPv4 地址。")
    return result[:8]

def resolve_cloudflare(hostname, timeout=15):
    # The DNS request contains only the hostname. No API credentials or proxy state.
    if not hostname or "." not in hostname or hostname.endswith(".localhost"):
        raise DraftError("DNS_HOST_REJECTED", "Cloudflare DNS 仅用于明确选择的域名。")
    try:
        ipaddress.ip_address(hostname)
    except ValueError:
        pass
    else:
        raise DraftError("DNS_HOST_REJECTED", "IP 地址无需外部 DNS 解析。")
    path = "/dns-query?" + urllib.parse.urlencode({"name": hostname, "type": "A"})
    last_error = None
    for bootstrap in (None, *DOH_BOOTSTRAP_IPS):
        conn = None
        try:
            conn = (http.client.HTTPSConnection(DOH_HOST, timeout=timeout, context=ssl.create_default_context())
                    if bootstrap is None else PinnedHTTPSConnection(DOH_HOST, bootstrap, timeout=timeout))
            conn.request("GET", path, headers={"Accept": "application/dns-json", "Connection": "close"})
            response = conn.getresponse()
            # Never follow redirects, including ones returned by the resolver.
            if response.status != 200:
                raise DraftError("DNS_HTTP_ERROR", "安全 DNS 未返回成功状态；不会跟随重定向。")
            raw = response.read(65537)
            if len(raw) > 65536:
                raise DraftError("DNS_RESPONSE_INVALID", "安全 DNS 回包过大。")
            try:
                return doh_addresses(json.loads(raw), hostname)
            except (ValueError, UnicodeError):
                raise DraftError("DNS_RESPONSE_INVALID", "安全 DNS 未返回有效 JSON。") from None
        except (urllib.error.URLError, OSError, http.client.HTTPException) as error:
            code, _ = network_reason(error)
            if code == "TLS_VERIFY_FAILED":
                raise DraftError(code, "安全 DNS 的 TLS 证书验证失败，已停止。") from None
            last_error = error
        finally:
            if conn is not None:
                conn.close()
    code, _ = network_reason(last_error)
    raise DraftError("DNS_RESOLVER_UNAVAILABLE", "无法连接安全 DNS（" + code + "）；未发送 API 凭据。") from None

class API:
    def __init__(self, base, token, timeout=15, attempts=3, sleeper=time.sleep, dns_resolver="auto"):
        self.base = base_url(base)
        self.origin = self.base.removesuffix("/api/v1/automation")
        self.token, self.timeout, self.attempts, self.sleeper = token, timeout, attempts, sleeper
        self.opener = urllib.request.build_opener(NoRedirect())
        if dns_resolver not in ("auto", "system", "cloudflare"):
            raise DraftError("INVALID_DNS_RESOLVER", "dns-resolver 仅支持 auto、system 或 cloudflare。")
        self.dns_resolver = dns_resolver
        self.hostname = urllib.parse.urlsplit(self.base).hostname
        self.resolved_ips = None
        self.address_index = 0

    @contextlib.contextmanager
    def open_request(self, request):
        if self.resolved_ips is None:
            with self.opener.open(request, timeout=self.timeout) as response:
                yield response
            return
        parsed = urllib.parse.urlsplit(request.full_url)
        if parsed.scheme != "https" or parsed.hostname != self.hostname:
            raise DraftError("DNS_HOST_MISMATCH", "固定解析仅允许当前 HTTPS API 主机。")
        address = self.resolved_ips[self.address_index % len(self.resolved_ips)]
        conn = PinnedHTTPSConnection(self.hostname, address, port=parsed.port or 443, timeout=self.timeout)
        try:
            path = urllib.parse.urlunsplit(("", "", parsed.path, parsed.query, ""))
            headers = dict(request.header_items())
            headers["Connection"] = "close"
            conn.request(request.method, path, body=request.data, headers=headers)
            response = conn.getresponse()
            if not 200 <= response.status < 300:
                raise urllib.error.HTTPError(request.full_url, response.status, "HTTP response", response.headers, io.BytesIO(response.read(8192)))
            yield response
        finally:
            conn.close()

    def safe_asset_url(self, value, readback=False, asset_id=None):
        absolute = urllib.parse.urljoin(self.origin + "/", value)
        p, origin = urllib.parse.urlsplit(absolute), urllib.parse.urlsplit(self.origin)
        prefix = "/api/v1/automation/assets/" if readback else "/api/v1/assets/"
        if p.scheme != origin.scheme or p.netloc != origin.netloc or p.query or p.fragment or not p.path.startswith(prefix):
            raise DraftError("UNSAFE_ASSET_URL", "附件服务返回了不符合约定的地址。")
        tail = p.path[len(prefix):]
        if not re.fullmatch(r"[a-f0-9]{64}", tail) or (asset_id is not None and tail != asset_id):
            raise DraftError("UNSAFE_ASSET_URL", "附件标识与地址不一致。")
        return absolute

    def request(self, method, path, payload=None, raw=None, mime=None, binary=False):
        if not path.startswith("/") or path.startswith("//"):
            raise DraftError("INVALID_PATH", "只允许访问当前草稿 API。")
        data = canonical(payload) if payload is not None else raw
        headers = {"Authorization": "Bearer " + self.token, "Accept": "application/octet-stream" if binary else "application/json", "User-Agent": USER_AGENT}
        if data is not None:
            headers["Content-Type"] = mime or "application/json; charset=utf-8"
        if self.dns_resolver == "cloudflare" and self.resolved_ips is None:
            if urllib.parse.urlsplit(self.base).scheme != "https":
                raise DraftError("DNS_HOST_REJECTED", "安全 DNS 固定连接仅支持 HTTPS。")
            self.resolved_ips = resolve_cloudflare(self.hostname, self.timeout)
        for attempt in range(self.attempts):
            try:
                req = urllib.request.Request(self.base + path, data=data, headers=headers, method=method)
                with self.open_request(req) as response:
                    result = response.read((MAX_ASSET + 1) if binary else (MAX_BODY * 4 + 1))
                    if binary:
                        if len(result) > MAX_ASSET:
                            raise DraftError("INVALID_RESPONSE", "附件读回超过大小限制。")
                        return result
                    if len(result) > MAX_BODY * 4:
                        raise DraftError("INVALID_RESPONSE", "API 响应超过大小限制。")
                    try:
                        parsed = json.loads(result)
                    except (UnicodeError, ValueError):
                        raise DraftError("INVALID_RESPONSE", "API 未返回有效 JSON。") from None
                    if not isinstance(parsed, dict) or "data" not in parsed:
                        raise DraftError("INVALID_RESPONSE", "API 响应缺少 data。")
                    return parsed
            except urllib.error.HTTPError as error:
                status = error.code
                try:
                    parsed = json.loads(error.read(8192))
                    code = parsed.get("error", {}).get("code", "HTTP_ERROR")
                    if not isinstance(code, str) or not re.fullmatch(r"[A-Z_]{1,64}", code):
                        code = "HTTP_ERROR"
                except (ValueError, UnicodeError, AttributeError, OSError):
                    code = "HTTP_ERROR"
                if status not in (429, 500, 502, 503, 504) or attempt + 1 == self.attempts:
                    raise DraftError(code, f"草稿 API 请求失败（HTTP {status}）；未自动覆盖。", status) from None
            except (urllib.error.URLError, OSError, http.client.HTTPException) as error:
                code, message = network_reason(error)
                if code == "TLS_VERIFY_FAILED":
                    raise DraftError(code, message) from None
                if attempt + 1 == self.attempts:
                    suffix = "读取未完成。" if method == "GET" else "写入结果待确认。保留 manifest，以同一命令恢复；不要更换 source-key。"
                    raise DraftError(code, message + suffix) from None
                if self.resolved_ips is not None:
                    self.address_index += 1
                elif self.dns_resolver == "auto" and self.hostname == DEFAULT_API_HOST:
                    self.resolved_ips = resolve_cloudflare(self.hostname, self.timeout)
            self.sleeper(min(2 ** attempt, 4))

    def capabilities(self):
        data = self.request("GET", "/capabilities")["data"]
        if data.get("service") != "cblog-draft-automation" or data.get("version") != 1 or data.get("mode") != "draft-only":
            raise DraftError("CAPABILITY_MISMATCH", "服务未声明兼容的仅草稿接口，已停止。")
        return data

    def read(self, key):
        validate_key(key)
        return self.request("GET", "/drafts/" + key)["data"]

    def asset_readback(self, record, expected_sha=None):
        if record["id"] != record["sha256"] or (expected_sha is not None and record["sha256"] != expected_sha):
            raise DraftError("ASSET_MISMATCH", "manifest 中的附件标识与当前本地图片不一致。")
        self.safe_asset_url(record["url"], False, record["id"])
        self.safe_asset_url(record["readback_url"], True, record["id"])
        raw = self.request("GET", "/assets/" + record["id"], binary=True)
        if digest(raw) != record["sha256"] or len(raw) != record["bytes"]:
            raise DraftError("ASSET_MISMATCH", "附件读回摘要或长度不一致；草稿未标记为验证成功。")
        return raw

def validate_key(key):
    if not KEY_RE.fullmatch(key):
        raise DraftError("INVALID_SOURCE_KEY", "source-key 需为 1–120 位小写字母、数字、下划线或连字符，且首尾为字母或数字。")

def image_mime(raw):
    if raw.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if raw.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if len(raw) >= 12 and raw.startswith(b"RIFF") and raw[8:12] == b"WEBP":
        return "image/webp"
    raise DraftError("INVALID_IMAGE", "仅支持 PNG、JPEG 或 WebP 本地图片。")

def mask_code(body):
    chars, fence, pos = list(body), None, 0
    for line in body.splitlines(keepends=True):
        m = re.match(r"^ {0,3}(`{3,}|~{3,})", line)
        if fence:
            if m and m.group(1)[0] == fence[0] and len(m.group(1)) >= len(fence):
                fence = None
            chars[pos:pos + len(line)] = re.sub(r"[^\n]", " ", line)
        elif m:
            fence = m.group(1)
            chars[pos:pos + len(line)] = re.sub(r"[^\n]", " ", line)
        elif line.startswith("    ") or line.startswith("\t"):
            chars[pos:pos + len(line)] = re.sub(r"[^\n]", " ", line)
        pos += len(line)
    masked = "".join(chars)
    for m in re.finditer(r"(`+)(?!`)([\s\S]*?)(?<!`)\1(?!`)", masked):
        chars[m.start():m.end()] = re.sub(r"[^\n]", " ", masked[m.start():m.end()])
    return "".join(chars)

def destination_span(text, start, end=None):
    end = len(text) if end is None else end
    while start < end and text[start].isspace():
        start += 1
    if start >= end:
        return None
    if text[start] == "<":
        finish = text.find(">", start + 1, end)
        return (start + 1, finish) if finish != -1 else None
    depth, i = 0, start
    while i < end:
        c = text[i]
        if c == "\\" and i + 1 < end:
            i += 2
            continue
        if c == "(":
            depth += 1
        elif c == ")":
            if depth == 0:
                break
            depth -= 1
        elif c.isspace() and depth == 0:
            break
        i += 1
    return (start, i) if i > start else None

def image_spans(body):
    masked, spans, labels = mask_code(body), set(), set()
    for m in re.finditer(r"(?<!\\)!\[((?:\\.|[^\]\\])*)\]", masked):
        i = m.end()
        if i < len(masked) and masked[i] == "(":
            span = destination_span(masked, i + 1)
            if span:
                spans.add(span)
        elif i < len(masked) and masked[i] == "[":
            end = masked.find("]", i + 1)
            if end != -1:
                labels.add((masked[i + 1:end] or m.group(1)).casefold().strip())
        else:
            labels.add(m.group(1).casefold().strip())
    for m in re.finditer(r"(?m)^ {0,3}\[([^\]]+)\]:[ \t]*", masked):
        if m.group(1).casefold().strip() in labels:
            end = masked.find("\n", m.end())
            span = destination_span(masked, m.end(), end if end != -1 else len(masked))
            if span:
                spans.add(span)
    for tag in re.finditer(r"<img\b[^>]*>", masked, re.I):
        m = re.search(r"\bsrc\s*=\s*([\"'])(.*?)\1", tag.group(), re.I)
        if m:
            spans.add((tag.start() + m.start(2), tag.start() + m.end(2)))
    return sorted(spans)

def make_plan(markdown, title, source_key, topic_id=None, tags=None, display_published_at=None):
    validate_key(source_key)
    p = Path(markdown).expanduser().resolve()
    title = title.strip()
    if not title or len(title) > 200:
        raise DraftError("INVALID_TITLE", "标题需为 1–200 个字符。")
    if len(tags or []) > 20 or any(len(tag) > 40 for tag in (tags or [])):
        raise DraftError("INVALID_TAGS", "最多 20 个标签，每个标签最多 40 个字符。")
    try:
        raw = p.read_bytes()
        body = raw.decode("utf-8")
    except (OSError, UnicodeError):
        raise DraftError("INVALID_MARKDOWN", "无法读取 UTF-8 Markdown 文件。") from None
    if len(raw) > MAX_BODY:
        raise DraftError("BODY_TOO_LARGE", "正文超过 256 KiB，不会自动截短。")
    if display_published_at:
        try:
            when = dt.datetime.fromisoformat(display_published_at.replace("Z", "+00:00"))
            if when.tzinfo is None:
                raise ValueError
        except ValueError:
            raise DraftError("INVALID_DATE", "展示时间需为含时区的 ISO 8601 时间。") from None
    assets, occurrences, remote = {}, [], []
    for start, end in image_spans(body):
        value = re.sub(r"\\([\\ ()])", r"\1", body[start:end])
        parts = urllib.parse.urlsplit(value)
        if parts.scheme in ("https", "http") or value.startswith("//") or value.startswith("/api/v1/assets/"):
            remote.append(value)
            continue
        if parts.scheme or not parts.path or parts.query or parts.fragment:
            raise DraftError("UNSUPPORTED_IMAGE_URL", "图片需使用本地文件或 HTTP(S) 地址。")
        asset = Path(urllib.parse.unquote(parts.path)).expanduser()
        asset = (p.parent / asset if not asset.is_absolute() else asset).resolve()
        try:
            if asset.stat().st_size > MAX_ASSET:
                raise DraftError("ASSET_TOO_LARGE", "本地图片超过 1 MiB；请先整理资源。")
            data = asset.read_bytes()
        except OSError:
            raise DraftError("IMAGE_NOT_FOUND", "Markdown 引用的本地图片不存在或不可读。") from None
        mime, sha = image_mime(data), digest(data)
        assets.setdefault(sha, {"path": str(asset), "sha256": sha, "bytes": len(data), "mime": mime})
        occurrences.append({"start": start, "end": end, "sha256": sha})
    fields = {"title": title, "body": body, "topic_id": None if topic_id in (None, "none") else topic_id, "tags": list(dict.fromkeys(tags or []))}
    if display_published_at is not None:
        fields["display_published_at"] = display_published_at
    fingerprint = digest(canonical({"fields": fields, "assets": list(assets), "sourceKey": source_key}))
    return {"sourceKey": source_key, "markdown": str(p), "input_sha256": fingerprint, "source_body_sha256": digest(raw), "body_bytes": len(raw), "fields": fields, "assets": assets, "occurrences": occurrences, "external_images": remote}

def plan_summary(plan):
    return {"mode": "offline-plan", "sourceKey": plan["sourceKey"], "title": plan["fields"]["title"], "topic_id": plan["fields"]["topic_id"], "tags": plan["fields"]["tags"], "body_bytes": plan["body_bytes"], "body_sha256": plan["source_body_sha256"], "local_images": list(plan["assets"].values()), "external_image_count": len(plan["external_images"]), "writes_permitted": False}

class Manifest:
    def __init__(self, path, base, key):
        self.path = Path(path).expanduser()
        try:
            self.data = json.loads(self.path.read_bytes()) if self.path.exists() else {"schema": 1, "base_url": base, "sourceKey": key, "assets": {}}
        except (OSError, ValueError):
            raise DraftError("INVALID_MANIFEST", "manifest 无法读取；保留原文件并检查，不要以新 key 重试。") from None
        if self.data.get("schema") != 1 or self.data.get("base_url") != base or self.data.get("sourceKey") != key:
            raise DraftError("MANIFEST_MISMATCH", "manifest 与当前 API 或 source-key 不匹配。")

    def save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        name = None
        try:
            fd, name = tempfile.mkstemp(prefix=".cblog-manifest-", dir=self.path.parent)
            with os.fdopen(fd, "wb") as f:
                os.fchmod(f.fileno(), 0o600)
                f.write(canonical(self.data) + b"\n")
                f.flush()
                os.fsync(f.fileno())
            os.replace(name, self.path)
        except OSError:
            raise DraftError("MANIFEST_WRITE_FAILED", "无法安全保存 manifest；已停止后续远端写入。") from None
        finally:
            if name and os.path.exists(name):
                os.unlink(name)

def verify_draft(remote, payload, source_key, version=None):
    if remote.get("state") != "draft" or remote.get("visibility") != "owner" or remote.get("writable") is False:
        raise DraftError("NOT_DRAFT", "远端内容不是仅自己可见的草稿，已停止。")
    if remote.get("sourceKey") != source_key or (version is not None and remote.get("version") != version):
        raise DraftError("READBACK_CONFLICT", "读回来源或版本与回执不同；可能存在并发编辑，请先审阅。")
    for field in ("title", "body", "topic_id", "tags", "display_published_at"):
        actual, expected = remote.get(field), payload.get(field)
        if field == "display_published_at" and actual and expected:
            try:
                actual = dt.datetime.fromisoformat(actual.replace("Z", "+00:00"))
                expected = dt.datetime.fromisoformat(expected.replace("Z", "+00:00"))
            except ValueError:
                raise DraftError("READBACK_MISMATCH", "读回展示时间不是有效 ISO 时间。") from None
        if field in payload and actual != expected:
            raise DraftError("READBACK_MISMATCH", "读回正文或属性与本次写入不一致。")
    if digest(remote.get("body", "").encode("utf-8")) != remote.get("body_sha256"):
        raise DraftError("READBACK_MISMATCH", "读回正文摘要不一致。")

def import_draft(api, plan, manifest_path, expected_version=None):
    key = plan["sourceKey"]
    m = Manifest(manifest_path, api.base, key)
    api.capabilities()
    pending = m.data.get("pending")
    if pending and (pending.get("rejected") or pending.get("reconciled")) and expected_version is not None:
        # A definitive rejection plus explicit reviewed version may start a new mutation.
        # Uncertain requests must first replay their original mutation, even with this flag.
        m.data["last_resolved_mutation"] = {"clientMutationId": pending["payload"]["clientMutationId"], "rejected": pending.get("rejected"), "reconciled": pending.get("reconciled")}
        m.data.pop("pending")
        m.save()
        pending = None
    if pending and pending.get("input_sha256") != plan["input_sha256"]:
        raise DraftError("PENDING_INPUT_CHANGED", "上次请求尚待确认；请使用原输入恢复，再整理新修改。")
    try:
        remote = api.read(key)
    except DraftError as error:
        if error.status == 404:
            remote = None
        else:
            raise
    if remote is not None and (remote.get("state") != "draft" or remote.get("visibility") != "owner" or remote.get("writable") is False):
        raise DraftError("NOT_DRAFT", "该来源已绑定非草稿内容，不会自动回退或覆盖。")
    if pending is None:
        previous = m.data.get("verified")
        current_version = remote["version"] if remote else 0
        known_version = expected_version if expected_version is not None else (previous["version"] if previous else 0)
        if current_version != known_version:
            raise DraftError("VERSION_REVIEW_REQUIRED", "远端版本与记录不同。先 read 审阅合并，再用 --expected-version 指定已审阅版本。")
        if previous and previous.get("input_sha256") == plan["input_sha256"] and remote and remote["version"] == previous["version"]:
            verify_draft(remote, previous["fields"], key, previous["version"])
            for sha in plan["assets"]:
                api.asset_readback(m.data["assets"][sha], sha)
            return {"status": "verified", "changed": False, "sourceKey": key, "version": remote["version"], "body_sha256": remote["body_sha256"], "admin_url": remote["admin_url"], "manifest": str(m.path)}
        m.save()
        for sha, asset in plan["assets"].items():
            if sha not in m.data["assets"]:
                raw = Path(asset["path"]).read_bytes()
                if digest(raw) != sha:
                    raise DraftError("LOCAL_ASSET_CHANGED", "本地图片在计划后发生变化，已停止。")
                record = api.request("POST", "/assets", raw=raw, mime=asset["mime"])["data"]
                if record.get("sha256") != sha or record.get("id") != sha or record.get("bytes") != asset["bytes"] or record.get("mime") != asset["mime"]:
                    raise DraftError("ASSET_MISMATCH", "上传附件回执与本地文件不一致。")
                api.safe_asset_url(record["url"], False, record["id"])
                api.safe_asset_url(record["readback_url"], True, record["id"])
                api.asset_readback(record)
                m.data["assets"][sha] = record
                m.save()
            else:
                api.asset_readback(m.data["assets"][sha], sha)
        body = plan["fields"]["body"]
        for item in reversed(plan["occurrences"]):
            url = m.data["assets"][item["sha256"]]["url"]
            body = body[:item["start"]] + url + body[item["end"]:]
        if len(body.encode("utf-8")) > MAX_BODY:
            raise DraftError("BODY_TOO_LARGE", "替换图片地址后的正文超过限制，不会截短。")
        fields = {**plan["fields"], "body": body}
        payload = {**fields, "expectedVersion": current_version, "clientMutationId": str(uuid.uuid4())}
        pending = {"input_sha256": plan["input_sha256"], "payload": payload, "fields": fields}
        m.data["pending"] = pending
        m.save()
    payload = pending["payload"]
    try:
        receipt = api.request("PUT", "/drafts/" + key, payload=payload)["data"]
    except DraftError as error:
        if error.status in (400, 401, 403, 404, 409, 413, 415, 422):
            m.data["pending"]["rejected"] = error.code
            m.save()
        raise
    verify_draft(receipt, pending["fields"], key)
    current = api.read(key)
    try:
        verify_draft(current, pending["fields"], key, receipt["version"])
    except DraftError:
        if current.get("version", 0) > receipt["version"]:
            # The original mutation is known applied; a later edit must be reviewed.
            m.data["pending"]["reconciled"] = {"appliedVersion": receipt["version"], "currentVersion": current["version"]}
            m.save()
        raise
    for sha in plan["assets"]:
        api.asset_readback(m.data["assets"][sha], sha)
    m.data["verified"] = {"input_sha256": plan["input_sha256"], "version": current["version"], "fields": pending["fields"], "body_sha256": current["body_sha256"], "id": current["id"], "admin_url": current["admin_url"], "verified_at": dt.datetime.now(dt.timezone.utc).isoformat()}
    m.data.pop("pending", None)
    m.save()
    return {"status": "verified", "changed": True, "sourceKey": key, "version": current["version"], "body_sha256": current["body_sha256"], "admin_url": current["admin_url"], "manifest": str(m.path)}

def parser():
    p = argparse.ArgumentParser(description="cBlog 草稿 API：离线计划、幂等导入和读回核验；不公开发布。")
    p.add_argument("--base-url", default=os.environ.get("CBLOG_DRAFT_API_URL", DEFAULT_BASE))
    p.add_argument("--token-file")
    p.add_argument("--dns-resolver", choices=("auto", "system", "cloudflare"), default=os.environ.get("CBLOG_DRAFT_DNS_RESOLVER", "auto"))
    p.add_argument("--timeout", type=float, default=15)
    p.add_argument("--attempts", type=int, default=3, choices=range(1, 4))
    sub = p.add_subparsers(dest="command", required=True)
    for command in ("plan", "import"):
        s = sub.add_parser(command)
        s.add_argument("--markdown", required=True)
        s.add_argument("--title", required=True)
        s.add_argument("--source-key", required=True)
        s.add_argument("--topic-id", default="none")
        s.add_argument("--tag", action="append", default=[])
        s.add_argument("--display-published-at")
        if command == "import":
            s.add_argument("--manifest")
            s.add_argument("--expected-version", type=int)
    sub.add_parser("groups")
    read = sub.add_parser("read")
    read.add_argument("source_key")
    listing = sub.add_parser("list")
    listing.add_argument("--cursor")
    listing.add_argument("--limit", type=int, default=50, choices=range(1, 101))
    return p

def main(argv=None):
    args = parser().parse_args(argv)
    token = None
    try:
        if args.timeout <= 0 or args.timeout > 120:
            raise DraftError("INVALID_TIMEOUT", "timeout 必须在 0–120 秒之间。")
        plan = None
        if args.command in ("plan", "import"):
            plan = make_plan(args.markdown, args.title, args.source_key, args.topic_id, args.tag, args.display_published_at)
        if args.command == "plan":
            result = plan_summary(plan)
        else:
            token = load_token(args.token_file)
            api = API(args.base_url, token, args.timeout, args.attempts, dns_resolver=args.dns_resolver)
            if args.command == "import":
                if args.expected_version is not None and args.expected_version < 0:
                    raise DraftError("INVALID_VERSION", "expected-version 不能为负数。")
                document = Path(plan["markdown"])
                manifest = args.manifest or document.with_name("." + document.name + "." + args.source_key + ".cblog-manifest.json")
                result = import_draft(api, plan, manifest, args.expected_version)
            elif args.command == "read":
                result = {"data": api.read(args.source_key)}
            elif args.command == "groups":
                result = api.request("GET", "/groups")
            else:
                query = {"limit": args.limit}
                if args.cursor:
                    validate_key(args.cursor)
                    query["cursor"] = args.cursor
                result = api.request("GET", "/drafts?" + urllib.parse.urlencode(query))
        output = json.dumps(result, ensure_ascii=False, indent=2)
        print(output.replace(token, "[REDACTED]") if token else output)
        return 0
    except DraftError as error:
        output = json.dumps({"error": {"code": error.code, "message": error.message}}, ensure_ascii=False)
        print(output.replace(token, "[REDACTED]") if token else output, file=sys.stderr)
        return 2
    except (OSError, ValueError, KeyError, TypeError):
        print('{"error":{"code":"INVALID_LOCAL_OR_REMOTE_DATA","message":"本地文件或 API 数据格式异常；已停止，请保留 manifest 检查。"}}', file=sys.stderr)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
