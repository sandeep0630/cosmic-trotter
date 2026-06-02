# CosmicTrotter Security

This is a **static client-side only** website (HTML + JS). No backend, databases, or user accounts on our infrastructure.

## Current Security Posture

- **Headers** (`_headers`): Strict CSP (limited hosts + 'self', object-src 'none', base-uri, frame-ancestors, upgrade-insecure-requests), HSTS (preload), X-Frame DENY, nosniff, COOP same-origin, CORP, restrictive Permissions-Policy, etc.
- **Redirects** (`_redirects`): Bot/scanner blocks (/wp-*, .env, git, etc.), controlled clean-URL rewrites only, no open redirects.
- **External resources**: Pinned where possible (Font Awesome 6.5.1 via cdnjs with SRI + crossorigin). Tailwind Play CDN and Google Fonts @import used (limitations noted below). Brevo (sibforms) for newsletter only.
- **Client-side sanitization**: `escapeHtml()` used for all user-provided content in search results, chat widgets, wisdom archives before any `.innerHTML`.
- **Forms**: Honeypot + client validation (regex + native) on email before any submit. Double-submit guard. Optimistic UI + background submit (no-cors + hidden iframe fallback). No data stored by us.
- **No eval / dangerous patterns**: No `eval`, `new Function`, or unsanitized user input concatenation into code/DOM in critical paths.
- **Other**: target=_blank + rel="noopener noreferrer" on external links. localStorage only for non-sensitive prefs/history (namespaced). 404.html themed and safe.

## Known Limitations / Trade-offs (static no-build site)

- Tailwind Play CDN (`cdn.tailwindcss.com`): Requires 'unsafe-inline'/'unsafe-eval' in CSP. Not version-pinned in a stable way for SRI. Consider migrating to a built CSS in future for stricter CSP.
- Google Fonts: Loaded via @import inside <style> (no SRI possible easily). Preconnect would be an improvement.
- Many inline <style> and onclick handlers (historical): Require 'unsafe-inline'.
- Form handling uses third-party (Brevo) optimistic redirect for UX.

## Reporting

See `.well-known/security.txt` for contact.

We appreciate reports of:
- CSP bypasses or XSS vectors
- Supply chain concerns in our (few) external scripts
- Misconfigurations in headers/redirects

No public bug bounty at this time.

## Recommendations for Deploy (Netlify / similar)

- Ensure the `_headers` and `_redirects` are respected.
- Enable any platform WAF / bot protection.
- Monitor for mixed content.
- Periodically re-pin Font Awesome and review used CDNs.
- Consider adding a build step (e.g. Tailwind CLI) in the future to eliminate the Play CDN.

Last reviewed: 2026 (post initial security tightening pass).