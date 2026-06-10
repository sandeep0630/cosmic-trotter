# cosmic-trotter
CosmicTrotter - Travel Through Knowledge

## Ask Krishna (the bot + floating widget)

The "Ask Krishna" experience is available in two forms:

- **Floating widget** (bottom-right on home + most pages) — **fully generative** when configured. This is the main conversational "chat with Krishna like GPT" experience.
- **Full bot page**: https://cosmictrotter.com/ancient-wisdom/ask-krishna-bot.html — richer dedicated UI with voice.

### Floating Widget = Fully Generative Chat with Krishna (GPT-like, completely free)

The floating widget is now designed to feel like a natural, flowing, multi-turn conversation with Lord Krishna himself.

**Completely free only** (recommended):
- Powered by Google Gemini (very generous free tier — millions of tokens/day).
- Strong system prompt that keeps perfect Krishna voice:
  - Warm, natural greetings ("Hi", "Namaste", "Hare Krishna", "Radhe Radhe", etc.)
  - Solves real human problems using wisdom from the Bhagavad Gita + one small practical step
  - Answers questions about life, dharma, the Gita, purpose, relationships, fear, work, etc.
  - Generative, contextual responses that feel alive and personal (true GPT-like experience)
- Always falls back gracefully to the high-quality local Gita wisdom engine.

**Setup (completely free):**
1. Get a free key: https://aistudio.google.com/app/apikey
2. In Netlify dashboard → Environment variables, add: `GEMINI_API_KEY=your_key_here`
3. Redeploy the site.

Detailed configuration steps are also written at the top of `netlify/functions/ask-krishna.js`.

The widget will then use real generative LLM responses for almost everything (including excellent greetings and deep problem-solving). It maintains a rolling conversation history so it feels continuous.

The function is at `netlify/functions/ask-krishna.js` (shared with the full bot page).

### Other improvement ideas (future)
- Streaming responses (word-by-word)
- RAG over the full Bhagavad Gita text
- Voice output (TTS)
- Different modes (verse lookup, story time, guided reflection)
- Per-user chat history (localStorage + optional login)

## Acknowledgments

The site's multilingual support (English ↔ తెలుగు) was one of the trickier pieces. It involved making the Google Translate widget behave reliably for automatic, popup-free translation while keeping custom EN/తెలుగు toggle buttons that actually work across page navigations.

This was achieved through extensive collaborative debugging — detailed console logs, timing experiments, widget bootstrap techniques, fallback translation observers, and persistent iteration until the combo could be forced cleanly without Google surfacing its own language selector.

Huge credit to the human persistence and precise feedback that turned a notoriously flaky integration into something that "just works."

---

*CosmicTrotter is a personal project exploring knowledge, wisdom, and the cosmos.*
