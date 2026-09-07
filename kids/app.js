(function () {
  const ROOT = "/kids";
  const STORIES = "/kids/kids-stories";
  const VANAGIRI = "/kids/kids-stories/vanagiri";
  const KEY = "vanagiri-progress-v2";

  const $ = (sel, el = document) => el.querySelector(sel);
  const app = () => document.getElementById("app");

  function path() {
    return (location.pathname || "/").replace(/\/+$/, "") || "/";
  }

  function data() {
    return window.VANAGIRI_DATA || { series: {}, episodes: [], companions: [], manis: [], universeLore: {} };
  }

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
      const ep = data().episodes.find((e) => e.id === parsed.episodeId) || data().episodes[0];
      const page = Math.max(0, Math.min(parsed.page || 0, (ep?.pages.length || 1) - 1));
      return { episodeId: ep?.id || "falling-star", page };
    } catch {
      return { episodeId: "falling-star", page: 0 };
    }
  }

  function saveProgress(episodeId, page) {
    localStorage.setItem(KEY, JSON.stringify({ episodeId, page }));
  }

  function go(href) {
    history.pushState({}, "", href);
    render();
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("#")) return;
    if (href === "/" || href.startsWith("/kids")) {
      e.preventDefault();
      go(href);
    }
  });
  window.addEventListener("popstate", render);

  function shell(inner, { homeOn, storiesOn } = {}) {
    return `<div class="shell">
      <header class="topbar">
        <a class="brand" href="${ROOT}"><img src="/logo.png" alt="">Kids · CosmicTrotter</a>
        <nav class="desk-nav">
          <a href="${ROOT}" class="${homeOn ? "is-on" : ""}">Home</a>
          <a href="${STORIES}" class="${storiesOn ? "is-on" : ""}">Stories</a>
        </nav>
      </header>
      ${inner}
      <nav class="bottom">
        <a href="${ROOT}" class="${homeOn ? "is-on" : ""}">Home</a>
        <a href="${STORIES}" class="${storiesOn ? "is-on" : ""}">Stories</a>
      </nav>
    </div>`;
  }

  function landing() {
    const pillars = [
      { title: "Kids Stories", text: "Illustrated adventures. Open a book, walk with a lion, find a jewel.", href: STORIES, live: true, image: "/kids/art/cover.jpg" },
      { title: "Temple Tales", text: "Quiet doors, lamps, and mountains. Told gently.", live: false, image: "/kids/art/temple.jpg" },
      { title: "Sky Watch", text: "Stars, moons, and the falling lights that start great journeys.", live: false, image: "/kids/art/falling-star.jpg" },
      { title: "Little Wisdom", text: "Short wonders from Krishna and the old stories.", live: false, image: "/kids/art/krishna.jpg" },
    ];
    const cards = pillars.map((p) => {
      const body = `<img src="${p.image}" alt="">
        <div class="pad">
          <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)">
            <span></span><span>${p.live ? "Open" : "Soon"}</span>
          </div>
          <h3 style="margin-top:.7rem;font-size:1.5rem">${p.title}</h3>
          <p class="muted">${p.text}</p>
        </div>`;
      return p.live
        ? `<a class="card" href="${p.href}">${body}</a>`
        : `<div class="card soon">${body}</div>`;
    }).join("");
    return shell(`
      <section class="hero">
        <img class="bg" src="/kids/art/village.jpg" alt="Forest village by a river">
        <div class="veil"></div>
        <div class="copy">
          <p class="kicker" style="color:var(--primary-fg)">CosmicTrotter Kids</p>
          <h1>A door just for children.</h1>
          <p style="max-width:36rem;font-family:var(--serif);font-size:1.15rem;line-height:1.6;opacity:.9">Stories, temples, stars, and small wisdom. Flip Kids off anytime to return to CosmicTrotter.</p>
        </div>
      </section>
      <section class="wrap">
        <p class="kicker">Choose a pillar</p>
        <h2 style="font-size:2rem;margin-top:.4rem">Where shall we go?</h2>
        <div class="grid-2" style="margin-top:1.5rem">${cards}</div>
      </section>`, { homeOn: true });
  }

  function stories() {
    const s = data().series;
    return shell(`
      <main class="wrap">
        <p class="kicker">Kids Stories</p>
        <h1 style="font-size:clamp(2rem,5vw,3rem);margin-top:.4rem">Storybooks for small travelers</h1>
        <p class="muted" style="max-width:40rem;font-size:1.15rem">Open a card. Walk into a forest. The first book is Vanagiri — seven illustrated episodes, a boy, and a lion who grew up beside him.</p>
        <a class="card story-feature" href="${VANAGIRI}" style="display:grid;margin-top:2rem">
          <img src="/kids/art/cover.jpg" alt="Aarav catching a blue jewel, Kesari beside him" style="aspect-ratio:auto;min-height:16rem">
          <div class="pad" style="display:flex;flex-direction:column;justify-content:center">
            <p class="kicker">Seven episodes · illustrated</p>
            <h2 style="font-size:2rem;margin-top:.4rem">${s.title || "Vanagiri Chronicles"}</h2>
            <p class="muted">${s.logline || ""}</p>
            <span class="kicker" style="margin-top:1.2rem">Open the chronicle</span>
          </div>
        </a>
      </main>`, { storiesOn: true });
  }

  function vanagiriHome() {
    const { series, episodes } = data();
    const p = loadProgress();
    const list = (episodes || []).map((ep) => `
      <a href="${VANAGIRI}/read/${ep.id}">
        <div>
          <p class="kicker">Episode ${ep.number} · ${ep.setting || ""}</p>
          <h3>${ep.title}</h3>
          <p class="muted" style="margin:0">${ep.tease}</p>
        </div>
        <span class="kicker">Read</span>
      </a>`).join("");
    return shell(`
      <section class="hero" style="min-height:70vh">
        <img class="bg" src="/kids/art/cover.jpg" alt="">
        <div class="veil"></div>
        <div class="copy">
          <p class="kicker" style="color:var(--primary-fg)">Kids Stories · seven episodes</p>
          <h1>${series.title}</h1>
          <p style="max-width:36rem;font-family:var(--serif);font-size:1.2rem;line-height:1.6;opacity:.9">${series.logline}</p>
          <div class="row">
            <a class="btn" href="${VANAGIRI}/read/${p.episodeId}">${p.page > 0 ? "Continue the road" : "Begin Episode 1"}</a>
            <a class="btn ghost" href="${VANAGIRI}/read">All seven episodes</a>
          </div>
        </div>
      </section>
      <section class="wrap">
        <p class="kicker">The whole chronicle</p>
        <h2 style="font-size:2rem;margin:.4rem 0 1.25rem">The temple does not appear in the snow until they walk there.</h2>
        <div class="grid-2" style="grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))">
          <a class="card pad" href="${VANAGIRI}/read"><h3>Seven episodes</h3><p class="muted">Forest, river, roar, wind, lamps, snow road, the door.</p></a>
          <a class="card pad" href="${VANAGIRI}/companions"><h3>Companions</h3><p class="muted">Why Meera is at the river. How Kesari grew with Aarav.</p></a>
          <a class="card pad" href="${VANAGIRI}/universe"><h3>The universe</h3><p class="muted">Jewels, not plumes. A feather used as a key.</p></a>
        </div>
        <div class="ep-list">${list}</div>
      </section>`, { storiesOn: true });
  }

  function readLibrary() {
    const { episodes } = data();
    const p = loadProgress();
    const cards = (episodes || []).map((ep) => `
      <a class="card" href="${VANAGIRI}/read/${ep.id}">
        <img src="${ep.cover}" alt="">
        <div class="pad">
          <p class="kicker">Episode ${ep.number}</p>
          <h3>${ep.title}</h3>
          <p class="muted">${ep.tease}</p>
        </div>
      </a>`).join("");
    return shell(`
      <main class="wrap">
        <p class="kicker">Vanagiri</p>
        <h1 style="font-size:2.4rem;margin-top:.4rem">All seven episodes</h1>
        <p class="muted">From a green forest village to a snow-cliff temple many days north.</p>
        <div class="row"><a class="btn" href="${VANAGIRI}/read/${p.episodeId}">Continue</a></div>
        <div class="grid-2" style="margin-top:1.5rem">${cards}</div>
      </main>`, { storiesOn: true });
  }

  function companions() {
    const cards = (data().companions || []).map((c) => `
      <article class="card">
        <img src="${c.image}" alt="${c.imageAlt || ""}" style="aspect-ratio:3/4;object-position:top">
        <div class="pad">
          <p class="kicker">${c.role}</p>
          <h2 style="font-size:1.6rem">${c.name}</h2>
          <p class="muted">${c.story}</p>
        </div>
      </article>`).join("");
    return shell(`
      <main class="wrap">
        <p class="kicker">The company of the forest</p>
        <h1 style="font-size:2.4rem;margin-top:.4rem">Companions of Vanagiri</h1>
        <div class="grid-2" style="margin-top:1.5rem;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))">${cards}</div>
        <div class="row"><a class="btn" href="${VANAGIRI}/read/falling-star">Read Episode 1</a></div>
      </main>`, { storiesOn: true });
  }

  function universe() {
    const lore = data().universeLore || {};
    const manis = (data().manis || []).map((m) => `<li class="card pad"><strong>${m.name}</strong><p class="muted" style="margin:.3rem 0 0">${m.meaning}</p></li>`).join("");
    const path = (lore.path || []).map((p) => `<li class="card pad"><strong>${p.name}</strong><p class="muted" style="margin:.3rem 0 0">${p.note}</p></li>`).join("");
    return shell(`
      <main class="wrap">
        <p class="kicker">The universe</p>
        <h1 style="font-size:2.4rem;margin-top:.4rem">The lock, the road, the key</h1>
        <p class="muted">${lore.temple || ""}</p>
        <h2 style="margin:1.5rem 0 .6rem">Family</h2>
        <p class="muted">${lore.family || ""}</p>
        <h2 style="margin:1.5rem 0 .6rem">The seven manis</h2>
        <ol class="ep-list">${manis}</ol>
        <h2 style="margin:1.5rem 0 .6rem">The walk</h2>
        <ol class="ep-list">${path}</ol>
      </main>`, { storiesOn: true });
  }

  function reader(episodeId, pageIndex) {
    const ep = data().episodes.find((e) => e.id === episodeId);
    if (!ep) return readLibrary();
    const pages = ep.pages || [];
    let i = Math.max(0, Math.min(pageIndex || 0, pages.length - 1));
    const page = pages[i];
    const nextEp = data().episodes[data().episodes.findIndex((e) => e.id === ep.id) + 1];
    saveProgress(ep.id, i);

    function paint() {
      const p = pages[i];
      const last = i === pages.length - 1;
      const nextBlock = last
        ? (nextEp
          ? `<a class="btn" href="${VANAGIRI}/read/${nextEp.id}">Next: Episode ${nextEp.number} · ${nextEp.title}</a>`
          : `<a class="btn" href="${VANAGIRI}/universe">The whole universe</a>`)
        : "";
      app().innerHTML = `<div class="reader">
        <header class="reader-bar">
          <a href="${VANAGIRI}/read">All episodes</a>
          <span>Ep ${ep.number} · ${i + 1}/${pages.length}</span>
          <button type="button" id="toc-btn">Pages</button>
        </header>
        <div class="art-frame"><img src="${p.image}" alt="${p.imageAlt || ""}"></div>
        <div class="page-copy">
          <p class="kicker">${p.kicker || ""}</p>
          <h1 style="font-size:2rem;margin:.4rem 0 1rem">${p.title || ""}</h1>
          ${(p.body || []).map((para) => `<p>${para}</p>`).join("")}
          ${last ? `<div class="row">${nextBlock}<a class="btn ghost" href="${VANAGIRI}/read">All episodes</a></div>` : ""}
        </div>
        <div class="pager">
          <button class="btn ghost" id="prev" ${i === 0 ? "disabled" : ""}>Previous</button>
          <button class="btn" id="next" ${last ? "disabled" : ""}>Next</button>
        </div>
      </div>`;
      $("#prev")?.addEventListener("click", () => { if (i > 0) { i -= 1; saveProgress(ep.id, i); paint(); window.scrollTo(0, 0); } });
      $("#next")?.addEventListener("click", () => { if (i < pages.length - 1) { i += 1; saveProgress(ep.id, i); paint(); window.scrollTo(0, 0); } });
      $("#toc-btn")?.addEventListener("click", () => {
        const existing = $(".toc");
        if (existing) { existing.remove(); return; }
        const toc = document.createElement("div");
        toc.className = "toc";
        toc.innerHTML = pages.map((pg, n) => `<a href="#" data-i="${n}" class="${n === i ? "is-on" : ""}">${n + 1}. ${pg.title}</a>`).join("");
        $(".reader").appendChild(toc);
        toc.addEventListener("click", (ev) => {
          const a = ev.target.closest("a[data-i]");
          if (!a) return;
          ev.preventDefault();
          i = Number(a.dataset.i);
          saveProgress(ep.id, i);
          paint();
          window.scrollTo(0, 0);
        });
      });
    }
    paint();
  }

  function render() {
    const p = path();
    document.title = "Kids · CosmicTrotter";
    if (p === ROOT || p === "/kids") {
      app().innerHTML = landing();
      return;
    }
    if (p === STORIES) {
      app().innerHTML = stories();
      return;
    }
    if (p === VANAGIRI) {
      app().innerHTML = vanagiriHome();
      return;
    }
    if (p === VANAGIRI + "/read") {
      app().innerHTML = readLibrary();
      return;
    }
    if (p === VANAGIRI + "/companions") {
      app().innerHTML = companions();
      return;
    }
    if (p === VANAGIRI + "/universe") {
      app().innerHTML = universe();
      return;
    }
    const m = p.match(/\/kids\/kids-stories\/vanagiri\/read\/([^/]+)$/);
    if (m) {
      const prog = loadProgress();
      reader(m[1], prog.episodeId === m[1] ? prog.page : 0);
      return;
    }
    app().innerHTML = landing();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
