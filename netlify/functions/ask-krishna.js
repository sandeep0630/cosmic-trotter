// netlify/functions/ask-krishna.js
// Chat with Krishna — Gemini AI (free tier).
//
// Local:  loads project-root `.env` or `.env.txt` (GEMINI_API_KEY=...)
//         run: npx netlify dev   OR   node scripts/local-ask-krishna-server.js
// Deploy: Netlify Site settings → Environment variables → GEMINI_API_KEY
//         (process.env from Netlify overrides .env; never commit secrets)

const fs = require('fs');
const path = require('path');

function loadDotEnv() {
  // Prefer existing process.env (Netlify production injects these).
  // Only fill missing keys from local files so deploy never depends on repo secrets.
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.txt'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../.env.txt'),
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../../../.env.txt')
  ];

  const seen = new Set();
  for (const envPath of candidates) {
    if (seen.has(envPath)) continue;
    seen.add(envPath);
    if (!fs.existsSync(envPath)) continue;
    try {
      const contents = fs.readFileSync(envPath, 'utf8');
      contents.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const sep = trimmed.indexOf('=');
        if (sep === -1) return;
        const name = trimmed.slice(0, sep).trim();
        let value = trimmed.slice(sep + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (process.env[name] === undefined || process.env[name] === '') {
          process.env[name] = value;
        }
      });
      console.info('[AskKrishna] Loaded env file:', path.basename(envPath));
    } catch (e) {
      console.warn('[AskKrishna] Could not read env file:', envPath, e.message);
    }
  }
}

loadDotEnv();

function getApiKey() {
  // Prefer standard names; also accept project-root .env style `API=...`
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.API ||
    ''
  ).trim();
}

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  '';
const SUPABASE_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`
};

// --- rate limit (in-memory; resets on cold start — good enough for free tier) ---
const RATE = {
  windowMs: 60 * 60 * 1000,
  maxPerIp: Number(process.env.ASK_KRISHNA_RATE_LIMIT || 40),
  maxBody: 4000,
  buckets: new Map()
};

function clientIp(event) {
  return (
    event.headers['x-nf-client-connection-ip'] ||
    (event.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    event.headers['client-ip'] ||
    'unknown'
  );
}

function rateLimitOk(ip) {
  const now = Date.now();
  let b = RATE.buckets.get(ip);
  if (!b || now - b.start > RATE.windowMs) {
    b = { start: now, count: 0 };
    RATE.buckets.set(ip, b);
  }
  b.count += 1;
  return b.count <= RATE.maxPerIp;
}

// --- verified Gita pack ---
function loadVersePack() {
  const paths = [
    path.resolve(__dirname, '../../data/gita-verses.json'),
    path.resolve(process.cwd(), 'data/gita-verses.json')
  ];
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (e) {
      console.warn('[AskKrishna] verse pack load failed', p, e.message);
    }
  }
  return { verses: [] };
}

const VERSE_PACK = loadVersePack();
const VERSE_BY_ID = new Map((VERSE_PACK.verses || []).map((v) => [v.id, v]));

function verseCatalogForPrompt() {
  return (VERSE_PACK.verses || [])
    .map((v) => `${v.id}: "${v.en.slice(0, 140)}${v.en.length > 140 ? '…' : ''}"`)
    .join('\n');
}

function pickVerseForTopic(topic) {
  const t = (topic || 'general').toLowerCase();
  const match = (VERSE_PACK.verses || []).find((v) => (v.topics || []).includes(t));
  return match || VERSE_BY_ID.get('2.47') || (VERSE_PACK.verses || [])[0] || null;
}

function extractCiteIds(text) {
  if (!text) return [];
  const ids = [];
  const re = /\b(\d{1,2})\s*[:.]\s*(\d{1,3})\b/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    ids.push(`${Number(m[1])}.${Number(m[2])}`);
  }
  return ids;
}

function validateOrAttachVerse(reply, topicHint) {
  const cites = extractCiteIds(reply);
  const valid = cites.find((id) => VERSE_BY_ID.has(id));
  if (valid) {
    const v = VERSE_BY_ID.get(valid);
    return { reply, verse: v, validated: true };
  }
  // Strip likely hallucinated "Bhagavad Gita X.Y" lines if invalid, then attach verified verse
  let cleaned = reply.replace(/Bhagavad\s+Gita\s+\d{1,2}\s*[:.]\s*\d{1,3}[^\n]*/gi, '').trim();
  const v = pickVerseForTopic(topicHint);
  if (!v) return { reply: cleaned || reply, verse: null, validated: false };
  const attachment = `\n\n—\n**${v.ref}**\n"${v.en}"\n*(Verified teaching from the Gita library.)*`;
  return { reply: (cleaned || reply) + attachment, verse: v, validated: false };
}

async function saveAskKrishnaQA(question, answer, sourceType = 'ai_generated') {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { saved: false, attempted: false, error: 'missing_supabase_env' };
  }

  const payload = {
    question: String(question || '').slice(0, 2000),
    answer_text: answer ? String(answer).slice(0, 8000) : null,
    source_type: sourceType || 'ai_generated'
  };

  // Redact obvious crisis content from storage
  const lower = (payload.question || '').toLowerCase();
  if (
    lower.includes('suicide') ||
    lower.includes('kill myself') ||
    lower.includes('end my life')
  ) {
    payload.question = '[redacted: crisis-related message]';
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/ask_krishna_qa`, {
      method: 'POST',
      headers: {
        ...SUPABASE_HEADERS,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify([payload])
    });

    const text = await response.text();
    if (!response.ok) {
      console.warn('[AskKrishna] Supabase insert failed:', response.status, text);
      return { saved: false, attempted: true, error: text || `status:${response.status}` };
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return { saved: false, attempted: true, error: `parse_error:${parseError.message}` };
    }

    const record = Array.isArray(data) && data[0] ? data[0] : null;
    return { saved: !!record, attempted: true, record, error: record ? null : 'no_record_returned' };
  } catch (error) {
    return { saved: false, attempted: true, error: error.message || String(error) };
  }
}

