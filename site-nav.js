(function () {
    const NAV_ID = "cosmic-site-nav";

    function getPath() {
        return window.location.pathname.replace(/\\/g, "/").toLowerCase();
    }

    function getBasePath() {
        const path = getPath();
        return path.includes("/ancient-wisdom/") || path.includes("/archetype/") ? "../" : "";
    }

    function isHomePage() {
        const path = getPath();
        return path.endsWith("/") || path.endsWith("/index.html") || !path.includes(".html");
    }

    function getCurrentSection() {
        const path = getPath();

        if (path.includes("ask-krishna")) return "askKrishna";
        if (path.includes("/wisdom")) return "wisdom";
        if (path.includes("/space")) return "space";
        if (path.includes("/philosophy")) return "philosophy";
        if (path.includes("/quantum")) return "quantum";
        if (path.includes("/ancient") || path.includes("/archetype/")) return "ancient";
        if (path.includes("/ev-guide") || path.includes("/pm_e-drive")) return "ev";
        return "home";
    }

    function navHref(base, target) {
        const links = {
            home: `${base}index.html`,
            explore: isHomePage() ? "#explore" : `${base}index.html#explore`,
            today: isHomePage() ? "#wisdom" : `${base}index.html#wisdom`,
            wisdom: `${base}wisdom.html`,
            space: `${base}space.html`,
            philosophy: `${base}philosophy.html`,
            quantum: `${base}quantum.html`,
            ancient: `${base}ancient.html`,
            ev: `${base}ev-guide.html`,
            askKrishna: `${base}ancient-wisdom/ask-krishna-bot.html`,
            community: `${base}index.html#community`
        };

        return links[target] || links.home;
    }

    function injectStyles() {
        if (document.getElementById("cosmic-site-nav-styles")) return;

        const style = document.createElement("style");
        style.id = "cosmic-site-nav-styles";
        style.textContent = `
            html,
            body {
                max-width: 100%;
                overflow-x: clip;
            }

            .cosmic-site-nav {
                position: sticky;
                top: 0;
                z-index: 70;
                width: 100vw;
                max-width: 100vw;
                overflow-x: clip;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(10, 10, 15, 0.95);
                color: #e0e7ff;
                font-family: 'Inter', system-ui, sans-serif;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
            }

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
                min-height: 84px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem 0;
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
                transition: transform 0.3s ease;
            }

            .cosmic-site-nav .logo-orb::before {
                content: "";
                position: absolute;
                inset: -18px;
                z-index: 0;
                border-radius: 9999px;
                background: radial-gradient(circle, rgba(0, 243, 255, 0.34), rgba(124, 58, 237, 0.2) 50%, transparent 74%);
                filter: blur(8px);
            }

            .cosmic-site-nav .logo-orb:hover {
                transform: scale(1.04);
            }

            .cosmic-site-nav .logo-disk {
                position: relative;
                z-index: 1;
                width: 100%;
                height: 100%;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 9999px;
                background: #0a0a0f;
                box-shadow: 0 0 14px rgba(0, 243, 255, 0.34);
            }

            .cosmic-site-nav__logo {
                width: 100%;
                height: 100%;
                object-fit: contain;
                padding: 0.375rem;
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
                width: 13rem;
            }

            .cosmic-site-nav__search-input {
                width: 100%;
                min-height: 42px;
                padding: 0 2.5rem 0 1rem;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 0.5rem;
                background: rgba(255, 255, 255, 0.05);
                color: #ffffff;
                font: inherit;
                font-size: 0.88rem;
                outline: none;
                transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
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
                right: 0.9rem;
                color: rgba(255, 255, 255, 0.42);
                transform: translateY(-50%);
                pointer-events: none;
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
            }

            .cosmic-site-nav .theme-toggle {
                position: static !important;
                top: auto !important;
                right: auto !important;
                z-index: auto !important;
                flex: 0 0 auto;
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
                width: 100%;
            }

            .cosmic-site-nav__mobile-theme {
                display: flex;
                justify-content: flex-end;
                margin-top: 0.75rem;
            }

            @media (min-width: 1536px) {
                .cosmic-site-nav__search {
                    width: 15rem;
                }
            }

            @media (max-width: 1279px) {
                .cosmic-site-nav__shell {
                    width: calc(100vw - 2rem);
                    margin-left: 1rem;
                    margin-right: 1rem;
                }

                .cosmic-site-nav__bar {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 2.75rem;
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
                    width: 2.75rem;
                    margin-left: 0;
                    justify-self: end;
                    z-index: 3;
                    transform: none;
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
                    width: calc(100vw - 1.25rem);
                    margin-left: 0.625rem;
                    margin-right: 0.625rem;
                }

                .cosmic-site-nav__bar {
                    min-height: 74px;
                }

                .cosmic-site-nav .logo-orb {
                    width: 3rem;
                    height: 3rem;
                    flex-basis: 3rem;
                }

                .cosmic-site-nav__name {
                    font-size: 1.35rem;
                }

                .cosmic-site-nav__tagline {
                    display: none;
                }

                .cosmic-site-nav__right {
                    gap: 0.5rem;
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

                .cosmic-site-nav__name {
                    font-size: 1.15rem;
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

            html[data-theme="light"] .cosmic-site-nav__search-input {
                background: rgba(255, 255, 255, 0.85) !important;
                border-color: rgba(36, 31, 24, 0.16) !important;
                color: #241f18 !important;
            }

            html[data-theme="light"] .cosmic-site-nav__search-input::placeholder {
                color: rgba(36, 31, 24, 0.45) !important;
            }

            html[data-theme="light"] .cosmic-site-nav__cta {
                color: #020617 !important;
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
        const logo = `${base}logo.png`;

        return `
            <nav id="${NAV_ID}" class="cosmic-site-nav" aria-label="Primary navigation">
                <div class="cosmic-site-nav__shell">
                    <div class="cosmic-site-nav__bar">
                        <a class="cosmic-site-nav__brand" href="${navHref(base, "home")}" aria-label="CosmicTrotter home">
                            <span class="logo-orb">
                                <span class="logo-disk">
                                    <img class="cosmic-site-nav__logo" src="${logo}" alt="CosmicTrotter Logo" width="56" height="56">
                                </span>
                            </span>
                            <span class="cosmic-site-nav__brand-copy">
                                <span class="cosmic-site-nav__name">CosmicTrotter</span>
                                <span class="cosmic-site-nav__tagline">TRAVEL THROUGH KNOWLEDGE</span>
                            </span>
                        </a>

                        <div class="cosmic-site-nav__center">
                            <div class="cosmic-site-nav__dock">
                                ${buildLink(base, "explore", "Explore", "fa-compass", current)}
                                ${buildLink(base, "today", "Today", "fa-infinity", current)}
                                <span class="cosmic-site-nav__menu-wrap" data-cosmic-menu-wrap>
                                    <button class="cosmic-site-nav__menu-button" type="button" data-cosmic-nav-menu aria-expanded="false" aria-controls="cosmic-site-nav-library">
                                        <i class="fa-solid fa-layer-group"></i>
                                        <span>Library</span>
                                        <i class="fa-solid fa-chevron-down cosmic-site-nav__chevron"></i>
                                    </button>
                                    <span id="cosmic-site-nav-library" class="cosmic-site-nav__panel" hidden>
                                        ${buildAskKrishnaButton("Ask Krishna Chat", "Start a guidance chat with Krishna")}
                                        ${buildPanelLink(navHref(base, "wisdom"), "fa-book-open", "Wisdom Library", "Quotes, reflections, and daily ideas")}
                                        ${buildPanelLink(navHref(base, "space"), "fa-rocket", "Space & Cosmos", "Black holes, planets, and star stories")}
                                        ${buildPanelLink(navHref(base, "philosophy"), "fa-brain", "Philosophy", "Consciousness, meaning, and big questions")}
                                        ${buildPanelLink(navHref(base, "quantum"), "fa-atom", "Quantum", "Tiny physics with giant implications")}
                                        ${buildPanelLink(navHref(base, "ancient"), "fa-landmark", "Ancient Wisdom", "Vedic and timeless knowledge journeys")}
                                        ${buildPanelLink(navHref(base, "ev"), "fa-charging-station", "EV Guide", "PM E-DRIVE costs, subsidies, and setup")}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div class="cosmic-site-nav__right">
                            <div class="cosmic-site-nav__utilities">
                                ${buildSearch("cosmic-site-nav-search")}
                                <a class="cosmic-site-nav__cta" href="${navHref(base, "community")}" data-cosmic-join>
                                    <span>Join</span>
                                    <i class="fa-solid fa-arrow-right"></i>
                                </a>
                            </div>
                            <span class="cosmic-site-nav__theme-slot" data-cosmic-theme-slot></span>
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
                                ${buildLink(base, "today", "Today", "fa-infinity", current)}
                                ${buildAskKrishnaButton("Ask Krishna", "")}
                                ${buildLink(base, "wisdom", "Wisdom", "fa-book-open", current)}
                                ${buildLink(base, "space", "Space", "fa-rocket", current)}
                                ${buildLink(base, "ancient", "Ancient", "fa-landmark", current)}
                                ${buildLink(base, "philosophy", "Philosophy", "fa-brain", current)}
                                ${buildLink(base, "quantum", "Quantum", "fa-atom", current)}
                                ${buildLink(base, "ev", "EV Guide", "fa-charging-station", current)}
                            </div>

                            <div class="cosmic-site-nav__mobile-tools">
                                ${buildSearch("cosmic-site-nav-mobile-search")}
                                <a class="cosmic-site-nav__cta" href="${navHref(base, "community")}" data-cosmic-join>
                                    <span>Join the Journey</span>
                                    <i class="fa-solid fa-arrow-right"></i>
                                </a>
                            </div>
                            <div class="cosmic-site-nav__mobile-theme" data-cosmic-theme-mobile-slot></div>
                        </div>
                    </div>
                </div>
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
        const menuPanel = nav.querySelector("#cosmic-site-nav-library");
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
            }
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
            link.addEventListener("click", () => {
                closeNavigation();
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

        moveThemeToggle();
        window.setTimeout(moveThemeToggle, 0);
        window.addEventListener("resize", moveThemeToggle);
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

        bindNav(base);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountNav);
    } else {
        mountNav();
    }
})();
