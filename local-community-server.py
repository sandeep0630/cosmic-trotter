#!/usr/bin/env python3
"""Local static server with a small Netlify-function-compatible community API.

Use this only for local manual testing:
    python local-community-server.py 8001

It reads SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY from .env or the process
environment, then serves the same path the browser uses in production:
/.netlify/functions/story-community
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def load_dotenv() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def clean_text(value: object, max_length: int) -> str:
    text = "" if value is None else str(value)
    text = re.sub(r"[\x00-\x1f\x7f]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_length]


def normalize_page_slug(value: object) -> str:
    slug = clean_text(value, 220)
    slug = re.sub(r"^https?://[^/]+", "", slug, flags=re.I)
    if not slug or slug == "/":
        return "/"
    return slug.split("#", 1)[0].split("?", 1)[0]


class CommunityApi:
    def __init__(self) -> None:
        self.supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
        self.supabase_key = os.environ.get("SUPABASE_PUBLISHABLE_KEY") or os.environ.get("SUPABASE_ANON_KEY", "")

    def ensure_config(self) -> None:
        if not self.supabase_url or not self.supabase_key:
            raise RuntimeError("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in .env")

    def request(self, method: str, path: str, payload: dict | None = None, prefer: str | None = None):
        self.ensure_config()
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
        }
        if prefer:
            headers["Prefer"] = prefer

        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = urllib.request.Request(
            f"{self.supabase_url}/rest/v1/{path}",
            data=body,
            headers=headers,
            method=method,
        )

        try:
            with urllib.request.urlopen(req, timeout=20) as res:
                text = res.read().decode("utf-8")
                return json.loads(text) if text else None
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8")
            raise RuntimeError(f"Supabase {error.code}: {detail}") from error

    def fetch_items_with_comments(self, items):
        if not items:
            return []

        ids = [item["id"] for item in items if item.get("id")]
        if not ids:
            return [{**item, "comments": []} for item in items]

        id_list = ",".join(ids)
        comments = self.request(
            "GET",
            f"community_comments?select=*&item_id=in.({id_list})&order=created_at.asc&limit=200",
        ) or []
        comments_by_item = {}
        for comment in comments:
            comments_by_item.setdefault(comment["item_id"], []).append(comment)

        return [{**item, "comments": comments_by_item.get(item["id"], [])} for item in items]

    def fetch_item(self, item_id: str):
        item_id = urllib.parse.quote(item_id, safe="")
        rows = self.request("GET", f"community_items?select=*&id=eq.{item_id}&limit=1") or []
        return (self.fetch_items_with_comments(rows) or [None])[0]

    def list_topics(self, _body: dict) -> dict:
        rows = self.request(
            "GET",
            "community_items?select=*&type=eq.topic&order=likes_count.desc,created_at.desc&limit=24",
        ) or []
        return {"topics": self.fetch_items_with_comments(rows)}

    def create_topic(self, body: dict) -> tuple[int, dict]:
        if clean_text(body.get("website"), 80):
            return 200, {"ok": True, "ignored": True}

        author_name = clean_text(body.get("authorName"), 80)
        title = clean_text(body.get("title"), 160)
        description = clean_text(body.get("description"), 900)

        if len(author_name) < 2:
            return 400, {"error": "Name is required."}
        if len(title) < 4:
            return 400, {"error": "Topic title is required."}
        if len(description) < 8:
            return 400, {"error": "Please add a little more detail."}

        rows = self.request(
            "POST",
            "community_items",
            {
                "type": "topic",
                "title": title,
                "description": description,
                "author_name": author_name,
                "source_page": normalize_page_slug(body.get("sourcePage")),
                "source_title": clean_text(body.get("sourceTitle"), 180) or None,
            },
            prefer="return=representation",
        ) or []
        return 201, {"topic": (self.fetch_items_with_comments(rows) or [None])[0]}

    def get_article(self, body: dict) -> dict:
        page_slug = normalize_page_slug(body.get("pageSlug") or body.get("sourcePage"))
        source_title = clean_text(body.get("sourceTitle"), 180) or "CosmicTrotter Article"
        encoded_slug = urllib.parse.quote(page_slug, safe="")
        rows = self.request(
            "GET",
            f"community_items?select=*&type=eq.article&page_slug=eq.{encoded_slug}&limit=1",
        ) or []

        if not rows:
            try:
                self.request(
                    "POST",
                    "community_items",
                    {
                        "type": "article",
                        "page_slug": page_slug,
                        "title": source_title,
                        "description": "",
                        "author_name": "CosmicTrotter",
                        "source_page": page_slug,
                        "source_title": source_title,
                    },
                    prefer="return=minimal",
                )
            except RuntimeError as error:
                if "409" not in str(error):
                    raise

            rows = self.request(
                "GET",
                f"community_items?select=*&type=eq.article&page_slug=eq.{encoded_slug}&limit=1",
            ) or []

        return {"article": (self.fetch_items_with_comments(rows) or [None])[0]}

    def like_item(self, body: dict) -> dict:
        item_id = clean_text(body.get("itemId"), 80)
        visitor_key = clean_text(body.get("visitorKey"), 140)
        if not item_id or not visitor_key:
            return {"error": "Missing item or visitor."}

        already_liked = False
        try:
            self.request(
                "POST",
                "community_likes",
                {"item_id": item_id, "visitor_key": visitor_key},
                prefer="return=minimal",
            )
        except RuntimeError as error:
            if "409" in str(error):
                already_liked = True
            else:
                raise

        return {"item": self.fetch_item(item_id), "alreadyLiked": already_liked}

    def add_comment(self, body: dict) -> tuple[int, dict]:
        if clean_text(body.get("website"), 80):
            return 200, {"ok": True, "ignored": True}

        item_id = clean_text(body.get("itemId"), 80)
        author_name = clean_text(body.get("authorName"), 80)
        comment = clean_text(body.get("comment"), 1200)
        if not item_id:
            return 400, {"error": "Missing item."}
        if len(author_name) < 2:
            return 400, {"error": "Name is required."}
        if len(comment) < 2:
            return 400, {"error": "Comment is required."}

        rows = self.request(
            "POST",
            "community_comments",
            {"item_id": item_id, "author_name": author_name, "comment": comment},
            prefer="return=representation",
        ) or []
        return 201, {"comment": rows[0] if rows else None, "item": self.fetch_item(item_id)}

    def dispatch(self, body: dict) -> tuple[int, dict]:
        action = body.get("action")
        if action == "list-topics":
            return 200, self.list_topics(body)
        if action == "create-topic":
            return self.create_topic(body)
        if action == "get-article":
            return 200, self.get_article(body)
        if action == "like-item":
            return 200, self.like_item(body)
        if action == "add-comment":
            return self.add_comment(body)
        return 400, {"error": "Unknown action."}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format: str, *args) -> None:
        sys.stdout.write("%s - %s\n" % (self.address_string(), format % args))

    def send_json(self, status: int, payload: dict) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self) -> None:
        if self.path.split("?", 1)[0] != "/.netlify/functions/story-community":
            self.send_error(404)
            return

        length = int(self.headers.get("Content-Length") or "0")
        try:
            body = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            status, payload = CommunityApi().dispatch(body)
            self.send_json(status, payload)
        except Exception as error:
            self.send_json(500, {"error": "Community action failed.", "detail": str(error)})


def main() -> None:
    load_dotenv()
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8001
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"CosmicTrotter local server running at http://localhost:{port}/")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping.")


if __name__ == "__main__":
    main()