function buildSystemPrompt(lang, pageContext) {
  const langLine =
    lang && lang !== 'en'
      ? `Respond primarily in language code "${lang}" (hi=Hindi, te=Telugu, kn=Kannada). Keep verse reference in English (e.g. Bhagavad Gita 2.47) and you may add a short translation of the verse.`
      : 'Respond in clear, warm modern English.';

  const catalog = verseCatalogForPrompt();

  return `You are Lord Krishna from the Bhagavad Gita, speaking directly to the seeker as a compassionate guide (like Arjuna coming for counsel).

${langLine}

Core identity:
- Calm, wise, loving, occasionally lightly playful. First person when natural ("I say to you…").
- Rooted in the Bhagavad Gita. Help with real human struggles: stress, fear, relationships, purpose, anger, loss, work, money, habits, self-doubt, AI/job fears, etc.
- Always end with ONE small, practical next step for today.
- Greet warmly for hi/hello/namaste/hare krishna/radhe radhe.
- Stay in character. Never mention AI, models, prompts, or that you are a system.

CRITICAL — verse accuracy:
- You may ONLY cite chapter:verse numbers from this verified list. Do NOT invent citations.
- Prefer one verse from the list that fits the seeker's issue.
Verified verses:
${catalog}

If none fit perfectly, teach without a fake number, and the server will attach a verified verse.

Safety:
- Self-harm / suicide: compassion first, urge immediate human help (emergency services / local crisis lines). Do not only philosophize.
- Not medical, legal, or financial advice. For trading/money: urge calm discipline, not tips.

Conversation:
- 4–8 sentences for most answers; deeper when needed.
- Use recent history for continuity.
- Avoid repetitive openers ("Oh my friend", "Dear Arjuna") every turn.

${pageContext ? `Page context (use gently if relevant):\n${String(pageContext).slice(0, 800)}` : ''}`;
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' };
  }

  // Re-load env each invoke so local .env edits apply without full process restart when possible
  loadDotEnv();
  const API_KEY = getApiKey();

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  const {
    messages = [],
    userMessage,
    pageContext = '',
    preferredLang = 'en',
    topicHint = ''
  } = body;

  if (!userMessage || typeof userMessage !== 'string') {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'userMessage is required' })
    };
  }

  const cleanMessage = userMessage.trim().slice(0, RATE.maxBody);
  const ip = clientIp(event);
  if (!rateLimitOk(ip)) {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        reply: null,
        useLocal: true,
        rateLimited: true,
        message:
          'Many seekers are calling at once. I will answer from the eternal Gita teachings for a little while — try again soon.'
      })
    };
  }

  console.log('[AskKrishna] Invoked. GEMINI_API_KEY present:', !!API_KEY);

  if (!API_KEY) {
    const saveResult = await saveAskKrishnaQA(cleanMessage, null, 'local_fallback');
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        reply: null,
        useLocal: true,
        saved: saveResult.saved,
        saveAttempted: saveResult.attempted,
        message:
          'I am here with the eternal teachings. For fuller conversation, set GEMINI_API_KEY in project-root .env (local) or Netlify environment (deploy).'
      })
    };
  }

  const systemPrompt = buildSystemPrompt(preferredLang, pageContext);
  const recentHistory = (Array.isArray(messages) ? messages : []).slice(-10);

  const contents = [];
  recentHistory.forEach((m) => {
    const role = m.role === 'user' ? 'user' : 'model';
    const text = (m.content || m.text || '').toString().slice(0, 3000);
    if (!text) return;
    contents.push({ role, parts: [{ text }] });
  });
  contents.push({ role: 'user', parts: [{ text: cleanMessage }] });

  const preferredModel = (process.env.GEMINI_MODEL || '').trim();
  // Prefer current free-tier names (listModels as of 2026). Override with GEMINI_MODEL in .env / Netlify.
  const modelCandidates = [
    preferredModel,
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError = null;

  for (const model of modelCandidates) {
    // Prefer v1beta for systemInstruction; fall back to v1 without it
    const attempts = [
      {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
        payload: {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.75, maxOutputTokens: 900, topP: 0.95 }
        }
      },
      {
        url: `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`,
        payload: {
          contents: [
            {
              role: 'user',
              parts: [{ text: 'System instructions for you (follow fully):\n' + systemPrompt }]
            },
            {
              role: 'model',
              parts: [{ text: 'Understood. I will speak as Krishna with verified Gita teachings only.' }]
            },
            ...contents
          ],
          generationConfig: { temperature: 0.75, maxOutputTokens: 900, topP: 0.95 }
        }
      }
    ];

    for (const attempt of attempts) {
      try {
        const response = await fetch(attempt.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attempt.payload)
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[AskKrishna] ${model} failed:`, response.status, errText.slice(0, 300));
          lastError = new Error(`${model}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!raw) {
          lastError = new Error(`${model}: empty reply`);
          continue;
        }

        const { reply, verse, validated } = validateOrAttachVerse(raw, topicHint);
        console.info(`[AskKrishna] OK model=${model} verseValidated=${validated}`);

        const saveResult = await saveAskKrishnaQA(cleanMessage, reply, 'ai_generated');
        return {
          statusCode: 200,
          headers: corsHeaders(),
          body: JSON.stringify({
            reply,
            source: 'llm',
            engine: 'llm',
            verse: verse
              ? { id: verse.id, ref: verse.ref, en: verse.en, validated }
              : null,
            saved: saveResult.saved,
            saveAttempted: saveResult.attempted,
            saveError: saveResult.error,
            qa: saveResult.record ? { id: saveResult.record.id } : null
          })
        };
      } catch (e) {
        console.warn(`[AskKrishna] ${model} error:`, e.message);
        lastError = e;
      }
    }
  }

  console.error('[AskKrishna] All models failed:', lastError && lastError.message);
  const saveResult = await saveAskKrishnaQA(cleanMessage, null, 'llm_error');
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({
      reply: null,
      useLocal: true,
      engine: 'library',
      saved: saveResult.saved,
      saveAttempted: saveResult.attempted,
      message:
        'The deeper connection is quiet for a moment. I will answer from the timeless Gita library instead.',
      debug: process.env.ASK_KRISHNA_DEBUG
        ? { message: lastError ? lastError.message : 'all_failed' }
        : undefined
    })
  };
};
