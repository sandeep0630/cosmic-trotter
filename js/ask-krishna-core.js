/**
 * Shared Ask Krishna client helpers (browser).
 * Loaded by widget / bot pages.
 */
(function (global) {
  const STORAGE_KEY = 'cosmic_ask_krishna_session_v1';
  const DAILY_KEY = 'cosmic_ask_krishna_daily_v1';
  const DAILY_FREE_SOFT = 60;

  function preferredLang() {
    try {
      const lang = (localStorage.getItem('preferredLang') || 'en').toLowerCase();
      if (['en', 'hi', 'te', 'kn'].includes(lang)) return lang;
    } catch (e) {}
    return 'en';
  }

  function speechLang(code) {
    return { en: 'en-US', hi: 'hi-IN', te: 'te-IN', kn: 'kn-IN' }[code] || 'en-US';
  }

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return { history: [], lastEngine: null };
      const data = JSON.parse(raw);
      return {
        history: Array.isArray(data.history) ? data.history.slice(-12) : [],
        lastEngine: data.lastEngine || null
      };
    } catch (e) {
      return { history: [], lastEngine: null };
    }
  }

  function saveSession(history, lastEngine) {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          history: (history || []).slice(-12),
          lastEngine: lastEngine || null,
          t: Date.now()
        })
      );
    } catch (e) {}
  }

  function dailyCount() {
    const day = new Date().toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem(DAILY_KEY);
      const data = raw ? JSON.parse(raw) : null;
      if (!data || data.day !== day) return { day, count: 0 };
      return { day, count: Number(data.count) || 0 };
    } catch (e) {
      return { day, count: 0 };
    }
  }

  function bumpDaily() {
    const { day, count } = dailyCount();
    const next = count + 1;
    try {
      localStorage.setItem(DAILY_KEY, JSON.stringify({ day, count: next }));
    } catch (e) {}
    return { day, count: next, softLimit: DAILY_FREE_SOFT, nearLimit: next >= DAILY_FREE_SOFT };
  }

  function track(eventName, detail) {
    try {
      window.dispatchEvent(new CustomEvent('cosmic-analytics', { detail: { event: eventName, ...detail } }));
      if (window.plausible) window.plausible(eventName, { props: detail || {} });
      if (window.gtag) window.gtag('event', eventName, detail || {});
    } catch (e) {}
  }

  function apiEndpoints() {
    // Prefer same-origin Netlify function; local server on 8888 as fallback for file:// or plain static serve
    const list = ['/.netlify/functions/ask-krishna'];
    if (
      location.protocol === 'file:' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1'
    ) {
      list.push('http://127.0.0.1:8888/.netlify/functions/ask-krishna');
      list.push('http://127.0.0.1:8888/api/ask-krishna');
    }
    return list;
  }

  async function callAskKrishnaApi({ userMessage, messages, pageContext, topicHint }) {
    const payload = {
      userMessage,
      messages: (messages || []).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      })),
      pageContext: pageContext || '',
      preferredLang: preferredLang(),
      topicHint: topicHint || ''
    };

    let lastErr = null;
    for (const url of apiEndpoints()) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          lastErr = new Error('status ' + res.status);
          continue;
        }
        const data = await res.json();
        return data;
      } catch (e) {
        lastErr = e;
      }
    }
    return { reply: null, useLocal: true, error: lastErr ? lastErr.message : 'network' };
  }

  function gitaChapterHref(ref) {
    // Deep link into Gita storybook when possible
    const m = String(ref || '').match(/(\d{1,2})\s*[:.]\s*(\d{1,3})/);
    if (!m) return 'bhagavad-gita.html';
    const ch = m[1];
    // Prefer chapter hash if present on site; otherwise full book
    return `bhagavad-gita.html#chapter-${ch}`;
  }

  function formatStructuredHtml(text, verse, options) {
    const escape = options && options.escapeHtml ? options.escapeHtml : (s) => String(s);
    let html = escape(text).replace(/\n/g, '<br>');
    // If LLM already used markdown-ish **bold**, light convert
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    if (verse && verse.ref) {
      const href = gitaChapterHref(verse.ref);
      const base = options && options.basePath != null ? options.basePath : '';
      html += `<div class="krishna-verse-card"><div class="krishna-verse-ref">${escape(verse.ref)}</div>`;
      if (verse.en) html += `<div class="krishna-verse-text">"${escape(verse.en)}"</div>`;
      html += `<a class="krishna-verse-link" href="${base}${href}">Open Gita journey →</a></div>`;
    }
    return html;
  }

  global.CosmicAskKrishna = {
    preferredLang,
    speechLang,
    loadSession,
    saveSession,
    dailyCount,
    bumpDaily,
    track,
    callAskKrishnaApi,
    gitaChapterHref,
    formatStructuredHtml,
    DAILY_FREE_SOFT
  };
})(typeof window !== 'undefined' ? window : globalThis);
