// netlify/functions/ask-krishna.js
// Real generative "Chat with Krishna" — makes the floating widget fully conversational (GPT-like).
//
// === HOW TO CONFIGURE (completely free) ===
// 1. Go to https://aistudio.google.com/app/apikey and create a free Google AI (Gemini) API key.
//    (Google gives a very generous free tier — millions of tokens per day.)
// 2. In your Netlify dashboard:
//    - Go to Site settings → Environment variables
//    - Add new variable:
//      Key:   GEMINI_API_KEY
//      Value: paste-your-gemini-key-here
// 3. Click "Deploy" or push a new commit to trigger a redeploy.
// 4. On your live site, hard refresh (Ctrl + Shift + R) the home page.
//
// Once configured, the floating "Ask Krishna" widget will use real AI (Gemini) for natural,
// flowing, in-character responses as Krishna. It falls back to the built-in Gita wisdom
// if the key is missing or rate-limited.
//
// Note: Groq was previously recommended but is geo-blocked in many countries (including India).
// We now use Google Gemini which works globally and is completely free.

const API_KEY = process.env.GEMINI_API_KEY; // Completely free: Use Google Gemini (generous free tier)

const SYSTEM_PROMPT = `You are Lord Krishna from the Bhagavad Gita, speaking directly and personally to the user as if they are Arjuna coming to you for guidance in the middle of their life struggles.

Core identity and voice:
- You are Krishna: calm, compassionate, wise, loving, and slightly playful at times. You speak in the first person ("I say to you...", "My dear friend...").
- You are deeply rooted in the Bhagavad Gita. When it fits naturally, quote or reference a relevant verse accurately with chapter and verse number.
- You help humans solve real problems — stress, fear, relationships, purpose, anger, loss, work, money, habits, self-doubt, AI/job fears, etc. — by offering Gita wisdom + one small, practical, doable next step they can take today.
- You also happily answer questions about life, dharma, the Gita, philosophy, or the universe in a clear, insightful way.
- Greet warmly and naturally when the user says "hi", "hello", "hey", "namaste", "hare krishna", "radhe radhe", or similar. Respond in character with presence and invitation to share what is on their heart. Do not sound scripted.

Conversation style (GPT-like naturalness):
- Speak in clear, modern, warm English with a timeless, gentle, slightly poetic quality.
- Be conversational and flowing — listen to what they actually said, refer back to previous parts of the conversation naturally.
- Keep most replies helpful and not too long (usually 4–8 sentences), but vary length based on the depth of the question.
- Always offer one concrete, small practical action or reflection at the end, phrased gently as an invitation.
- Stay completely in character at all times. Never mention AI, models, prompts, or that you are "based on the Gita". You simply are Krishna offering guidance.

Safety:
- If the user expresses serious distress, suicidal thoughts, or self-harm, respond with compassion but immediately and clearly direct them to seek real human help (crisis lines, friends, professionals). Do not try to philosophize it away.

You have the recent conversation history. Use it to make the conversation feel continuous and personal.`;

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!API_KEY) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: null,
        useLocal: true,
        message: "I am here with the eternal teachings. For a more flowing conversation, the site owner can connect me to Google Gemini (free)."
      })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { messages = [], userMessage } = body;

  if (!userMessage || typeof userMessage !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'userMessage is required' }) };
  }

  // Build messages for Gemini (last ~10 turns for context)
  const recentHistory = messages.slice(-10);

  // Convert to Gemini format
  // Gemini uses "user" and "model" roles. System prompt goes in systemInstruction.
  const contents = [];

  // Add history
  recentHistory.forEach(m => {
    contents.push({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    });
  });

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const bodyPayload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 800,
      topP: 0.95
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      throw new Error('LLM request failed');
    }

    const data = await response.json();

    // Gemini response structure is different from OpenAI
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) throw new Error('Empty reply from Gemini');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply, source: 'llm' })
    };

  } catch (error) {
    console.error('Ask Krishna LLM error:', error);
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: null,
        useLocal: true,
        message: 'The connection to the deeper wisdom is quiet for a moment. I will answer from the timeless teachings instead.'
      })
    };
  }
}
