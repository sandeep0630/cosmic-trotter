---
name: ancient-wisdom-storybook
description: >
  Build CosmicTrotter Ancient Wisdom illustrated storybook pages the same way as
  Dashavatara, Puri Jagannath, Kashi Vishwanath, Tirupati Venkateswara, and Hanuman:
  deep multi-source research (Chaganti Koteswara Rao, Nanduri Srinivas, Puranas), pre-historical
  creation cycles, continuous story prose (never bullet-history), full reading tools (reading mode,
  bookmarks, top button, quick nav), story-community integration, amber epic styling, EN+Telugu labels,
  subject-pure cinematic images, ancient.html journey card, and sitemap. Use when the user asks to write
  or expand an ancient-wisdom / puranic / temple / avatar story, says "like Dashavatara", "storybook", or runs /ancient-wisdom-storybook.
---

# Ancient Wisdom Storybook (CosmicTrotter)

Write long-form **sacred storybooks** for the Ancient Wisdom pillar — not short cards, not timeline checklists, not academic outline dumps.

**Gold standards in this repo:**
- `dashavatara.html` — multi-section epic + full reading tools
- `kashi-vishwanath.html` — pre-historical creation (Anandakanan), Trishula city, Ganga, Divodasa, 12 Adityas, Kotwal Bhairava & Ugra Varahi, Annapurna, Vyasa Ramnagar, Harishchandra, Gyan Vapi, Ahilyabai
- `tirupati-venkateswara.html` — Bhrigu test, Srinivasa descent, Varaha pact, divine wedding, Kubera loan, Pancha Berams, Kurmathi Nambi, Annamayya, Brahmotsavam
- `hanuman.html` — 11th Rudra, birth, solar leap, Surya education, Sundarakanda ocean leap, Ashoka Vatika, Lanka Dahanam, Sanjeevani mountain, Panchamukha Hanuman, Ashta Siddhi, Hanuman Chalisa, Vala Pooja, Chiranjeevi vow
- `puri-jaganath.html` — origin -> temple -> living worship narrative
- Library hub: `ancient.html` (`coreArticles`, `isDashavatara: true` for journey cards)

Also read: `references/storybook-spec.md` in this skill for the technical/CSS/JS checklist.

---

## Key Learnings & Strict Principles

