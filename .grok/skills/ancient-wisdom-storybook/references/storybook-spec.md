# Storybook technical spec (CosmicTrotter)

Copy patterns from `dashavatara.html` and `puri-jaganath.html`.

## DOM skeleton

```html
<body class="cosmic-bg">
  <div class="reading-progress-shell"><div id="reading-progress-bar"></div></div>
  <button id="dash-top-button" class="dash-top-button" …>↑</button>

  <!-- hero -->
  <!-- quick-nav container #quick-nav -->
  <!-- reading mode + bookmarks toolbar -->

  <div class="max-w-5xl mx-auto px-6 pb-16">
    <section id="part-…" class="avatar-story">
      <!-- number badge + h2 + Telugu subtitle -->
      <!-- optional title image.avatar-title-img -->
      <div class="chapters">
        <div class="chapter">
          <h3>…</h3>
          <!-- optional img.chapter-img + p.illustration-caption -->
          <p>…story prose…</p>
          <p class="source-note">Traditional layer: …</p>
        </div>
      </div>
      <div class="core-wisdom rounded-2xl p-5 my-5">…</div>
      <div class="story-nav">prev / next</div>
    </section>

    <section id="references" class="avatar-story">…linked sources…</section>
  </div>

  <script>/* parts[], reading mode, bookmarks, top */</script>
  <script src="theme-toggle.js?…"></script> <!-- in head ideally -->
  <script src="site-nav.js?…"></script>
  <script src="story-community.js?…"></script>
  <script src="ask-krishna-widget.js"></script>
</body>
```

## JS essentials

```js
const parts = [
  { id: "who", num: 1, name: "Who… (తెలుగు)" },
  // ids must match part-${id}
];

const READING_MODE_KEY = 'cosmic_<slug>_reading_mode';
const BOOKMARK_KEY = 'cosmic_<slug>_bookmarks';
```

Bookmark system expects:
- `.avatar-story` sections
- `.chapter` blocks with `h3` and `p` children
- Auto IDs `chapter-<slug>-N`, `para-<slug>-N-M`
- Click handler on `[data-bookmark-target]`

Back-to-top: show after ~520px scroll; smooth `scrollTo(0)`.

## CSS classes to preserve

- `.avatar-story`, `.chapter`, `.chapter h3` (amber headings)
- `.avatar-title-img`, `.chapter-img`, `.illustration-caption`
- `.core-wisdom`, `.story-nav`, `.source-note`
- `.reading-mode` body class + progress bar
- `.bookmark-toggle`, `.bookmarkable-paragraph`, `.dash-top-button`
- `.avatar-selector`, `.avatar-chip`

## ancient.html journey card

```js
{
  href: "my-story.html",
  category: "puranas",
  level: "Origin → …",      // short journey label
  read: "Journey",
  title: "…",
  desc: "One sentence story promise",
  icon: "fa-…",
  iconColor: "from-amber-400 to-orange-500",
  iconBg: "text-black",
  isDashavatara: true        // amber journey styling
}
```

Renderer uses `isDashavatara` for journey badge (“ILLUSTRATED JOURNEY” / “Start the Journey”).

## Image naming

```
ancient-wisdom/images/<slug>-title.jpg
ancient-wisdom/images/<slug>-chapter-01-<scene>.jpg
…
```

Style lock phrase (adapt subject):

> Elegant traditional Indian mythological digital painting, warm golden amber light, deep cosmic navy background, text-free no letters no watermark, cinematic 16:9 sacred storybook art matching CosmicTrotter Dashavatara chapter style

## Content density target

- Major journey: multiple parts, **many full chapters**, comparable emotional weight to one Dashavatara avatar arc × several parts (not a 3-minute card).
- References: always linked; official + scripture + historical cross-check.

## Example narrative map (Puri Jagannath)

1. Who is Jagannath?
2. How he first appeared (Nilamadhava → Indradyumna → daru)
3. The temple that rose by the sea
4. Songs, saints, and storms
5. How the year worships him
6. Nabakalebara
7. Worship and belief today
8. References
