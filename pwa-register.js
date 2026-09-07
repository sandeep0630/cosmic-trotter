/** Register CosmicTrotter service worker (Phase 3 offline shell). */
(function () {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Local file:// or unsupported path — ignore quietly
      try {
        navigator.serviceWorker.register("sw.js").catch(() => undefined);
      } catch (e) { /* ignore */ }
    });
  });
})();

(function loadKidsToggle() {
  var s = document.createElement("script");
  s.src = "/kids-toggle.js?v=20260907-kids-4";
  s.defer = true;
  document.head.appendChild(s);
})();
