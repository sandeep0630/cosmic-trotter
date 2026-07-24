---
name: instagram-ai-reels
description: >
  Build CosmicTrotter Instagram reels with real xAI image-to-video (not Ken Burns
  zoom): article-faithful keyframes, cinematic locked-camera motion, branded
  on-screen captions + cosmictrotter.com CTA, ffmpeg assemble to videos/, and
  ready-to-paste IG post captions. Use when the user asks for Instagram reels,
  AI video reels, reel captions, "like the reels we made", pillar reels
  (Gita / quantum / space / philosophy), or runs /instagram-ai-reels.
---

# Instagram AI Reels (CosmicTrotter)

Produce **publish-ready 9:16 Instagram reels** that:

1. Use **real AI video** (`grok-imagine-video` image-to-video) — **never** shaky Ken Burns zoom-only stitches as the product.
2. Stay **true to the article** (scenes, tone, pillar brand).
3. Drive traffic to **cosmictrotter.com** (on-screen CTA + IG post caption + article URL).

**Gold pipeline in this repo:** `reels/ai_video_pipeline.py`  
**Do not** treat `reels/cinematic_reel.py` (zoompan) as the final product.

Also read: `references/reel-pipeline.md` in this skill.

---

## When invoked

1. Confirm **scope**: one article, one pillar, or all catalog reels.
2. Confirm **article URL(s)** on cosmictrotter.com (use `site-nav.js` KNOWLEDGE_CATALOG if unsure).
3. Prefer **reusing** existing `key_*.jpg` + `ai_clip_*.mp4` when regenerating only captions/assembly.
4. Then run the pipeline end-to-end. Do not ship raw AI clips without caption burn-in.

---

## Hard product rules

| Rule | Detail |
|------|--------|
| Aspect | **9:16 · 1080×1920** finals |
| Motion | Real `image_to_video` / API i2v — environment + light motion |
| Camera | **Locked tripod or one slow steady move** — **no shaky zoom in/out**, no whip-pans |
| Keyframes | **Text-free** art (text is burned later) |
| Beats | 5–6 clips × ~6s ≈ 28–36s reel |
| On-screen | Brand · title · sub · progress dots · **final CTA** |
| Delivery | `videos/<slug>_instagram_reel.mp4` **and** copy under `reels/.../` |
| IG caption | Add/update `reels/INSTAGRAM_CAPTIONS.md` (paste text for posting) |
| Auth | `~/.grok/auth.json` OIDC **or** `XAI_API_KEY` |
| Rate limit | Video API is tight — **`--workers 1`**, retries on 429 |

### ZDR / video failures

If video returns *Zero Data Retention teams must provide upload_url*: ZDR is on for the **session team** (not necessarily the Console team the user is looking at). Prefer API key from the non-ZDR team, or disable ZDR, then retry. Smoke-test one clip before bulk gen.

---

## Pipeline (always this order)

### 1) Article → shot plan

For each reel, define 5–6 beats:

| Beat | Role |
|------|------|
| 0 | Hook / title scene |
| 1–3 | Core article ideas (visual metaphors) |
| 4 or 5 | Closing + **CTA to cosmictrotter.com** |

Write:

- **On-screen title / sub** (short, readable)
- **Video motion prompt** (cinematic, locked camera, article content)
- **Article URL** → `https://cosmictrotter.com/...`

Store plan in:

- `reels/REEL_SCRIPTS.md` (human script)
- `reels/<path>/manifest.json` (machine: slug, pillar, beats, `article_url`)

**Pillars & brand accents:**

| Pillar key | Brand strip | Accent |
|------------|-------------|--------|
| `ancient` | COSMICTROTTER · ANCIENT WISDOM | Amber gold |
| `quantum` | COSMICTROTTER · QUANTUM REALMS | Violet |
| `space` | COSMICTROTTER · SPACE & COSMOS | Emerald |
| `philosophy` | COSMICTROTTER · PHILOSOPHY | Cyan |

### 2) Keyframes (`key_00.jpg` …)

- 9:16 or wide then cover-cropped to 1080×1920 in the pipeline
- Style-sync with the article/pillar art
- **No title text on the image**
- Prefer `image_gen` / `image_edit` with consistent style; or article cover art

Folder layout:

```
reels/bhagavad-gita/          # or reels/quantum/<slug>/ etc.
  key_00.jpg …
  manifest.json
```

### 3) AI video (`ai_clip_00.mp4` …)

Use **`reels/ai_video_pipeline.py`** (preferred) or Grok `image_to_video` then assemble.

