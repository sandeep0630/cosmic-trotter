(function () {
  var STORAGE_KEY = 'cosmic-trotter-theme';
  var root = document.documentElement;
  var savedTheme = null;

  try {
    savedTheme = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    savedTheme = null;
  }

  var initialTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  root.setAttribute('data-theme', initialTheme);
  root.style.colorScheme = initialTheme;

  var css = [
    ':root[data-theme="light"]{color-scheme:light;}',
    'html[data-theme="light"] body{background:#f7f2e8!important;color:#241f18!important;}',
    'html[data-theme="light"] .cosmic-bg{background:radial-gradient(circle at top,#fff8e8 0%,#eef6ff 52%,#f8fafc 100%)!important;}',
    'html[data-theme="light"] nav,html[data-theme="light"] footer{background:rgba(255,255,255,.88)!important;border-color:rgba(36,31,24,.14)!important;color:#241f18!important;box-shadow:0 10px 35px rgba(50,36,16,.08);}',
    'html[data-theme="light"] .cosmic-card,html[data-theme="light"] .wisdom-card,html[data-theme="light"] .message-krishna{background:rgba(255,255,255,.82)!important;border-color:rgba(124,58,237,.2)!important;box-shadow:0 18px 45px rgba(50,36,16,.1);color:#241f18!important;}',
    'html[data-theme="light"] [class*="bg-[#0a0a0f]"],html[data-theme="light"] [class*="bg-[#0f0f1a]"],html[data-theme="light"] [class*="bg-[#1a1a2e]"],html[data-theme="light"] [class*="bg-[#111827]"]{background-color:#fffaf0!important;}',
    'html[data-theme="light"] [class*="bg-white/5"],html[data-theme="light"] [class*="bg-white/10"]{background-color:rgba(255,255,255,.7)!important;}',
    'html[data-theme="light"] [class*="border-white/"]{border-color:rgba(36,31,24,.16)!important;}',
    'html[data-theme="light"] .text-white,html[data-theme="light"] [class*="text-white/"]{color:#241f18!important;}',
    'html[data-theme="light"] .text-white\\/40,html[data-theme="light"] .text-white\\/50,html[data-theme="light"] .text-white\\/60,html[data-theme="light"] .text-white\\/70,html[data-theme="light"] .text-white\\/80{color:rgba(36,31,24,.72)!important;}',
    'html[data-theme="light"] [class*="bg-gradient"] .text-white,html[data-theme="light"] .message-user,html[data-theme="light"] .message-user .text-sm,html[data-theme="light"] .cosmic-btn{color:#fff!important;}',
    'html[data-theme="light"] .cosmic-btn,html[data-theme="light"] .text-black{color:#080807!important;}',
    'html[data-theme="light"] input,html[data-theme="light"] textarea{background:rgba(255,255,255,.88)!important;color:#241f18!important;border-color:rgba(36,31,24,.18)!important;}',
    'html[data-theme="light"] input::placeholder,html[data-theme="light"] textarea::placeholder{color:rgba(36,31,24,.45)!important;}',
    'html[data-theme="light"] .prose,html[data-theme="light"] .prose-invert{color:#241f18!important;}',
    'html[data-theme="light"] .prose p,html[data-theme="light"] .prose li{color:rgba(36,31,24,.78)!important;}',
    'html[data-theme="light"] .verse-highlight{background:rgba(124,58,237,.11)!important;color:#241f18!important;}',
    'html[data-theme="light"] img:not(.theme-preserve){filter:saturate(1.04) brightness(1.02);}',
    '.theme-toggle{position:fixed;top:14px;right:14px;z-index:99999;display:inline-flex;align-items:center;gap:10px;padding:8px 11px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(10,10,15,.72);color:#fff;font:600 12px/1 Inter,system-ui,sans-serif;letter-spacing:.02em;backdrop-filter:blur(14px);box-shadow:0 12px 30px rgba(0,0,0,.24);cursor:pointer;transition:background .2s ease,border-color .2s ease,color .2s ease,transform .2s ease;}',
    '.theme-toggle:hover{transform:translateY(-1px);}',
    '.theme-toggle__track{position:relative;width:36px;height:20px;border-radius:999px;background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);}',
    '.theme-toggle__thumb{position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.28);transition:transform .2s ease,background .2s ease;}',
    '.theme-toggle__label{min-width:34px;text-align:left;}',
    'html[data-theme="light"] .theme-toggle{background:rgba(255,255,255,.78);border-color:rgba(36,31,24,.18);color:#241f18;box-shadow:0 12px 30px rgba(60,40,10,.14);}',
    'html[data-theme="light"] .theme-toggle__track{background:rgba(124,58,237,.22);box-shadow:inset 0 0 0 1px rgba(124,58,237,.24);}',
    'html[data-theme="light"] .theme-toggle__thumb{transform:translateX(16px);background:#7c3aed;}',
    '@media (max-width:640px){.theme-toggle{top:10px;right:10px;padding:7px 9px;}.theme-toggle__label{display:none;}}'
  ].join('');

  function installStyles() {
    if (document.getElementById('cosmic-theme-style')) return;

    var style = document.createElement('style');
    style.id = 'cosmic-theme-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function updateToggle(button) {
    if (!button) return;

    var isLight = currentTheme() === 'light';
    button.setAttribute('aria-pressed', String(isLight));
    button.setAttribute('title', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    button.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    var labelEl = button.querySelector('.theme-toggle__label');
    if (labelEl) labelEl.textContent = isLight ? 'Light' : 'Dark';
  }

  // Exposed for site-nav.js mover to re-sync state after moving the button between slots
  window.__cosmicUpdateThemeToggle = function (button) {
    updateToggle(button || document.querySelector('.theme-toggle'));
  };

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Theme persistence is optional when storage is blocked.
    }

    updateToggle(document.querySelector('.theme-toggle'));
  }

  function createToggle() {
    if (document.querySelector('.theme-toggle')) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.innerHTML = '<span class="theme-toggle__track" aria-hidden="true"><span class="theme-toggle__thumb"></span></span><span class="theme-toggle__label"></span>';
    button.addEventListener('click', function () {
      setTheme(currentTheme() === 'light' ? 'dark' : 'light');
    });

    document.body.appendChild(button);
    updateToggle(button);

    // Immediately try to move into the cosmic site nav slots (if site-nav has already rendered them).
    // This + the mover in site-nav.js eliminates the fixed toggle overlapping Join / hamburger.
    tryRelocateToggleToNavSlot(button);
  }

  function tryRelocateToggleToNavSlot(button) {
    if (!button) button = document.querySelector('.theme-toggle');
    if (!button) return;

    var desktopSlot = document.querySelector('[data-cosmic-theme-slot]');
    var mobileSlot = document.querySelector('[data-cosmic-theme-mobile-slot]');
    var useMobile = window.matchMedia && window.matchMedia('(max-width: 1279px)').matches;
    var slot = useMobile ? mobileSlot : desktopSlot;

    if (slot && button.parentElement !== slot) {
      slot.appendChild(button);
      updateToggle(button);
    }

    // A couple of follow-up attempts in case slots appear slightly later
    setTimeout(function () {
      var b = document.querySelector('.theme-toggle');
      var ds = document.querySelector('[data-cosmic-theme-slot]');
      var ms = document.querySelector('[data-cosmic-theme-mobile-slot]');
      var um = window.matchMedia && window.matchMedia('(max-width: 1279px)').matches;
      var s = um ? ms : ds;
      if (s && b && b.parentElement !== s) {
        s.appendChild(b);
        updateToggle(b);
      }
    }, 80);
    setTimeout(function () {
      var b = document.querySelector('.theme-toggle');
      var ds = document.querySelector('[data-cosmic-theme-slot]');
      var ms = document.querySelector('[data-cosmic-theme-mobile-slot]');
      var um = window.matchMedia && window.matchMedia('(max-width: 1279px)').matches;
      var s = um ? ms : ds;
      if (s && b && b.parentElement !== s) {
        s.appendChild(b);
        updateToggle(b);
      }
    }, 220);
  }

  installStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createToggle);
  } else {
    createToggle();
  }

  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
      root.setAttribute('data-theme', event.newValue);
      root.style.colorScheme = event.newValue;
      updateToggle(document.querySelector('.theme-toggle'));
    }
  });
})();
