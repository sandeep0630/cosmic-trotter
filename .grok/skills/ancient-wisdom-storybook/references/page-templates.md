# CosmicTrotter page templates (Phase 0 notes)

Use these patterns when adding content. Prefer **one strong storybook** over short + deep pairs.

## Hub page (e.g. `philosophy.html`, `quantum.html`)

- Cosmic dark bg, pillar accent color
- Hero + intro card + grid of journey cards with images
- Links to live URLs only (no “Coming soon”)
- `theme-toggle.js`, `site-nav.js`, `ask-krishna-widget.js`
- Canonical + meta description + favicon/OG when convenient

## Short journey storybook (default — Philosophy model)

```
philosophy/<slug>.html
philosophy/images/<slug>.jpg
```

Must have:

1. `data-storybook-slug="<slug>"` on `<body>`
2. `storybook.css` + `storybook.js` (bookmarks, reading mode, back-to-top)
3. Hero image, continuous prose chapters, Key Insights, Core Wisdom, References
4. Related journeys grid (include cross-pillar when natural)
5. `_redirects` clean URL + `sitemap.xml` entry
6. Catalog entry in `site-nav.js` → `KNOWLEDGE_CATALOG` if search should find it

## Epic journey (Dashavatara / Puri model)

- Root-level HTML, multi-part sections, chapter art, unique localStorage keys
- Sister card on `ancient.html` with `isDashavatara: true`
- See skill `ancient-wisdom-storybook`

## Pillar accents

| Pillar | Accent |
|--------|--------|
| Site / Philosophy | cyan `#00f3ff` |
| Quantum | violet `#a78bfa` |
| Space | teal/emerald |
| Ancient | amber `#fcd34d` |
