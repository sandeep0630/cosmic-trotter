# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def logo_already_linked(html: str) -> bool:
    head = html[:3000]
    return bool(re.search(r"<a\b[^>]*>[\s\S]{0,160}?logo\.png", head, re.I))


def wrap_logos(html: str, home_href: str) -> str:
    def repl(m: re.Match) -> str:
        start = m.start()
        chunk = html[max(0, start - 220) : start]
        opens = len(re.findall(r"<a\b", chunk, re.I))
        closes = len(re.findall(r"</a>", chunk, re.I))
        if opens > closes:
            return m.group(0)
        img = m.group(0)
        return f'<a href="{home_href}" aria-label="CosmicTrotter home">{img}</a>'

    return re.sub(r"<img\b[^>]*\blogo\.png\b[^>]*>", repl, html, count=2, flags=re.I)


def main() -> None:
    jobs = []
    for p in (ROOT / "philosophy").glob("*.html"):
        jobs.append((p, "../index.html"))
    for folder in ("quantum-realms", "space-cosmos"):
        for p in (ROOT / folder).glob("*.html"):
            if p.name.endswith("-deep.html"):
                continue
            jobs.append((p, "../index.html"))
    jobs.append((ROOT / "bhagavad-gita.html", "index.html"))
    # root philosophy hub etc if unlinked
    for name in ("philosophy.html", "quantum.html", "space.html"):
        jobs.append((ROOT / name, "index.html"))

    for path, home in jobs:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        if logo_already_linked(text):
            print("skip", path.name)
            continue
        new = wrap_logos(text, home)
        if new != text:
            path.write_text(new, encoding="utf-8")
            print("fixed", path.relative_to(ROOT))
        else:
            print("no-change", path.name)


if __name__ == "__main__":
    main()
