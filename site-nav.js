(function () {
    const NAV_ID = "cosmic-site-nav";
    const SECTION_HASHES = new Set(["#explore", "#wisdom", "#community", "#pulse", "#reels", "#flagships", "#paths"]);
    const PENDING_SECTION_KEY = "cosmicPendingSectionHash";

    function getPath() {
        return window.location.pathname.replace(/\\/g, "/").toLowerCase();
    }

    function getBasePath() {
        // Root-relative depth: /philosophy/consciousness(.html) needs "../"
        // so logo/scripts resolve to site root, not /philosophy/logo.png (404).
        // Also: directory hubs like /crossroads/ or /crossroads need "../"
        // (single segment with no file extension = folder index, not a root page).
        let path = getPath().replace(/\/+$/, "");
        if (!path || path === "/") return "";

        const parts = path.split("/").filter(Boolean);
        if (parts.length === 0) return "";

        const last = parts[parts.length - 1];
        const lastLooksLikeFile = /\.[a-z0-9]+$/i.test(last);

        // Root-level files: /index.html, /philosophy.html, /ancient.html
        if (parts.length === 1 && lastLooksLikeFile) return "";

        // Directory hub: /crossroads, /crossroads/ → one level below root
        if (parts.length === 1 && !lastLooksLikeFile) return "../";

        // Nested pages: /crossroads/what-is-time(.html), /philosophy/time(.html)
        // Clean URLs without .html still have 2+ segments → depth = n - 1
        return "../".repeat(parts.length - 1);
    }

    /** Site-wide knowledge catalog for nav search (titles + keywords → URL). */
    const KNOWLEDGE_CATALOG = [
        { title: "Philosophy", keywords: "consciousness free will meaning simulation self mind", url: "philosophy.html" },
        { title: "What Is Consciousness?", keywords: "hard problem awareness mind witness sakshin", url: "philosophy/consciousness.html" },
        { title: "The Simulation Hypothesis", keywords: "simulation bostrom maya matrix reality", url: "philosophy/simulation.html" },
        { title: "Free Will and the Causal Web", keywords: "free will determinism agency karma choice", url: "philosophy/free-will.html" },
        { title: "Who Am I?", keywords: "self identity atman anatta narrative witness", url: "philosophy/the-self.html" },
        { title: "Meaning Without Final Answers", keywords: "meaning purpose absurd camus purusartha", url: "philosophy/meaning.html" },
        { title: "Mind-Made Machines", keywords: "ai ethics artificial intelligence responsibility alignment", url: "philosophy/ai-ethics.html" },
        { title: "Time Change and Permanence", keywords: "time impermanence ship of theseus entropy change", url: "philosophy/time.html" },
        { title: "Quantum Realms", keywords: "quantum physics entanglement observation", url: "quantum.html" },
        { title: "The Witness and the Wave", keywords: "double slit observation witness wave", url: "quantum-realms/witness-wave.html" },
        { title: "Entangled Across the Void", keywords: "entanglement nonlocality oneness", url: "quantum-realms/entangled-unity.html" },
        { title: "Born of the Void", keywords: "vacuum nothing creation casimir", url: "quantum-realms/born-of-void.html" },
        { title: "The Cosmic Hum", keywords: "vibration fields om sound", url: "quantum-realms/cosmic-hum.html" },
        { title: "Space & Cosmos", keywords: "space cosmos astronomy universe", url: "space.html" },
        { title: "The Breathing Cosmos", keywords: "cyclic cosmology bounce breath creation", url: "space-cosmos/breathing-cosmos.html" },
        { title: "Event Horizon", keywords: "black hole horizon gravity time", url: "space-cosmos/event-horizon.html" },
        { title: "Worlds Without Number", keywords: "exoplanets worlds planets life", url: "space-cosmos/worlds-without-number.html" },
        { title: "Rishis Among the Stars", keywords: "aryabhata surya siddhanta astronomy vedic", url: "space-cosmos/rishis-stars.html" },
        { title: "Ancient Wisdom", keywords: "veda upanishad purana temple", url: "ancient.html" },
        { title: "Dashavatara", keywords: "vishnu avatar matsya kurma rama krishna", url: "dashavatara.html" },
        { title: "Bhagavad Gita", keywords: "gita kurukshetra arjuna krishna dharma karma yoga", url: "bhagavad-gita.html" },
        { title: "Puri Jagannath", keywords: "jagannath puri rath yatra odisha", url: "puri-jaganath.html" },
        { title: "Hanuman", keywords: "hanuman anjaneya ramayana bhakti devotion sanjeevani", url: "hanuman.html" },
        { title: "Lord Venkateswara of Tirupati", keywords: "tirupati tirumala venkateswara balaji srinivasa govinda pilgrimage", url: "tirupati-venkateswara.html" },
        { title: "Start Here", keywords: "begin path welcome new visitor guide", url: "start.html" },
        { title: "Watch Reels", keywords: "instagram reels video watch cinematic", url: "index.html#reels" },
        { title: "Cosmic Crossroads", keywords: "crossroads science wisdom series time free will self", url: "crossroads/" },
        { title: "What Is Time? Crossroads", keywords: "time kala physics crossroads clocks relativity", url: "crossroads/what-is-time.html" },
        { title: "What Is Free Will? Crossroads", keywords: "free will agency karma determinism neuroscience", url: "crossroads/what-is-free-will.html" },
        { title: "What Is the Self? Crossroads", keywords: "self identity atman anatta narrative witness", url: "crossroads/what-is-the-self.html" },
        { title: "Gita Verse of the Day", keywords: "bhagavad gita daily verse practice", url: "gita-verse.html" },
        { title: "Kashi Vishwanath", keywords: "kashi varanasi banaras vishwanath ganga moksha shiva", url: "kashi-vishwanath.html" },
        { title: "Cosmic Map", keywords: "map navigate all journeys constellation", url: "map.html" },
        { title: "Travel journal", keywords: "travel pilgrimage road field notes temples journal", url: "travel.html" },
        { title: "Email Season", keywords: "newsletter email 8 week season growth", url: "email-season.html" },
        { title: "What Is Nothing? Crossroads", keywords: "nothing vacuum void nasadiya sunya", url: "crossroads/what-is-nothing.html" },
        { title: "Akasha", keywords: "akasha space ether upanishad", url: "ancient-wisdom/akasha.html" },
        { title: "Hiranyagarbha", keywords: "hiranyagarbha cosmic egg golden womb", url: "ancient-wisdom/hiranyagarbha.html" },
        { title: "Panchakosha", keywords: "panchakosha five sheaths yoga", url: "ancient-wisdom/panchakosha.html" },
        { title: "Vishwaroopa", keywords: "vishwaroopa cosmic form krishna gita", url: "ancient-wisdom/vishwaroopa.html" },
        { title: "Kala", keywords: "kala time death yuga", url: "ancient-wisdom/kala.html" },
        { title: "Daily Wisdom", keywords: "quote wisdom daily", url: "wisdom.html" },
        { title: "Ask Krishna", keywords: "krishna chat guidance dharma gita", url: "ancient-wisdom/ask-krishna-bot.html" }
    ];

    function resolveCatalogUrl(relativeUrl, base) {
        if (!relativeUrl) return base || "";
        // From nested folders, strip one level when target is top-level
        if (base === "../") {
            if (relativeUrl.startsWith("philosophy/") || relativeUrl.startsWith("quantum-realms/") ||
                relativeUrl.startsWith("space-cosmos/") || relativeUrl.startsWith("ancient-wisdom/")) {
                return "../" + relativeUrl;
            }
            return "../" + relativeUrl;
        }
        return relativeUrl;
    }

    function searchKnowledgeCatalog(query) {
        const q = query.toLowerCase().trim();
        if (!q) return null;
        let best = null;
        let bestScore = 0;
        for (const item of KNOWLEDGE_CATALOG) {
            const hay = `${item.title} ${item.keywords}`.toLowerCase();
            if (hay.includes(q) || q.split(/\s+/).every((w) => hay.includes(w))) {
                const score = hay.includes(q) ? 10 + (item.title.toLowerCase().includes(q) ? 5 : 0) : 3;
                if (score > bestScore) {
                    bestScore = score;
                    best = item;
                }
            }
        }
        return best;
    }

    function ensureBrandIcons() {
        const head = document.head;
        if (!head || head.querySelector('link[data-cosmic-favicon]')) return;
        const base = getBasePath();
        const fav = document.createElement("link");
        fav.rel = "icon";
        fav.type = "image/png";
        fav.href = `${base}favicon.png`;
        fav.setAttribute("data-cosmic-favicon", "1");
        head.appendChild(fav);
        const apple = document.createElement("link");
        apple.rel = "apple-touch-icon";
        apple.href = `${base}apple-touch-icon.png`;
        apple.setAttribute("data-cosmic-favicon", "1");
        head.appendChild(apple);
    }

    function isHomePage() {
        const path = getPath();
        return path.endsWith("/") || path.endsWith("/index.html") || !path.includes(".html");
    }

    function normalizePagePath(pathname) {
        let path = (pathname || "/").replace(/\\/g, "/").toLowerCase();
        if (path.endsWith("/")) path += "index.html";
        return path;
    }

    function isSamePageUrl(url) {
        return normalizePagePath(url.pathname) === normalizePagePath(window.location.pathname);
    }

    function isHomepageUrl(url) {
        const path = normalizePagePath(url.pathname);
        return path.endsWith("/index.html");
    }

    function rememberSectionHash(hash) {
        if (!SECTION_HASHES.has(hash)) return;

        try {
            sessionStorage.setItem(PENDING_SECTION_KEY, hash);
        } catch (error) {}
    }

    function getPendingSectionHash() {
        let pending = "";

        try {
            pending = sessionStorage.getItem(PENDING_SECTION_KEY) || "";
        } catch (error) {}

        if (SECTION_HASHES.has(window.location.hash)) {
            return window.location.hash;
        }

        return SECTION_HASHES.has(pending) ? pending : "";
    }

    function clearPendingSectionHash() {
        try {
            sessionStorage.removeItem(PENDING_SECTION_KEY);
        } catch (error) {}
    }

    function scrollToSectionHash(hash, behavior = "smooth") {
        if (!SECTION_HASHES.has(hash)) return false;

        const target = document.getElementById(hash.slice(1));
        if (!target) return false;

        const intro = document.getElementById("intro-screen");
        if (intro && intro.parentNode) {
            intro.parentNode.removeChild(intro);
        }

        const scroll = () => target.scrollIntoView({ behavior, block: "start" });
        requestAnimationFrame(scroll);
        window.setTimeout(scroll, 90);
        return true;
    }

    function restoreSectionHashScroll() {
        const hash = getPendingSectionHash();
        if (!hash) return;

        if (scrollToSectionHash(hash, "auto")) {
            clearPendingSectionHash();
        }
    }

    function getCurrentSection() {
        const path = getPath();

        if (path.includes("ask-krishna")) return "askKrishna";
        if (path.includes("/travel")) return "travel";
        if (path.includes("/map")) return "map";
        if (path.includes("/crossroads")) return "crossroads";
        if (path.includes("/wisdom")) return "wisdom";
        if (path.includes("/space") || path.includes("/space-cosmos")) return "space";
        if (path.includes("/philosophy")) return "philosophy";
        if (path.includes("/quantum") || path.includes("/quantum-realms")) return "quantum";
        if (path.includes("/ancient") || path.includes("/archetype/") ||
            path.includes("dashavatara") || path.includes("hanuman") ||
            path.includes("tirupati") || path.includes("kashi") || path.includes("jaganath") ||
            path.includes("bhagavad-gita")) return "ancient";
        if (path.includes("/ev-guide") || path.includes("/pm_e-drive")) return "ev";
        return "home";
    }

    function navHref(base, target) {
        const links = {
            home: `${base}index.html`,
            explore: isHomePage() ? "#explore" : `${base}index.html#explore`,
            today: isHomePage() ? "#pulse" : `${base}index.html#pulse`,
            wisdom: `${base}wisdom.html`,
            space: `${base}space.html`,
            philosophy: `${base}philosophy.html`,
            quantum: `${base}quantum.html`,
            ancient: `${base}ancient.html`,
            crossroads: `${base}crossroads/`,
            map: `${base}map.html`,
            travel: `${base}travel.html`,
            start: `${base}start.html`,
            gitaVerse: `${base}gita-verse.html`,
            ev: `${base}ev-guide.html`,
            askKrishna: `${base}ancient-wisdom/ask-krishna-bot.html`,
            community: isHomePage() ? "#community" : `${base}index.html#community`
        };

        // Always return the base English .html (or hash) version.
        // If preferredLang is Telugu, Kannada, or Hindi, the language initializer translates the current page in-place.
        return links[target] || links.home;
    }

    function injectStyles() {
        if (document.getElementById("cosmic-site-nav-styles")) return;

        const style = document.createElement("style");
        style.id = "cosmic-site-nav-styles";
        style.textContent = `

            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Cinzel:wght@600;700&family=Noto+Sans:wght@500;600&family=Noto+Sans+Devanagari:wght@500;600&family=Noto+Sans+Telugu:wght@500;600&family=Noto+Sans+Kannada:wght@500;600&display=swap');

            :root {
                --ct-gold: #d4af37;
                --ct-gold-soft: #c5a059;
                --ct-ink: #0a0a0b;
            }

            .cosmic-site-nav {
                background: #000000 !important;
                border-bottom: 1px solid rgba(212, 175, 55, 0.28) !important;
                color: #f5ead0 !important;
            }
            .cosmic-site-nav.is-scrolled {
                background: rgba(0,0,0,0.96) !important;
                border-bottom-color: rgba(212, 175, 55, 0.45) !important;
                box-shadow: 0 12px 40px rgba(0,0,0,0.55) !important;
            }
            .cosmic-site-nav__progress {
                background: linear-gradient(90deg, #d4af37, #f1d78a) !important;
            }
            .cosmic-site-nav__name {
                font-family: 'Playfair Display', Cinzel, Georgia, serif !important;
                font-weight: 600 !important;
                font-size: 1.55rem !important;
                color: #d4af37 !important;
                letter-spacing: 0.01em;
            }
            .cosmic-site-nav__tagline { display: none !important; }
            .cosmic-site-nav__brand { color: #d4af37 !important; gap: 0.7rem !important; }
            .ct-mark,
            .ct-mark__star,
            .ct-mark__ct {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                visibility: hidden !important;
            }
            .cosmic-site-nav .logo-orb { display: none !important; }
            .cosmic-site-nav__logo,
            .cosmic-site-nav img.cosmic-site-nav__logo {
                display: inline-block !important;
                width: 2.55rem !important;
                height: 2.55rem !important;
                max-width: 2.55rem !important;
                max-height: 2.55rem !important;
                flex: 0 0 2.55rem;
                object-fit: cover !important;
                border-radius: 999px !important;
                border: 1.5px solid #d4af37 !important;
                box-shadow: 0 0 16px rgba(212,175,55,0.28) !important;
                background: #0a0a0b;
                overflow: hidden !important;
                visibility: visible !important;
                position: static !important;
                pointer-events: auto !important;
            }
            .cosmic-site-nav__brand-copy {
                overflow: visible !important;
                min-width: max-content !important;
            }
            .cosmic-site-nav__name {
                overflow: visible !important;
                white-space: nowrap !important;
            }
            .cosmic-site-nav__link,
            .cosmic-site-nav__menu-button {
                color: rgba(255,255,255,0.92) !important;
                font-family: Inter, system-ui, sans-serif;
                font-size: 0.92rem;
                background: transparent !important;
            }
            .cosmic-site-nav__link:hover,
            .cosmic-site-nav__menu-button:hover,
            .cosmic-site-nav__link.is-active,
            .cosmic-site-nav__menu-button.is-active {
                color: #d4af37 !important;
            }
            .cosmic-site-nav__link.is-active span {
                box-shadow: 0 1px 0 #d4af37;
            }
            .cosmic-site-nav__link i,
            .cosmic-site-nav__menu-button i { display: none; }
            .cosmic-site-nav__menu-button .fa-chevron-down { display: inline-block !important; font-size: 0.65rem; opacity: 0.7; }
            .lang-switch {
                display: inline-flex !important;
                gap: 0.35rem !important;
                border: 0 !important;
                background: transparent !important;
                overflow: visible !important;
                border-radius: 0 !important;
            }
            .lang-btn {
                padding: 0.28rem 0.7rem !important;
                border: 1px solid rgba(212,175,55,0.55) !important;
                border-radius: 999px !important;
                background: transparent !important;
                color: #d4af37 !important;
                font-size: 0.72rem !important;
                min-height: 0 !important;
            }
            .lang-btn.active {
                background: #d4af37 !important;
                color: #0a0a0b !important;
                border-color: #d4af37 !important;
            }
            .lang-btn:hover:not(.active) {
                background: rgba(212,175,55,0.12) !important;
                color: #f1d78a !important;
            }
            .cosmic-site-nav__cta {
                background: transparent !important;
                color: #fff !important;
                border: 1px solid rgba(212,175,55,0.7) !important;
                border-radius: 999px !important;
                font-weight: 600 !important;
                box-shadow: none !important;
            }
            .cosmic-site-nav__cta:hover,
            .cosmic-site-nav__cta:focus-visible {
                background: rgba(212,175,55,0.12) !important;
                color: #f1d78a !important;
            }
            .cosmic-site-nav__cta i { display: none; }
            .cosmic-site-nav__ask {
                min-height: 42px;
                display: inline-flex;
                align-items: center;
                gap: 0.45rem;
                padding: 0 1.05rem;
                border: 0;
                border-radius: 999px;
                background: #d4af37;
                color: #0a0a0b;
                font-size: 0.88rem;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
                box-shadow: 0 0 18px rgba(212,175,55,0.28);
            }
            .cosmic-site-nav__ask:hover { background: #e3c25a; }

            /* ===== Gold mock chrome (plain text nav) ===== */
            .cosmic-site-nav__dock {
                border: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
                padding: 0 !important;
                gap: 1.4rem !important;
                border-radius: 0 !important;
            }
            .cosmic-site-nav__utilities {
                display: none !important;
            }
            .cosmic-site-nav__link,
            .cosmic-site-nav__menu-button {
                background: transparent !important;
                border: 0 !important;
                box-shadow: none !important;
                color: #ffffff !important;
                font-weight: 500 !important;
                font-size: 0.95rem !important;
                letter-spacing: 0.01em;
                min-height: 0 !important;
                padding: 0.2rem 0.1rem !important;
                border-radius: 0 !important;
            }
            .cosmic-site-nav__link:hover,
            .cosmic-site-nav__menu-button:hover,
            .cosmic-site-nav__link:focus-visible,
            .cosmic-site-nav__menu-button:focus-visible {
                background: transparent !important;
                color: #d4af37 !important;
            }
            .cosmic-site-nav__link.is-active {
                background: transparent !important;
                color: #ffffff !important;
            }
            .cosmic-site-nav__link.is-active span {
                box-shadow: 0 2px 0 #d4af37 !important;
            }
            .cosmic-site-nav__cta {
                background: transparent !important;
                border: 0 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                color: #ffffff !important;
                font-weight: 500 !important;
                min-height: 0 !important;
                padding: 0.2rem 0.55rem !important;
            }
            .cosmic-site-nav__cta:hover,
            .cosmic-site-nav__cta:focus-visible {
                background: transparent !important;
                color: #d4af37 !important;
                box-shadow: none !important;
                transform: none !important;
            }
            .cosmic-site-nav__ask {
                border-radius: 0.55rem !important;
                background: #d4af37 !important;
                color: #0a0a0b !important;
                font-weight: 700 !important;
                padding: 0.52rem 1rem !important;
                min-height: 0 !important;
                gap: 0.4rem !important;
                box-shadow: none !important;
            }
            .cosmic-site-nav__ask i {
                display: inline-block !important;
                color: #0a0a0b !important;
                font-size: 0.78rem;
            }
            .lang-switch {
                gap: 0.4rem !important;
            }
            .lang-btn {
                font-family: "Noto Sans", "Noto Sans Devanagari", "Noto Sans Telugu", "Noto Sans Kannada", Inter, sans-serif !important;
                color: #ffffff !important;
                border: 1px solid rgba(212,175,55,0.7) !important;
                border-radius: 0.45rem !important;
                background: transparent !important;
                padding: 0.28rem 0.55rem !important;
                font-size: 0.72rem !important;
                min-height: 0 !important;
                line-height: 1.2;
            }
            .lang-btn[data-lang="hi"] { font-family: "Noto Sans Devanagari", "Noto Sans", sans-serif !important; }
            .lang-btn[data-lang="te"] { font-family: "Noto Sans Telugu", "Noto Sans", sans-serif !important; }
            .lang-btn[data-lang="kn"] { font-family: "Noto Sans Kannada", "Noto Sans", sans-serif !important; }
            .lang-btn.active {
                background: rgba(212,175,55,0.18) !important;
                color: #ffffff !important;
                border-color: #d4af37 !important;
            }

            .cosmic-site-nav__mega {
                border-color: rgba(212,175,55,0.28) !important;
                background: rgba(8,8,10,0.98) !important;
            }
            .cosmic-site-nav__mega-label { color: #d4af37 !important; }
            .cosmic-site-nav__mega-map { color: #d4af37 !important; }
            .cosmic-site-nav__panel-link:hover,
            .cosmic-site-nav__panel-button:hover { background: rgba(212,175,55,0.08) !important; }
            .cosmic-site-nav__search-input:focus { border-color: #d4af37 !important; }
            .cosmic-site-nav__hamburger span { background: #d4af37 !important; }

            html,
            body {
                max-width: 100%;
                overflow-x: clip;
            }

            .cosmic-site-nav {
                position: sticky;
                top: 0;
                z-index: 70;
                width: 100%;
                max-width: 100%;
                overflow-x: clip;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(10, 10, 15, 0.95);
                color: #e0e7ff;
                font-family: 'Inter', system-ui, sans-serif;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                transition: background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
            }

            .cosmic-site-nav.is-scrolled {
                background: rgba(10, 10, 15, 0.96);
                border-bottom-color: rgba(0, 243, 255, 0.12);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
            }

            .cosmic-site-nav__progress {
                position: absolute;
                left: 0;
                bottom: 0;
                height: 2px;
                width: 0%;
                background: linear-gradient(90deg, #00f3ff, #7c3aed, #fbbf24);
                pointer-events: none;
                z-index: 2;}

            .cosmic-site-nav *,
            .cosmic-site-nav *::before,
            .cosmic-site-nav *::after {
                box-sizing: border-box;
            }

            .cosmic-site-nav .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }

            .cosmic-site-nav__shell {
                width: min(100% - 2rem, 80rem);
                margin: 0 auto;
            }

            .cosmic-site-nav__bar {
                min-height: 80px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem 0;
                transition: min-height 0.25s ease, padding 0.25s ease;
            }

            .cosmic-site-nav.is-compact .cosmic-site-nav__bar {
                min-height: 64px;
                padding: 0.45rem 0;
            }

            .cosmic-site-nav.is-compact .logo-orb {
                width: 2.75rem;
                height: 2.75rem;
                flex-basis: 2.75rem;
            }

            .cosmic-site-nav.is-compact .cosmic-site-nav__tagline {
                display: none;
            }

            .cosmic-site-nav.is-compact .cosmic-site-nav__name {
                font-size: 1.5rem;
            }

            .cosmic-site-nav__mega {
                position: absolute;
                left: 50%;
                top: calc(100% + 0.65rem);
                transform: translateX(-50%);
                width: min(52rem, calc(100vw - 2rem));
                padding: 1rem;
                border-radius: 1.25rem;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: rgba(10, 10, 15, 0.97);
                box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                z-index: 80;
            }

            .cosmic-site-nav__mega[hidden] {
                display: none !important;
            }

            .cosmic-site-nav__mega-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 0.75rem;
            }

            .cosmic-site-nav__mega-col {
                padding: 0.5rem;
                border-radius: 0.85rem;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.06);
            }

            .cosmic-site-nav__mega-label {
                display: block;
                font-size: 0.65rem;
                letter-spacing: 0.16em;
                text-transform: uppercase;
                color: rgba(0, 243, 255, 0.85);
                margin: 0.25rem 0.5rem 0.6rem;
                font-weight: 600;
            }

            .cosmic-site-nav__mega-footer {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 0.75rem;
                margin-top: 0.85rem;
                padding-top: 0.85rem;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
            }

            .cosmic-site-nav__mega-tools {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.4);
            }

            .cosmic-site-nav__mega-tools a {
                color: rgba(255, 255, 255, 0.55);
                text-decoration: none;
            }

            .cosmic-site-nav__mega-tools a:hover {
                color: #00f3ff;
            }

            .cosmic-site-nav__mega-map {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                color: #00f3ff;
                font-size: 0.875rem;
                font-weight: 600;
                text-decoration: none;
            }

            .cosmic-site-nav__mega-map:hover {
                text-shadow: 0 0 12px rgba(0, 243, 255, 0.45);
            }

            @media (max-width: 900px) {
                .cosmic-site-nav__mega-grid {
                    grid-template-columns: 1fr;
                }
            }

            .cosmic-site-nav__brand {
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                min-width: 0;
                flex: 0 0 auto;
                color: #ffffff;
                text-decoration: none;
            }

            .cosmic-site-nav .logo-orb {
                position: relative;
                isolation: isolate;
                width: 3.5rem;
                height: 3.5rem;
                flex: 0 0 3.5rem;
                overflow: visible;
                border-radius: 9999px;
                transition: transform 0.4s ease;
            }

            .cosmic-site-nav .logo-orb::before {
                content: "";
                position: absolute;
                inset: -18px;
                z-index: 0;
                border-radius: 9999px;
                pointer-events: none;
                background:
                    radial-gradient(circle,
                        rgba(0, 243, 255, 0.28) 0%,
                        rgba(124, 58, 237, 0.18) 50%,
                        transparent 78%);
                filter: blur(10px);
            }

            .cosmic-site-nav .logo-orb:hover {
                transform: scale(1.06);
            }

            .cosmic-site-nav .logo-disk {
                position: relative;
                z-index: 1;
                width: 100%;
                height: 100%;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 9999px;
                background: #0a0a0f;
                box-shadow:
                    0 0 10px rgba(0, 243, 255, 0.25),
                    0 0 22px rgba(124, 58, 237, 0.18),
                    inset 0 1px 0 rgba(255,255,255,0.1);
            }

            .cosmic-site-nav__logo {
                display: block;
                width: 2.55rem;
                height: 2.55rem;
                object-fit: cover;
                border-radius: 9999px;
            }

            .cosmic-site-nav__brand-copy {
                min-width: 0;
            }

            .cosmic-site-nav__name {
                display: block;
                color: #ffffff;
                font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
                font-size: 1.875rem;
                font-weight: 700;
                letter-spacing: 0;
                line-height: 1;
                white-space: nowrap;
            }

            .cosmic-site-nav__tagline {
                display: block;
                margin-top: 0.2rem;
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.62rem;
                font-weight: 600;
                letter-spacing: 0;
                white-space: nowrap;
            }

            .cosmic-site-nav__center {
                flex: 1 1 auto;
                min-width: 0;
                display: flex;
                justify-content: center;
                padding: 0 1rem;
            }

            .cosmic-site-nav__dock {
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.25rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 9999px;
                background: rgba(255, 255, 255, 0.055);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
            }

            .cosmic-site-nav__link,
            .cosmic-site-nav__menu-button,
            .cosmic-site-nav__mobile-toggle,
            .cosmic-site-nav__panel-button {
                border: 0;
                color: rgba(255, 255, 255, 0.74);
                font: inherit;
                text-decoration: none;
                cursor: pointer;
                transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
            }

            .cosmic-site-nav__link,
            .cosmic-site-nav__menu-button {
                min-height: 42px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0 0.95rem;
                border-radius: 9999px;
                background: transparent;
                white-space: nowrap;
                font-size: 0.88rem;
                font-weight: 700;
            }

            .cosmic-site-nav__link i,
            .cosmic-site-nav__menu-button i:first-child {
                color: #00f3ff;
            }

            .cosmic-site-nav__link:hover,
            .cosmic-site-nav__link:focus-visible,
            .cosmic-site-nav__menu-button:hover,
            .cosmic-site-nav__menu-button:focus-visible {
                background: rgba(255, 255, 255, 0.08);
                color: #ffffff;
                outline: none;
            }

            .cosmic-site-nav__link.is-active {
                background: rgba(0, 243, 255, 0.12);
                color: #d9fbff;
            }

            .cosmic-site-nav__menu-wrap {
                position: relative;
            }

            .cosmic-site-nav__chevron {
                color: rgba(255, 255, 255, 0.45);
                font-size: 0.66rem;
            }

            .cosmic-site-nav__panel {
                position: absolute;
                top: calc(100% + 0.75rem);
                left: 50%;
                width: min(22rem, calc(100vw - 2rem));
                padding: 0.5rem;
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 0.5rem;
                background: rgba(10, 10, 15, 0.97);
                box-shadow: 0 22px 60px rgba(0, 0, 0, 0.36);
                transform: translateX(-50%);
                backdrop-filter: blur(18px);
                -webkit-backdrop-filter: blur(18px);
            }

            .cosmic-site-nav__panel[hidden] {
                display: none;
            }

            .cosmic-site-nav__panel-link,
            .cosmic-site-nav__panel-button {
                width: 100%;
                display: flex;
                align-items: flex-start;
                gap: 0.85rem;
                padding: 0.9rem;
                border-radius: 0.5rem;
                background: transparent;
                color: rgba(255, 255, 255, 0.78);
                text-align: left;
                text-decoration: none;
            }

            .cosmic-site-nav__panel-link:hover,
            .cosmic-site-nav__panel-link:focus-visible,
            .cosmic-site-nav__panel-button:hover,
            .cosmic-site-nav__panel-button:focus-visible {
                background: rgba(255, 255, 255, 0.08);
                color: #ffffff;
                outline: none;
                transform: translateY(-1px);
            }

            .cosmic-site-nav__panel-link i,
            .cosmic-site-nav__panel-button i {
                width: 1.25rem;
                margin-top: 0.15rem;
                color: #00f3ff;
                text-align: center;
            }

            .cosmic-site-nav__panel-title {
                display: block;
                font-size: 0.92rem;
                font-weight: 800;
            }

            .cosmic-site-nav__panel-desc {
                display: block;
                margin-top: 0.15rem;
                color: rgba(255, 255, 255, 0.46);
                font-size: 0.75rem;
                line-height: 1.35;
            }

            .cosmic-site-nav__right {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .cosmic-site-nav__utilities {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .cosmic-site-nav__search {
                position: relative;
                width: 42px;
                height: 42px;
                border-radius: 9999px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.15);
                transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.3s ease;
                overflow: hidden;
                cursor: pointer;
            }

            .cosmic-site-nav__search:focus-within {
                width: 13rem;
                border-radius: 0.5rem;
            }

            .cosmic-site-nav__search-input {
                width: 100%;
                min-height: 42px;
                padding: 0 2.5rem 0 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 9999px;
                background: rgba(255, 255, 255, 0.05);
                color: #ffffff;
                font: inherit;
                font-size: 0.88rem;
                outline: none;
                opacity: 0;
                transition: opacity 0.2s ease, border-radius 0.3s ease;
            }

            .cosmic-site-nav__search:focus-within .cosmic-site-nav__search-input {
                opacity: 1;
                border-radius: 0.5rem;
            }

            .cosmic-site-nav__search-input::placeholder {
                color: rgba(255, 255, 255, 0.4);
            }

            .cosmic-site-nav__search-input:focus {
                border-color: rgba(0, 243, 255, 0.7);
                background: rgba(255, 255, 255, 0.09);
                box-shadow: 0 0 0 4px rgba(0, 243, 255, 0.1);
            }

            .cosmic-site-nav__search i {
                position: absolute;
                top: 50%;
                right: 0.65rem;
                color: rgba(255, 255, 255, 0.42);
                transform: translateY(-50%);
                pointer-events: none;
                transition: color 0.2s ease;
            }

            .cosmic-site-nav__search:focus-within i {
                color: rgba(255, 255, 255, 0.6);
            }

            .cosmic-site-nav__cta {
                min-height: 42px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0 1.15rem;
                border-radius: 0.5rem;
                background: linear-gradient(135deg, #00f3ff, #7c3aed);
                color: #020617;
                font-size: 0.88rem;
                font-weight: 800;
                text-decoration: none;
                white-space: nowrap;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .cosmic-site-nav__cta:hover,
            .cosmic-site-nav__cta:focus-visible {
                transform: translateY(-1px);
                outline: none;
                box-shadow: 0 0 24px rgba(0, 243, 255, 0.35);
            }

            .cosmic-site-nav__theme-slot {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .cosmic-site-nav .theme-toggle {
                position: static !important;
                top: auto !important;
                right: auto !important;
                z-index: auto !important;
                flex: 0 0 auto;
            }

            /* When the toggle lives in the header (or mobile panel), the word "Dark"/"Light" takes too much space next to lang+Join.
               Hide the label; the track/thumb switch is sufficient and compact. */
            .cosmic-site-nav .theme-toggle__label {
                display: none !important;
            }

            /* Safety net: if the floating toggle created by theme-toggle.js hasn't been moved into a slot yet,
               park it leftward so it cannot cover the Join button or lang switch in the header. */
            .cosmic-site-nav ~ .theme-toggle,
            body > .theme-toggle {
                /* Only affect the raw floating version; the one inside slots is selected by the rule above */
            }
            .cosmic-site-nav ~ .theme-toggle:not(.cosmic-site-nav *),
            body > .theme-toggle {
                right: 108px !important; /* clear the lang + Join + mobile toggle cluster on wide headers */
                z-index: 55 !important;
            }

            .cosmic-site-nav__mobile-toggle {
                display: none;
                width: 2.75rem;
                height: 2.75rem;
                flex: 0 0 2.75rem;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 0.5rem;
                background: rgba(255, 255, 255, 0.08);
                color: #ffffff;
            }

            .cosmic-site-nav__mobile-toggle:hover,
            .cosmic-site-nav__mobile-toggle:focus-visible {
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
                outline: none;
            }

            .cosmic-site-nav__hamburger {
                position: relative;
                width: 1.15rem;
                height: 0.9rem;
                display: inline-flex;
                flex-direction: column;
                justify-content: space-between;
            }

            .cosmic-site-nav__hamburger span {
                display: block;
                width: 100%;
                height: 2px;
                border-radius: 9999px;
                background: currentColor;
                transition: transform 0.2s ease, opacity 0.2s ease;
            }

            .cosmic-site-nav__mobile-toggle.is-open .cosmic-site-nav__hamburger span:nth-child(1) {
                transform: translateY(6px) rotate(45deg);
            }

            .cosmic-site-nav__mobile-toggle.is-open .cosmic-site-nav__hamburger span:nth-child(2) {
                opacity: 0;
            }

            .cosmic-site-nav__mobile-toggle.is-open .cosmic-site-nav__hamburger span:nth-child(3) {
                transform: translateY(-6px) rotate(-45deg);
            }

            .cosmic-site-nav__mobile-panel {
                padding: 0 0 1rem;
            }

            .cosmic-site-nav__mobile-panel[hidden] {
                display: none;
            }

            .cosmic-site-nav__mobile-card {
                padding: 0.75rem;
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 0.5rem;
                background: rgba(10, 10, 15, 0.96);
                box-shadow: 0 22px 60px rgba(0, 0, 0, 0.34);
                backdrop-filter: blur(18px);
                -webkit-backdrop-filter: blur(18px);
            }

            .cosmic-site-nav__mobile-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 0.5rem;
            }

            .cosmic-site-nav__mobile-grid .cosmic-site-nav__link,
            .cosmic-site-nav__mobile-grid .cosmic-site-nav__panel-button,
            .cosmic-site-nav__mobile-grid .cosmic-site-nav__cta {
                width: 100%;
                min-height: 48px;
                border-radius: 0.5rem;
            }

            .cosmic-site-nav__mobile-grid .cosmic-site-nav__panel-button {
                align-items: center;
                justify-content: flex-start;
            }

            .cosmic-site-nav__mobile-tools {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 0.75rem;
                margin-top: 0.75rem;
            }

            .cosmic-site-nav__mobile-tools .cosmic-site-nav__search {
                width: 100% !important;
                height: auto;
                border-radius: 0.5rem;
                overflow: visible;
                background: transparent;
                border: none;
            }

            .cosmic-site-nav__mobile-tools .cosmic-site-nav__search-input {
                opacity: 1;
                border-radius: 0.5rem;
                width: 100%;
            }

            .cosmic-site-nav__mobile-tools .cosmic-site-nav__search i {
                pointer-events: auto;
            }

            .cosmic-site-nav__mobile-theme {
                display: flex;
                justify-content: flex-end;
                margin-top: 0.75rem;
            }

            @media (min-width: 1536px) {
                .cosmic-site-nav__search:focus-within {
                    width: 15rem;
                }
            }

            @media (max-width: 1279px) {
                .cosmic-site-nav__shell {
                    width: calc(100% - 2rem);
                    margin-left: 1rem;
                    margin-right: 1rem;
                }

                .cosmic-site-nav__bar {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) auto;
                    align-items: center;
                    gap: 0.75rem;
                    padding-right: 0;
                }

                .cosmic-site-nav__brand {
                    max-width: 100%;
                }

                .cosmic-site-nav__center,
                .cosmic-site-nav__utilities {
                    display: none;
                }

                .cosmic-site-nav__right {
                    position: static;
                    width: max-content;
                    max-width: 100%;
                    margin-left: 0;
                    justify-self: end;
                    z-index: 3;
                    transform: none;
                    gap: 0.5rem;
                    display: flex;
                    align-items: center;
                }

                /* Hide Join in the top bar on collapsed header; lang-switch stays visible on left */
                .cosmic-site-nav__right > [data-cosmic-join] {
                    display: none !important;
                }

                .cosmic-site-nav__theme-slot {
                    display: none;
                }

                .cosmic-site-nav__mobile-toggle {
                    display: inline-flex !important;
                    position: static;
                    border-color: rgba(0, 243, 255, 0.55);
                    background: rgba(0, 243, 255, 0.14);
                    color: #00f3ff;
                    box-shadow: 0 0 18px rgba(0, 243, 255, 0.2);
                }
            }

            @media (max-width: 640px) {
                .cosmic-site-nav__shell {
                    width: calc(100% - 1.25rem);
                    margin-left: 0.625rem;
                    margin-right: 0.625rem;
                }

                .cosmic-site-nav__bar {
                    min-height: 74px;
                    grid-template-columns: minmax(0, 1fr) auto;
                    padding: 0.6rem 0;
                }

                .cosmic-site-nav__brand {
                    max-width: 100%;
                }

                .cosmic-site-nav__right {
                    display: flex;
                    gap: 0.4rem;
                }

                .cosmic-site-nav__right .lang-switch {
                    position: static;
                    max-width: none;
                    transform: none;
                }

                .cosmic-site-nav__mobile-toggle {
                    position: static;
                    z-index: 4;
                }

                .cosmic-site-nav .logo-orb {
                    width: 3rem;
                    height: 3rem;
                    flex-basis: 3rem;
                }

                .cosmic-site-nav__name {
                    font-size: 1.12rem;
                }

                .cosmic-site-nav__tagline {
                    display: none;
                }

                .cosmic-site-nav__brand-copy {
                    display: block;
                }

                .cosmic-site-nav__mobile-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                .cosmic-site-nav__mobile-tools {
                    grid-template-columns: minmax(0, 1fr);
                }

                .cosmic-site-nav__mobile-theme {
                    justify-content: flex-start;
                }
            }

            @media (max-width: 420px) {
                .cosmic-site-nav .logo-orb {
                    width: 2.65rem;
                    height: 2.65rem;
                    flex-basis: 2.65rem;
                }

                .cosmic-site-nav__brand-copy {
                    display: block;
                    min-width: 0;
                }

                .cosmic-site-nav__right {
                    gap: 0.35rem;
                }
            }

            html[data-theme="light"] .cosmic-site-nav {
                background: rgba(255, 255, 255, 0.9) !important;
                border-color: rgba(36, 31, 24, 0.14) !important;
                color: #241f18 !important;
                box-shadow: 0 10px 35px rgba(50, 36, 16, 0.08) !important;
            }

            html[data-theme="light"] .cosmic-site-nav__brand,
            html[data-theme="light"] .cosmic-site-nav__name {
                color: #241f18 !important;
            }

            html[data-theme="light"] .cosmic-site-nav__tagline,
            html[data-theme="light"] .cosmic-site-nav__panel-desc {
                color: rgba(36, 31, 24, 0.55) !important;
            }

            html[data-theme="light"] .cosmic-site-nav__dock,
            html[data-theme="light"] .cosmic-site-nav__panel,
            html[data-theme="light"] .cosmic-site-nav__mobile-card,
            html[data-theme="light"] .cosmic-site-nav__mobile-toggle {
                background: rgba(255, 255, 255, 0.72) !important;
                border-color: rgba(36, 31, 24, 0.16) !important;
            }

            html[data-theme="light"] .cosmic-site-nav__link,
            html[data-theme="light"] .cosmic-site-nav__menu-button,
            html[data-theme="light"] .cosmic-site-nav__mobile-toggle,
            html[data-theme="light"] .cosmic-site-nav__panel-link,
            html[data-theme="light"] .cosmic-site-nav__panel-button {
                color: rgba(36, 31, 24, 0.72) !important;
            }

            html[data-theme="light"] .cosmic-site-nav__link:hover,
            html[data-theme="light"] .cosmic-site-nav__link:focus-visible,
            html[data-theme="light"] .cosmic-site-nav__menu-button:hover,
            html[data-theme="light"] .cosmic-site-nav__menu-button:focus-visible,
            html[data-theme="light"] .cosmic-site-nav__panel-link:hover,
            html[data-theme="light"] .cosmic-site-nav__panel-link:focus-visible,
            html[data-theme="light"] .cosmic-site-nav__panel-button:hover,
            html[data-theme="light"] .cosmic-site-nav__panel-button:focus-visible {
                background: rgba(124, 58, 237, 0.08) !important;
                color: #241f18 !important;
            }

            html[data-theme="light"] .cosmic-site-nav__link.is-active {
                background: rgba(0, 143, 168, 0.12) !important;
                color: #075985 !important;
            }

            html[data-theme="light"] .cosmic-site-nav__search {
                background: rgba(255, 255, 255, 0.7) !important;
                border-color: rgba(36, 31, 24, 0.16) !important;
            }

            html[data-theme="light"] .cosmic-site-nav__search-input {
                background: rgba(255, 255, 255, 0.85) !important;
                border-color: rgba(36, 31, 24, 0.16) !important;
                color: #241f18 !important;
            }

            html[data-theme="light"] .cosmic-site-nav__search-input::placeholder {
                color: rgba(36, 31, 24, 0.45) !important;
            }

            html[data-theme="light"] .cosmic-site-nav__search i {
                color: rgba(36, 31, 24, 0.5) !important;
            }

            html[data-theme="light"] .cosmic-site-nav__cta {
                color: #020617 !important;
            }

            html[data-theme="light"] .lang-switch {
                border-color: rgba(36, 31, 24, 0.16);
                background: rgba(255, 255, 255, 0.72);
            }

            html[data-theme="light"] .lang-btn {
                color: rgba(36, 31, 24, 0.68);
            }

            html[data-theme="light"] .lang-btn.active {
                background: rgba(0, 142, 156, 0.14);
                color: #241f18;
            }

            html[data-theme="light"] .lang-btn:hover:not(.active) {
                background: rgba(36, 31, 24, 0.06);
                color: #241f18;
            }

            /* === Mobile enhancements (global, loaded on all pages via site-nav) === */
            html, body {
                overflow-x: hidden; /* stronger than clip for older browsers */
            }

            /* Better tap targets */
            button,
            .cosmic-btn,
            a[onclick],
            [role="button"] {
                min-height: 44px;
                -webkit-tap-highlight-color: rgba(0, 243, 255, 0.25);
            }

            @media (max-width: 640px) {
                /* Slightly more breathing room on small screens */
                .cosmic-card,
                .wisdom-card {
                    padding-left: 1.25rem !important;
                    padding-right: 1.25rem !important;
                }

                /* Inputs and buttons easier to tap */
                input[type="text"],
                input[type="email"],
                button {
                    font-size: 16px; /* prevent iOS auto-zoom on focus */
                }

                .cosmic-btn,
                button[class*="py-"] {
                    min-height: 48px;
                }
            }

            /* Chat / form message bubbles should not cause scroll */
            .message-krishna, .message-user {
                max-width: 85%;
                word-wrap: break-word;
            }

            /* Language switcher */
            .lang-switch {
                display: inline-flex;
                align-items: center;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 9999px;
                overflow: hidden;
                font-size: 0.7rem;
                font-weight: 600;
                letter-spacing: 0.5px;
                background: rgba(255, 255, 255, 0.03);
                flex-shrink: 0;
            }

            .lang-btn {
                padding: 5px 7px;
                background: transparent;
                color: rgba(255, 255, 255, 0.65);
                border: none;
                cursor: pointer;
                transition: all 0.15s ease;
                white-space: nowrap;
            }

            .lang-btn.active {
                background: rgba(0, 243, 255, 0.12);
                color: #fff;
                font-weight: 700;
            }

            .lang-btn:hover:not(.active) {
                background: rgba(255, 255, 255, 0.06);
                color: #fff;
            }

            /* Strongly protect our language switcher from Google Translate mangling the labels or layout */
            .lang-switch.notranslate,
            .lang-switch[translate="no"] {
                translate: no;
            }
            .lang-switch.notranslate .lang-btn,
            .lang-switch[translate="no"] .lang-btn {
                unicode-bidi: isolate;
            }

            @media (max-width: 640px) {
                .lang-btn {
                    padding: 4px 5px;
                    font-size: 0.58rem;
                }
            }

            /* Ensure controls don't collapse and overlap in tight headers */
            .cosmic-site-nav__right > * {
                flex-shrink: 0;
            }

            /* Hide Google Translate UI that can appear as a popup / banner / "select language" prompt / menu.
               We deliberately do NOT hide .goog-te-gadget or .goog-te-combo with *initial* CSS 
               because Google needs to render them to create the internal select we can control.
               JS will hide the gadget the instant we force the value (via watcher + poller).
            */
            .goog-te-banner-frame,
            iframe.goog-te-banner-frame,
            body > .skiptranslate,
            iframe.skiptranslate,
            .VIpgJd-ZVi9od-ORHb-OEVmcd.skiptranslate,
            .VIpgJd-ZVi9od-xl07Ob-OEVmcd.skiptranslate,
            .goog-te-ftab,
            .goog-te-balloon-frame,
            .goog-te-spinner-pos,
            .goog-te-spinner,
            .goog-te-menu-value,
            .goog-te-menu2,
            .goog-te-menu2-col,
            .goog-te-menu2-item,
            .goog-te-menu2-item-selected,
            .goog-te-combo-wrapper {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                left: -9999px !important;
                pointer-events: none !important;
            }

            body {
                top: 0px !important;
                margin-top: 0px !important;
                position: static !important;
            }

            /* Extra safety for the common banner */
            .goog-te-banner-frame.skiptranslate,
            iframe.goog-te-banner-frame.skiptranslate {
                display: none !important;
            }

            /* After we have forced (or when translated class is present), hide any remaining gadget via CSS as belt-and-suspenders.
               The JS watcher/poller does the primary hide right after forcing the combo value. */
            html.translated-ltr .goog-te-gadget,
            html.translated-rtl .goog-te-gadget {
                display: none !important;
                visibility: hidden !important;
                position: absolute !important;
                left: -9999px !important;
            }
        `;

        document.head.appendChild(style);
    }

    function buildPanelLink(href, icon, title, desc) {
        return `
            <a class="cosmic-site-nav__panel-link" href="${href}">
                <i class="fa-solid ${icon}"></i>
                <span>
                    <span class="cosmic-site-nav__panel-title">${title}</span>
                    <span class="cosmic-site-nav__panel-desc">${desc}</span>
                </span>
            </a>
        `;
    }

    function buildAskKrishnaButton(title, desc) {
        return `
            <button class="cosmic-site-nav__panel-button" type="button" data-cosmic-ask-krishna>
                <i class="fa-solid fa-comments"></i>
                <span>
                    <span class="cosmic-site-nav__panel-title">${title}</span>
                    ${desc ? `<span class="cosmic-site-nav__panel-desc">${desc}</span>` : ""}
                </span>
            </button>
        `;
    }

    function buildLink(base, section, label, icon, current) {
        const href = navHref(base, section);
        const active = current === section ? " is-active" : "";
        return `<a class="cosmic-site-nav__link${active}" href="${href}"><i class="fa-solid ${icon}"></i><span>${label}</span></a>`;
    }

    function buildSearch(id) {
        return `
            <label class="cosmic-site-nav__search" for="${id}">
                <span class="sr-only">Search knowledge</span>
                <input id="${id}" class="cosmic-site-nav__search-input" type="text" placeholder="Search knowledge" data-cosmic-search>
                <i class="fa-solid fa-search"></i>
            </label>
        `;
    }

    function buildNav() {
        const base = getBasePath();
        const current = getCurrentSection();
        const logo = `${base}logo.png?v=gold`;
        const journeysActive = ["ancient", "philosophy", "quantum", "space", "crossroads"].includes(current) ? " is-active" : "";

        return `
            <nav id="${NAV_ID}" class="cosmic-site-nav" aria-label="Primary navigation">
                <div class="cosmic-site-nav__shell">
                    <div class="cosmic-site-nav__bar">
                        <a class="cosmic-site-nav__brand" href="${navHref(base, "home")}" aria-label="CosmicTrotter home">
                            <span class="ct-mark" aria-hidden="true" hidden><span class="ct-mark__ct">CT</span><span class="ct-mark__star">✦</span></span>
                            <img class="cosmic-site-nav__logo" src="${logo}" alt="CosmicTrotter" width="40" height="40" decoding="async">
                            <span class="cosmic-site-nav__brand-copy">
                                <span class="cosmic-site-nav__name">CosmicTrotter</span>
                            </span>
                        </a>

                        <div class="cosmic-site-nav__center">
                            <div class="cosmic-site-nav__dock">
                                <span class="cosmic-site-nav__menu-wrap" data-cosmic-menu-wrap>
                                    <button class="cosmic-site-nav__menu-button${journeysActive}" type="button" data-cosmic-nav-menu aria-expanded="false" aria-controls="cosmic-site-nav-journeys">
                                        <i class="fa-solid fa-route"></i>
                                        <span>Journeys</span>
                                        <i class="fa-solid fa-chevron-down cosmic-site-nav__chevron"></i>
                                    </button>
                                    <div id="cosmic-site-nav-journeys" class="cosmic-site-nav__mega" hidden>
                                        <div class="cosmic-site-nav__mega-grid">
                                            <div class="cosmic-site-nav__mega-col">
                                                <span class="cosmic-site-nav__mega-label">Ancient Wisdom</span>
                                                ${buildPanelLink(`${base}dashavatara.html`, "fa-om", "Dashavatara", "Ten avatars of Vishnu")}
                                                ${buildPanelLink(`${base}bhagavad-gita.html`, "fa-book-open", "Bhagavad Gita", "Chapter storybook")}
                                                ${buildPanelLink(`${base}hanuman.html`, "fa-fire", "Hanuman", "Devoted strength")}
                                                ${buildPanelLink(`${base}puri-jaganath.html`, "fa-place-of-worship", "Jagannath of Puri", "Origin to living worship")}
                                                ${buildPanelLink(`${base}tirupati-venkateswara.html`, "fa-mountain", "Tirupati Venkateswara", "Seven hills pilgrimage")}
                                                ${buildPanelLink(`${base}kashi-vishwanath.html`, "fa-water", "Kashi Vishwanath", "Ganga · moksha")}
                                                ${buildPanelLink(navHref(base, "ancient"), "fa-landmark", "All Ancient Wisdom", "Library hub")}
                                            </div>
                                            <div class="cosmic-site-nav__mega-col">
                                                <span class="cosmic-site-nav__mega-label">Mind & Meaning</span>
                                                ${buildPanelLink(navHref(base, "crossroads"), "fa-code-branch", "Cosmic Crossroads", "Science + wisdom essays")}
                                                ${buildPanelLink(navHref(base, "philosophy"), "fa-brain", "Philosophy", "Consciousness, free will, self")}
                                                ${buildPanelLink(navHref(base, "gitaVerse"), "fa-sun", "Gita verse of the day", "Daily practice")}
                                                ${buildAskKrishnaButton("Ask Krishna Chat", "Gita-rooted guidance")}
                                                ${buildPanelLink(navHref(base, "wisdom"), "fa-infinity", "Daily Wisdom", "A new insight every day")}
                                            </div>
                                            <div class="cosmic-site-nav__mega-col">
                                                <span class="cosmic-site-nav__mega-label">Science & Cosmos</span>
                                                ${buildPanelLink(navHref(base, "quantum"), "fa-atom", "Quantum Realms", "Observation & oneness")}
                                                ${buildPanelLink(navHref(base, "space"), "fa-rocket", "Space & Cosmos", "Black holes to cyclic cosmos")}
                                                ${buildPanelLink(navHref(base, "start"), "fa-compass", "Start Here", "Pick your first path")}
                                                ${buildPanelLink(navHref(base, "travel"), "fa-suitcase-rolling", "Travel journal", "Field notes from the road")}
                                            </div>
                                        </div>
                                        <div class="cosmic-site-nav__mega-footer">
                                            <a class="cosmic-site-nav__mega-map" href="${navHref(base, "map")}"><i class="fa-solid fa-map"></i> Open full map</a>
                                            <a class="cosmic-site-nav__mega-map" href="${navHref(base, "travel")}"><i class="fa-solid fa-suitcase-rolling"></i> Travel journal</a>
                                            <span class="cosmic-site-nav__mega-tools">Tools: <a href="${navHref(base, "ev")}">India EV guide</a></span>
                                        </div>
                                    </div>
                                </span>
                                ${buildLink(base, "travel", "Travel", "fa-suitcase-rolling", current)}
                                ${buildLink(base, "map", "Map", "fa-map", current)}
                            </div>
                        </div>

                        <div class="cosmic-site-nav__right">
                            <div class="cosmic-site-nav__utilities">
                                ${buildSearch("cosmic-site-nav-search")}
                            </div>
                            <span class="cosmic-site-nav__theme-slot" data-cosmic-theme-slot></span>

                            <div class="lang-switch notranslate" translate="no" data-lang-switch>
                                <button type="button" class="lang-btn" data-lang="en" onclick="switchToLang('en')">EN</button>
                                <button type="button" class="lang-btn" data-lang="hi" onclick="switchToLang('hi')">हिंदी</button>
                                <button type="button" class="lang-btn" data-lang="te" onclick="switchToLang('te')">తెలుగు</button>
                                <button type="button" class="lang-btn" data-lang="kn" onclick="switchToLang('kn')">ಕನ್ನಡ</button>
                            </div>

                            <a class="cosmic-site-nav__cta" href="${navHref(base, "community")}" data-cosmic-join data-cta="nav-join">
                                <span>Join</span>
                            </a>

                            <button class="cosmic-site-nav__ask" type="button" data-cosmic-ask-krishna>
                                <i class="fa-solid fa-sparkles"></i>
                                <span>Ask Krishna</span>
                            </button>

                            <button class="cosmic-site-nav__mobile-toggle" type="button" data-cosmic-mobile-toggle aria-label="Open navigation menu" aria-expanded="false" aria-controls="cosmic-site-nav-mobile">
                                <span class="cosmic-site-nav__hamburger" aria-hidden="true">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </button>
                        </div>
                    </div>

                    <div id="cosmic-site-nav-mobile" class="cosmic-site-nav__mobile-panel" hidden>
                        <div class="cosmic-site-nav__mobile-card">
                            <div class="cosmic-site-nav__mobile-grid">
                                ${buildLink(base, "explore", "Explore", "fa-compass", current)}
                                ${buildLink(base, "today", "Daily", "fa-infinity", current)}
                                ${buildLink(base, "crossroads", "Crossroads", "fa-code-branch", current)}
                                ${buildAskKrishnaButton("Ask Krishna", "")}
                                ${buildLink(base, "ancient", "Ancient", "fa-landmark", current)}
                                ${buildLink(base, "philosophy", "Philosophy", "fa-brain", current)}
                                ${buildLink(base, "quantum", "Quantum", "fa-atom", current)}
                                ${buildLink(base, "space", "Space", "fa-rocket", current)}
                                ${buildLink(base, "wisdom", "Wisdom", "fa-book-open", current)}
                                ${buildLink(base, "map", "Map", "fa-map", current)}
                                ${buildLink(base, "travel", "Travel", "fa-suitcase-rolling", current)}
                                ${buildLink(base, "start", "Start", "fa-door-open", current)}
                            </div>

                            <div class="cosmic-site-nav__mobile-tools">
                                ${buildSearch("cosmic-site-nav-mobile-search")}
                            </div>

                            <div class="cosmic-site-nav__mobile-theme" data-cosmic-theme-mobile-slot></div>

                            <p class="cosmic-site-nav__mega-tools" style="margin:0.75rem 0 0;text-align:center">Tools: <a href="${navHref(base, "ev")}">India EV guide</a></p>

                            <a class="cosmic-site-nav__cta" href="${navHref(base, "community")}" data-cosmic-join data-cta="nav-join-mobile" style="margin-top:0.75rem">
                                <span>Join free</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="cosmic-site-nav__progress" data-cosmic-scroll-progress aria-hidden="true"></div>
            </nav>
        `;
    }

    function findInPage(query) {
        const selectors = [
            "h1",
            "h2",
            "h3",
            "h4",
            "p",
            "li",
            ".cosmic-card",
            ".wisdom-card"
        ];
        const candidates = Array.from(document.querySelectorAll(selectors.join(",")));
        return candidates.find((element) => element.textContent.toLowerCase().includes(query));
    }

    function highlightElement(element) {
        const originalOutline = element.style.outline;
        const originalBackground = element.style.backgroundColor;

        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.style.transition = "background-color 0.3s ease, outline-color 0.3s ease";
        element.style.outline = "2px solid rgba(0, 243, 255, 0.65)";
        element.style.backgroundColor = "rgba(0, 243, 255, 0.1)";

        window.setTimeout(() => {
            element.style.outline = originalOutline;
            element.style.backgroundColor = originalBackground;
        }, 1600);
    }

    function bindNav(base) {
        const nav = document.getElementById(NAV_ID);
        if (!nav) return;

        const menuButton = nav.querySelector("[data-cosmic-nav-menu]");
        const menuPanel = nav.querySelector("#cosmic-site-nav-journeys") || nav.querySelector("#cosmic-site-nav-library");
        const mobileButton = nav.querySelector("[data-cosmic-mobile-toggle]");
        const mobilePanel = nav.querySelector("#cosmic-site-nav-mobile");

        function moveThemeToggle() {
            const desktopSlot = nav.querySelector("[data-cosmic-theme-slot]");
            const mobileSlot = nav.querySelector("[data-cosmic-theme-mobile-slot]");
            const toggle = document.querySelector(".theme-toggle");
            const useMobileSlot = window.matchMedia("(max-width: 1279px)").matches;
            const slot = useMobileSlot ? mobileSlot : desktopSlot;

            if (slot && toggle && toggle.parentElement !== slot) {
                slot.appendChild(toggle);
                // Re-sync label/state after relocation (in case it was created before theme state was applied)
                if (typeof window.__cosmicUpdateThemeToggle === 'function') {
                    try { window.__cosmicUpdateThemeToggle(toggle); } catch (e) {}
                }
            }
        }

        // Robust mover: handles cases where .theme-toggle is created after bindNav runs
        function ensureThemeToggleMoved(retries = 8) {
            moveThemeToggle();
            if (retries <= 0) return;
            const toggle = document.querySelector(".theme-toggle");
            const desktopSlot = nav.querySelector("[data-cosmic-theme-slot]");
            const mobileSlot = nav.querySelector("[data-cosmic-theme-mobile-slot]");
            const useMobile = window.matchMedia("(max-width: 1279px)").matches;
            const targetSlot = useMobile ? mobileSlot : desktopSlot;
            if (!toggle || !targetSlot || toggle.parentElement === targetSlot) return;
            setTimeout(() => ensureThemeToggleMoved(retries - 1), 60);
        }

        function setMenu(open) {
            if (!menuButton || !menuPanel) return;
            menuPanel.hidden = !open;
            menuButton.setAttribute("aria-expanded", String(open));
        }

        function setMobile(open) {
            if (!mobileButton || !mobilePanel) return;
            mobilePanel.hidden = !open;
            mobileButton.setAttribute("aria-expanded", String(open));
            mobileButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
            mobileButton.classList.toggle("is-open", open);
        }

        function closeNavigation() {
            setMenu(false);
            setMobile(false);
        }

        function openAskKrishna() {
            closeNavigation();

            if (typeof window.openKrishnaChat === "function") {
                window.openKrishnaChat();
                return;
            }

            window.location.href = navHref(base, "askKrishna");
        }

        function handleSearch(event) {
            if (event.key !== "Enter") return;

            const input = event.currentTarget;
            const query = input.value.toLowerCase().trim();
            if (!query) return;

            const catalogHit = searchKnowledgeCatalog(query);
            if (catalogHit) {
                input.value = "";
                closeNavigation();
                window.location.href = resolveCatalogUrl(catalogHit.url, base);
                return;
            }

            const found = findInPage(query);
            if (found) {
                highlightElement(found);
            } else {
                window.alert(`No results found for: ${query}`);
            }

            input.value = "";
            closeNavigation();
        }

        function handleJoin(event) {
            const community = document.getElementById("community");
            if (!community) return;

            event.preventDefault();
            community.scrollIntoView({ behavior: "smooth" });
            closeNavigation();
        }

        menuButton?.addEventListener("click", (event) => {
            event.stopPropagation();
            setMenu(menuButton.getAttribute("aria-expanded") !== "true");
        });

        mobileButton?.addEventListener("click", (event) => {
            event.stopPropagation();
            setMobile(mobileButton.getAttribute("aria-expanded") !== "true");
            setMenu(false);
        });

        nav.querySelectorAll("[data-cosmic-ask-krishna]").forEach((button) => {
            button.addEventListener("click", openAskKrishna);
        });

        nav.querySelectorAll("[data-cosmic-search]").forEach((input) => {
            input.addEventListener("keydown", handleSearch);
        });

        nav.querySelectorAll("[data-cosmic-join]").forEach((link) => {
            link.addEventListener("click", handleJoin);
        });

        nav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", (event) => {
                const rawHref = link.getAttribute("href") || "";
                closeNavigation();

                let url;
                try {
                    url = new URL(rawHref, window.location.href);
                } catch (error) {
                    return;
                }

                if (!SECTION_HASHES.has(url.hash) || !isHomepageUrl(url)) return;

                rememberSectionHash(url.hash);

                if (isSamePageUrl(url) && scrollToSectionHash(url.hash)) {
                    event.preventDefault();
                    history.pushState(null, "", url.hash);
                    clearPendingSectionHash();
                }
            });
        });

        document.addEventListener("click", (event) => {
            if (!(event.target instanceof Element)) return;

            if (!event.target.closest(`#${NAV_ID}`)) {
                closeNavigation();
            } else if (!event.target.closest("[data-cosmic-menu-wrap]")) {
                setMenu(false);
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeNavigation();
            }
        });

        ensureThemeToggleMoved();
        window.setTimeout(() => ensureThemeToggleMoved(5), 0);
        window.addEventListener("resize", () => ensureThemeToggleMoved(3));

        const progressEl = nav.querySelector("[data-cosmic-scroll-progress]");
        function onScrollChrome() {
            const y = window.scrollY || document.documentElement.scrollTop || 0;
            nav.classList.toggle("is-scrolled", y > 8);
            nav.classList.toggle("is-compact", y > 48);
            if (progressEl) {
                const doc = document.documentElement;
                const max = Math.max(1, doc.scrollHeight - window.innerHeight);
                progressEl.style.width = Math.min(100, (y / max) * 100) + "%";
            }
        }
        onScrollChrome();
        window.addEventListener("scroll", onScrollChrome, { passive: true });

        // Also watch for the toggle being added later (race with theme-toggle.js creation)
        try {
            const mo = new MutationObserver(() => {
                const t = document.querySelector(".theme-toggle");
                if (t) {
                    ensureThemeToggleMoved(2);
                    // If successfully moved at least once, we can disconnect to avoid noise
                    if (t.parentElement && (t.parentElement.hasAttribute('data-cosmic-theme-slot') || t.parentElement.hasAttribute('data-cosmic-theme-mobile-slot'))) {
                        mo.disconnect();
                    }
                }
            });
            mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
        } catch (e) {}
    }

    // ===== Language Toggle (English / Telugu / Kannada) =====
    //
    // This system (Google Translate widget + cookie strategy + MutationObserver + polling
    // + client-side fallback translation + aggressive hiding of all Google UI) was the
    // result of extensive collaborative debugging.
    //
    // Credit goes to the detailed console logs, timing experiments, widget bootstrap
    // techniques, and persistent iteration that finally made automatic translation work
    // reliably without Google surfacing its language selector popup.
    //
    // Key techniques that made it stable:
    // - Reload immediately on language change (cookie present from page start)
    // - "Renderable but invisible" 200px bootstrap container during widget init
    // - Early + persistent MutationObserver + long aggressive poller for .goog-te-combo
    // - Hard-hide gadget/container only *after* successful force
    // - Robust client-side text fallback (with caching + smart node skipping)
    //
    // getTeluguEquivalentUrl kept for backward compatibility in a couple of places
    // but with dedicated -te.html pages removed, it is no longer used for navigation.
    // Telugu, Kannada, and Hindi are applied in-place on the English pages through our text translation flow,
    // keeping Google's visible toolbar out of the page chrome.
    const LANGUAGE_CONFIG = {
        en: { label: 'English', script: null },
        te: { label: 'Telugu', script: /[\u0C00-\u0C7F]/ },
        kn: { label: 'Kannada', script: /[\u0C80-\u0CFF]/ },
        hi: { label: 'Hindi', script: /[\u0900-\u097F]/ }
    };
    const TRANSLATION_LANGS = new Set(['te', 'kn', 'hi']);
    // Telugu + Kannada + Devanagari (Hindi)
    const INDIC_TRANSLATION_SCRIPT = /[\u0C00-\u0C7F\u0C80-\u0CFF\u0900-\u097F]/;

    function normalizePreferredLang(lang) {
        return LANGUAGE_CONFIG[lang] ? lang : 'en';
    }

    function isTranslationLang(lang) {
        return TRANSLATION_LANGS.has(lang);
    }

    function setLanguageButtonState(lang) {
        const activeLang = normalizePreferredLang(lang);
        document.querySelectorAll('[data-lang-switch] .lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === activeLang);
        });
    }

    function getTeluguEquivalentUrl(currentPath) {
        // Return the current path unchanged; the page translates in place.
        return currentPath || window.location.pathname;
    }

    function getEnglishEquivalentUrl(urlOrPath) {
        let full = urlOrPath || window.location.href;

        // If inside Google Translate, extract the original 'u'
        if (full.includes('translate.google.com/translate')) {
            try {
                const params = new URL(full).searchParams;
                const original = params.get('u');
                if (original) {
                    return original;
                }
            } catch (e) {}
        }

        // Normalize to path if full URL was passed
        let path = full;
        try {
            path = new URL(full).pathname;
        } catch (e) {
            path = full;
        }

        if (!path) return '/index.html';
        let en = path.replace(/-te(\.html)?$/, '$1');
        if (!en.endsWith('.html') && !en.endsWith('/')) {
            en = en.replace(/-te$/, '');
        }
        if (en === '' || en === '/') en = '/index.html';

        // If we had query/hash in original full, preserve from current if needed
        if (full.includes('?') || full.includes('#')) {
            // best effort: if full was google, we already extracted
        }

        // Return full URL if the input looked like full URL
        if ((urlOrPath || '').startsWith('http')) {
            try {
                const u = new URL(full);
                return u.origin + en + (u.search || '') + (u.hash || '');
            } catch (e) {}
        }

        return en;
    }

    function switchToLang(lang) {
        lang = normalizePreferredLang(lang);
        console.log('[CosmicLang] switchToLang called with:', lang);

        localStorage.setItem('preferredLang', lang);
        setLanguageButtonState(lang);

        if (lang === 'en') {
            localStorage.setItem('preferredLang', 'en');
            deactivateGoogleWidget();

            // Go to clean English version (strip any Google Translate wrapper if present)
            let target = getEnglishEquivalentUrl(window.location.href);
            if (!target.startsWith('http')) {
                target = window.location.origin + (target.startsWith('/') ? target : '/' + target);
            }
            if (target.includes('translate.google.com')) {
                try {
                    target = new URL(target).searchParams.get('u') || target;
                } catch(e) {}
            }
            if (target !== window.location.href) {
                window.location.href = target;
            } else {
                window.location.reload();
            }
            return;
        }

        // Telugu/Kannada/Hindi: translate this page in-place without loading Google's toolbar UI.
        // initLanguage() uses the same preference to translate future pages after navigation.
        // The language buttons remain in the injected nav on every page.
        localStorage.setItem('preferredLang', lang);
        removeGoogleTranslateChrome(true);
        setLanguageButtonState(lang);
        document.documentElement.lang = lang;
        applyFallbackTranslation(lang);
        setTimeout(() => applyFallbackTranslation(lang), 1200);
        setTimeout(() => applyFallbackTranslation(lang), 5000);
        return;
    }

    function getCleanEnglishUrl() {
        const full = window.location.href;

        // If already inside Google Translate, extract the original 'u'
        if (full.includes('translate.google.com/translate')) {
            try {
                const u = new URL(full).searchParams.get('u');
                if (u) return u;
            } catch (e) {}
        }

        // Otherwise use current location but strip any -te
        let clean = window.location.origin + window.location.pathname;
        clean = clean.replace(/-te\.html$/, '.html');
        if (window.location.search) clean += window.location.search;
        if (window.location.hash) clean += window.location.hash;
        return clean;
    }

    function removeGoogleTranslateChrome(clearCookie) {
        document.querySelectorAll([
            '#google_translate_element',
            '.goog-te-banner-frame',
            'iframe.goog-te-banner-frame',
            '.goog-te-balloon-frame',
            '.goog-te-ftab',
            '.goog-te-spinner-pos',
            '.goog-te-spinner',
            '.goog-te-gadget',
            '.goog-te-menu-frame',
            '.goog-te-menu2',
            'body > .skiptranslate',
            'iframe.skiptranslate'
        ].join(',')).forEach(el => {
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });

        document.documentElement.classList.remove('translated-ltr', 'translated-rtl');

        if (document.body) {
            document.body.style.top = '0px';
            document.body.style.marginTop = '0px';
            document.body.style.paddingTop = '';
        }

        if (clearCookie) {
            try {
                document.cookie = "googtrans=;path=/;max-age=0";
                document.cookie = "googtrans=;path=/;domain=" + location.hostname + ";max-age=0";
            } catch (e) {}
        }
    }

    // Robust watcher using MutationObserver so we force 'te' the *instant* Google injects the combo.
    // This prevents the 10s delay + language selector popup that appears when the force is too slow.
    function setupTeluguComboWatcher() {
        if (window._teComboWatcher) return; // already watching

        const forceNow = () => {
            const select = document.querySelector('.goog-te-combo');
            if (!select) return false;

            let didForce = false;
            if (select.value !== 'te') {
                select.value = 'te';
            }
            select.dispatchEvent(new Event('change', { bubbles: true }));
            try { select.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
            didForce = true;

            // Keep the widget renderable but invisible until Google finishes translating.
            // Hiding it too early can leave the page marked translated without rewritten text.
            const cont = document.getElementById('google_translate_element');
            if (cont) {
                cont.style.cssText = 'position:fixed !important; left:-220px !important; top:0 !important; width:200px !important; height:40px !important; opacity:0 !important; z-index:-9999 !important; overflow:hidden !important; pointer-events:none !important;';
            }

            return didForce || select.value === 'te';
        };

        // Watch the entire document so we catch the combo no matter where Google inserts it
        window._teComboWatcher = new MutationObserver(() => {
            forceNow();
        });

        window._teComboWatcher.observe(document.documentElement || document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });

        // Also run an immediate check (in case the nodes are already there)
        // and a couple of fast follow-ups
        forceNow();
        setTimeout(forceNow, 80);
        setTimeout(forceNow, 220);
        setTimeout(forceNow, 520);
    }

    const FALLBACK_CACHE_KEYS = {
        te: 'cosmicTeTranslationCacheV1',
        kn: 'cosmicKnTranslationCacheV1',
        hi: 'cosmicHiTranslationCacheV1'
    };
    const FALLBACK_SPLIT = '\n[[[CT_SPLIT]]]\n';
    const fallbackCaches = {};

    function getCurrentTranslationLang() {
        const lang = normalizePreferredLang(localStorage.getItem('preferredLang') || 'en');
        return isTranslationLang(lang) ? lang : null;
    }

    function getFallbackCache(lang) {
        lang = normalizePreferredLang(lang);
        const key = FALLBACK_CACHE_KEYS[lang];
        if (!key) return {};
        if (fallbackCaches[lang]) return fallbackCaches[lang];
        try {
            fallbackCaches[lang] = JSON.parse(localStorage.getItem(key) || '{}') || {};
        } catch (e) {
            fallbackCaches[lang] = {};
        }
        return fallbackCaches[lang];
    }

    function saveFallbackCache(lang) {
        lang = normalizePreferredLang(lang);
        const key = FALLBACK_CACHE_KEYS[lang];
        if (!key) return;
        try {
            const cache = getFallbackCache(lang);
            const entries = Object.entries(cache);
            const trimmed = entries.length > 500 ? Object.fromEntries(entries.slice(entries.length - 500)) : cache;
            fallbackCaches[lang] = trimmed;
            localStorage.setItem(key, JSON.stringify(trimmed));
        } catch (e) {}
    }

    function shouldSkipTranslationNode(node) {
        const parent = node && node.parentElement;
        if (!parent) return true;
        if (parent.closest('#google_translate_element, [data-lang-switch], .notranslate, [translate="no"]')) return true;

        const blockedTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'SVG', 'CANVAS', 'IFRAME', 'CODE', 'PRE', 'KBD', 'SAMP']);
        let el = parent;
        while (el && el !== document.body) {
            if (blockedTags.has(el.tagName)) return true;
            el = el.parentElement;
        }

        const text = node.nodeValue || '';
        const sourceText = node._cosmicOriginalText || text;
        const trimmed = sourceText.replace(/\s+/g, ' ').trim();
        if (!trimmed || trimmed.length < 2) return true;
        if (!node._cosmicOriginalText && INDIC_TRANSLATION_SCRIPT.test(text)) return true;
        if (!/[A-Za-z]/.test(trimmed)) return true;
        return false;
    }

    function scheduleFallbackTranslation(delay) {
        const lang = getCurrentTranslationLang();
        if (!lang) return;
        clearTimeout(window._cosmicFallbackTimer);
        window._cosmicFallbackTimer = setTimeout(() => applyFallbackTranslation(lang), delay || 250);
    }

    function setupFallbackObserver() {
        if (window._cosmicFallbackObserver || !document.body) return;

        window._cosmicFallbackObserver = new MutationObserver(mutations => {
            if (!getCurrentTranslationLang()) return;
            if (window._cosmicFallbackMuting) return;

            const hasAddedText = mutations.some(mutation => {
                if (mutation.type === 'characterData') {
                    return !shouldSkipTranslationNode(mutation.target);
                }

                return Array.from(mutation.addedNodes || []).some(node => {
                    if (node.nodeType === Node.TEXT_NODE) return !shouldSkipTranslationNode(node);
                    if (node.nodeType !== Node.ELEMENT_NODE) return false;
                    if (node.matches && node.matches('#google_translate_element, [data-lang-switch], .notranslate, [translate="no"]')) return false;
                    return /[A-Za-z]/.test(node.innerText || node.textContent || '');
                });
            });

            if (hasAddedText) scheduleFallbackTranslation(350);
        });

        window._cosmicFallbackObserver.observe(document.body, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    function collectTranslatableTextNodes() {
        if (!document.body) return [];
        const nodes = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                return shouldSkipTranslationNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }
        });

        let node = walker.nextNode();
        while (node) {
            nodes.push(node);
            node = walker.nextNode();
        }
        return nodes;
    }

    function collectTranslatableAttributeItems() {
        if (!document.body) return [];
        const attrs = ['placeholder', 'title', 'aria-label'];
        const items = [];

        document.querySelectorAll('[placeholder], [title], [aria-label]').forEach(el => {
            if (el.closest('#google_translate_element, [data-lang-switch], .notranslate, [translate="no"]')) return;

            attrs.forEach(attr => {
                const value = el.getAttribute(attr);
                if (!value) return;
                const originalKey = `_cosmicOriginalAttr_${attr}`;
                if (!el[originalKey]) el[originalKey] = value;
                const core = String(el[originalKey] || '').replace(/\s+/g, ' ').trim();
                if (!core || INDIC_TRANSLATION_SCRIPT.test(core) || !/[A-Za-z]/.test(core)) return;
                items.push({ el, attr, core });
            });
        });

        return items;
    }

    function collectResidualEnglishTextNodes(lang) {
        if (!document.body) return [];
        const scriptPattern = LANGUAGE_CONFIG[normalizePreferredLang(lang)].script;
        if (!scriptPattern) return [];
        const nodes = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node && node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                if (parent.closest('#google_translate_element, [data-lang-switch], .notranslate, [translate="no"]')) return NodeFilter.FILTER_REJECT;
                const text = node.nodeValue || '';
                if (!scriptPattern.test(text) || !/[A-Za-z]/.test(text)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        let node = walker.nextNode();
        while (node) {
            nodes.push(node);
            node = walker.nextNode();
        }
        return nodes;
    }

    async function translateTextBatch(texts, lang) {
        lang = normalizePreferredLang(lang);
        const query = texts.join(FALLBACK_SPLIT);
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' + encodeURIComponent(lang) + '&dt=t&q=' + encodeURIComponent(query);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Translation request failed: ' + response.status);
        const data = await response.json();
        const translated = ((data && data[0]) || []).map(part => part && part[0] ? part[0] : '').join('');
        const parts = translated.split(/\s*\[\[\[CT_SPLIT\]\]\]\s*/);
        if (parts.length === texts.length) return parts;

        const translatedTexts = [];
        for (const text of texts) {
            const singleUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' + encodeURIComponent(lang) + '&dt=t&q=' + encodeURIComponent(text);
            const singleResponse = await fetch(singleUrl);
            if (!singleResponse.ok) throw new Error('Translation request failed: ' + singleResponse.status);
            const singleData = await singleResponse.json();
            translatedTexts.push(((singleData && singleData[0]) || []).map(part => part && part[0] ? part[0] : '').join('') || text);
        }
        return translatedTexts;
    }

    async function translateTextBatchToTelugu(texts) {
        return translateTextBatch(texts, 'te');
    }

    async function translateAndCacheItems(lang, cache, items) {
        const uncached = items.filter(item => item && item.core && !cache[item.core]);
        let index = 0;

        while (index < uncached.length && getCurrentTranslationLang() === lang) {
            const batch = [];
            let charCount = 0;

            while (index < uncached.length && batch.length < 18 && charCount + uncached[index].core.length < 2800) {
                batch.push(uncached[index]);
                charCount += uncached[index].core.length + FALLBACK_SPLIT.length;
                index++;
            }

            if (!batch.length) {
                batch.push(uncached[index]);
                index++;
            }

            const translations = await translateTextBatch(batch.map(item => item.core), lang);
            translations.forEach((translated, i) => {
                cache[batch[i].core] = translated || batch[i].core;
            });
            saveFallbackCache(lang);
        }
    }

    async function translateVisibleAttributes(lang, cache) {
        const items = collectTranslatableAttributeItems();
        await translateAndCacheItems(lang, cache, items);

        items.forEach(item => {
            if (getCurrentTranslationLang() !== lang) return;
            if (!cache[item.core]) return;
            item.el.setAttribute(item.attr, cache[item.core]);
        });
    }

    async function translateVisibleAttributesToTelugu(cache) {
        return translateVisibleAttributes('te', cache);
    }

    async function translateResidualEnglishText(lang, cache) {
        const nodes = collectResidualEnglishTextNodes(lang);
        const segmentPattern = /[A-Za-z][A-Za-z0-9'’&-]*(?:\s+[A-Za-z0-9'’&-]+)*/g;
        const items = [];
        const seen = new Set();

        nodes.forEach(node => {
            const matches = (node.nodeValue || '').match(segmentPattern) || [];
            matches.forEach(match => {
                const core = match.replace(/\s+/g, ' ').trim();
                if (core.length < 3 || seen.has(core)) return;
                seen.add(core);
                items.push({ core });
            });
        });

        await translateAndCacheItems(lang, cache, items);

        nodes.forEach(node => {
            if (getCurrentTranslationLang() !== lang) return;
            const next = (node.nodeValue || '').replace(segmentPattern, match => {
                const core = match.replace(/\s+/g, ' ').trim();
                return cache[core] || match;
            });
            if (next !== node.nodeValue) {
                window._cosmicFallbackMuting = true;
                node.nodeValue = next;
                window._cosmicFallbackMuting = false;
            }
        });
    }

    async function translateResidualEnglishTextToTelugu(cache) {
        return translateResidualEnglishText('te', cache);
    }

    async function applyFallbackTranslation(lang) {
        lang = normalizePreferredLang(lang || localStorage.getItem('preferredLang') || 'en');
        if (!isTranslationLang(lang) || getCurrentTranslationLang() !== lang) return;
        if (window._cosmicFallbackRunning) {
            window._cosmicFallbackPendingLang = lang;
            return;
        }

        window._cosmicFallbackRunning = true;
        document.documentElement.classList.add('cosmic-lang-fallback-active', `cosmic-${lang}-fallback-active`);
        setupFallbackObserver();

        try {
            const cache = getFallbackCache(lang);
            const nodes = collectTranslatableTextNodes();
            const uncached = [];

            nodes.forEach(node => {
                if (!node._cosmicOriginalText) node._cosmicOriginalText = node.nodeValue;
                const original = node._cosmicOriginalText || '';
                const leading = (original.match(/^\s*/) || [''])[0];
                const trailing = (original.match(/\s*$/) || [''])[0];
                const core = original.replace(/\s+/g, ' ').trim();
                if (!core) return;

                if (cache[core]) {
                    window._cosmicFallbackMuting = true;
                    node.nodeValue = leading + cache[core] + trailing;
                    window._cosmicFallbackMuting = false;
                    return;
                }

                uncached.push({ node, original, leading, trailing, core });
            });

            let index = 0;
            while (index < uncached.length && getCurrentTranslationLang() === lang) {
                const batch = [];
                let charCount = 0;

                while (index < uncached.length && batch.length < 18 && charCount + uncached[index].core.length < 2800) {
                    batch.push(uncached[index]);
                    charCount += uncached[index].core.length + FALLBACK_SPLIT.length;
                    index++;
                }

                if (!batch.length) {
                    batch.push(uncached[index]);
                    index++;
                }

                const translations = await translateTextBatch(batch.map(item => item.core), lang);
                translations.forEach((translated, i) => {
                    const item = batch[i];
                    const finalText = translated || item.core;
                    cache[item.core] = finalText;
                    if (getCurrentTranslationLang() === lang) {
                        window._cosmicFallbackMuting = true;
                        item.node.nodeValue = item.leading + finalText + item.trailing;
                        window._cosmicFallbackMuting = false;
                    }
                });
                saveFallbackCache(lang);
            }

            await translateVisibleAttributes(lang, cache);
            await translateResidualEnglishText(lang, cache);
        } catch (e) {
            console.warn('[CosmicLang] ' + LANGUAGE_CONFIG[lang].label + ' fallback translation failed', e);
        } finally {
            window._cosmicFallbackRunning = false;
            document.documentElement.classList.remove('cosmic-lang-fallback-active', `cosmic-${lang}-fallback-active`);
            if (window._cosmicFallbackPendingLang) {
                const pendingLang = window._cosmicFallbackPendingLang;
                window._cosmicFallbackPendingLang = null;
                setTimeout(() => applyFallbackTranslation(pendingLang), 300);
            }
        }
    }

    function setupTeluguFallbackObserver() {
        setupFallbackObserver();
    }

    function applyTeluguFallbackTranslation() {
        return applyFallbackTranslation('te');
    }

    // Initialize the hidden Google Translate widget for Telugu.
    // The text fallback below covers cases where the widget initializes but does not rewrite the DOM.
    function activateGoogleTeluguWidget() {
        console.log('[CosmicLang] activateGoogleTeluguWidget called');

        // Guard against too many overlapping calls
        if (window._cosmicTeActive) {
            console.log('[CosmicLang] activate skipped (already active)');
            return;
        }
        window._cosmicTeActive = true;

        setupTeluguComboWatcher();

        try {
            document.cookie = "googtrans=/en/te; path=/; max-age=31536000";
            if (location.hostname) {
                document.cookie = "googtrans=/en/te; path=/; domain=" + location.hostname + "; max-age=31536000";
            }
        } catch (e) {}

        // === Critical for the widget to actually create the .goog-te-combo ===
        // The Google Translate widget is extremely picky. If the container has zero or near-zero
        // size or is completely offscreen/opacity 0 from the start, it often skips injecting the
        // internal .goog-te-gadget and .goog-te-combo entirely (that's why we see "combo never appeared").
        //
        // Solution: Give it a small but real "bootstrap" footprint (30x30px is enough for its internal
        // rendering) positioned at top-left with extremely low opacity + negative z so the user never
        // sees anything. We keep this state until we have forced 'te', then we hard-hide it.
        let container = document.getElementById('google_translate_element');
        const makeBootstrapVisible = () => {
            if (!container) return;
            // "Invisible but renderable" bootstrap: slightly off left edge with enough width/height
            // for the Google widget to actually create its internal .goog-te-gadget and .goog-te-combo.
            // Using negative left + real size allows rendering without the user seeing the bar.
            // This is the key fix for "combo never appeared".
            container.style.cssText =
                'position:fixed !important;' +
                'left:-220px !important;' +
                'top:0 !important;' +
                'width:200px !important;' +
                'height:40px !important;' +
                'opacity:0 !important;' +
                'z-index:-9999 !important;' +
                'overflow:hidden !important;' +
                'pointer-events:none !important;';
        };
        const hardHideContainer = () => {
            if (!container) return;
            container.style.cssText =
                'position:fixed !important;' +
                'left:-9999px !important;' +
                'top:-9999px !important;' +
                'width:1px !important;' +
                'height:1px !important;' +
                'opacity:0 !important;' +
                'overflow:hidden !important;' +
                'pointer-events:none !important;';
        };

        if (!container) {
            container = document.createElement('div');
            container.id = 'google_translate_element';
            document.body.appendChild(container);
        }

        // Start in the bootstrap size so Google will actually create the combo for us to control.
        makeBootstrapVisible();

        const killBanner = () => {
            document.querySelectorAll('.goog-te-banner-frame, iframe.goog-te-banner-frame').forEach(b => {
                if (b && b.parentNode) b.parentNode.removeChild(b);
            });
            if (document.body) {
                document.body.style.top = '0px';
                document.body.style.marginTop = '0px';
            }
        };
        killBanner();

        if (!window._teBannerKiller) {
            window._teBannerKiller = new MutationObserver(() => killBanner());
            window._teBannerKiller.observe(document.documentElement || document.body, { childList: true, subtree: true });
        }

        function initWidgetAndForce() {
            setupTeluguComboWatcher();

            try {
                // Ensure bootstrap style right before init — this is critical for the widget
                // to decide to create the gadget and combo. We use a renderable offscreen box
                // (200px wide, just off the left edge, fully transparent) so Google actually
                // injects .goog-te-combo instead of skipping it.
                makeBootstrapVisible();

                // Clear previous content to avoid duplicate gadgets
                if (container) container.innerHTML = '';

                console.log('[CosmicLang] Creating TranslateElement with bootstrap container (200px renderable offscreen)');

                new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'te',
                    autoDisplay: false
                }, 'google_translate_element');
            } catch (e) {
                console.error('[CosmicLang] TranslateElement error', e);
            }

            document.querySelectorAll('[data-lang-switch] .lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === 'te');
            });

            // Give the widget a moment to inject after creation, then start aggressive forcing.
            // The observer is already watching, this poller is the reliable backup.
            // We start looking fairly soon after the init call.
            setTimeout(() => {
                let pollAttempts = 0;
                const maxPollAttempts = 120; // ~19s — be patient with Google's slow injection
                const poller = setInterval(() => {
                    pollAttempts++;
                    killBanner();

                    // Try both document and inside the container
                    let select = document.querySelector('.goog-te-combo');
                    if (!select && container) {
                        select = container.querySelector('.goog-te-combo');
                    }

                    if (select) {
                        console.log('[CosmicLang] Found .goog-te-combo, forcing te (attempt ' + pollAttempts + ')');

                        if (select.value !== 'te') {
                            select.value = 'te';
                        }
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        try { select.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}

                        // Keep Google UI renderable but invisible until translation settles.
                        const gadget = document.querySelector('.goog-te-gadget');
                        if (gadget) {
                            gadget.style.cssText = 'position:absolute !important; left:-220px !important; top:0 !important; width:200px !important; height:40px !important; opacity:0 !important; overflow:hidden !important; pointer-events:none !important;';
                        }

                        const isTranslated = document.documentElement.classList.contains('translated-ltr') ||
                                             document.documentElement.classList.contains('translated-rtl');

                        if (isTranslated || pollAttempts > 60) {
                            clearInterval(poller);
                            // One final reinforcement
                            setTimeout(() => {
                                const s2 = document.querySelector('.goog-te-combo');
                                if (s2) {
                                    if (s2.value !== 'te') {
                                        s2.value = 'te';
                                    }
                                    s2.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                                killBanner();
                                setTimeout(() => {
                                    hardHideContainer();
                                    const g2 = document.querySelector('.goog-te-gadget');
                                    if (g2) {
                                        g2.style.cssText = 'display:none !important; visibility:hidden !important; position:absolute !important; left:-9999px !important; width:0 !important; height:0 !important; overflow:hidden !important;';
                                    }
                                }, 3000);
                            }, 800);
                        }
                    }

                    if (pollAttempts >= maxPollAttempts) {
                        clearInterval(poller);
                        hardHideContainer();
                        console.warn('[CosmicLang] Gave up after many attempts. The .goog-te-combo never appeared. Translation may need a manual refresh or the widget failed to initialize.');

                        // Aggressive last-ditch: destroy and recreate the container with fresh bootstrap size
                        // then re-init the widget. This often succeeds on the second try.
                        try {
                            if (container && container.parentNode) container.parentNode.removeChild(container);
                            container = document.createElement('div');
                            container.id = 'google_translate_element';
                            document.body.appendChild(container);
                            makeBootstrapVisible();   // give it the 30px bootstrap footprint again

                            new google.translate.TranslateElement({
                                pageLanguage: 'en',
                                includedLanguages: 'te',
                                autoDisplay: false
                            }, 'google_translate_element');

                            // Restart a shorter poller for the new instance
                            setTimeout(() => {
                                let retryAttempts = 0;
                                const retryPoller = setInterval(() => {
                                    retryAttempts++;
                                    killBanner();
                                    const s = document.querySelector('.goog-te-combo');
                                    if (s) {
                                        if (s.value !== 'te') {
                                            s.value = 'te';
                                        }
                                        s.dispatchEvent(new Event('change', { bubbles: true }));
                                        const g = document.querySelector('.goog-te-gadget');
                                        if (g) g.style.cssText = 'position:absolute !important; left:-220px !important; top:0 !important; width:200px !important; height:40px !important; opacity:0 !important; overflow:hidden !important; pointer-events:none !important;';
                                        setTimeout(() => hardHideContainer(), 3000);
                                        clearInterval(retryPoller);
                                    }
                                    if (retryAttempts > 40) clearInterval(retryPoller);
                                }, 150);
                            }, 500);
                        } catch (e) {}
                    }
                }, 160);
            }, 450); // small delay after new TranslateElement so it can start rendering
        }

        // Do NOT hard-hide on a timer anymore. We keep the bootstrap size (30x30 low opacity)
        // until the poller actually finds the combo and forces 'te'. Only then do we hard-hide.
        // This is what finally makes .goog-te-combo appear.

        // Load the Google script or run init now
        if (!window.googleTranslateElementInitTe) {
            console.log('[CosmicLang] Loading Google Translate script for te...');
            const script = document.createElement('script');
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInitTe';
            script.async = true;
            script.onerror = () => {
                console.error('[CosmicLang] Google Translate script failed to load. Check network / blockers.');
                window._cosmicTeActive = false;
            };
            window.googleTranslateElementInitTe = function () {
                console.log('[CosmicLang] Google callback fired');
                initWidgetAndForce();
                // release guard after a while
                setTimeout(() => { window._cosmicTeActive = false; }, 15000);
            };
            document.head.appendChild(script);
        } else if (window.google && window.google.translate) {
            initWidgetAndForce();
            setTimeout(() => { window._cosmicTeActive = false; }, 15000);
        } else {
            setTimeout(() => {
                window._cosmicTeActive = false;
                activateGoogleTeluguWidget();
            }, 300);
        }
    }

    function deactivateGoogleWidget() {
        removeGoogleTranslateChrome(true);
        setLanguageButtonState('en');
    }





    function initLanguage() {
        const saved = normalizePreferredLang(localStorage.getItem('preferredLang') || 'en');
        localStorage.setItem('preferredLang', saved);

        // Early defensive removal of any Google banner (in case it tries to appear before our code runs)
        if (isTranslationLang(saved)) {
            const earlyKill = () => {
                removeGoogleTranslateChrome(true);
            };
            earlyKill();
            setTimeout(earlyKill, 50);
        }

        if (saved === 'en') {
            deactivateGoogleWidget();
        }

        // Set active button state for our custom EN / Hindi / Telugu / Kannada toggle.
        setLanguageButtonState(saved);

        // Auto-apply Telugu/Kannada/Hindi on every page load when preferred.
        // This avoids Google's visible toolbar and works across navigation via localStorage.
        if (isTranslationLang(saved)) {
            removeGoogleTranslateChrome(true);
            applyFallbackTranslation(saved);
            setTimeout(() => applyFallbackTranslation(saved), 1200);
            setTimeout(() => applyFallbackTranslation(saved), 5000);
        }

        // Set html lang attribute for accessibility/SEO
        document.documentElement.lang = isTranslationLang(saved) ? saved : 'en';
    }

    function mountNav() {
        injectStyles();

        if (document.getElementById(NAV_ID)) return;

        const base = getBasePath();
        const wrapper = document.createElement("div");
        wrapper.innerHTML = buildNav().trim();
        const newNav = wrapper.firstElementChild;
        const existingNav = document.querySelector("body > nav, nav");

        if (existingNav) {
            existingNav.replaceWith(newNav);
        } else {
            document.body.insertAdjacentElement("afterbegin", newNav);
        }

        ensureBrandIcons();
        ensureJourneyProgressScript(base);
        bindNav(base);
        initLanguage();
        restoreSectionHashScroll();
        window.setTimeout(restoreSectionHashScroll, 150);
    }

    function ensureJourneyProgressScript(base) {
        if (document.querySelector('script[data-cosmic-journey-progress]')) return;
        const s = document.createElement('script');
        s.src = `${base}journey-progress.js`;
        s.setAttribute('data-cosmic-journey-progress', '1');
        document.body.appendChild(s);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountNav);
    } else {
        mountNav();
    }

    // Expose for inline onclick in nav (simple & reliable)
    window.switchToLang = switchToLang;
})();
