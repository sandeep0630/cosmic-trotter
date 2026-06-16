(function () {
  var ENDPOINT = '/.netlify/functions/story-community';
  var VISITOR_KEY = 'cosmic-story-community-visitor';
  var LIKED_KEY = 'cosmic-story-community-liked';
  var MAX_TOPICS = 24;

  function installStyles() {
    if (document.getElementById('story-community-styles')) return;
    var style = document.createElement('style');
    style.id = 'story-community-styles';
    style.textContent = [
      '.story-community{max-width:1040px;margin:0 auto;padding:0 24px 72px;color:#fff;font-family:Inter,system-ui,sans-serif;}',
      '.story-community *{box-sizing:border-box;}',
      '.story-community__surface{border:1px solid rgba(255,255,255,.12);background:linear-gradient(135deg,rgba(0,243,255,.08),rgba(124,58,237,.08));border-radius:24px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.18);}',
      '.story-community__header{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:22px;}',
      '.story-community__eyebrow{color:#00f3ff;font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:8px;}',
      '.story-community h2,.story-community h3{margin:0;color:#fff;letter-spacing:0;line-height:1.1;}',
      '.story-community h2{font-size:clamp(30px,4vw,48px);}',
      '.story-community h3{font-size:24px;}',
      '.story-community p{color:rgba(255,255,255,.68);line-height:1.65;margin:8px 0 0;}',
      '.story-community__grid{display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:22px;align-items:start;}',
      '.story-community__form,.story-community__article-card,.story-community__topic-card{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.055);border-radius:18px;padding:18px;}',
      '.story-community label{display:block;color:rgba(255,255,255,.72);font-size:12px;font-weight:700;margin:0 0 7px;}',
      '.story-community input,.story-community textarea{width:100%;border:1px solid rgba(255,255,255,.16);background:rgba(5,8,20,.72);color:#fff;border-radius:12px;padding:12px 13px;font:500 14px/1.35 Inter,system-ui,sans-serif;outline:none;}',
      '.story-community textarea{min-height:108px;resize:vertical;}',
      '.story-community input:focus,.story-community textarea:focus{border-color:rgba(0,243,255,.65);box-shadow:0 0 0 3px rgba(0,243,255,.12);}',
      '.story-community__field{margin-bottom:14px;}',
      '.story-community__hidden{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;}',
      '.story-community__button{display:inline-flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:14px;background:linear-gradient(135deg,#00f3ff,#7c3aed);color:#06070b;font-weight:800;padding:12px 16px;cursor:pointer;transition:transform .18s ease,opacity .18s ease;}',
      '.story-community__button:hover{transform:translateY(-1px);}',
      '.story-community__button:disabled{cursor:not-allowed;opacity:.55;transform:none;}',
      '.story-community__button--ghost{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff;padding:9px 11px;font-size:13px;}',
      '.story-community__button--liked{background:rgba(239,68,68,.18);border-color:rgba(239,68,68,.36);color:#fecaca;}',
      '.story-community__list{display:grid;gap:14px;}',
      '.story-community__empty{border:1px dashed rgba(255,255,255,.18);border-radius:18px;padding:24px;text-align:center;color:rgba(255,255,255,.62);}',
      '.story-community__topic-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;}',
      '.story-community__topic-title{font-size:18px;font-weight:800;color:#fff;line-height:1.25;}',
      '.story-community__meta{font-size:12px;color:rgba(255,255,255,.5);margin-top:7px;}',
      '.story-community__actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:14px;}',
      '.story-community__comment-form{display:grid;grid-template-columns:160px minmax(0,1fr) auto;gap:8px;margin-top:12px;}',
      '.story-community__comments{display:grid;gap:8px;margin-top:12px;}',
      '.story-community__comment{border-left:2px solid rgba(0,243,255,.45);padding:8px 10px;background:rgba(255,255,255,.045);border-radius:10px;}',
      '.story-community__comment strong{color:#fff;font-size:13px;}',
      '.story-community__comment div{color:rgba(255,255,255,.7);font-size:13px;line-height:1.5;margin-top:3px;}',
      '.story-community__status{font-size:13px;margin-top:12px;color:rgba(255,255,255,.7);}',
      '.story-community__status--error{color:#fca5a5;}',
      '.story-community--article{padding-top:18px;}',
      '.story-community--article .story-community__surface{background:rgba(255,255,255,.055);}',
      '.story-community--article .story-community__grid{grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);}',
      '.story-community--light-surface{color:#0f172a;}',
      '.story-community--light-surface .story-community__surface{background:#fff;border-color:#dbe3ef;box-shadow:0 22px 55px rgba(15,23,42,.08);}',
      '.story-community--light-surface .story-community__eyebrow{color:#0A66C2;}',
      '.story-community--light-surface h2,.story-community--light-surface h3,.story-community--light-surface .story-community__topic-title,.story-community--light-surface .story-community__comment strong{color:#0f172a;}',
      '.story-community--light-surface p,.story-community--light-surface .story-community__comment div{color:#475569;}',
      '.story-community--light-surface label,.story-community--light-surface .story-community__meta,.story-community--light-surface .story-community__status{color:#64748b;}',
      '.story-community--light-surface .story-community__form,.story-community--light-surface .story-community__article-card,.story-community--light-surface .story-community__topic-card{background:#f8fafc;border-color:#dbe3ef;}',
      '.story-community--light-surface input,.story-community--light-surface textarea{background:#fff;border-color:#cbd5e1;color:#0f172a;}',
      '.story-community--light-surface input:focus,.story-community--light-surface textarea:focus{border-color:#0A66C2;box-shadow:0 0 0 3px rgba(10,102,194,.14);}',
      '.story-community--light-surface .story-community__button{background:#0A66C2;color:#fff;}',
      '.story-community--light-surface .story-community__button--ghost{background:#fff;border-color:#cbd5e1;color:#0f172a;}',
      '.story-community--light-surface .story-community__button--ghost:hover{border-color:#0A66C2;color:#0A66C2;}',
      '.story-community--light-surface .story-community__button--liked{background:#fee2e2;border-color:#fecaca;color:#b91c1c;}',
      '.story-community--light-surface .story-community__comment{background:#fff;border-left-color:#0A66C2;}',
      '.story-community--light-surface .story-community__empty{border-color:#cbd5e1;color:#64748b;background:#f8fafc;}',
      '.story-community__article-stats{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:16px;}',
      '.story-community-title-badge{display:inline-flex;align-items:center;gap:8px;margin-top:14px;border:1px solid rgba(255,255,255,.18);background:rgba(6,8,20,.58);color:#fff;border-radius:999px;padding:9px 13px;font:800 13px/1 Inter,system-ui,sans-serif;letter-spacing:0;cursor:pointer;backdrop-filter:blur(12px);box-shadow:0 10px 28px rgba(0,0,0,.18);transition:transform .18s ease,border-color .18s ease,background .18s ease;}',
      '.story-community-title-badge:hover{transform:translateY(-1px);border-color:rgba(0,243,255,.45);background:rgba(0,243,255,.12);}',
      '.story-community-title-badge i{color:#fb7185;}',
      '.story-community-title-badge__muted{color:rgba(255,255,255,.68);font-weight:700;}',
      '@media (max-width:820px){.story-community{padding-left:18px;padding-right:18px;}.story-community__header{display:block}.story-community__grid,.story-community--article .story-community__grid{grid-template-columns:1fr}.story-community__comment-form{grid-template-columns:1fr}.story-community__button{width:100%;}}',
      'html[data-theme="light"] .story-community{color:#241f18;}',
      'html[data-theme="light"] .story-community__surface,html[data-theme="light"] .story-community__form,html[data-theme="light"] .story-community__article-card,html[data-theme="light"] .story-community__topic-card{background:rgba(255,255,255,.82);border-color:rgba(36,31,24,.14);box-shadow:0 18px 45px rgba(50,36,16,.1);}',
      'html[data-theme="light"] .story-community h2,html[data-theme="light"] .story-community h3,html[data-theme="light"] .story-community__topic-title,html[data-theme="light"] .story-community__comment strong{color:#241f18;}',
      'html[data-theme="light"] .story-community p,html[data-theme="light"] .story-community__comment div{color:rgba(36,31,24,.72);}',
      'html[data-theme="light"] .story-community label,html[data-theme="light"] .story-community__meta,html[data-theme="light"] .story-community__status{color:rgba(36,31,24,.58);}',
      'html[data-theme="light"] .story-community input,html[data-theme="light"] .story-community textarea{background:rgba(255,255,255,.9);border-color:rgba(36,31,24,.16);color:#241f18;}',
      'html[data-theme="light"] .story-community__button--ghost{background:rgba(36,31,24,.06);border-color:rgba(36,31,24,.14);color:#241f18;}',
      'html[data-theme="light"] .story-community__button--liked{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.25);color:#b91c1c;}',
      'html[data-theme="light"] .story-community__comment{background:rgba(36,31,24,.045);}',
      'html[data-theme="light"] .story-community__empty{border-color:rgba(36,31,24,.18);color:rgba(36,31,24,.56);}',
      'html[data-theme="light"] .story-community-title-badge{background:rgba(255,255,255,.82);border-color:rgba(36,31,24,.16);color:#241f18;text-shadow:none;box-shadow:0 12px 28px rgba(50,36,16,.11);}',
      'html[data-theme="light"] .story-community-title-badge:hover{background:rgba(255,255,255,.96);border-color:rgba(0,120,160,.28);}',
      'html[data-theme="light"] .story-community-title-badge__muted{color:rgba(36,31,24,.6);}'
    ].join('');
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char];
    });
  }

  function getVisitorKey() {
    try {
      var existing = localStorage.getItem(VISITOR_KEY);
      if (existing) return existing;
      var next = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(16).slice(2);
      localStorage.setItem(VISITOR_KEY, next);
      return next;
    } catch (error) {
      return 'visitor-' + Math.random().toString(16).slice(2);
    }
  }

  function getLikedItems() {
    try {
      return JSON.parse(localStorage.getItem(LIKED_KEY) || '{}') || {};
    } catch (error) {
      return {};
    }
  }

  function markLiked(itemId) {
    try {
      var liked = getLikedItems();
      liked[itemId] = true;
      localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
    } catch (error) {
      // Local like memory is a convenience only.
    }
  }

  function hasLiked(itemId) {
    return !!getLikedItems()[itemId];
  }

  function pageSlug() {
    var path = window.location.pathname || '/';
    return path === '/' || path.endsWith('/') ? path : path.replace(/\/index\.html$/, '/');
  }

  function pageTitle() {
    var h1 = document.querySelector('h1');
    return (h1 && h1.textContent.trim()) || document.title.replace(/\s*[•|-]\s*CosmicTrotter.*/, '').trim() || 'CosmicTrotter Article';
  }

  function isArticlePage() {
    var path = pageSlug();
    if (document.querySelector('[data-story-community]')) return false;
    if (/\/(ask-krishna|ask-krishna-bot|matsya)\.html$/i.test(path)) return false;
    if (/\/ancient-wisdom\/.+\.html$/i.test(path)) return true;
    if (/\/space-cosmos\/.+\.html$/i.test(path)) return true;
    if (/\/quantum-realms\/.+\.html$/i.test(path)) return true;
    return /\/(dashavatara|ev-guide|PM_E-DRIVE_EV_Charging_Guide|zermatt-family-travel-guide)\.html$/i.test(path);
  }

  function prefersLightCommunitySurface() {
    var path = pageSlug();
    if (/\/PM_E-DRIVE_EV_Charging_Guide\.html$/i.test(path)) return true;
    return document.body && (
      document.body.classList.contains('bg-slate-50') ||
      document.body.classList.contains('bg-white') ||
      document.body.classList.contains('bg-gray-50')
    );
  }

  function api(action, payload) {
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || data.detail || 'Community request failed.');
        return data;
      });
    });
  }

  function commentsHtml(comments) {
    if (!comments || !comments.length) return '';
    return '<div class="story-community__comments">' + comments.slice(-6).map(function (comment) {
      return '<div class="story-community__comment"><strong>' + escapeHtml(comment.author_name) + '</strong><div>' + escapeHtml(comment.comment) + '</div></div>';
    }).join('') + '</div>';
  }

  function actionButtons(item) {
    var liked = hasLiked(item.id);
    return '<div class="story-community__actions">' +
      '<button class="story-community__button story-community__button--ghost ' + (liked ? 'story-community__button--liked' : '') + '" data-like-item="' + escapeHtml(item.id) + '">' +
      '<i class="fa-solid fa-heart"></i><span>' + (liked ? 'Liked' : 'Like') + '</span><span>(' + Number(item.likes_count || 0) + ')</span></button>' +
      '<span class="story-community__meta">' + Number(item.comments_count || (item.comments || []).length || 0) + ' comments</span>' +
      '</div>';
  }

  function commentForm(itemId) {
    return '<form class="story-community__comment-form" data-comment-form="' + escapeHtml(itemId) + '">' +
      '<input name="authorName" autocomplete="name" maxlength="80" required placeholder="Your name">' +
      '<input name="comment" maxlength="1200" required placeholder="Post a comment">' +
      '<input class="story-community__hidden" name="website" tabindex="-1" autocomplete="off">' +
      '<button class="story-community__button story-community__button--ghost" type="submit">Post</button>' +
      '</form>';
  }

  function topicCard(item) {
    return '<article class="story-community__topic-card" data-community-item="' + escapeHtml(item.id) + '">' +
      '<div class="story-community__topic-head"><div><div class="story-community__topic-title">' + escapeHtml(item.title) + '</div>' +
      '<div class="story-community__meta">Suggested by ' + escapeHtml(item.author_name) + '</div></div></div>' +
      '<p>' + escapeHtml(item.description) + '</p>' +
      actionButtons(item) + commentsHtml(item.comments) + commentForm(item.id) +
      '</article>';
  }

  function setStatus(root, text, isError) {
    var el = root.querySelector('[data-community-status]');
    if (!el) return;
    el.textContent = text || '';
    el.classList.toggle('story-community__status--error', !!isError);
  }

  function renderTopicList(root, topics) {
    var list = root.querySelector('[data-topic-list]');
    if (!list) return;
    if (!topics || !topics.length) {
      list.innerHTML = '<div class="story-community__empty">No story requests yet. Be the first to light one up.</div>';
      return;
    }
    list.innerHTML = topics.slice(0, MAX_TOPICS).map(topicCard).join('');
  }

  function topicFormHtml(compact) {
    return '<form class="story-community__form" data-topic-form>' +
      '<div class="story-community__field"><label>Your name</label><input name="authorName" maxlength="80" autocomplete="name" required placeholder="Your name"></div>' +
      '<div class="story-community__field"><label>Story topic</label><input name="title" maxlength="160" required placeholder="What should CosmicTrotter cover next?"></div>' +
      '<div class="story-community__field"><label>Why this story?</label><textarea name="description" maxlength="900" required placeholder="Tell us what you want explored and why it matters."></textarea></div>' +
      '<input class="story-community__hidden" name="website" tabindex="-1" autocomplete="off">' +
      '<button class="story-community__button" type="submit"><i class="fa-solid fa-wand-magic-sparkles"></i><span>' + (compact ? 'Suggest Story' : 'Drop a Topic') + '</span></button>' +
      '<div class="story-community__status" data-community-status></div>' +
      '</form>';
  }

  function renderHome(target) {
    target.className = 'story-community story-community--home';
    target.innerHTML = '<div class="story-community__surface">' +
      '<div class="story-community__header"><div><div class="story-community__eyebrow">Story Requests</div><h2>Drop a Topic for CosmicTrotter</h2><p>Suggest the sacred stories, cosmic mysteries, travel guides, or deep questions you want us to create next. Everyone can like and discuss ideas.</p></div></div>' +
      '<div class="story-community__grid"><div>' + topicFormHtml(false) + '</div><div><h3>Reader Requested Stories</h3><p>The most loved ideas rise to the top.</p><div class="story-community__list" data-topic-list><div class="story-community__empty">Loading story requests...</div></div></div></div>' +
      '</div>';
    api('list-topics').then(function (data) {
      renderTopicList(target, data.topics || []);
    }).catch(function (error) {
      renderTopicList(target, []);
      setStatus(target, error.message, true);
    });
  }

  function renderArticle(target) {
    target.id = 'story-community-section';
    target.className = 'story-community story-community--article' + (prefersLightCommunitySurface() ? ' story-community--light-surface' : '');
    target.innerHTML = '<div class="story-community__surface">' +
      '<div class="story-community__header"><div><div class="story-community__eyebrow">Reader Circle</div><h3>Like, Comment, or Request the Next Story</h3><p>Your reactions help shape what CosmicTrotter creates next.</p></div></div>' +
      '<div class="story-community__grid"><div class="story-community__article-card" data-article-card><div class="story-community__empty">Loading article discussion...</div></div><div>' + topicFormHtml(true) + '</div></div>' +
      '</div>';
    installTitleBadge(null);
    api('get-article', { pageSlug: pageSlug(), sourcePage: pageSlug(), sourceTitle: pageTitle() }).then(function (data) {
      updateArticleCard(target, data.article);
      updateTitleBadge(data.article);
    }).catch(function (error) {
      var card = target.querySelector('[data-article-card]');
      if (card) card.innerHTML = '<div class="story-community__empty">' + escapeHtml(error.message) + '</div>';
      updateTitleBadge(null);
    });
  }

  function updateArticleCard(root, article) {
    var card = root.querySelector('[data-article-card]');
    if (!card || !article) return;
    card.setAttribute('data-community-item', article.id);
    card.innerHTML = '<div class="story-community__topic-title">' + escapeHtml(article.title) + '</div>' +
      '<p>Was this article useful, moving, or worth expanding?</p>' +
      actionButtons(article) + commentsHtml(article.comments) + commentForm(article.id);
  }

  function installTitleBadge(article) {
    if (document.querySelector('.story-community-title-badge')) {
      updateTitleBadge(article);
      return;
    }

    var h1 = document.querySelector('h1');
    if (!h1 || !h1.parentElement) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'story-community-title-badge';
    button.setAttribute('aria-label', 'Go to article likes and comments');
    button.addEventListener('click', function () {
      var target = document.getElementById('story-community-section') || document.querySelector('.story-community--article');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    h1.insertAdjacentElement('afterend', button);
    updateTitleBadge(article);
  }

  function updateTitleBadge(article) {
    var button = document.querySelector('.story-community-title-badge');
    if (!button) return;

    if (!article) {
      button.innerHTML = '<i class="fa-solid fa-heart"></i><span>Loading reader love...</span>';
      return;
    }

    var likes = Number(article.likes_count || 0);
    var comments = Number(article.comments_count || (article.comments || []).length || 0);
    var likeText = likes === 1 ? '1 like' : likes + ' likes';
    var commentText = comments === 1 ? '1 comment' : comments + ' comments';
    button.innerHTML = '<i class="fa-solid fa-heart"></i><span>' + likeText + '</span><span class="story-community-title-badge__muted">· ' + commentText + '</span>';
    button.setAttribute('aria-label', 'Go to like and comment section. ' + likeText + ', ' + commentText + '.');
  }

  function handleTopicSubmit(event, root) {
    var form = event.target.closest('[data-topic-form]');
    if (!form) return;
    event.preventDefault();

    var button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    setStatus(root, 'Posting your topic...', false);

    var formData = new FormData(form);
    api('create-topic', {
      authorName: formData.get('authorName'),
      title: formData.get('title'),
      description: formData.get('description'),
      website: formData.get('website'),
      sourcePage: pageSlug(),
      sourceTitle: pageTitle()
    }).then(function (data) {
      form.reset();
      setStatus(root, 'Posted. Thank you for shaping the next story.', false);
      var list = root.querySelector('[data-topic-list]');
      if (list && data.topic) {
        api('list-topics').then(function (fresh) { renderTopicList(root, fresh.topics || [data.topic]); });
      }
    }).catch(function (error) {
      setStatus(root, error.message, true);
    }).finally(function () {
      if (button) button.disabled = false;
    });
  }

  function handleCommentSubmit(event, root) {
    var form = event.target.closest('[data-comment-form]');
    if (!form) return;
    event.preventDefault();

    var itemId = form.getAttribute('data-comment-form');
    var button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;

    var data = new FormData(form);
    api('add-comment', {
      itemId: itemId,
      authorName: data.get('authorName'),
      comment: data.get('comment'),
      website: data.get('website')
    }).then(function (payload) {
      form.reset();
      refreshItem(root, payload.item);
      updateTitleBadge(payload.item);
    }).catch(function (error) {
      alert(error.message);
    }).finally(function () {
      if (button) button.disabled = false;
    });
  }

  function handleLikeClick(event, root) {
    var button = event.target.closest('[data-like-item]');
    if (!button) return;
    var itemId = button.getAttribute('data-like-item');
    button.disabled = true;
    api('like-item', { itemId: itemId, visitorKey: getVisitorKey() }).then(function (payload) {
      markLiked(itemId);
      refreshItem(root, payload.item);
      updateTitleBadge(payload.item);
    }).catch(function (error) {
      alert(error.message);
    }).finally(function () {
      button.disabled = false;
    });
  }

  function refreshItem(root, item) {
    if (!item) return;
    var existing = root.querySelector('[data-community-item="' + item.id + '"]');
    if (!existing) return;
    if (existing.classList.contains('story-community__article-card')) {
      updateArticleCard(root, item);
    } else {
      existing.outerHTML = topicCard(item);
    }
  }

  function bind(root) {
    root.addEventListener('submit', function (event) {
      handleTopicSubmit(event, root);
      handleCommentSubmit(event, root);
    });
    root.addEventListener('click', function (event) {
      handleLikeClick(event, root);
    });
  }

  function mount() {
    installStyles();

    var explicit = document.querySelector('[data-story-community]');
    if (explicit) {
      renderHome(explicit);
      bind(explicit);
      return;
    }

    if (!isArticlePage()) return;

    var target = document.createElement('section');
    var footer = document.querySelector('footer');
    if (footer && footer.parentElement) {
      footer.parentElement.insertBefore(target, footer);
    } else {
      document.body.appendChild(target);
    }
    renderArticle(target);
    bind(target);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