```bash
# Smoke one clip
python reels/ai_video_pipeline.py --smoke

# One reel
python reels/ai_video_pipeline.py --dir bhagavad-gita --workers 1

# All reels (skips existing ai_clip_*.mp4)
python reels/ai_video_pipeline.py --all --workers 1

# Force re-gen AI clips
python reels/ai_video_pipeline.py --all --force --workers 1
```

**Motion prompt formula:**

```
Cinematic locked tripod (or one slow steady dolly). [What moves in the world:
wind, light, particles, fabric, waves]. [Mood]. No zoom, no shake, no whip-pan.
```

Prompts live in `MOTION_PROMPTS` inside `ai_video_pipeline.py` and/or `beat.video_prompt` in manifest.

**Expect ~45–90s per clip.** Full 16×5 catalog ≈ 1–1.5+ hours sequential.

### 4) Caption burn-in (mandatory)

Final product **must** show overlays for the **full** clip duration.

**Known bug (do not regress):** PNG overlay must use ffmpeg **`-loop 1`** on the caption image. Without looping, text appears for 1 frame only and `videos/` looks “uncaptioned.”

Pipeline handles this in `caption_clip()`:

- Loop caption PNG
- RGBA overlay onto scaled 1080×1920 clip
- Soft fade in/out
- Final beat: CTA pill `Read free → cosmictrotter.com`

Re-assemble **without** re-generating AI video:

```bash
python reels/ai_video_pipeline.py --all --skip-gen
```

### 5) Concat + publish

- Crossfade beats (`xfade`) + silent stereo bed
- Write `reels/.../<slug>_instagram_reel.mp4`
- Copy to **`videos/<slug>_instagram_reel.mp4`** (publish path)

### 6) Instagram post captions

Update **`reels/INSTAGRAM_CAPTIONS.md`** with a copy-paste block per video:

- Hook line
- 2–4 sentence body tied to article
- Full article URL
- “Link in bio · CosmicTrotter · [Pillar]”
- 4–6 hashtags

On-screen text ≠ IG caption box. Ship both.

### 7) Verify before done

- [ ] Every beat has `ai_clip_*.mp4` (>50 KB)
- [ ] Final in `videos/` has **visible** brand + title + dots mid-clip (extract frame at ~2s and inspect)
- [ ] Last beat CTA points audience to cosmictrotter.com
- [ ] `manifest.json` has correct `article_url`
- [ ] `INSTAGRAM_CAPTIONS.md` entry matches video filename
- [ ] No Ken Burns-only final shipped as “AI reel”
- [ ] If bulk job: report completed/failed slugs and remaining ETA honestly

---

## Scaffold a new reel (minimal)

1. Create `reels/<pillar>/<slug>/` (or `reels/<slug>/` for top-level like Gita).
2. Add `key_00.jpg` … `key_04.jpg` (or 05).
3. Write `manifest.json`:

```json
{
  "slug": "my-slug",
  "pillar": "philosophy",
  "title": "Display Title",
  "article_url": "https://cosmictrotter.com/philosophy/my-slug.html",
  "beats": [
    { "key": "key_00.jpg", "title": "Hook title", "sub": "One short line" },
    { "key": "key_01.jpg", "title": "...", "sub": "..." },
    { "key": "key_04.jpg", "title": "Enter the journey", "sub": "Full free story · CosmicTrotter.com" }
  ]
}
```

4. Add `ARTICLE_URLS` + `MOTION_PROMPTS` entries in `ai_video_pipeline.py` if missing.
5. Run pipeline for that dir.
6. Append IG caption to `INSTAGRAM_CAPTIONS.md`.
7. Point user to `videos/<slug>_instagram_reel.mp4`.

---

## Anti-patterns

| Bad | Good |
|-----|------|
| Zoompan-only “cinematic” reel | Real i2v with locked camera |
| Text baked into keyframe art | Text-free keys + burn-in overlay |
| Overlay without `-loop 1` | Looped caption PNG for full duration |
| Final only under `reels/` | Always copy to `videos/` |
| CTA “full story inside” with no URL | Explicit cosmictrotter.com + IG caption URL |
| Parallel video gen ×3 hitting 429 | Sequential `--workers 1` + backoff |
| Claiming done without frame check | Extract mid-frame and verify text |

---

## After shipping

Tell the user:

1. Path(s) under `videos/`
2. Matching article URL(s)
3. That post text is in `reels/INSTAGRAM_CAPTIONS.md`
4. Music still needs to be added in IG/CapCut (exports are silent)
5. Rough duration / any failures

Do **not** re-run full AI video gen for caption-only fixes — use `--skip-gen`.
