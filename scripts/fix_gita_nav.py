# -*- coding: utf-8 -*-
from pathlib import Path
import re

p = Path(__file__).resolve().parents[1] / "bhagavad-gita.html"
t = p.read_text(encoding="utf-8")
# Fix corrupted "← Previous" -> "revious" (lost arrow+P in some encodings)
t = re.sub(
    r'(<a href="#part-[^"]+">)\s*[^<]*revious\s*(</a>)',
    r"\1&larr; Previous\2",
    t,
)
t = re.sub(
    r'(<a href="#part-[^"]+">)\s*Next\s*(?:→|&rarr;)?\s*(</a>)',
    r"\1Next &rarr;\2",
    t,
)
t = t.replace("Living the Gita →", "Living the Gita &rarr;")
t = t.replace("Chapter 1 →", "Chapter 1 &rarr;")
t = t.replace("References →", "References &rarr;")
p.write_text(t, encoding="utf-8")
print("revious left:", t.count("revious"))
i = t.find('class="story-nav"')
print(t[i : i + 160])
