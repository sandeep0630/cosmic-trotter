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
