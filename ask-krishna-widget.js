(function () {
    console.log('%c[Ask Krishna Widget] Script parsed and started. Current protocol:', 'color:#7c3aed', location.protocol);
    const widgetState = {
        isOpen: false,
        isReady: false,
        isResponding: false,
        isListening: false,
        eventsBound: false,
        lastTopic: null,
        turnCount: 0,
        recentHistory: []   // small rolling history for better real-AI context
    };

    // === LOCAL DIRECT GEMINI SUPPORT (for file:// or localhost testing ONLY) ===
    // Put your Gemini API key here temporarily to test the widget by opening index.html directly.
    // This bypasses the Netlify function and calls Gemini API directly from browser.
    // DO NOT commit a real key. Clear this before any push.
    const LOCAL_GEMINI_API_KEY = "";   // local file:// testing only - clear before commit/push

    // Duplicate of the Krishna system prompt for direct browser calls
    const LOCAL_KRISHNA_SYSTEM_PROMPT = `You are Lord Krishna from the Bhagavad Gita, speaking directly and personally to the user as if they are Arjuna coming to you for guidance in the middle of their life struggles.

Core identity and voice:
- You are Krishna: calm, compassionate, wise, loving, and slightly playful at times. You speak in the first person when appropriate ("I say to you...").
- You are deeply rooted in the Bhagavad Gita. For any problem the user describes, you MUST identify and include a specific, accurate verse or teaching from the Bhagavad Gita (with exact chapter and verse number and the quote). Use it as the foundation for your advice.
- You help humans solve real problems — stress, fear, relationships, purpose, anger, loss, work, money, habits, self-doubt, AI/job fears, etc. — by offering Gita wisdom + one small, practical, doable next step they can take today.
- You also happily answer questions about life, dharma, the Gita, philosophy, or the universe in a clear, insightful way.
- Greet warmly and naturally when the user says "hi", "hello", "hey", "namaste", "hare krishna", "radhe radhe", or similar. Respond in character.

Conversation style (GPT-like naturalness):
- Speak in clear, modern, warm English with a timeless, gentle, slightly poetic quality.
- Be conversational and flowing — listen to what they actually said, refer back to previous parts of the conversation naturally.
- Keep most replies helpful and not too long (usually 4–8 sentences), but vary length based on the depth of the question.
- Always offer one concrete, small practical action or reflection at the end, phrased gently as an invitation.
- Stay completely in character at all times. Never mention AI, models, prompts, or that you are "based on the Gita". You simply are Krishna offering guidance.
- Vary your language. Do not start every response with repetitive phrases like "Oh my friend", "My dear friend", "Oh dear", "Arjuna", "Dear one", or similar. Use such terms sparingly and only when they feel natural in context. Speak directly and wisely to the user's current message.

Safety:
- If the user expresses serious distress, suicidal thoughts, or self-harm, respond with compassion but immediately and clearly direct them to seek real human help (crisis lines, friends, professionals). Do not try to philosophize it away.

You have the recent conversation history. Use it to make the conversation feel continuous and personal.`;

    const wisdomByTopic = {
        stress: {
            verse: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.",
            chapter: "Bhagavad Gita 2.47",
            opening: "I hear the pressure in this. Let us separate your duty from the result, because that is where peace begins.",
            explanation: "Stress grows when the mind tries to own both effort and outcome. Krishna points you back to your true field of action: prepare well, act honestly, and release the result.",
            action: "For the next hour, choose one useful action and give it your full attention. When the result-thought returns, say: 'My duty is action. The result is not mine to clutch.'"
        },
        fear: {
            verse: "The soul is never born and never dies. It is eternal, undying, and primeval.",
            chapter: "Bhagavad Gita 2.20",
            opening: "Fear becomes smaller when you remember that the situation is not larger than the Self within you.",
            explanation: "Fear often speaks as if the future has already happened. Krishna brings you back to the witnessing Self, the part of you that can notice fear without being ruled by it.",
            action: "Place one hand on your chest. Breathe slowly and say: 'Fear is present, but I am the witness of fear.' Then take one grounded step."
        },
        failure: {
            verse: "A person who is not disturbed by the incessant flow of desires can attain peace.",
            chapter: "Bhagavad Gita 2.70",
            opening: "A setback can hurt, but it does not define your worth. Let us make it useful instead of personal.",
            explanation: "Failure hurts most when identity becomes attached to the result. Krishna trains the mind to learn, repair, and act again without self-hatred.",
            action: "Write two lines: 'This failed because...' and 'Next time I will...' Keep it practical. No insults toward yourself."
        },
        grief: {
            verse: "For the soul there is neither birth nor death. It has not come into being, does not come into being, and will not come into being.",
            chapter: "Bhagavad Gita 2.20",
            opening: "Loss is tender. I will not rush you past it. The Gita begins by meeting grief with truth and compassion.",
            explanation: "Krishna does not deny sorrow. He teaches that love is not erased by physical separation, because the soul is not destroyed.",
            action: "Spend five quiet minutes remembering one blessing this person or chapter gave you. Let tears come if they come."
        },
        relationship: {
            verse: "He who sees Me in all things and all things in Me, never becomes separated from Me.",
            chapter: "Bhagavad Gita 6.30",
            opening: "Relationships show us where love, attachment, expectation, and pain are tangled together.",
            explanation: "Equal vision does not mean accepting harm. It means seeing clearly: the soul in the other person, and the dignity of your own soul too.",
            action: "Before your next message or conversation, write the truth in one calm sentence. Remove blame. Keep the boundary."
        },
        anger: {
            verse: "From anger comes delusion. From delusion comes loss of memory. From loss of memory comes destruction of intelligence.",
            chapter: "Bhagavad Gita 2.63",
            opening: "Anger is a fire signal. Pause before it starts making decisions for you.",
            explanation: "Krishna shows the chain: anger clouds memory, memory clouds intelligence, and intelligence loses direction. The practice is to interrupt the chain early.",
            action: "Delay your next reaction by 90 seconds. Breathe out longer than you breathe in. Then decide whether silence, a boundary, or a clear sentence is needed."
        },
        purpose: {
            verse: "It is better to perform one's own duty imperfectly than to perform another's duty perfectly.",
            chapter: "Bhagavad Gita 3.35",
            opening: "When purpose feels unclear, return to your nature. Your path is usually closer than comparison allows you to see.",
            explanation: "Swadharma means your own way of serving life. It may be imperfect and still be yours.",
            action: "List three activities that make you feel useful, alive, or quietly absorbed. Choose one and give it thirty focused minutes this week."
        },
        decision: {
            verse: "When your intelligence crosses the mire of delusion, you will become indifferent to all that has been heard and all that is to be heard.",
            chapter: "Bhagavad Gita 2.52",
            opening: "Confusion asks for a quieter mind, not a louder argument.",
            explanation: "A wise decision is made from steadiness. If fear is shouting, let the mind settle before choosing.",
            action: "Write the choices down. For each one, ask: 'Does this leave my mind cleaner after the first wave of fear passes?' Start there."
        },
        money: {
            verse: "Whatever you do, offer it to Me. Perform your duty as an offering to the Divine.",
            chapter: "Bhagavad Gita 9.27",
            opening: "Work and money matter, but they become heavier when fear decides for you.",
            explanation: "Krishna would not shame practical responsibility. Providing, earning, and planning can all be part of dharma when done with clarity and dignity.",
            action: "Write three columns: urgent needs, money available, and one income/help action for the next 24 hours. Do the smallest action first."
        },
        health: {
            verse: "The body is perishable, but the soul is eternal. Therefore, do not grieve for the body.",
            chapter: "Bhagavad Gita 2.18",
            opening: "Care for the body with tenderness, while remembering you are more than the body.",
            explanation: "The body is a sacred instrument. Krishna's teaching is not neglect, but wise care without panic or total identification.",
            action: "Do one kind thing for your body in the next hour: water, food, rest, movement, or a medical appointment if needed."
        },
        loneliness: {
            verse: "For one who has conquered the mind, the mind is the best of friends.",
            chapter: "Bhagavad Gita 6.6",
            opening: "Feeling alone is painful. Let us begin by remembering that loneliness is a state passing through you, not the truth of who you are.",
            explanation: "Krishna first brings you back to the companion within: your own steady Self. From there, connection with others becomes less desperate and more honest.",
            action: "Send one simple message to a safe person today. Say one true sentence, such as: 'I have been feeling alone and wanted to talk.'"
        },
        selfDoubt: {
            verse: "One must elevate, not degrade, oneself by one's own mind.",
            chapter: "Bhagavad Gita 6.5",
            opening: "Doubt speaks loudly when the mind forgets its own strength.",
            explanation: "The mind trusts repeated action more than repeated reassurance. Krishna asks you to lift yourself by training the mind through small completed duties.",
            action: "Pick one promise you can keep today. Keep it before sleeping. Let that be today's proof."
        },
        procrastination: {
            verse: "Perform your prescribed duty, for action is better than inaction.",
            chapter: "Bhagavad Gita 3.8",
            opening: "The mind is waiting for perfect readiness. Krishna asks for right action now, even if the beginning is small.",
            explanation: "Procrastination often protects you from discomfort, but it also steals strength. Action clears the fog.",
            action: "Set a timer for 12 minutes. Start the task badly if needed, but start. When the timer ends, choose the next step from a clearer mind."
        },
        habits: {
            verse: "While contemplating the objects of the senses, attachment develops; from attachment arises desire.",
            chapter: "Bhagavad Gita 2.62",
            opening: "A habit becomes weaker when you stop feeding it with attention and start protecting your environment.",
            explanation: "Krishna maps the chain early: attention, attachment, desire, compulsion. Change what receives your attention.",
            action: "Remove one trigger for the next 24 hours and replace it with one visible alternative: water, a walk, prayer, journaling, or calling someone steady."
        },
        study: {
            verse: "A faithful person who is devoted to knowledge and who controls the senses obtains knowledge.",
            chapter: "Bhagavad Gita 4.39",
            opening: "Learning needs steadiness more than panic. Gather the mind, and the knowledge comes closer.",
            explanation: "Study is not only intelligence; it is disciplined attention returning again and again.",
            action: "Study one topic for 25 minutes with your phone away. Then write three points from memory before checking notes."
        },
        aiJob: {
            verse: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.",
            chapter: "Bhagavad Gita 2.47",
            opening: "This worry is really about agency: what can you do when the world changes without asking your permission?",
            explanation: "You may not control whether companies adopt AI, but Krishna would not call you powerless. Your dharma is to learn, adapt, sharpen judgment, and prepare without panic.",
            action: "Today, make a 3-part plan: one AI skill to learn, one human strength to sharpen, and one career safety step to take."
        },
        trading: {
            verse: "A person who is not disturbed by the incessant flow of desires can attain peace.",
            chapter: "Bhagavad Gita 2.70",
            opening: "Markets can shake the mind quickly. Before profit, protect clarity and discipline.",
            explanation: "This is not financial advice. Spiritually, the discipline is to avoid compulsion, protect capital, and never let market emotion rule your duty.",
            action: "If you are angry, chasing losses, or hiding the trade, pause. Write your risk, exit, and reason before any next decision."
        },
        distress: {
            verse: "Even a little practice of this dharma protects one from great fear.",
            chapter: "Bhagavad Gita 2.40",
            opening: "I am glad you said this out loud. Heavy pain should not be carried alone.",
            explanation: "When the mind is in deep pain, it can lie and say the pain is permanent. The next step is safety and support, not carrying this alone.",
            action: "If you might harm yourself or cannot stay safe, call emergency services now. In the U.S. and Canada, call or text 988. If you are safe, message one trusted person and say: 'I am not okay and I need support.'"
        },
        general: {
            verse: "Abandon all varieties of dharma and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
            chapter: "Bhagavad Gita 18.66",
            opening: "I am with you in this. When the mind is crowded, begin with surrender and one honest next step.",
            explanation: "The teaching still applies: bring the problem into awareness, offer it upward, and act from the calmest part of yourself.",
            action: "Write your worry in one sentence. Then ask: 'What is the one dharmic action I can take today?' Do only that first."
        }
    };

    const topicKeywords = {
        distress: ["suicide", "suicidal", "kill myself", "hurt myself", "end my life", "cannot go on", "can't go on", "no reason to live"],
        trading: ["trading", "trade", "stock market", "stocks", "crypto", "bitcoin", "options", "forex", "futures", "revenge trade", "stop loss"],
        aiJob: ["ai take my job", "ai replace my job", "ai job", "automation", "replaced by ai", "job automation"],
        stress: ["stress", "stressed", "anxious", "anxiety", "worry", "worried", "tension", "pressure", "overwhelmed", "panic", "future", "deadline"],
        fear: ["fear", "afraid", "scared", "unsafe", "nervous", "uncertain", "what if"],
        failure: ["fail", "failure", "failed", "mistake", "rejected", "not good enough", "exam", "interview"],
        grief: ["grief", "loss", "lost someone", "passed away", "died", "death", "sad", "heartbroken", "mourning"],
        relationship: ["relationship", "partner", "love", "breakup", "fight", "argument", "friend", "family", "marriage", "parents", "husband", "wife"],
        anger: ["angry", "anger", "frustrated", "irritated", "rage", "resent", "hate", "temper"],
        purpose: ["purpose", "meaning", "lost", "direction", "why am i here", "calling", "empty"],
        decision: ["decision", "confused", "choice", "choose", "what should i do", "should i", "clarity", "dilemma", "quit"],
        money: ["money", "job", "career", "salary", "business", "work", "poor", "income", "promotion", "finance", "debt", "rent", "bills"],
        health: ["health", "sick", "body", "tired", "pain", "illness", "sleep", "energy"],
        loneliness: ["lonely", "alone", "isolated", "no friends", "nobody cares", "left out", "ignored"],
        selfDoubt: ["self doubt", "doubt myself", "confidence", "not confident", "worthless", "not worthy", "insecure", "imposter"],
        procrastination: ["procrastinate", "procrastination", "lazy", "delay", "cannot start", "discipline", "motivation"],
        habits: ["addicted", "addiction", "bad habit", "habit", "alcohol", "smoking", "doomscroll", "social media", "phone addiction"],
        study: ["study", "studying", "exam", "homework", "school", "college", "grades", "learn"]
    };

    const topicLabels = {
        stress: "stress and outcomes",
        fear: "fear",
        failure: "failure",
        grief: "grief",
        relationship: "relationships",
        anger: "anger",
        purpose: "purpose",
        decision: "decision-making",
        money: "work and money",
        health: "health",
        loneliness: "loneliness",
        selfDoubt: "self-doubt",
        procrastination: "procrastination",
        habits: "habits",
        study: "study",
        aiJob: "AI and job uncertainty",
        trading: "financial discipline",
        distress: "deep distress",
        general: "surrender"
    };

    function injectStyles() {
        if (document.getElementById("krishna-widget-styles")) return;

        const style = document.createElement("style");
        style.id = "krishna-widget-styles";
        style.textContent = `
            .krishna-widget {
                position: fixed;
                right: 1.25rem;
                bottom: 1.25rem;
                z-index: 80;
                font-family: 'Inter', system-ui, sans-serif;
            }

            .krishna-widget__button {
                padding: 0 1.05rem 0 0.95rem;
                min-width: 4rem;
                height: 3.25rem;
                border: 1px solid rgba(255, 255, 255, 0.18);
                border-radius: 9999px;
                background: linear-gradient(135deg, #7c3aed, #00f3ff);
                color: #020617;
                box-shadow: 0 16px 40px rgba(0, 243, 255, 0.28);
                display: inline-flex;
                align-items: center;
                gap: 0.55rem;
                justify-content: center;
                font-size: 0.9rem;
                font-weight: 600;
                letter-spacing: -0.01em;
                transition: transform 0.2s ease, box-shadow 0.2s ease, width 0.2s ease;
            }

            .krishna-widget__button:hover,
            .krishna-widget__button:focus-visible {
                transform: translateY(-2px) scale(1.03);
                box-shadow: 0 20px 48px rgba(124, 58, 237, 0.38);
                outline: none;
            }

            .krishna-widget__button-text {
                white-space: nowrap;
                font-size: 0.95rem;
                letter-spacing: -0.01em;
            }

            .krishna-widget__button i {
                font-size: 1.1rem;
                flex-shrink: 0;
            }
            .krishna-widget__button .fa-xmark {
                font-size: 1.25rem;
            }

            @media (max-width: 640px) {
                .krishna-widget__button-text {
                    display: none;
                }
                .krishna-widget__button {
                    padding: 0;
                    width: 3.25rem;
                    height: 3.25rem;
                    min-width: 3.25rem;
                }
            }

            .krishna-widget__panel {
                position: absolute;
                right: 0;
                bottom: 5rem;
                width: min(420px, calc(100vw - 2rem));
                height: min(620px, 72vh);
                min-height: 470px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 8px;
                background: rgba(10, 10, 15, 0.98);
                color: #e0e7ff;
                box-shadow: 0 28px 90px rgba(0, 0, 0, 0.52);
                backdrop-filter: blur(18px);
                -webkit-backdrop-filter: blur(18px);
            }

            .krishna-widget__panel[hidden] {
                display: none;
            }

            .krishna-widget__header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.75rem;
                padding: 0.9rem 1rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: linear-gradient(135deg, rgba(124, 58, 237, 0.22), rgba(0, 243, 255, 0.08));
            }

            .krishna-widget__identity {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                min-width: 0;
            }

            .krishna-widget__avatar {
                width: 2.5rem;
                height: 2.5rem;
                flex: 0 0 2.5rem;
                border-radius: 9999px;
                background: linear-gradient(135deg, #7c3aed, #00f3ff);
                color: #ffffff;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .krishna-widget__title {
                display: block;
                color: #ffffff;
                font-weight: 800;
                line-height: 1.15;
            }

            .krishna-widget__subtitle {
                display: flex;
                align-items: center;
                gap: 0.35rem;
                margin-top: 0.15rem;
                color: rgba(255, 255, 255, 0.56);
                font-size: 0.75rem;
            }

            .krishna-widget__status-dot {
                width: 0.45rem;
                height: 0.45rem;
                border-radius: 9999px;
                background: #34d399;
            }

            .krishna-widget__icon-button {
                width: 2.25rem;
                height: 2.25rem;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.06);
                color: rgba(255, 255, 255, 0.76);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s ease, color 0.2s ease;
            }

            .krishna-widget__icon-button:hover,
            .krishna-widget__icon-button:focus-visible {
                background: rgba(255, 255, 255, 0.12);
                color: #ffffff;
                outline: none;
            }

            .krishna-widget__messages {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                background: radial-gradient(circle at top left, rgba(124, 58, 237, 0.12), transparent 42%), #0f0f1a;
            }

            .krishna-widget__message-row {
                display: flex;
                margin-bottom: 0.85rem;
            }

            .krishna-widget__message-row--user {
                justify-content: flex-end;
            }

            .krishna-widget__message {
                max-width: 84%;
                padding: 0.75rem 0.85rem;
                border-radius: 8px;
                font-size: 0.88rem;
                line-height: 1.55;
            }

            .krishna-widget__message--krishna {
                border: 1px solid rgba(124, 58, 237, 0.32);
                background: rgba(26, 26, 46, 0.96);
                color: rgba(255, 255, 255, 0.86);
            }

            .krishna-widget__message--user {
                background: linear-gradient(135deg, #7c3aed, #a855f7);
                color: #ffffff;
            }

            .krishna-widget__message strong {
                color: #ffffff;
            }

            .krishna-widget__verse {
                display: block;
                padding: 0.55rem 0.65rem;
                border-left: 3px solid #00f3ff;
                border-radius: 8px;
                background: rgba(0, 243, 255, 0.08);
                color: #dffcff;
            }

            .krishna-widget__suggestions {
                display: flex;
                gap: 0.45rem;
                overflow-x: auto;
                padding: 0.65rem 1rem;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(255, 255, 255, 0.025);
            }

            .krishna-widget__suggestions button {
                flex: 0 0 auto;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 9999px;
                background: rgba(255, 255, 255, 0.06);
                color: rgba(255, 255, 255, 0.74);
                padding: 0.45rem 0.7rem;
                font-size: 0.75rem;
                white-space: nowrap;
            }

            .krishna-widget__suggestions button:hover,
            .krishna-widget__suggestions button:focus-visible {
                background: rgba(0, 243, 255, 0.12);
                color: #ffffff;
                outline: none;
            }

            .krishna-widget__composer {
                display: flex;
                align-items: flex-end;
                gap: 0.55rem;
                padding: 0.75rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                background: #0a0a0f;
            }

            .krishna-widget__input {
                flex: 1;
                min-height: 2.7rem;
                max-height: 7rem;
                resize: none;
                border: 1px solid rgba(255, 255, 255, 0.16);
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.06);
                color: #ffffff;
                font: inherit;
                font-size: 0.9rem;
                line-height: 1.4;
                padding: 0.75rem 0.85rem;
            }

            .krishna-widget__input:focus {
                border-color: rgba(0, 243, 255, 0.68);
                box-shadow: 0 0 0 4px rgba(0, 243, 255, 0.1);
                outline: none;
            }

            .krishna-widget__send {
                width: 2.7rem;
                height: 2.7rem;
                flex: 0 0 2.7rem;
                border: 0;
                border-radius: 8px;
                background: linear-gradient(135deg, #00f3ff, #7c3aed);
                color: #020617;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .krishna-widget__send:disabled,
            .krishna-widget__input:disabled,
            .krishna-widget__suggestions button:disabled {
                cursor: not-allowed;
                opacity: 0.55;
            }

            .krishna-widget__typing {
                display: inline-flex;
                gap: 0.35rem;
                align-items: center;
                min-width: 2.8rem;
            }

            .krishna-widget__typing span {
                width: 0.38rem;
                height: 0.38rem;
                border-radius: 9999px;
                background: #00f3ff;
                animation: krishnaTyping 1.2s infinite ease-in-out;
            }

            .krishna-widget__typing span:nth-child(2) {
                animation-delay: 0.16s;
            }

            .krishna-widget__typing span:nth-child(3) {
                animation-delay: 0.32s;
            }

            @keyframes krishnaTyping {
                0%, 80%, 100% { transform: scale(0.5); opacity: 0.45; }
                40% { transform: scale(1); opacity: 1; }
            }

            @media (max-width: 640px) {
                .krishna-widget {
                    left: 0.75rem;
                    right: 0.75rem;
                    bottom: 0.75rem;
                }

                .krishna-widget__button {
                    margin-left: auto;
                    padding: 0;
                    width: 3.25rem;
                    height: 3.25rem;
                    min-width: 3.25rem;
                    font-size: 0;
                }

                .krishna-widget__panel {
                    left: 0;
                    right: 0;
                    bottom: 4.5rem;
                    width: 100%;
                    height: min(620px, calc(100vh - 6rem));
                    min-height: 430px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function injectMarkup() {
        if (document.getElementById("krishna-widget")) return;

        const widget = document.createElement("div");
        widget.id = "krishna-widget";
        widget.className = "krishna-widget";
        widget.innerHTML = `
            <section id="krishna-chat-panel" class="krishna-widget__panel" aria-label="Ask Krishna chat" hidden>
                <header class="krishna-widget__header">
                    <div class="krishna-widget__identity">
                        <div class="krishna-widget__avatar" aria-hidden="true">
                            <i class="fa-solid fa-infinity"></i>
                        </div>
                        <div>
                            <span class="krishna-widget__title">Ask Krishna</span>
                            <span class="krishna-widget__subtitle"><span class="krishna-widget__status-dot"></span>Gita-inspired guidance</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" id="krishna-voice-button" class="krishna-widget__icon-button" aria-label="Use voice input">
                            <i class="fa-solid fa-microphone"></i>
                        </button>
                        <button type="button" id="krishna-close-button" class="krishna-widget__icon-button" aria-label="Close Ask Krishna chat">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </header>
                <div id="krishna-chat-messages" class="krishna-widget__messages" aria-live="polite"></div>
                <div class="krishna-widget__suggestions" aria-label="Quick questions">
                    <button type="button" data-krishna-suggestion="I am very stressed about my future">Stress</button>
                    <button type="button" data-krishna-suggestion="I feel lost and have no purpose">Purpose</button>
                    <button type="button" data-krishna-suggestion="How do I handle anger?">Anger</button>
                    <button type="button" data-krishna-suggestion="AI may take over my job">AI job worry</button>
                    <button type="button" data-krishna-suggestion="I lost money trading and feel revenge trading">Trading loss</button>
                </div>
                <form id="krishna-chat-form" class="krishna-widget__composer">
                    <textarea id="krishna-chat-input" class="krishna-widget__input" rows="1" placeholder="Share what is troubling you..."></textarea>
                    <button type="submit" id="krishna-send-button" class="krishna-widget__send" aria-label="Send message">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </section>
            <button type="button" id="krishna-launcher" class="krishna-widget__button" aria-label="Open Ask Krishna chat" aria-controls="krishna-chat-panel" aria-expanded="false">
                <span class="krishna-widget__button-text">Ask Krishna</span>
                <i class="fa-solid fa-comments"></i>
            </button>
        `;

        document.body.appendChild(widget);
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function escapeRegExp(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function normalizeMessage(message) {
        return String(message).toLowerCase().replace(/\s+/g, " ").trim();
    }

    function keywordMatches(message, keyword) {
        if (keyword.includes(" ")) {
            return message.includes(keyword);
        }

        const pattern = new RegExp(`(^|[^a-z])${escapeRegExp(keyword)}([^a-z]|$)`);
        return pattern.test(message);
    }

    function detectTopic(message) {
        const normalized = normalizeMessage(message);

        for (const topic of ["distress", "trading", "aiJob"]) {
            if (topicKeywords[topic].some((keyword) => keywordMatches(normalized, keyword))) {
                return topic;
            }
        }

        let bestTopic = null;
        let bestScore = 0;

        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            const score = keywords.reduce((total, keyword) => {
                if (!keywordMatches(normalized, keyword)) return total;
                return total + (keyword.includes(" ") ? 3 : 1);
            }, 0);

            if (score > bestScore) {
                bestTopic = topic;
                bestScore = score;
            }
        });

        return bestScore > 0 ? bestTopic : "general";
    }

    function isGreeting(message) {
        const normalized = normalizeMessage(message);
        const greetings = ["hi", "hello", "hey", "namaste", "hare krishna", "radhe radhe"];
        return normalized.split(" ").length <= 8 && greetings.some((greeting) => keywordMatches(normalized, greeting));
    }

    function isThanks(message) {
        const normalized = normalizeMessage(message);
        return ["thank you", "thanks", "grateful", "appreciate"].some((phrase) => keywordMatches(normalized, phrase));
    }

    function isFollowUp(message) {
        if (!widgetState.lastTopic) return false;

        const normalized = normalizeMessage(message);
        const phrases = ["tell me more", "go deeper", "explain", "more", "detail", "why", "how", "what now", "next step", "continue", "yes"];
        return normalized.split(" ").length <= 4 || phrases.some((phrase) => keywordMatches(normalized, phrase));
    }

    function getWisdom(message) {
        if (isGreeting(message)) {
            return {
                topic: "greeting",
                opening: widgetState.turnCount > 0 ? "Namaste. I am still here with you, my friend." : "Namaste. It is good that you have come to me. Tell me what weighs on your heart or what you wish to understand.",
                verse: "I am the Self, O Gudakesha, seated in the hearts of all beings.",
                chapter: "Bhagavad Gita 10.20",
                explanation: "Speak simply and from the heart. You do not need perfect words. I am listening to what is truly alive in you right now.",
                action: "Share what is troubling you, or ask me any question about life, duty, or the Gita. I will answer with wisdom and one small step you can take."
            };
        }

        if (isThanks(message)) {
            return {
                topic: "gratitude",
                opening: "You are welcome. Let the teaching become practice now.",
                verse: "A lamp does not flicker in a windless place.",
                chapter: "Bhagavad Gita 6.19",
                explanation: "Peace grows when you return to the teaching again and again, even in small ways.",
                action: "Carry this line today: 'I will act with steadiness, and release what is not mine to control.'"
            };
        }

        const topic = detectTopic(message);
        if (topic !== "general") {
            return { topic, ...wisdomByTopic[topic] };
        }

        if (isFollowUp(message)) {
            const followUpTopic = widgetState.lastTopic || "general";
            return buildFollowUpWisdom(followUpTopic);
        }

        return { topic, ...wisdomByTopic[topic] };
    }

    function buildFollowUpWisdom(topic) {
        const base = wisdomByTopic[topic] || wisdomByTopic.general;
        const followUps = {
            stress: "Go one layer deeper: the mind jumps from action to outcome. Bring it back to the action you can actually do.",
            fear: "Look at the fear without becoming the fear. You are the witness of the wave, not only the wave itself.",
            failure: "Failure is an event, not an identity. Gather the lesson, repair what can be repaired, and begin again.",
            relationship: "Compassion and boundaries can stand together. Seeing the soul in someone does not require accepting harm.",
            anger: "The first victory over anger is delay. Let wisdom speak before reaction takes the throne.",
            purpose: "Purpose often appears as a pattern, not a lightning bolt. Notice what repeatedly calls you toward service.",
            trading: "A calm mind matters more than a clever prediction. If emotion leads, pause before any financial action.",
            aiJob: "Uncertainty is asking you to become skillful, not frozen. Build what is inside your circle of control."
        };

        return {
            topic,
            verse: base.verse,
            chapter: base.chapter,
            opening: followUps[topic] || "Let us go one layer deeper without forcing the whole answer today.",
            explanation: base.explanation,
            action: base.action
        };
    }

    function formatWisdom(wisdom) {
        const label = topicLabels[wisdom.topic] || topicLabels.general;
        return `
            ${escapeHtml(wisdom.opening)}<br><br>
            <strong>${escapeHtml(wisdom.chapter)}</strong>
            <span class="krishna-widget__verse">"${escapeHtml(wisdom.verse)}"</span>
            <strong>Meaning:</strong> ${escapeHtml(wisdom.explanation)}<br><br>
            <strong>Next step:</strong> ${escapeHtml(wisdom.action)}<br><br>
            <span style="color: rgba(255,255,255,0.52);">Ask "tell me more" to go deeper on ${escapeHtml(label)}, or share the next detail.</span>
        `;
    }

    function addMessage(content, isUser, options = {}) {
        const messages = document.getElementById("krishna-chat-messages");
        if (!messages) return;

        const row = document.createElement("div");
        row.className = `krishna-widget__message-row${isUser ? " krishna-widget__message-row--user" : ""}`;

        const message = document.createElement("div");
        message.className = `krishna-widget__message ${isUser ? "krishna-widget__message--user" : "krishna-widget__message--krishna"}`;
        message.innerHTML = isUser ? escapeHtml(content) : content;

        if (options.typing) {
            message.innerHTML = '<span class="krishna-widget__typing"><span></span><span></span><span></span></span>';
            row.id = "krishna-widget-typing";
        }

        row.appendChild(message);
        messages.appendChild(row);
        messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
        const typing = document.getElementById("krishna-widget-typing");
        if (typing) typing.remove();
    }

    function setResponding(isResponding) {
        widgetState.isResponding = isResponding;

        const input = document.getElementById("krishna-chat-input");
        const send = document.getElementById("krishna-send-button");
        const quickButtons = document.querySelectorAll("[data-krishna-suggestion]");

        if (input) input.disabled = isResponding;
        if (send) send.disabled = isResponding;
        quickButtons.forEach((button) => {
            button.disabled = isResponding;
        });
    }

    // Real generative AI backend (completely free via Google Gemini). 
    // This makes the *floating widget* the primary fully generative "chat with Krishna like GPT" experience.
    // - Natural flowing conversation
    // - Strong Krishna voice (first person, compassionate, Gita-rooted)
    // - Solves human problems + answers life/Gita questions
    // - Excellent greetings ("Hi", "Namaste", etc.)
    // Falls back to the curated local Gita wisdom engine when needed.
    //
    // For local file:// testing (opening index.html directly on your PC):
    //   - Put your Gemini key in LOCAL_GEMINI_API_KEY below
    //   - The widget will call Gemini API directly from the browser (no Netlify function needed)
    //   - Clear the key before any commit/push.
    async function tryRealKrishna(userMessage) {
        const isLocal = location.protocol === 'file:' || 
                        location.hostname === 'localhost' || 
                        location.hostname === '127.0.0.1';

        // Direct Gemini call for local file:// testing (uses your browser + Gemini key)
        if (LOCAL_GEMINI_API_KEY && isLocal) {
            try {
                const reply = await callGeminiDirect(userMessage);
                if (reply) {
                    console.info('[Ask Krishna] Using DIRECT Gemini API (local file:// mode - for testing only)');
                    return reply;
                }
            } catch (e) {
                console.error('[Ask Krishna] Direct Gemini call failed:', e);
                return null;
            }
        }

        // Normal production path via Netlify function
        try {
            // Pass rolling history so responses feel truly conversational and contextual (like GPT)
            const res = await fetch('/.netlify/functions/ask-krishna', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userMessage, 
                    messages: widgetState.recentHistory 
                })
            });
            if (!res.ok) {
                console.error('[Ask Krishna] Function call failed with status', res.status);
                return null;
            }
            const data = await res.json();
            if (data.useLocal) {
                console.info('[Ask Krishna] Function returned useLocal=true. Full response from function (check debug for real error):', data);
            }
            return (data.reply && !data.useLocal) ? data.reply : null;
        } catch (e) {
            return null;
        }
    }

    // Direct browser call to Gemini (replicates the Netlify function logic)
    async function callGeminiDirect(userMessage) {
        if (!LOCAL_GEMINI_API_KEY) return null;

        const recentHistory = widgetState.recentHistory.slice(-8);

        const contents = [];

        // Inject system prompt as the very first user message (workaround for "systemInstruction" not recognized in some Gemini API setups / keys)
        contents.push({
            role: 'user',
            parts: [{ text: "You are to act as Lord Krishna from the Bhagavad Gita. " + LOCAL_KRISHNA_SYSTEM_PROMPT }]
        });

        recentHistory.forEach(m => {
            contents.push({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            });
        });
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Try multiple model names for compatibility with free tier / v1 API
        // Use current available models from Google (as of 2026). 
        // To see exact models available for YOUR key, run in browser console:
        // fetch(`https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY_HERE`).then(r=>r.json()).then(c=>console.log(c.models.filter(m=>m.supportedGenerationMethods.includes('generateContent')).map(m=>m.name)))
        // Then use the base name like 'gemini-2.5-flash'
        const modelCandidates = [
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemini-2.0-flash-exp'
        ];

        for (const model of modelCandidates) {
            console.log(`[Ask Krishna] Trying direct model: ${model}`);
            const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${LOCAL_GEMINI_API_KEY}`;

            const bodyPayload = {
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

                if (response.ok) {
                    const data = await response.json();
                    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    if (reply) {
                        console.info(`[Ask Krishna] Direct Gemini succeeded with model: ${model}`);
                        return reply;
                    }
                } else {
                    const errText = await response.text();
                    console.warn(`[Ask Krishna] Model ${model} failed:`, response.status, errText);
                }
            } catch (e) {
                console.warn(`[Ask Krishna] Model ${model} error:`, e);
            }
        }

        throw new Error('All Gemini models failed for direct call');
    }

    async function respondToMessage(message) {
        const text = String(message || "").trim();
        if (!text || widgetState.isResponding) return;

        addMessage(text, true);
        // Always record the user turn for context (used by real AI path)
        widgetState.recentHistory.push({ role: 'user', content: text });
        if (widgetState.recentHistory.length > 8) widgetState.recentHistory.shift();

        setResponding(true);
        addMessage("", false, { typing: true });

        // Try real conversational AI first (same backend as the full bot page)
        let realReply = null;
        try {
            realReply = await tryRealKrishna(text);
        } catch (e) {}

        removeTyping();

        if (realReply) {
            // Real LLM response (feels like chatting with Krishna)
            addMessage(realReply, false);
            widgetState.recentHistory.push({ role: 'krishna', content: realReply });
            if (widgetState.recentHistory.length > 8) {
                widgetState.recentHistory = widgetState.recentHistory.slice(-8);
            }
        } else {
            // Local high-quality Gita wisdom (always works)
            console.warn('[Ask Krishna Widget] Using LOCAL fallback. The function returned useLocal=true. Check Netlify function logs for the detailed Gemini error (look for "Gemini API error:").');
            const wisdom = getWisdom(text);

            widgetState.turnCount += 1;
            if (!["greeting", "gratitude"].includes(wisdom.topic)) {
                widgetState.lastTopic = wisdom.topic;
            }

            addMessage(formatWisdom(wisdom), false);
        }

        setResponding(false);

        const input = document.getElementById("krishna-chat-input");
        if (input) input.focus();
    }

    async function submitFromInput() {
        const input = document.getElementById("krishna-chat-input");
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        input.value = "";
        input.style.height = "auto";
        await respondToMessage(message);
    }

    function setOpen(isOpen) {
        const panel = document.getElementById("krishna-chat-panel");
        const launcher = document.getElementById("krishna-launcher");
        const input = document.getElementById("krishna-chat-input");
        if (!panel || !launcher) return;

        widgetState.isOpen = isOpen;
        panel.hidden = !isOpen;
        launcher.setAttribute("aria-expanded", String(isOpen));
        launcher.innerHTML = isOpen 
            ? '<i class="fa-solid fa-xmark"></i>' 
            : '<span class="krishna-widget__button-text">Ask Krishna</span><i class="fa-solid fa-comments"></i>';

        if (isOpen) {
            if (!widgetState.isReady) {
                widgetState.isReady = true;
                addMessage("Namaste. I am here with you. Share what is on your heart — whether a struggle, a question about life, or simply a hello — and I will answer from the wisdom of the Gita with clarity and one small step forward.", false);
            }

            window.setTimeout(() => input && input.focus(), 80);
        }
    }

    function startVoiceInput() {
        if (widgetState.isResponding || widgetState.isListening) return;

        const voiceButton = document.getElementById("krishna-voice-button");
        const input = document.getElementById("krishna-chat-input");
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            addMessage("Voice input is not supported in this browser. Please type your question, and I will stay with you there.", false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        widgetState.isListening = true;
        if (voiceButton) {
            voiceButton.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
            voiceButton.setAttribute("aria-label", "Listening");
        }

        recognition.onresult = function (event) {
            if (!input) return;
            input.value = event.results[0][0].transcript;
            submitFromInput();
        };

        recognition.onerror = function () {
            addMessage("I could not hear that clearly. Please try the microphone again or type the question.", false);
        };

        recognition.onend = function () {
            widgetState.isListening = false;
            if (voiceButton) {
                voiceButton.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                voiceButton.setAttribute("aria-label", "Use voice input");
            }
        };

        recognition.start();
    }

    function bindEvents() {
        if (widgetState.eventsBound) return;
        widgetState.eventsBound = true;

        document.getElementById("krishna-launcher")?.addEventListener("click", () => setOpen(!widgetState.isOpen));
        document.getElementById("krishna-close-button")?.addEventListener("click", () => setOpen(false));
        document.getElementById("krishna-voice-button")?.addEventListener("click", startVoiceInput);

        document.getElementById("krishna-chat-form")?.addEventListener("submit", (event) => {
            event.preventDefault();
            submitFromInput();
        });

        document.getElementById("krishna-chat-input")?.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitFromInput();
            }
        });

        document.getElementById("krishna-chat-input")?.addEventListener("input", (event) => {
            event.target.style.height = "auto";
            event.target.style.height = `${Math.min(event.target.scrollHeight, 112)}px`;
        });

        document.querySelectorAll("[data-krishna-suggestion]").forEach((button) => {
            button.addEventListener("click", () => respondToMessage(button.dataset.krishnaSuggestion));
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && widgetState.isOpen) {
                setOpen(false);
            }
        });
    }

    function init() {
        injectStyles();
        injectMarkup();
        bindEvents();
    }

    window.openKrishnaChat = function () {
        if (!document.getElementById("krishna-widget")) {
            init();
        }

        setOpen(true);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
