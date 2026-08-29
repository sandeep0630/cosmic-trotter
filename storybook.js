const storybookState = {
  readingMode: false,
  bookmarks: []
};

function getStorybookSlug() {
  const fromBody = document.body?.dataset?.storybookSlug;
  if (fromBody && String(fromBody).trim()) return String(fromBody).trim();
  const path = (window.location.pathname || '').replace(/\.html?$/i, '');
  const leaf = path.split('/').filter(Boolean).pop();
  return leaf || 'default';
}

function bookmarksStorageKey() {
  return `cosmic_${getStorybookSlug()}_bookmarks`;
}

function readingModeStorageKey() {
  return `cosmic_${getStorybookSlug()}_reading_mode`;
}

function initializeStorybook() {
  if (document.documentElement.dataset.storybookReady === '1') return;
  document.documentElement.dataset.storybookReady = '1';
  document.documentElement.classList.remove('no-js');
  buildStorybookControls();
  prepareBookmarkTargets();
  bindReadingModeButton();
  setupProgressBar();
  setupBackToTop();
  restoreBookmarks();
  restoreReadingMode();
  mountContinueChip();
  window.addEventListener('scroll', () => {
    updateProgressBar();
    updateBackToTopButton();
  });
}

function buildStorybookControls() {
  if (document.getElementById('reading-mode-btn')) {
    document.getElementById('bookmarks-btn')?.addEventListener('click', showBookmarkPanel);
    return;
  }
  const controlsContainer = document.createElement('section');
  controlsContainer.className = 'storybook-controls';
  controlsContainer.innerHTML = `
    <div class="storybook-tools">
      <div class="tool-note">Use reading mode for immersive flow and bookmark chapters for later.</div>
      <div class="tool-actions">
        <button id="reading-mode-btn" type="button" aria-pressed="false" title="Toggle reading mode">
          <i class="fa-solid fa-book"></i>
          <span class="hidden sm:inline">Reading mode</span>
        </button>
        <button id="bookmarks-btn" type="button" aria-label="Open saved places" title="Open saved places">
          <i class="fa-solid fa-bookmark"></i>
          <span class="hidden sm:inline">My places</span>
          <span id="bookmark-count" class="bookmark-count">0</span>
        </button>
      </div>
    </div>
  `;

  const contentArea = document.querySelector('.storybook-content');
  if (contentArea && contentArea.parentNode) {
    contentArea.parentNode.insertBefore(controlsContainer, contentArea);
  } else {
    document.body.prepend(controlsContainer);
  }

  document.getElementById('bookmarks-btn')?.addEventListener('click', showBookmarkPanel);
}

function createBookmarkButton(type, targetId) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `bookmark-toggle ${type === 'chapter' ? 'chapter-bookmark' : 'para-bookmark'}`;
  button.dataset.bookmarkType = type;
  button.dataset.bookmarkTarget = targetId;
  button.setAttribute('aria-label', `Bookmark ${type}`);
  button.setAttribute('title', `Bookmark ${type}`);
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleBookmark(targetId, type);
  });
  return button;
}

function bookmarkKey(type, targetId) {
  return `${type}:${targetId}`;
}

function getBookmarks() {
  return storybookState.bookmarks;
}

function saveBookmarks(bookmarks) {
  storybookState.bookmarks = bookmarks;
  try {
    localStorage.setItem(bookmarksStorageKey(), JSON.stringify(bookmarks));
  } catch (error) {
    console.warn('Unable to save bookmarks', error);
  }
  updateBookmarkCount();
}

function restoreBookmarks() {
  try {
    let raw = localStorage.getItem(bookmarksStorageKey());
    if (!raw) {
      const alt = `cosmic_${getStorybookSlug().replace(/-/g, '_')}_bookmarks`;
      raw = localStorage.getItem(alt);
    }
    // Legacy shared key (pre page-scoped storage)
    if (!raw && getStorybookSlug() === 'default') {
      raw = localStorage.getItem('storybook-bookmarks');
    }
    const saved = JSON.parse(raw || '[]');
    if (Array.isArray(saved)) {
      storybookState.bookmarks = saved.map((bookmark) => {
        if (!bookmark) return null;
        if (bookmark.key && bookmark.targetId) return bookmark;
        const targetId = bookmark.targetId || bookmark.id;
        if (!targetId) return null;
        const type = bookmark.type || (String(targetId).startsWith('para-') ? 'paragraph' : 'chapter');
        return {
          key: bookmark.key || `${type}:${targetId}`,
          type,
          targetId,
          title: bookmark.title || 'Saved place',
          snippet: bookmark.snippet || bookmark.excerpt || '',
          ts: bookmark.ts || bookmark.timestamp || Date.now()
        };
      }).filter(Boolean);
    }
  } catch (error) {
    console.warn('Unable to restore bookmarks', error);
  }
  syncBookmarkButtons();
  updateBookmarkCount();
}

function updateBookmarkCount() {
  const countElement = document.getElementById('bookmark-count');
  if (countElement) {
    countElement.textContent = String(getBookmarks().length || 0);
  }
}

