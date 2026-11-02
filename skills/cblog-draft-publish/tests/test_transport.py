import contextlib
import importlib.util
import io
import json
from pathlib import Path
import socket
import ssl
import unittest
from unittest.mock import MagicMock, patch
import urllib.error
import urllib.request

SPEC = importlib.util.spec_from_file_location("cblog_transport", Path(__file__).parents[1] / "scripts/cblog_draft.py")
c = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(c)
HOST = c.DEFAULT_API_HOST
IP = "104.21.50.142"
TOKEN = "synthetic-secret-for-transport-tests"

def dns_document(host=HOST, records=None):
    return {"Status": 0, "Question": [{"name": host, "type": 1}], "Answer": records or [{"name": host, "type": 1, "data": IP}]}

class FakeResponse(io.BytesIO):
    status = 200
    headers = {}

class FakeConnection:
    created = []
    status = 200
    document = dns_document()
    def __init__(self, host, *args, **kwargs):
        self.host, self.args, self.kwargs = host, args, kwargs
        self.requests = []
        self.closed = False
        self.created.append(self)
    def request(self, method, path, body=None, headers=None):
        self.requests.append((method, path, body, headers or {}))
    def getresponse(self):
        result = FakeResponse(json.dumps(self.document).encode())
        result.status = self.status
        return result
    def close(self):
        self.closed = True

