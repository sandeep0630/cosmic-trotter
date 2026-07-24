# Storybook technical spec (CosmicTrotter)

Copy patterns from `dashavatara.html`, `kashi-vishwanath.html`, `tirupati-venkateswara.html`, `hanuman.html`, and `puri-jaganath.html`.

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
  </div>

  <footer class="border-t border-white/10 py-10 text-center text-xs text-white/40">CosmicTrotter · Travel Through Knowledge</footer>

  <script>/* parts[], reading mode, bookmarks, top */</script>
  <script src="theme-toggle.js?…"></script> <!-- in head ideally -->
  <script src="site-nav.js?…"></script>
  <script src="story-community.js?…"></script> <!-- also register slug in isArticlePage() -->
  <script src="ask-krishna-widget.js"></script>
</body>
```

## Key Rules & Rules Checklist

1. **No Standalone References Section**: Keep fact-checking internal and use short `.source-note` callouts.
2. **No "Sister" UI Labels**: Use clean titles (`Venkateswara of Tirupati`, `Jagannath of Puri`, `Explore Illustrated Storybooks`).
3. **100% Subject-Pure Images**: Only images directly belonging to the deity/temple.
4. **Pre-Historical & Deep Purāṇic Stories**: Include pre-historical creation cycles and Chaganti Koteswara Rao & Nanduri Srinivas pravachana insights.
5. **Community Module (`story-community.js`)**: Add page slug to `isArticlePage()` in `story-community.js` and include `<footer>` tag before `</body>`.

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

## Image naming

```
ancient-wisdom/images/<slug>-title.jpg
ancient-wisdom/images/<slug>-chapter-01-<scene>.jpg
…
```

Style lock phrase:

> Elegant traditional Indian mythological digital painting, warm golden amber light, deep cosmic navy background, text-free no letters no watermark, cinematic 16:9 sacred storybook art matching CosmicTrotter Dashavatara chapter style
