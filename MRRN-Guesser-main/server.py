from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import re
import sqlite3
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "scores.db"
USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_-]{2,18}$")
BANNED_WORDS = {
    "admin",
    "moderator",
    "owner",
    "fuck",
    "shit",
    "bitch",
    "cunt",
    "nigger",
    "nigga",
    "fag",
    "nig",
    "gay",
}


def init_db():
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                score INTEGER NOT NULL CHECK(score >= 0 AND score <= 25000),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_scores_score_created ON scores(score DESC, created_at ASC)"
        )


def username_error(username):
    if not isinstance(username, str):
        return "Invalid username"
    username = username.strip()
    if not USERNAME_PATTERN.fullmatch(username):
        return "Invalid username"
    lowered = username.lower()
    if any(word in lowered for word in BANNED_WORDS):
        return "Invalid username"
    return ""


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/scores":
            self.send_scores()
            return
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/scores":
            self.receive_score()
            return
        self.send_error(404, "Not found")

    def send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_scores(self):
        with sqlite3.connect(DB_PATH) as connection:
            connection.row_factory = sqlite3.Row
            rows = connection.execute(
                """
                SELECT username, score, created_at
                FROM scores
                ORDER BY score DESC, created_at ASC
                LIMIT 25
                """
            ).fetchall()
        self.send_json(200, [dict(row) for row in rows])

    def receive_score(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > 512:
                self.send_json(413, {"error": "Payload too large"})
                return
            data = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, json.JSONDecodeError):
            self.send_json(400, {"error": "Invalid JSON"})
            return

        username = data.get("username", "")
        score = data.get("score")
        error = username_error(username)
        if error:
            self.send_json(400, {"error": error})
            return
        if not isinstance(score, int) or score < 0 or score > 25000:
            self.send_json(400, {"error": "Invalid score"})
            return

        clean_username = username.strip()
        with sqlite3.connect(DB_PATH) as connection:
            connection.execute(
                "INSERT INTO scores(username, score) VALUES(?, ?)",
                (clean_username, score),
            )
        self.send_json(201, {"username": clean_username, "score": score})


if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer(("127.0.0.1", 8000), Handler)
    print("Serving MRRN Guesser at http://127.0.0.1:8000")
    server.serve_forever()