class TransportTests(unittest.TestCase):
    def setUp(self):
        FakeConnection.created = []
        FakeConnection.status = 200
        FakeConnection.document = dns_document()

    def assert_code(self, code, fn):
        with self.assertRaises(c.DraftError) as caught:
            fn()
        self.assertEqual(caught.exception.code, code)
        self.assertNotIn(TOKEN, caught.exception.message)

    def test_doh_question_and_answer_host_are_bound(self):
        self.assertEqual(c.doh_addresses(dns_document(), HOST), [IP])
        self.assert_code("DNS_RESPONSE_INVALID", lambda: c.doh_addresses(dns_document("other.example.test"), HOST))
        wrong_answer = dns_document(records=[{"name": "other.example.test", "type": 1, "data": IP}])
        self.assert_code("DNS_NO_ADDRESS", lambda: c.doh_addresses(wrong_answer, HOST))

    def test_only_explicit_cname_chain_is_accepted(self):
        doc = dns_document(records=[{"name": HOST, "type": 5, "data": "alias.example.test."}, {"name": "alias.example.test", "type": 1, "data": IP}, {"name": "unrelated.example.test", "type": 1, "data": "1.1.1.1"}])
        self.assertEqual(c.doh_addresses(doc, HOST), [IP])

    def test_private_loopback_multicast_and_invalid_answers_rejected(self):
        for value in ("127.0.0.1", "10.1.2.3", "169.254.1.1", "224.0.0.1", "0.0.0.0", "::1", "not-an-ip"):
            with self.subTest(value=value), self.assertRaises(c.DraftError):
                c.doh_addresses(dns_document(records=[{"name": HOST, "type": 1, "data": value}]), HOST)

    def test_dns_request_has_no_bearer_and_uses_fixed_host(self):
        with patch.object(c.http.client, "HTTPSConnection", FakeConnection):
            self.assertEqual(c.resolve_cloudflare(HOST), [IP])
        conn = FakeConnection.created[0]
        self.assertEqual(conn.host, "cloudflare-dns.com")
        self.assertTrue(conn.kwargs["context"].check_hostname)
        self.assertEqual(conn.kwargs["context"].verify_mode, ssl.CERT_REQUIRED)
        method, path, body, headers = conn.requests[0]
        self.assertEqual(method, "GET")
        self.assertEqual(path, "/dns-query?name=" + HOST + "&type=A")
        self.assertEqual(headers["Accept"], "application/dns-json")
        self.assertNotIn("Authorization", headers)
        self.assertNotIn(TOKEN, str(conn.requests))
        self.assertIsNone(body)
        self.assertTrue(conn.closed)

    def test_dns_redirect_is_not_followed(self):
        FakeConnection.status = 302
        with patch.object(c.http.client, "HTTPSConnection", FakeConnection), patch.object(c, "PinnedHTTPSConnection") as pinned:
            self.assert_code("DNS_HTTP_ERROR", lambda: c.resolve_cloudflare(HOST))
        self.assertEqual(len(FakeConnection.created), 1)
        pinned.assert_not_called()

    def test_dns_system_failure_uses_bootstrap_with_resolver_hostname(self):
        with patch.object(c.http.client, "HTTPSConnection", side_effect=socket.gaierror("private error " + TOKEN)), patch.object(c, "PinnedHTTPSConnection", FakeConnection):
            self.assertEqual(c.resolve_cloudflare(HOST), [IP])
        conn = FakeConnection.created[0]
        self.assertEqual(conn.host, "cloudflare-dns.com")
        self.assertEqual(conn.args, ("1.1.1.1",))
        self.assertNotIn(TOKEN, str(conn.requests))

    def test_pinned_socket_keeps_hostname_sni_and_certificate_checks(self):
        raw, wrapped = MagicMock(), MagicMock()
        context = MagicMock(check_hostname=True, verify_mode=ssl.CERT_REQUIRED)
        context.wrap_socket.return_value = wrapped
        with patch.object(c.ssl, "create_default_context", return_value=context), patch.object(c.socket, "create_connection", return_value=raw) as connect:
            conn = c.PinnedHTTPSConnection(HOST, IP, timeout=7)
            conn.connect()
        connect.assert_called_once_with((IP, 443), 7, None)
        context.wrap_socket.assert_called_once_with(raw, server_hostname=HOST)
        self.assertEqual(conn.host, HOST)
        self.assertIs(conn.sock, wrapped)

    def test_tls_failure_closes_socket_and_does_not_weaken_validation(self):
        raw = MagicMock()
        context = MagicMock(check_hostname=True, verify_mode=ssl.CERT_REQUIRED)
        context.wrap_socket.side_effect = ssl.SSLCertVerificationError("mismatch " + TOKEN)
        with patch.object(c.ssl, "create_default_context", return_value=context), patch.object(c.socket, "create_connection", return_value=raw):
            conn = c.PinnedHTTPSConnection(HOST, IP)
            with self.assertRaises(ssl.SSLCertVerificationError):
                conn.connect()
        raw.close.assert_called_once()
        self.assertTrue(context.check_hostname)
        self.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)

    def test_unknown_internal_host_never_automatically_queries_external_dns(self):
        api = c.API("https://private.service.internal/api/v1/automation", TOKEN, attempts=2, sleeper=lambda _: None)
        api.opener = MagicMock()
        api.opener.open.side_effect = TimeoutError("sensitive " + TOKEN)
        with patch.object(c, "resolve_cloudflare") as resolver:
            self.assert_code("NETWORK_TIMEOUT", lambda: api.request("GET", "/capabilities"))
        resolver.assert_not_called()

    def test_known_host_auto_fallback_keeps_mutation_and_bearer_on_api_only(self):
        api = c.API(c.DEFAULT_BASE, TOKEN, attempts=2, sleeper=lambda _: None)
        api.opener = MagicMock()
        api.opener.open.side_effect = TimeoutError("network " + TOKEN)
        FakeConnection.document = {"data": {"ok": True}}
        payload = {"clientMutationId": "stable-id", "body": "完整正文"}
        with patch.object(c, "resolve_cloudflare", return_value=[IP]) as resolver, patch.object(c, "PinnedHTTPSConnection", FakeConnection):
            self.assertEqual(api.request("PUT", "/drafts/test", payload=payload)["data"], {"ok": True})
        resolver.assert_called_once_with(HOST, 15)
        conn = FakeConnection.created[0]
        self.assertEqual(conn.host, HOST)
        self.assertEqual(conn.args, (IP,))
        system_request = api.opener.open.call_args.args[0]
        direct_request = conn.requests[0]
        self.assertEqual(system_request.data, direct_request[2])
        self.assertEqual(direct_request[3]["Authorization"], "Bearer " + TOKEN)

    def test_explicit_cloudflare_skips_system_api_request_and_refuses_redirect(self):
        api = c.API(c.DEFAULT_BASE, TOKEN, dns_resolver="cloudflare", sleeper=lambda _: None)
        api.opener = MagicMock()
        FakeConnection.status = 302
        with patch.object(c, "resolve_cloudflare", return_value=[IP]), patch.object(c, "PinnedHTTPSConnection", FakeConnection):
            self.assert_code("HTTP_ERROR", lambda: api.request("GET", "/capabilities"))
        api.opener.open.assert_not_called()
        self.assertEqual(len(FakeConnection.created), 1)

    def test_certificate_error_no_auto_dns_fallback_or_retry(self):
        api = c.API(c.DEFAULT_BASE, TOKEN, attempts=3, sleeper=lambda _: None)
        api.opener = MagicMock()
        api.opener.open.side_effect = urllib.error.URLError(ssl.SSLCertVerificationError("bad cert " + TOKEN))
        with patch.object(c, "resolve_cloudflare") as resolver:
            self.assert_code("TLS_VERIFY_FAILED", lambda: api.request("GET", "/capabilities"))
        resolver.assert_not_called()
        self.assertEqual(api.opener.open.call_count, 1)

    def test_error_reason_is_whitelisted_and_does_not_echo_exception(self):
        for error, expected in ((urllib.error.URLError(socket.gaierror(TOKEN)), "DNS_FAILURE"), (TimeoutError(TOKEN), "NETWORK_TIMEOUT"), (ConnectionResetError(TOKEN), "CONNECTION_RESET"), (ssl.SSLError(TOKEN), "TLS_ERROR")):
            code, message = c.network_reason(error)
            self.assertEqual(code, expected)
            self.assertNotIn(TOKEN, message)

if __name__ == "__main__":
    unittest.main()
