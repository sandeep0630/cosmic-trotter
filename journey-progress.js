/**
 * CosmicTrotter journey progress
 * - Saves scroll % + path for "continue where you left off"
 * - Shows resume banners on hub pages ([data-continue-reading])
 * - Fills [data-read-time] from word count when empty
 */
(function () {
  const LAST_KEY = 'cosmic_journey_last_v1';
  const RECENT_KEY = 'cosmic_journey_recent_v1';

  function pathKey() {
    return (window.location.pathname || '/').replace(/\\/g, '/');
  }

  function isJourneyPage() {
    return !!(document.body && (
      document.body.dataset.storybookSlug ||
      document.querySelector('.storybook-content')
    ));
  }

  function scrollPercent() {
    const top = window.scrollY || document.documentElement.scrollTop || 0;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height <= 0) return 0;
    return Math.min(100, Math.round((top / height) * 100));
  }

  function titleOfPage() {
    const h1 = document.querySelector('h1');
    if (h1) return h1.textContent.trim().slice(0, 120);
    return document.title.split('•')[0].trim().slice(0, 120);
  }

  function saveProgress() {
    if (!isJourneyPage()) return;
    const entry = {
      path: pathKey(),
      href: window.location.pathname + window.location.search + window.location.hash,
      title: titleOfPage(),
      percent: scrollPercent(),
      ts: Date.now()
    };
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify(entry));
      let recent = [];
      try { recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) {}
      if (!Array.isArray(recent)) recent = [];
      recent = recent.filter((r) => r && r.path !== entry.path);
      recent.unshift(entry);
      localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 12)));
    } catch (e) {}
  }

  let saveTimer = null;
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveProgress, 400);
  }

  function getLast() {
    try {
      return JSON.parse(localStorage.getItem(LAST_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function renderContinueBanners() {
    const mounts = document.querySelectorAll('[data-continue-reading]');
    if (!mounts.length) return;
    const last = getLast();
    if (!last || !last.path || !last.title) {
      mounts.forEach((el) => { el.hidden = true; });
      return;
    }
    // Don't resume the same page you're already on
    const here = pathKey();
    if (last.path === here || here.endsWith(last.path)) {
      mounts.forEach((el) => { el.hidden = true; });
      return;
    }
    const pct = typeof last.percent === 'number' ? last.percent : 0;
    if (pct < 3) {
      mounts.forEach((el) => { el.hidden = true; });
      return;
    }
    mounts.forEach((el) => {
      el.hidden = false;
      el.innerHTML = `
        <div class="rounded-2xl border border-cyan-400/25 bg-cyan-400/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div class="text-xs uppercase tracking-[2px] text-cyan-300 mb-1">Continue reading</div>
            <div class="font-semibold text-white">${escapeHtml(last.title)}</div>
            <div class="text-sm text-white/55 mt-0.5">${pct}% through</div>
          </div>
          <a href="${escapeAttr(last.href || last.path)}" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10 transition">
            Resume <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      `;
    });
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/`/g, '');
  }

  function fillReadTimes() {
    document.querySelectorAll('[data-read-time]').forEach((el) => {
      if (el.textContent && el.textContent.trim() && !el.dataset.readTimeAuto) return;
      const words = (document.querySelector('.storybook-content') || document.body)
        .innerText.split(/\s+/).filter(Boolean).length;
      const mins = Math.max(3, Math.round(words / 220));
      el.textContent = `${mins} min`;
      el.dataset.readTimeAuto = '1';
    });
  }

  function init() {
    fillReadTimes();
    renderContinueBanners();
    if (isJourneyPage()) {
      window.addEventListener('scroll', scheduleSave, { passive: true });
      window.addEventListener('beforeunload', saveProgress);
      scheduleSave();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CosmicJourneyProgress = { saveProgress, getLast, renderContinueBanners };
})();
