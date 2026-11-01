#!/usr/bin/env python3
"""
Serveur statique local avec support des requêtes HTTP Range (HTTP 206).
La vidéo se charge par petits morceaux à la demande : lecture instantanée,
seek n'importe où sans avoir téléchargé tout le fichier — comme YouTube.
"""
import http.server
import os
import re
import socketserver
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8742
CHUNK = 64 * 1024
RANGE_RE = re.compile(r'^bytes=(\d*)-(\d*)$')


class RangeHandler(http.server.SimpleHTTPRequestHandler):
    # keep-alive HTTP/1.1 : nous écrivons toujours un Content-Length exact
    protocol_version = 'HTTP/1.1'

    def end_headers(self):
        # annonce le support Range sur toutes les réponses
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_HEAD(self):
        rng = self.headers.get('Range')
        if rng:
            self._serve_range(head_only=True)
        else:
            super().do_HEAD()

    def do_GET(self):
        if 'Range' in self.headers:
            self._serve_range()
        else:
            super().do_GET()

    def _serve_range(self, head_only=False):
        path = self.translate_path(self.path)
        if os.path.isdir(path) or not os.path.isfile(path):
            # on laisse le handler standard gérer (index.html, 404…)
            if head_only:
                super().do_HEAD()
            else:
                super().do_GET()
            return
        try:
            size = os.path.getsize(path)
        except OSError:
            self.send_error(404, 'File not found')
            return

        m = RANGE_RE.match((self.headers.get('Range') or '').strip())
        if not m:
            super().do_GET() if not head_only else super().do_HEAD()
            return
        start_s, end_s = m.group(1), m.group(2)
        if start_s == '' and end_s == '':
            super().do_GET() if not head_only else super().do_HEAD()
            return
        if start_s == '':
            # suffixe : bytes=-N → les N derniers octets
            n = min(int(end_s), size)
            start, end = size - n, size - 1
        else:
            start = int(start_s)
            end = int(end_s) if end_s else size - 1
            end = min(end, size - 1)
        if start > end or start >= size:
            self.send_response(416, 'Range Not Satisfiable')
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return

        length = end - start + 1
        self.send_response(206, 'Partial Content')
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(length))
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        if head_only:
            return
        try:
            with open(path, 'rb') as f:
                f.seek(start)
                remaining = length
                while remaining > 0:
                    chunk = f.read(min(CHUNK, remaining))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
        except OSError:
            pass  # segment annulé par le navigateur (seek / pré-chargement) — c'est normal


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == '__main__':
    os.chdir(ROOT)
    srv = Server(('127.0.0.1', PORT), RangeHandler)
    print(f'Serveur streaming (Range) sur http://127.0.0.1:{PORT}/ — racine : {ROOT}')
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
