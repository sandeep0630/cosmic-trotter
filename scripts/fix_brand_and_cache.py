# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OLD = "story-community.js?v=20260617-community-4"
NEW = "story-community.js?v=20260722-community-5"

def fix_nested_brand():
    pat = re.compile(
        r'(<div class="flex items-center gap-x-3">)\s*'
        r'<a href="(\.\./index\.html)" aria-label="CosmicTrotter home">(<img[^>]*logo\.png[^>]*>)</a>\s*'
        r'(<span class="font-display[^"]*">CosmicTrotter</span>)',
        re.I,
    )
    for folder in ("philosophy", "quantum-realms", "space-cosmos"):
        for p in (ROOT / folder).glob("*.html"):
            if p.name.endswith("-deep.html"):
                continue
            t = p.read_text(encoding="utf-8")
            nt, n = pat.subn(
                r'\1<a href="\2" class="flex items-center gap-x-3" aria-label="CosmicTrotter home">\3\4</a>',
                t,
                count=1,
            )
            if n:
                p.write_text(nt, encoding="utf-8")
                print("brand", p.relative_to(ROOT))

def bump_cache():
    count = 0
    paths = list((ROOT / "philosophy").glob("*.html"))
    paths += [ROOT / "bhagavad-gita.html", ROOT / "dashavatara.html", ROOT / "puri-jaganath.html"]
    paths += list((ROOT / "quantum-realms").glob("*.html"))
    paths += list((ROOT / "space-cosmos").glob("*.html"))
    paths += [ROOT / "philosophy.html", ROOT / "quantum.html", ROOT / "space.html", ROOT / "index.html"]
    for p in paths:
        if not p.exists() or p.name.endswith("-deep.html"):
            continue
        t = p.read_text(encoding="utf-8")
        if OLD in t:
            p.write_text(t.replace(OLD, NEW), encoding="utf-8")
            count += 1
            print("cache", p.relative_to(ROOT))
    print("bumped", count)

if __name__ == "__main__":
    fix_nested_brand()
    bump_cache()