function prepareBookmarkTargets() {
  const contentArea = document.querySelector('.storybook-content');
  if (!contentArea) return;

  const chapterHeads = contentArea.querySelectorAll('.chapter h3, .chapter h2');
  const headings = Array.from(chapterHeads.length ? chapterHeads : contentArea.querySelectorAll('h2, h3'));
  headings.forEach((heading, index) => {
    if (heading.dataset.storybookBound) return;
    heading.dataset.storybookBound = '1';
    const id = heading.id || `bookmark-chapter-${index + 1}`;
    heading.id = id;

    heading.classList.add('chapter-heading');
    const headingText = document.createElement('span');
    headingText.className = 'heading-text';
    headingText.textContent = heading.textContent.trim();
    heading.textContent = '';
    heading.appendChild(headingText);
    heading.appendChild(createBookmarkButton('chapter', id));
  });

  const paraRoot = chapterHeads.length ? contentArea.querySelectorAll('.chapter p') : contentArea.querySelectorAll('p');
  const paragraphs = Array.from(paraRoot).filter((p) => !p.classList.contains('illustration-caption') && !p.classList.contains('source-note'));
  paragraphs.forEach((paragraph, index) => {
    if (paragraph.dataset.storybookBound) return;
    paragraph.dataset.storybookBound = '1';
    const id = paragraph.id || `bookmark-paragraph-${index + 1}`;
    paragraph.id = id;
    paragraph.classList.add('bookmarkable-paragraph');

    if (!paragraph.querySelector('.para-bookmark')) {
      const wrapper = document.createElement('span');
      wrapper.className = 'para-bookmark';
      wrapper.appendChild(createBookmarkButton('paragraph', id));
      paragraph.prepend(wrapper);
    }
  });

  syncBookmarkButtons();
}

function syncBookmarkButtons() {
  const saved = new Set(getBookmarks().map((bookmark) => bookmark.key));
  document.querySelectorAll('[data-bookmark-target]').forEach((button) => {
    const key = bookmarkKey(button.dataset.bookmarkType, button.dataset.bookmarkTarget);
    const isSaved = saved.has(key);
    button.classList.toggle('is-saved', isSaved);
    button.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
    const icon = button.querySelector('i');
    if (icon) {
      icon.className = isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
    }
  });

  document.querySelectorAll('.bookmarkable-paragraph').forEach((paragraph) => {
    const key = bookmarkKey('paragraph', paragraph.id);
    paragraph.classList.toggle('is-bookmarked', saved.has(key));
  });
}

function buildBookmark(targetId, type) {
  const target = document.getElementById(targetId);
  if (!target) return null;

  const title = type === 'chapter'
    ? target.querySelector('.heading-text')?.textContent?.trim() || target.textContent.trim()
    : `Paragraph`;
  const snippet = type === 'paragraph'
    ? compactText(target.textContent.trim(), 180)
    : '';

  return {
    key: bookmarkKey(type, targetId),
    type,
    targetId,
    title,
    snippet,
    ts: Date.now()
  };
}

function toggleBookmark(targetId, type) {
  const key = bookmarkKey(type, targetId);
  const bookmarks = getBookmarks();
  const existingIndex = bookmarks.findIndex((bookmark) => bookmark.key === key);

  if (existingIndex >= 0) {
    bookmarks.splice(existingIndex, 1);
    saveBookmarks(bookmarks);
    syncBookmarkButtons();
    return;
  }

  const bookmark = buildBookmark(targetId, type);
  if (!bookmark) return;

  saveBookmarks([bookmark, ...bookmarks]);
  syncBookmarkButtons();
}

