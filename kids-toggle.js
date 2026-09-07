(function () {
  const STORAGE = "cosmic-kids-mode";

  function isKidsPath() {
    const path = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
    return path === "/kids" || path.startsWith("/kids/");
  }

  function go(on) {
    try {
      localStorage.setItem(STORAGE, on ? "1" : "0");
    } catch (e) {}
    window.location.href = on ? "/kids/" : "/";
  }

  function buildToggle() {
    const on = isKidsPath();
    const wrap = document.createElement("div");
    wrap.className = "ct-kids-toggle";
    wrap.innerHTML =
      '<span class="ct-kids-label">Kids</span>' +
      '<button type="button" role="switch" aria-checked="' +
      (on ? "true" : "false") +
      '" aria-label="Kids mode" class="ct-kids-switch' +
      (on ? " is-on" : "") +
      '"><span class="ct-kids-knob"></span></button>';
    wrap.querySelector("button").addEventListener("click", function () {
      go(!on);
    });
    return wrap;
  }

  function injectStyles() {
    if (document.getElementById("ct-kids-toggle-css")) return;
    const css = document.createElement("style");
    css.id = "ct-kids-toggle-css";
    css.textContent =
      ".ct-kids-toggle{display:inline-flex;align-items:center;gap:.5rem;min-height:44px;padding:4px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);margin-left:auto;flex-shrink:0;align-self:center}" +
      ".kids-toggle-slot{margin-left:auto;display:flex;align-items:center;flex-shrink:0}" +
      ".kids-toggle-slot .ct-kids-toggle{margin-left:0}" +
      ".ct-kids-toggle .ct-kids-label{font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.74)}" +
      "body:not(.cosmic-bg) .ct-kids-toggle{border-color:#d9c6a0;background:#fff8ea}" +
      "body:not(.cosmic-bg) .ct-kids-label{color:#6e5c4a}" +
      ".ct-kids-switch{position:relative;width:48px;height:28px;border:0;border-radius:9999px;background:rgba(255,255,255,.2);cursor:pointer}" +
      "body:not(.cosmic-bg) .ct-kids-switch{background:#c4ad80}" +
      ".ct-kids-switch.is-on{background:#00f3ff}" +
      "body:not(.cosmic-bg) .ct-kids-switch.is-on{background:#0d6b62}" +
      ".ct-kids-knob{position:absolute;top:2px;left:2px;width:24px;height:24px;border-radius:9999px;background:#fff;transition:transform .15s ease}" +
      ".ct-kids-switch.is-on .ct-kids-knob{transform:translateX(20px)}";
    document.head.appendChild(css);
  }

  function placeToggle() {
    document.querySelectorAll(".ct-kids-toggle").forEach(function (n) { n.remove(); });
    const slot = document.querySelector(".kids-toggle-slot");
    if (slot) {
      slot.appendChild(buildToggle());
      return true;
    }
    const bar =
      document.querySelector("header .max-w-7xl") ||
      document.querySelector("header .max-w-6xl") ||
      document.querySelector(".topbar") ||
      document.querySelector("header");
    if (!bar) return false;
    bar.appendChild(buildToggle());
    return true;
  }

  window.CT_PLACE_KIDS_TOGGLE = placeToggle;

  function init() {
    injectStyles();
    if (placeToggle()) return;
    const obs = new MutationObserver(function () {
      if (placeToggle()) obs.disconnect();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () {
      obs.disconnect();
      placeToggle();
    }, 4000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
