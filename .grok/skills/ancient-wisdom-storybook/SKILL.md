---
name: ancient-wisdom-storybook
description: >
  Build CosmicTrotter Ancient Wisdom illustrated storybook pages the same way as
  Dashavatara and Puri Jagannath: multi-source research + fact-check, continuous
  story prose (never bullet-history), full reading tools (mode, bookmarks, top),
  amber epic styling, EN+Telugu labels, chapter images, ancient.html sister card,
  sitemap, and linked References. Use when the user asks to write or expand an
  ancient-wisdom / puranic / temple / avatar story, says "like Dashavatara",
  "sister card", "storybook", or runs /ancient-wisdom-storybook.
---

# Ancient Wisdom Storybook (CosmicTrotter)

Write long-form **sacred storybooks** for the Ancient Wisdom pillar  -  not short cards, not timeline checklists, not academic outline dumps.

**Gold standards in this repo:**
- `dashavatara.html`  -  multi-section epic + full reading tools
- `puri-jaganath.html`  -  origin -> temple -> living worship narrative + References
- Library hub: `ancient.html` (`coreArticles`, `isDashavatara: true` for journey cards)

Also read: `references/storybook-spec.md` in this skill for the feature/CSS/JS checklist.

---

## When invoked

1. Confirm the **subject** (e.g. avatar, kshetra, deity, puranic episode).
2. Confirm **filename** (prefer root `kebab-name.html` for journeys, like `dashavatara.html` / `puri-jaganath.html`).
3. Confirm **placement**: sister journey card on `ancient.html` (usually yes for full storybooks).
4. Then execute the pipeline below end-to-end. Do not ship a thin stub.

---

## Pipeline (always in this order)

### 1) Research first (do not write yet)

Gather from **multiple tiers**, then keep only what survives fact-check:

| Tier | What | Examples |
|------|------|----------|
| A | Primary tradition / scripture | Named Puranas, Itihasa, well-attested mahatmya cycles |
| B | Living tradition / official temple or sampradaya materials | Official temple sites, Record of Rights summaries, published niti calendars |
| C | History / architecture / epigraphy | Dynasties, inscriptions, art-history consensus  -  **labeled as history** |
| D | Other real theories | Tribal synthesis, scholarly debates  -  only if they **actually exist**; never as sole "secret truth" |

**Reject:** viral blogs, invented dialogue, fake exact BCE foundation years, speculation about secret ritual contents (e.g. Brahma padartha), single-theory reductionism.

**Label layers in the prose** with occasional short `source-note` lines, e.g.  
`Traditional layer: …` / `Historical layer: …` / `Living niti: …`

### 2) Choose narrative order (story, not timeline checklist)

Default **storybook arc** (adapt names to the subject):

1. **Who** is this form / place / teaching?
2. **Origin story** (full continuous narrative  -  how it emerged)
3. **How the house / tradition grew** (temple, lineage, or cultural home  -  as story)
4. **How devotion endured** (saints, crises, restorations  -  as story)
5. **How it is lived now** (festivals, daily worship, what devotees believe today)
6. **Closing** + **References** (linked sources)

If the user forces a strict chronology, still write **prose scenes**, not Step 1/2/3 or bullet dumps of years.

**Hard rules:**
- No "pointed details" history (no bare date lists as the main text).
- No "Step 1 / Step 2" unless the user explicitly asks for a ritual procedure list.
- Weave dates and kings **into narrative sentences**.
- Prefer Dashavatara tone: warm, clear, reverent, precise, not preachy.

### 3) Scaffold the page (feature parity with Dashavatara)

Clone UX from `dashavatara.html` / `puri-jaganath.html`:

**Must have:**
- Cosmic dark bg + amber accents (`#fcd34d` / amber borders)
- Hero (title, EN subtitle with Telugu where natural, back to `ancient.html`)
- Quick jump chips (`#quick-nav` + `parts` array)
- Reading mode button + progress bar
- Bookmarks ("My places") with **page-scoped** localStorage keys  
  e.g. `cosmic_<slug>_reading_mode`, `cosmic_<slug>_bookmarks`
