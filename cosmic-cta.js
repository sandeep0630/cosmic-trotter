/**
 * CosmicTrotter — uniform end-of-article CTA strip.
 * Opt-in: set data-cosmic-cta='{"pillar":"philosophy","related":[{"href":"...","label":"..."}]}'
 * on <body>, or call CosmicCTA.mount({...}).
 */
(function () {
  function parseConfig() {
    const raw = document.body && document.body.getAttribute("data-cosmic-cta");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function isNested() {
    const path = (window.location.pathname || "").replace(/\\/g, "/");
    const parts = path.split("/").filter(Boolean);
    // e.g. /philosophy/foo.html or /crossroads/x.html → depth 2+
    return parts.length >= 2;
  }

  function rootPrefix() {
    return isNested() ? "../" : "";
  }

  function mount(config) {
    if (!config) config = parseConfig();
    if (!config) return;
    if (document.getElementById("cosmic-cta-strip")) return;

    const p = rootPrefix();
    const related = Array.isArray(config.related) ? config.related : [];
    const relatedHtml = related
      .slice(0, 3)
      .map(
        (r) =>
          `<a href="${r.href}" class="cosmic-cta-link">${escapeHtml(r.label || "Related")}</a>`
      )
      .join("");

    const wrap = document.createElement("section");
    wrap.id = "cosmic-cta-strip";
    wrap.className = "cosmic-cta-strip";
    wrap.innerHTML = `
      <div class="cosmic-cta-inner">
        <div class="cosmic-cta-kicker">CONTINUE THE JOURNEY</div>
        <div class="cosmic-cta-grid">
          <div class="cosmic-cta-col">
            <div class="cosmic-cta-label">Related</div>
            <div class="cosmic-cta-links">${relatedHtml || `<a href="${p}start.html" class="cosmic-cta-link">Start Here</a>`}</div>
          </div>
          <div class="cosmic-cta-col">
            <div class="cosmic-cta-label">Ask &amp; watch</div>
            <div class="cosmic-cta-links">
              <a href="${p}ancient-wisdom/ask-krishna-bot.html" class="cosmic-cta-link">Ask Krishna</a>
              <a href="${p}index.html#reels" class="cosmic-cta-link">Watch reels</a>
              <a href="${p}gita-verse.html" class="cosmic-cta-link">Gita verse today</a>
            </div>
          </div>
          <div class="cosmic-cta-col">
            <div class="cosmic-cta-label">Explore</div>
            <div class="cosmic-cta-links">
              <a href="${p}crossroads/" class="cosmic-cta-link">Cosmic Crossroads</a>
              <a href="${p}wisdom.html" class="cosmic-cta-link">Daily Wisdom</a>
              <a href="${p}start.html" class="cosmic-cta-link">Start Here</a>
            </div>
          </div>
        </div>
      </div>
    `;

    // inject styles once
    if (!document.getElementById("cosmic-cta-styles")) {
      const style = document.createElement("style");
      style.id = "cosmic-cta-styles";
      style.textContent = `
        .cosmic-cta-strip {
          max-width: 48rem;
          margin: 0 auto 4rem;
          padding: 0 1.5rem;
        }
        .cosmic-cta-inner {
          border-radius: 1.25rem;
          border: 1px solid rgba(0, 243, 255, 0.18);
          background: linear-gradient(145deg, rgba(0,243,255,0.06), rgba(124,58,237,0.06));
          padding: 1.5rem 1.35rem;
        }
        .cosmic-cta-kicker {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #00f3ff;
          margin-bottom: 1rem;
          text-align: center;
        }
        .cosmic-cta-grid {
          display: grid;
          gap: 1.25rem;
        }
        @media (min-width: 768px) {
          .cosmic-cta-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        }
        .cosmic-cta-label {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.45);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .cosmic-cta-links { display: flex; flex-direction: column; gap: 0.4rem; }
        .cosmic-cta-link {
          color: rgba(224,231,255,0.92);
          text-decoration: none;
          font-size: 0.95rem;
        }
        .cosmic-cta-link:hover { color: #00f3ff; text-decoration: underline; }
      `;
      document.head.appendChild(style);
    }

    // Prefer insert before footer, else before ask-krishna / end of body
    const footer = document.querySelector("footer");
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(wrap, footer);
    } else {
      document.body.appendChild(wrap);
    }
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  window.CosmicCTA = { mount };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => mount());
  } else {
    mount();
  }
})();
