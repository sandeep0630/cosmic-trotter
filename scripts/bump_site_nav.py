# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OLD = re.compile(r"site-nav\.js\?v=[^\"'\s>]+")
NEW = "site-nav.js?v=20260722-nav-base-3"

count = 0
for p in ROOT.rglob("*.html"):
    if "node_modules" in p.parts or "mcps" in p.parts:
        continue
    t = p.read_text(encoding="utf-8", errors="replace")
    if "site-nav.js" not in t:
        continue
    nt, n = OLD.subn(NEW, t)
    if n == 0 and "site-nav.js\"" in t:
        nt = t.replace("site-nav.js\"", NEW + "\"")
        n = 1 if nt != t else 0
    if n:
        p.write_text(nt, encoding="utf-8")
        count += n
        print("bumped", p.relative_to(ROOT))
print("total", count)
