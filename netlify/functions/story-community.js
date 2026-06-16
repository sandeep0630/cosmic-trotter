const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function response(statusCode, payload) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  };
}

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizePageSlug(value) {
  var slug = cleanText(value, 220).replace(/^https?:\/\/[^/]+/i, '');
  if (!slug || slug === '/') return '/';
  return slug.split('#')[0].split('?')[0];
}

function requireConfig() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return response(503, {
      error: 'Community backend is not configured yet.',
      setup: 'Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Netlify environment variables.'
    });
  }
  return null;
}

async function supabaseFetch(path, options = {}) {
  const headers = Object.assign({
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`
  }, options.headers || {});

  const result = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body
  });

  const text = await result.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = text;
    }
  }

  if (!result.ok) {
    const detail = typeof data === 'object' && data ? data.message || data.details || data.hint || JSON.stringify(data) : text;
    const error = new Error(detail || `Supabase request failed with ${result.status}`);
    error.status = result.status;
    error.data = data;
    throw error;
  }

  return data;
}

function itemQuery(extra) {
  return `community_items?select=*&${extra}`;
}

async function fetchItemsWithComments(items) {
  if (!items || !items.length) return [];

  const ids = items.map((item) => item.id).filter(Boolean);
  if (!ids.length) return items.map((item) => Object.assign({}, item, { comments: [] }));

  const commentPath = `community_comments?select=*&item_id=in.(${ids.join(',')})&order=created_at.asc&limit=200`;
  const comments = await supabaseFetch(commentPath);
  const byItem = new Map();

  (comments || []).forEach((comment) => {
    if (!byItem.has(comment.item_id)) byItem.set(comment.item_id, []);
    byItem.get(comment.item_id).push(comment);
  });

  return items.map((item) => Object.assign({}, item, { comments: byItem.get(item.id) || [] }));
}

async function fetchItem(itemId) {
  const encoded = encodeURIComponent(itemId);
  const items = await supabaseFetch(itemQuery(`id=eq.${encoded}&limit=1`));
  return (await fetchItemsWithComments(items))[0] || null;
}

async function listTopics() {
  const items = await supabaseFetch(
    'community_items?select=*&type=eq.topic&order=likes_count.desc,created_at.desc&limit=24'
  );
  return response(200, { topics: await fetchItemsWithComments(items || []) });
}

async function createTopic(body) {
  if (cleanText(body.website, 80)) {
    return response(200, { ok: true, ignored: true });
  }

  const authorName = cleanText(body.authorName, 80);
  const title = cleanText(body.title, 160);
  const description = cleanText(body.description, 900);

  if (authorName.length < 2) return response(400, { error: 'Name is required.' });
  if (title.length < 4) return response(400, { error: 'Topic title is required.' });
  if (description.length < 8) return response(400, { error: 'Please add a little more detail.' });

  const payload = {
    type: 'topic',
    title,
    description,
    author_name: authorName,
    source_page: normalizePageSlug(body.sourcePage),
    source_title: cleanText(body.sourceTitle, 180) || null
  };

  const rows = await supabaseFetch('community_items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  const topic = (await fetchItemsWithComments(rows || []))[0];
  return response(201, { topic });
}

async function getArticle(body) {
  const pageSlug = normalizePageSlug(body.pageSlug || body.sourcePage);
  const sourceTitle = cleanText(body.sourceTitle, 180) || 'CosmicTrotter Article';
  const encodedSlug = encodeURIComponent(pageSlug);

  let items = await supabaseFetch(
    `community_items?select=*&type=eq.article&page_slug=eq.${encodedSlug}&limit=1`
  );

  if (!items || !items.length) {
    try {
      await supabaseFetch('community_items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          type: 'article',
          page_slug: pageSlug,
          title: sourceTitle,
          description: '',
          author_name: 'CosmicTrotter',
          source_page: pageSlug,
          source_title: sourceTitle
        })
      });
    } catch (error) {
      if (error.status !== 409) throw error;
    }

    items = await supabaseFetch(
      `community_items?select=*&type=eq.article&page_slug=eq.${encodedSlug}&limit=1`
    );
  }

  const article = (await fetchItemsWithComments(items || []))[0] || null;
  return response(200, { article });
}

async function likeItem(body) {
  const itemId = cleanText(body.itemId, 80);
  const visitorKey = cleanText(body.visitorKey, 120);

  if (!itemId || !visitorKey) return response(400, { error: 'Missing item or visitor.' });

  let alreadyLiked = false;
  try {
    await supabaseFetch('community_likes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ item_id: itemId, visitor_key: visitorKey })
    });
  } catch (error) {
    if (error.status === 409) {
      alreadyLiked = true;
    } else {
      throw error;
    }
  }

  return response(200, { item: await fetchItem(itemId), alreadyLiked });
}

async function addComment(body) {
  if (cleanText(body.website, 80)) {
    return response(200, { ok: true, ignored: true });
  }

  const itemId = cleanText(body.itemId, 80);
  const authorName = cleanText(body.authorName, 80);
  const comment = cleanText(body.comment, 1200);

  if (!itemId) return response(400, { error: 'Missing item.' });
  if (authorName.length < 2) return response(400, { error: 'Name is required.' });
  if (comment.length < 2) return response(400, { error: 'Comment is required.' });

  const rows = await supabaseFetch('community_comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      item_id: itemId,
      author_name: authorName,
      comment
    })
  });

  return response(201, { comment: rows && rows[0], item: await fetchItem(itemId) });
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Method not allowed.' });
  }

  const missingConfig = requireConfig();
  if (missingConfig) return missingConfig;

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (error) {
    return response(400, { error: 'Invalid JSON.' });
  }

  try {
    switch (body.action) {
      case 'list-topics':
        return await listTopics(body);
      case 'create-topic':
        return await createTopic(body);
      case 'get-article':
        return await getArticle(body);
      case 'like-item':
        return await likeItem(body);
      case 'add-comment':
        return await addComment(body);
      default:
        return response(400, { error: 'Unknown action.' });
    }
  } catch (error) {
    console.error('[story-community]', error);
    return response(error.status || 500, {
      error: error.status === 404 ? 'Not found.' : 'Community action failed.',
      detail: error.message
    });
  }
};
