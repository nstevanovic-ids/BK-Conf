#!/usr/bin/env python3
"""Serveur statique de mesure : compresse en gzip le texte comme GitHub Pages.

Usage : python docs/lot1/outils/serve.py <dossier> [port]

GitHub Pages sert HTML, CSS, JS, JSON, SVG et texte en gzip, avec Cache-Control max-age=600.
Le serveur de Python ne compresse pas : sans cela, Lighthouse mesurerait des poids bruts.
"""
import gzip
import http.server
import sys
from functools import partial
from io import BytesIO
from pathlib import Path

TEXT = {".html", ".js", ".css", ".json", ".svg", ".txt", ".md", ".ico"}


class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir():
            path = path / "index.html"
        gz = "gzip" in self.headers.get("Accept-Encoding", "") and path.suffix in TEXT
        if not gz or not path.is_file():
            return super().send_head()
        body = gzip.compress(path.read_bytes(), 6)
        self.send_response(200)
        self.send_header("Content-Type", self.guess_type(str(path)))
        self.send_header("Content-Encoding", "gzip")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "max-age=600")
        self.end_headers()
        return BytesIO(body)

    def log_message(self, *args):
        pass


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8000
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=root))
    print(f"http://127.0.0.1:{port}/ → {root}", flush=True)
    srv.serve_forever()


if __name__ == "__main__":
    main()