function showBookmarkPanel() {
  const existing = document.querySelector('.bookmark-overlay');
  if (existing) {
    existing.remove();
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'bookmark-overlay active';
  overlay.innerHTML = `
    <div class="bookmark-panel-card" role="dialog" aria-modal="true">
      <div class="bookmark-panel-header">
        <div>
          <div class="title">My places</div>
          <div class="subtitle">Saved chapters and paragraphs from this story.</div>
        </div>
        <button class="bookmark-close" type="button" aria-label="Close bookmarks" data-close-bookmarks>
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="bookmark-list"></div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (event) => {
    const close = event.target.closest('[data-close-bookmarks]');
    if (close || event.target === overlay) {
      overlay.remove();
    }
  });

  renderBookmarkPanel();
}

function renderBookmarkPanel() {
  const list = document.querySelector('.bookmark-list');
  if (!list) return;
  list.innerHTML = '';

  const bookmarks = getBookmarks();
  if (!bookmarks.length) {
    list.innerHTML = '<div class="empty-state">No saved chapters or paragraphs yet.</div>';
    return;
  }

  bookmarks.forEach((bookmark, index) => {
    const item = document.createElement('div');
    item.className = 'bookmark-item';
    item.innerHTML = `
      <div class="bookmark-item-label">${escapeHtml(bookmark.type === 'chapter' ? 'Chapter' : 'Paragraph')}</div>
      <div class="bookmark-item-title">${escapeHtml(bookmark.title)}</div>
      ${bookmark.snippet ? `<div class="bookmark-item-snippet">${escapeHtml(bookmark.snippet)}</div>` : ''}
      <div class="bookmark-actions">
        <button type="button" data-jump="${index}" aria-label="Go to bookmark">Go</button>
        <button type="button" data-remove="${index}" aria-label="Remove bookmark">Remove</button>
      </div>
    `;

    item.querySelector('[data-jump]')?.addEventListener('click', () => {
      scrollToBookmark(bookmark);
      document.querySelector('.bookmark-overlay')?.remove();
    });
    item.querySelector('[data-remove]')?.addEventListener('click', () => {
      removeBookmark(bookmark.key);
      renderBookmarkPanel();
    });

    list.appendChild(item);
  });
}

function removeBookmark(key) {
  const bookmarks = getBookmarks().filter((bookmark) => bookmark.key !== key);
  saveBookmarks(bookmarks);
  syncBookmarkButtons();
}

function scrollToBookmark(bookmark) {
  const target = bookmark && document.getElementById(bookmark.targetId);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.pageYOffset - 88;
  window.scrollTo({ top, behavior: 'smooth' });
  history.replaceState(null, '', `#${target.id}`);
  target.classList.add('temp-highlight');
  setTimeout(() => target.classList.remove('temp-highlight'), 2200);
}

function compactText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

function restoreReadingMode() {
  try {
    let saved = localStorage.getItem(readingModeStorageKey());
    if (saved == null && getStorybookSlug() === 'default') {
      saved = localStorage.getItem('storybook-reading-mode');
    }
    const enabled = saved === 'true';
    if (enabled) applyReadingMode(true, false);
  } catch (error) {
    console.warn('Unable to restore reading mode', error);
  }
}

function applyReadingMode(enabled, persist = true) {
  storybookState.readingMode = enabled;
  document.body.classList.toggle('reading-mode', enabled);

  const button = document.getElementById('reading-mode-btn');
  if (!button) return;
  button.setAttribute('aria-pressed', String(enabled));
  button.innerHTML = enabled
    ? '<i class="fa-solid fa-times"></i> <span class="hidden sm:inline">Exit reading mode</span>'
    : '<i class="fa-solid fa-book"></i> <span class="hidden sm:inline">Reading mode</span>';

  if (persist) {
    try {
      localStorage.setItem(readingModeStorageKey(), enabled ? 'true' : 'false');
    } catch (error) {
      console.warn('Unable to save reading mode', error);
    }
  }

  updateProgressBar();
}

function bindReadingModeButton() {
  const button = document.getElementById('reading-mode-btn');
  if (!button) return;
  button.addEventListener('click', () => applyReadingMode(!storybookState.readingMode));
}

function setupProgressBar() {
  if (document.getElementById('reading-progress-bar')) return;
  const progressShell = document.createElement('div');
  progressShell.className = 'reading-progress-shell';
  progressShell.innerHTML = '<div id="reading-progress-bar"></div>';
  document.body.appendChild(progressShell);
}

function updateProgressBar() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  const bar = document.getElementById('reading-progress-bar');
  if (bar) bar.style.width = `${percent}%`;
  const shell = bar?.parentElement;
  if (shell) shell.classList.toggle('visible', storybookState.readingMode && scrollTop > 80);
}

function setupBackToTop() {
  if (document.getElementById('dash-top-button')) return;
  const btn = document.createElement('button');
  btn.id = 'dash-top-button';
  btn.className = 'dash-top-button';
  btn.type = 'button';
  btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(btn);
}

function updateBackToTopButton() {
  const button = document.getElementById('dash-top-button');
  if (!button) return;
  button.classList.toggle('is-visible', window.scrollY > 520);
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[tag]));
}


function mountContinueChip() {
  if (document.querySelector('.storybook-continue')) return;
  let last = null;
  try {
    last = window.CosmicJourneyProgress && window.CosmicJourneyProgress.getLast
      ? window.CosmicJourneyProgress.getLast()
      : JSON.parse(localStorage.getItem('cosmic_journey_last_v1') || 'null');
  } catch (e) { last = null; }
  const here = (window.location.pathname || '/').replace(/\\/g, '/');
  if (!last || !last.path) return;
  const same = last.path === here || here.endsWith(last.path) || last.path.endsWith(here.replace(/\.html?$/i, ''));
  if (!same || !(last.percent > 8)) return;
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'storybook-continue';
  chip.innerHTML = '<i class="fa-solid fa-play"></i> Continue where you left off';
  chip.addEventListener('click', () => {
    const y = (document.documentElement.scrollHeight - document.documentElement.clientHeight) * (last.percent / 100);
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
  const content = document.querySelector('.storybook-content');
  if (content) content.parentNode.insertBefore(chip, content);
  else document.body.prepend(chip);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeStorybook);
} else {
  initializeStorybook();
}
