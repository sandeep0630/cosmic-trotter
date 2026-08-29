# CosmicTrotter Security

CosmicTrotter is a static site on **Netlify** with a small set of serverless functions — not a backend-free page.

## What actually runs

- **Static pages**: HTML, CSS, and client JavaScript (storybooks, nav, theme, PWA).
- **Netlify Functions** (`netlify/functions/`):
  - `ask-krishna` — chat with a Gita-grounded assistant. The function calls **Google Gemini** using a server-side API key (`GEMINI_API_KEY` / `API` in Netlify env or local `.env`). The key is never shipped to the browser.
  - `story-community` — optional likes/comments via **Supabase** (`SUPABASE_URL` + publishable/anon key in env).
- **Third parties**: Brevo (newsletter), Font Awesome / Google Fonts / Tailwind Play CDN, Instagram embeds on the homepage.

There are no user passwords on CosmicTrotter. Do not send secrets in a report if you find one; describe the location instead.

## Current Security Posture

- **Headers** (`_headers`): CSP, HSTS, X-Frame DENY, nosniff, COOP, CORP, Permissions-Policy.
- **Redirects** (`_redirects`): Bot/scanner blocks, clean-URL rewrites, www → apex.
- **CORS**: Function responses allow only `https://cosmictrotter.com`, `https://www.cosmictrotter.com`, and localhost for local-dev. Not `*`.
- **Ask Krishna widget**: User text is HTML-escaped. Assistant/model text is rendered as text (not raw `innerHTML`) to reduce XSS from prompt injection.
- **Forms**: Honeypot + client validation on email. No account store on our side.
- **Secrets**: Gemini and Supabase credentials live in environment variables only. Never commit `.env`.

## Known Limitations / Trade-offs

- Tailwind Play CDN (`cdn.tailwindcss.com`) requires `'unsafe-inline'` / `'unsafe-eval'` in CSP.
- Google Fonts via `@import` (no SRI).
- Many inline `<style>` / onclick handlers (historical).
- In-memory rate limit on Ask Krishna resets on cold start.

## Reporting

See `.well-known/security.txt` for contact.

We appreciate reports of XSS, CSP bypass, CORS misconfig, prompt-injection that leads to HTML execution, or leaked credentials in the repo.

No public bug bounty at this time.

## Recommendations for Deploy (Netlify)

- Keep `_headers` and `_redirects`.
- Set `GEMINI_API_KEY` (and Supabase vars if community is live) in Netlify env — never in git.
- Enable platform WAF / bot protection.
- Periodically re-pin Font Awesome and review CDNs.

Last reviewed: 2026-08-29 (Ask Krishna CORS + XSS hardening; honest architecture notes).