- Back-to-top floating button
- Sections: `class="avatar-story"` + `id="part-..."` (keeps bookmark JS pattern)
- Chapters: `div.chapter` > `h3` + narrative `p` (+ optional images)
- Core Wisdom boxes (amber gradient) per major section
- Prev/next `.story-nav` links
- `theme-toggle.js`, `site-nav.js`, `ask-krishna-widget.js` (and `story-community.js` if other journeys use it)
- Canonical URL, meta description, Font Awesome + Tailwind CDN as existing pages

**Telugu:** English body + Telugu labels in part subtitles / jump nav (like Dashavatara), not full parallel Telugu pages unless asked.

### 4) Write content as continuous story

- Each part = several chapters of **full paragraphs**.
- Dialogue only if sourced or clearly traditional; do not invent.
- Explain difficult names once (Sanskrit/Odia) then use them naturally.
- End major parts with Core Wisdom (short bullets OK **only** inside Core Wisdom boxes).
- Bottom **References** section: small type, numbered links, official + scriptural + historical cross-checks + honesty notes.

### 5) Images (style-sync with Dashavatara)

- Folder: `ancient-wisdom/images/`
- Naming: `<slug>-title.*`, `<slug>-chapter-NN-short-name.*`
- Style: warm gold/amber sacred light, deep navy/cosmic bg, traditional Indian mythic painting, **text-free**, cinematic ~16:9, same family as `dashavatara-*-title.png` / chapter arts
- Generate with locked style prompts; prefer one base then `image_edit` variants for consistency
- Every image: meaningful `alt` + optional `.illustration-caption`
- Do not use tourist photos or meme art as the main illustrations

### 6) Wire into the site

- **`ancient.html`**: add `coreArticles` entry near other journeys  
  - `read: "Journey"`  
  - `isDashavatara: true` (reuses amber journey card styling)  
  - category usually `puranas` unless clearly Vedas/Upanishads/Gita
- **`sitemap.xml`**: add URL + lastmod
- Cross-link from related journeys (footer or closing) when natural
- Update search/nav only if this repo already indexes pages there

### 7) Verify before done

- [ ] No Method/meta essay section unless user asks
- [ ] Story order makes emotional sense (who -> origin -> house -> life today)
- [ ] No bullet-history sections
- [ ] Reading mode / bookmarks / top work; storage keys unique per page
- [ ] Jump nav `parts` IDs match `part-*` section IDs
- [ ] All image paths exist
- [ ] References links present
- [ ] Sister card on `ancient.html` if it is a journey page
- [ ] Fact claims labeled; secrets not invented

---

## Voice cheatsheet

**Do:** "According to the Skanda Purana's Purushottama tradition…"  
**Do:** "Temple history remembers…" / "Historians date the standing temple to…"  
**Don't:** "Everyone knows…" / "Scientists proved the idol contains…"  
**Don't:** Convert puranic yugas into fake BCE years.

---

## Anti-patterns (from real revisions on this project)

| Bad | Good |
|-----|------|
| Timeline parts named "12th-13th century" with bullets | Story chapter: "When a king built the house of stone" |
| "Step 1… Step 2…" origin | Continuous narrative paragraphs |
| "Method / How this page was written" as Part 0 | Skip meta; put honesty in References + brief source-notes |
| Short stub "coming soon" | Full multi-part storybook or don't claim Journey |
| Generic stock images | Dashavatara-family sacred art, text-free |
| Shared bookmark key with another page | Unique `cosmic_<slug>_*` keys |

---

## Minimal file set for a new journey

```
<puri-or-topic>.html          # storybook page (repo root for major journeys)
ancient-wisdom/images/<slug>-*.jpg|png
ancient.html                  # sister card
sitemap.xml                   # URL
```

Optional: deep/short article pair under `ancient-wisdom/` only for non-journey deep dives (existing pattern: `upanishads.html` + `upanishads-deep.html`). **Journey storybooks** follow Dashavatara / Puri Jagannath, not the short-card article template.

---

## After shipping

Summarize for the user: parts written, sources used, images added, integration points. Ask if they want denser scripture quotes, more Telugu, or image regeneration  -  do not silently thin the story.
