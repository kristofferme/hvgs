"""Den lokale nettsida.

Tjeneren lytter bare på 127.0.0.1, og saven forlater aldri maskinen. Alt
filtrering og sortering skjer her, i Python – nettleseren får bare den sida med
rader den faktisk viser.
"""

from __future__ import annotations

import json
import socket
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from . import csvut
from .datasett import Datasett
from .felles import HER, si
from .spillere import ATTRIBUTTGRUPPER, FELT, FELT_FOR

WEB = HER / "web"
MIME = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml"}


class Handler(BaseHTTPRequestHandler):
    datasett: Datasett = None          # settes av start()
    server_version = "fmscout"

    def log_message(self, *_args):     # ingen støy i terminalen
        pass

    # -- små hjelpere -----------------------------------------------------

    def _svar(self, kropp: bytes, type_: str = "application/json; charset=utf-8",
              status: int = 200, ekstra: dict | None = None):
        self.send_response(status)
        self.send_header("Content-Type", type_)
        self.send_header("Content-Length", str(len(kropp)))
        self.send_header("Cache-Control", "no-store")
        for navn, verdi in (ekstra or {}).items():
            self.send_header(navn, verdi)
        self.end_headers()
        self.wfile.write(kropp)

    def _json(self, data, status: int = 200):
        self._svar(json.dumps(data, ensure_ascii=False).encode("utf-8"), status=status)

    def _fil(self, navn: str):
        sti = (WEB / navn).resolve()
        if not sti.is_file() or WEB.resolve() not in sti.parents:
            self._svar(b"finnes ikke", "text/plain; charset=utf-8", 404)
            return
        self._svar(sti.read_bytes(), MIME.get(sti.suffix, "application/octet-stream"))

    def _kropp(self) -> dict:
        lengde = int(self.headers.get("Content-Length") or 0)
        if not lengde:
            return {}
        try:
            return json.loads(self.rfile.read(lengde).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return {}

    # -- ruter ------------------------------------------------------------

    def do_GET(self):
        rute = urlparse(self.path)
        sti = rute.path
        if sti in ("/", "/index.html"):
            return self._fil("index.html")
        if sti in ("/app.js", "/stil.css"):
            return self._fil(sti.lstrip("/"))
        if sti == "/api/meta":
            meta = self.datasett.meta()
            meta["attributtgrupper"] = {
                gruppe: [n for n, _, _ in liste] for gruppe, liste in ATTRIBUTTGRUPPER
            }
            meta["feltgrupper"] = _feltgrupper(self.datasett)
            return self._json(meta)
        if sti == "/api/spiller":
            nr = int((parse_qs(rute.query).get("nr") or ["-1"])[0])
            if 0 <= nr < len(self.datasett.rader):
                rad = dict(self.datasett.rader[nr])
                rad.pop("sok", None)
                return self._json(rad)
            return self._json({"feil": "ukjent spiller"}, 404)
        if sti == "/api/csv":
            return self._csv(parse_qs(rute.query))
        return self._svar(b"finnes ikke", "text/plain; charset=utf-8", 404)

    def do_POST(self):
        if urlparse(self.path).path != "/api/sok":
            return self._svar(b"finnes ikke", "text/plain; charset=utf-8", 404)
        try:
            return self._json(self.datasett.sok(self._kropp()))
        except Exception as e:                      # noqa: BLE001 – vis feilen i UI-et
            return self._json({"feil": str(e)}, 400)

    def _csv(self, spm: dict):
        try:
            sporring = json.loads((spm.get("q") or ["{}"])[0])
        except ValueError:
            sporring = {}
        rader = self.datasett.treff(sporring)
        if (spm.get("kolonner") or ["synlige"])[0] == "alle":
            kolonner = [f.nokkel for f in FELT if f.nokkel not in self.datasett.tomme]
        else:
            kolonner = [k for k in (sporring.get("kolonner") or []) if k in FELT_FOR]
        skilletegn = (spm.get("skilletegn") or [";"])[0][:1] or ";"
        tekst = csvut.til_tekst(rader, kolonner, skilletegn=skilletegn)
        self._svar(
            b"\xef\xbb\xbf" + tekst.encode("utf-8"),
            "text/csv; charset=utf-8",
            ekstra={"Content-Disposition": 'attachment; filename="fmscout.csv"'},
        )


def _feltgrupper(datasett: Datasett) -> dict:
    ut: dict[str, list[str]] = {}
    for felt in datasett.kolonner:
        ut.setdefault(felt.gruppe, []).append(felt.nokkel)
    return ut


def ledig_port(onsket: int) -> int:
    if onsket:
        return onsket
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def start(datasett: Datasett, *, port: int = 0, apne: bool = True, melding=si) -> None:
    Handler.datasett = datasett
    port = ledig_port(port)
    tjener = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    adresse = f"http://127.0.0.1:{port}/"
    melding("")
    melding(f"  {len(datasett.rader)} spillere klare  ·  {adresse}")
    melding("  Trykk Ctrl+C når du er ferdig.")
    melding("")
    if apne:
        threading.Timer(0.4, lambda: webbrowser.open(adresse)).start()
    try:
        tjener.serve_forever()
    except KeyboardInterrupt:
        melding("Ha det.")
    finally:
        tjener.server_close()