1. **Pre-Historical & Deep Purāṇic Layering**:
   - Always research and include pre-historical creation cycles, cosmic origins, and deep puranic lore (e.g., *Anandakanan* before Earth's creation, *Lingodbhava*, *11th Rudra Avatara*, *Panchamukha Hanuman*, *12 Dwadasa Adityas*, *Kotwal Bhairava & Ugra Varahi*, *Ramnagar Vyasa Kashi*, *Harishchandra Ghat* truth trial).
   - Deeply integrate Telugu pravachanam insights from **Brahmasri Chaganti Koteswara Rao** and **Sri Nanduri Srinivas** for authentic spiritual depth.

2. **No "References" Section**:
   - Do NOT include a standalone "References & Multi-Tier Source Notes" or `#part-refs` section in the storybooks unless specifically requested. Perform rigorous fact-checking internally during content creation and use subtle inline `.source-note` callouts within narrative chapters.

3. **No "Sister" UI Labels**:
   - Do NOT use terms like `"Sister:"` or `"Sister journey:"` in header buttons, cross-links, or footers. Use clean, direct titles: e.g. `<span>Venkateswara of Tirupati</span>`, `<span>Jagannath of Puri</span>`, `<p>Explore Illustrated Storybooks on CosmicTrotter:</p>`.

4. **100% Subject-Pure Cinematic Artwork**:
   - Every single image in a storybook MUST belong exclusively to the subject deity/temple. Never include unrelated gods or photos. All images must be high-definition, text-free, cinematic (16:9), matching the golden/amber sacred aesthetic of `dashavatara`.

5. **Automatic Community Module Registration (`story-community.js`)**:
   - Every new storybook MUST include `<script src="story-community.js"></script>` AND its filename slug MUST be registered in `story-community.js`'s `isArticlePage()` regex.
   - Every storybook MUST include a `<footer class="border-t border-white/10 py-10 text-center text-xs text-white/40">CosmicTrotter · Travel Through Knowledge</footer>` element so `story-community.js` automatically mounts the **"Join the discussion: Like, Comment, or Request the Next Story"** component directly above the footer.

---

## Pipeline (always in this order)

### 1) Research first (do not write yet)
Gather from multiple tiers (Primary Scriptures, Living Traditions/Official Portals, Chaganti Koteswara Rao & Nanduri Srinivas pravachanams, Epigraphy), then keep only what survives fact-checking.

Label layers in the prose with short `source-note` lines:
`Traditional layer: …` / `Historical layer: …` / `Living niti: …`

### 2) Choose narrative order (story, not timeline checklist)
Default storybook arc:
1. **Who** is this form / place / teaching?
2. **Pre-Historical & Primordial Origin** (creation before Earth, cosmic vows)
3. **Puranic & Divine Incarnation Episodes** (full continuous narrative)
4. **Devotees, Saints & Historical Renewal** (as story)
5. **Living Niti, Worship & Festivals Today** (what devotees practice today)

### 3) Scaffold the page (feature parity)
- Cosmic dark bg + amber accents (`#fcd34d` / amber borders)
- Hero (title, EN subtitle with Telugu, clean back button)
- Quick jump chips (`#quick-nav` + `parts` array)
- Reading mode button + scroll progress bar
- Bookmarks ("My places") with **page-scoped** localStorage keys (`cosmic_<slug>_*`)
- Back-to-top floating button
- Core Wisdom boxes (amber gradient) per major section
- Prev/next `.story-nav` links (linking to adjacent story chapters, ending with "Back to Start ↑")
- Footer element + `story-community.js`, `theme-toggle.js`, `site-nav.js`, `ask-krishna-widget.js`

### 4) Images (style-sync with Dashavatara)
- Folder: `ancient-wisdom/images/`
- Naming: `<slug>-title.*`, `<slug>-chapter-NN-short-name.*`
- Style: warm gold/amber sacred light, deep navy/cosmic bg, traditional Indian mythic painting, text-free, 16:9.

### 5) Wire into the site
- **`ancient.html`**: add `coreArticles` entry (`isDashavatara: true`)
- **`sitemap.xml`**: add URL + lastmod
- **`story-community.js`**: ensure page slug is in `isArticlePage()` regex.

### 6) Verify before done
- [ ] No standalone References section unless user explicitly asks
- [ ] No "Sister" prefix in buttons or headers
- [ ] Pre-historical and puranic stories included
- [ ] Chaganti & Nanduri Srinivas pravachana insights integrated
- [ ] 100% subject-pure images
- [ ] Reading mode / bookmarks / top work; storage keys unique per page
- [ ] `story-community.js` registered and footer tag present
- [ ] Sister card on `ancient.html` if it is a journey page

---

## Anti-patterns (from real revisions on this project)

| Bad | Good |
|-----|------|
| Standalone References section at bottom | Internal fact-check + inline `.source-note` callouts |
| "Sister journey: ..." / "Sister: ..." labels | Clean titles: "Jagannath of Puri", "Explore Illustrated Storybooks" |
| Skipping pre-historical stories | Full pre-historical creation cycles (Anandakanan, 11th Rudra, etc.) |
| Unrelated deity images in a story | 100% subject-pure image selection |
| Missing `story-community.js` regex entry | Page slug added to `isArticlePage()` in `story-community.js` |
| Shared bookmark key with another page | Unique `cosmic_<slug>_*` keys |

---

## Minimal file set for a new journey

```
<slug>.html                   # storybook page (repo root for major journeys)
ancient-wisdom/images/<slug>-*.jpg|png
ancient.html                  # journey card
sitemap.xml                   # URL entry
story-community.js            # slug added to isArticlePage()
```

---

## After shipping

Summarize for the user: parts written, sources used, pre-historical stories included, images added, integration points. Ask if they want denser scripture quotes, more Telugu, or image fine-tuning.
