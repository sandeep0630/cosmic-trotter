# CosmicTrotter reel pipeline reference

## Tools

| Piece | Path / endpoint |
|-------|-----------------|
| Main builder | `reels/ai_video_pipeline.py` |
| Shot scripts | `reels/REEL_SCRIPTS.md` |
| IG post captions | `reels/INSTAGRAM_CAPTIONS.md` |
| Catalog docs | `reels/README.md` |
| Publish folder | `videos/` |
| Legacy zoom (avoid) | `reels/cinematic_reel.py` |
| Video API | `POST https://api.x.ai/v1/videos/generations` |
| Poll | `GET https://api.x.ai/v1/videos/{request_id}` |
| Model | `grok-imagine-video` |
| Auth | `~/.grok/auth.json` → `key`, or `XAI_API_KEY` |

## CLI cheatsheet

```bash
python reels/ai_video_pipeline.py --smoke
python reels/ai_video_pipeline.py --dir quantum/witness-wave --workers 1
python reels/ai_video_pipeline.py --all --workers 1
python reels/ai_video_pipeline.py --all --skip-gen          # captions + concat only
python reels/ai_video_pipeline.py --all --force --workers 1 # re-gen AI clips
```

## Per-reel artifacts

```
reels/<...>/<slug>/
  key_00.jpg …           # text-free keyframes
  ai_key_00.jpg …        # prepared 1080×1920
  ai_clip_00.mp4 …       # raw AI video
  ai_cap_00.png …        # transparent overlay (brand/title/dots/CTA)
  ai_captioned_00.mp4 …  # clip + overlay (must show text full duration)
  manifest.json
  <slug>_instagram_reel.mp4
videos/
  <slug>_instagram_reel.mp4   # publish this
```

## Caption burn-in (critical)

```text
ffmpeg -i ai_clip.mp4 -loop 1 -i ai_cap.png \
  -filter_complex "[0:v]scale=1080:1920:...,format=rgba[base];
                   [1:v]format=rgba[cap];
                   [base][cap]overlay=0:0,format=yuv420p[v]" \
  -map "[v]" -t <duration> ...
```

**Without `-loop 1`**, still PNG is one frame → finals look uncaptioned.

## Timing expectations

| Work | Time |
|------|------|
| One 6s AI clip | ~45–90s |
| One 5-beat reel (gen) | ~5–10 min |
| 16 reels × 5 clips | ~1–1.5+ hours sequential |
| `--skip-gen` all 16 | ~15–40 min (encode only) |

## Catalog article URLs

See `ARTICLE_URLS` in `ai_video_pipeline.py` and table in `INSTAGRAM_CAPTIONS.md`.  
Also: `site-nav.js` → `KNOWLEDGE_CATALOG`.

## Verify text in final

```bash
ffmpeg -y -ss 2 -i videos/<slug>_instagram_reel.mp4 -frames:v 1 /tmp/check.jpg
# Open check.jpg — must show brand + title + dots
```
