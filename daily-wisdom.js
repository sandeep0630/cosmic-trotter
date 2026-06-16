(function () {
  var WISDOM_BANK = [
    {
      id: 'rig-veda-1-164-46',
      tradition: 'Vedas',
      source: 'Rig Veda 1.164.46',
      teaching: 'Truth is one; the wise describe it in many ways.',
      reflection: 'Do not get trapped by names and forms. Look for the single truth shining through many paths, teachers, and experiences.'
    },
    {
      id: 'rig-veda-10-191-2',
      tradition: 'Vedas',
      source: 'Rig Veda 10.191.2',
      teaching: 'Walk together, speak together, and let your minds move in harmony.',
      reflection: 'Unity is not sameness. It is shared intention, respectful speech, and a willingness to move toward dharma together.'
    },
    {
      id: 'yajur-veda-shanti',
      tradition: 'Vedas',
      source: 'Yajur Veda, Shanti Mantra',
      teaching: 'May there be peace in the heavens, peace in the sky, peace on earth, and peace in all beings.',
      reflection: 'Peace is not only personal calm. It is a way of living that blesses the environment, relationships, speech, and thought.'
    },
    {
      id: 'isha-upanishad-1',
      tradition: 'Upanishads',
      source: 'Isha Upanishad 1',
      teaching: 'All this is pervaded by the Divine; enjoy the world through renunciation.',
      reflection: 'Use what life gives you, but do not clutch it. Sacred living begins when possession becomes stewardship.'
    },
    {
      id: 'katha-upanishad-1-3-14',
      tradition: 'Upanishads',
      source: 'Katha Upanishad 1.3.14',
      teaching: 'Arise, awake, and learn from the wise until the goal is reached.',
      reflection: 'Do not wait for perfect confidence. Wake up, seek good guidance, and keep walking until clarity becomes lived experience.'
    },
    {
      id: 'katha-upanishad-2-3-14',
      tradition: 'Upanishads',
      source: 'Katha Upanishad 2.3.14',
      teaching: 'When the desires in the heart fall away, the mortal discovers the immortal.',
      reflection: 'Freedom is not getting everything the mind wants. Freedom is seeing the Self that remains when craving loosens.'
    },
    {
      id: 'chandogya-upanishad-6-8-7',
      tradition: 'Upanishads',
      source: 'Chandogya Upanishad 6.8.7',
      teaching: 'Tat tvam asi: That sacred reality is your own deepest Self.',
      reflection: 'You are not merely your worry, role, or story. Beneath all change, the same sacred presence lives in you.'
    },
    {
      id: 'brihadaranyaka-upanishad-1-3-28',
      tradition: 'Upanishads',
      source: 'Brihadaranyaka Upanishad 1.3.28',
      teaching: 'Lead me from the unreal to the Real, from darkness to light, from death to immortality.',
      reflection: 'Each day offers this movement: from confusion to truth, from fear to awareness, from temporary identity to the deathless Self.'
    },
    {
      id: 'mundaka-upanishad-3-1-6',
      tradition: 'Upanishads',
      source: 'Mundaka Upanishad 3.1.6',
      teaching: 'Truth alone triumphs.',
      reflection: 'A life built on truth may move slowly, but it moves with strength. Falsehood wins moments; truth wins the soul.'
    },
    {
      id: 'mandukya-upanishad-1',
      tradition: 'Upanishads',
      source: 'Mandukya Upanishad 1',
      teaching: 'Om is all this: past, present, future, and what is beyond time.',
      reflection: 'The sacred sound points to totality. Let the mind become quiet enough to feel life as one whole movement.'
    },
    {
      id: 'taittiriya-upanishad-1-11',
      tradition: 'Upanishads',
      source: 'Taittiriya Upanishad 1.11',
      teaching: 'Speak truth. Practice dharma.',
      reflection: 'Spiritual life does not begin in dramatic visions. It begins in honest speech and right conduct.'
    },
    {
      id: 'bhagavad-gita-2-47',
      tradition: 'Bhagavad Gita',
      source: 'Bhagavad Gita 2.47',
      teaching: 'You have the right to action, but not to control the fruits of action.',
      reflection: 'Give your best to the work in front of you. Let the result belong to the larger order.'
    },
    {
      id: 'bhagavad-gita-2-48',
      tradition: 'Bhagavad Gita',
      source: 'Bhagavad Gita 2.48',
      teaching: 'Remain steady in success and failure; this evenness is yoga.',
      reflection: 'Peace grows when praise and blame no longer throw the mind from side to side.'
    },
    {
      id: 'bhagavad-gita-4-7',
      tradition: 'Bhagavad Gita',
      source: 'Bhagavad Gita 4.7-8',
      teaching: 'Whenever dharma declines, the Divine rises to restore balance.',
      reflection: 'Do not lose faith when disorder becomes visible. Dharma has a way of returning through courage, wisdom, and right action.'
    },
    {
      id: 'bhagavad-gita-6-5',
      tradition: 'Bhagavad Gita',
      source: 'Bhagavad Gita 6.5',
      teaching: 'Lift yourself by your own mind; do not degrade yourself.',
      reflection: 'The mind can be a friend or an enemy. Train it with small truthful actions, not endless self-criticism.'
    },
    {
      id: 'bhagavad-gita-9-27',
      tradition: 'Bhagavad Gita',
      source: 'Bhagavad Gita 9.27',
      teaching: 'Whatever you do, offer it to the Divine.',
      reflection: 'Ordinary work becomes sacred when ego loosens and the heart offers the action upward.'
    },
    {
      id: 'bhagavad-gita-18-66',
      tradition: 'Bhagavad Gita',
      source: 'Bhagavad Gita 18.66',
      teaching: 'Surrender to the Divine without fear.',
      reflection: 'Surrender is not helplessness. It is trusting the highest truth while taking the next dharmic step.'
    },
    {
      id: 'mahabharata-yaksha-prashna',
      tradition: 'Mahabharata',
      source: 'Mahabharata, Yaksha Prashna',
      teaching: 'The greatest wonder is that people see death every day, yet live as though they are permanent.',
      reflection: 'Remembering impermanence can make life brighter, kinder, and more urgent in the right way.'
    },
    {
      id: 'mahabharata-dharma-rakshati',
      tradition: 'Mahabharata',
      source: 'Mahabharata, Dharma Teaching',
      teaching: 'Dharma protects those who protect dharma.',
      reflection: 'When you protect truth, fairness, compassion, and duty, those same forces quietly protect your life.'
    },
    {
      id: 'mahabharata-ahimsa',
      tradition: 'Mahabharata',
      source: 'Mahabharata, Anushasana Parva',
      teaching: 'Non-harm is among the highest forms of dharma.',
      reflection: 'Practice non-harm in speech first. Many battles are prevented before they become actions.'
    },
    {
      id: 'ramayana-rama-dharma',
      tradition: 'Ramayana',
      source: 'Valmiki Ramayana',
      teaching: 'Dharma is lived most clearly when comfort is sacrificed for truth.',
      reflection: 'Rama\'s path reminds us that integrity is not proven when life is easy; it is proven when the heart still chooses what is right.'
    },
    {
      id: 'ramayana-hanuman-devotion',
      tradition: 'Ramayana',
      source: 'Valmiki Ramayana, Sundara Kanda',
      teaching: 'Devotion reveals strength that doubt cannot see.',
      reflection: 'Hanuman remembers his power when he remembers his purpose. When you forget your strength, return to service.'
    },
    {
      id: 'ramayana-sita-patience',
      tradition: 'Ramayana',
      source: 'Valmiki Ramayana',
      teaching: 'Patience rooted in truth becomes inner fire, not weakness.',
      reflection: 'Sita\'s endurance teaches that quiet strength can be brighter than force. Hold truth without losing dignity.'
    },
    {
      id: 'bhagavata-purana-1-2-6',
      tradition: 'Bhagavata Purana',
      source: 'Bhagavata Purana 1.2.6',
      teaching: 'The highest dharma awakens loving devotion to the Divine without selfish motive.',
      reflection: 'Love becomes liberating when it is steady, sincere, and not bargaining for reward.'
    },
    {
      id: 'bhagavata-prahlada',
      tradition: 'Bhagavata Purana',
      source: 'Bhagavata Purana, Prahlada Charitra',
      teaching: 'Faith can remain fearless even inside great opposition.',
      reflection: 'Prahlada shows that devotion is not fragile. When rooted in the heart, it survives pressure from the world.'
    },
    {
      id: 'bhagavata-krishna-heart',
      tradition: 'Bhagavata Purana',
      source: 'Bhagavata Purana, Krishna Lila',
      teaching: 'The Divine meets the heart through love, play, humility, and surrender.',
      reflection: 'Do not make spirituality only heavy. Let wonder, music, friendship, and love also become doorways to God.'
    },
    {
      id: 'shiva-mahapurana-neelakantha',
      tradition: 'Shiva Mahapurana',
      source: 'Shiva Mahapurana, Neelakantha Teaching',
      teaching: 'The wise can hold poison without letting it poison the heart.',
      reflection: 'Shiva\'s blue throat teaches transformation. Do not spread bitterness; contain it, offer it, and let awareness purify it.'
    },
    {
      id: 'shiva-mahapurana-remembrance',
      tradition: 'Shiva Mahapurana',
      source: 'Shiva Mahapurana',
      teaching: 'Sincere remembrance of Shiva burns inner impurity and awakens auspiciousness.',
      reflection: 'A pure moment of remembrance can interrupt a long habit of distraction. Return to the sacred name with sincerity.'
    },
    {
      id: 'shiva-mahapurana-stillness',
      tradition: 'Shiva Mahapurana',
      source: 'Shiva Mahapurana, Yoga Teaching',
      teaching: 'Stillness is not emptiness; it is the presence from which creation dances.',
      reflection: 'When the mind becomes quiet, life does not disappear. It becomes more deeply alive.'
    },
    {
      id: 'vishnu-purana-dharma',
      tradition: 'Purana',
      source: 'Vishnu Purana',
      teaching: 'The Divine sustains the world through order, compassion, and protection.',
      reflection: 'Preservation is sacred work. Care for what is good before it is broken.'
    }
  ];

  var REFLECTION_LENSES = [
    'Let this teaching become a mirror today. Notice where the mind resists it, because that resistance is often the doorway to growth.',
    'Carry this wisdom into one ordinary action. The sacred becomes real when it changes how you speak, choose, work, or forgive.',
    'Today, read this as guidance for the exact situation in front of you, not as an abstract quote. Dharma always asks to be lived.',
    'Let the teaching soften hurry. A calm mind can see the next right action more clearly than a restless mind can.',
    'Use this as a check on attachment. Ask where you are clinging, where you are serving, and where you can release the result.',
    'Let this wisdom bring humility. You do not need to control the whole road; you need to walk the next step cleanly.',
    'Bring this into your relationships today. Sacred knowledge is proven by patience, truthful speech, and compassion under pressure.',
    'Let this teaching train the mind. When old patterns rise, return to this line before reacting.',
    'Hold this as a reminder that inner life and practical life are not separate. Your duty can become worship.',
    'Let this wisdom point you back to the Self beneath mood, fear, success, and failure.'
  ];

  var PRACTICES = [
    'Before sleeping, write one sentence about how you practiced this today.',
    'Pause for three slow breaths before your next important action and remember this teaching.',
    'Choose one conversation today where you will speak with more truth and less ego.',
    'Offer one task today to the Divine before you begin it.',
    'Write down one thing you can control and one thing you must release.',
    'Repeat the source line once in the morning and once at night.',
    'Do one act of service quietly, without announcing it.',
    'When the mind becomes restless, return to the word dharma and choose the cleaner action.',
    'Spend two minutes in silence and ask, "What is the next right step?"',
    'Let one small habit become more sattvic today: food, speech, attention, or work.'
  ];

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function dateKey(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function parseDateKey(value) {
    var match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    var year = Number(match[1]);
    var month = Number(match[2]);
    var day = Number(match[3]);
    var date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
  }

  function addDays(keyOrDate, amount) {
    var date = keyOrDate instanceof Date ? new Date(keyOrDate) : parseDateKey(keyOrDate);
    if (!date) date = new Date();
    date.setDate(date.getDate() + amount);
    return dateKey(date);
  }

  function todayKey() {
    return dateKey(new Date());
  }

  function yesterdayKey() {
    return addDays(todayKey(), -1);
  }

  function compareDateKeys(a, b) {
    return String(a).localeCompare(String(b));
  }

  function isFuture(key) {
    return compareDateKeys(key, todayKey()) > 0;
  }

  function formatDate(keyOrDate) {
    var date = keyOrDate instanceof Date ? keyOrDate : parseDateKey(keyOrDate);
    if (!date) date = new Date();
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function stableIndex(seed, length) {
    var hash = 0;
    for (var i = 0; i < seed.length; i += 1) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % length;
  }

  function fromUrl(fallback) {
    var params = new URLSearchParams(window.location.search);
    var requested = params.get('wisdom');
    var parsed = parseDateKey(requested);
    if (!parsed) return fallback || todayKey();
    var key = dateKey(parsed);
    return isFuture(key) ? todayKey() : key;
  }

  function updateUrl(key, replace) {
    var url = new URL(window.location.href);
    if (key === todayKey()) {
      url.searchParams.delete('wisdom');
    } else {
      url.searchParams.set('wisdom', key);
    }
    var method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', url);
  }

  function wisdomForDate(key) {
    var parsed = parseDateKey(key);
    var safeKey = parsed ? dateKey(parsed) : todayKey();
    if (isFuture(safeKey)) safeKey = todayKey();

    var source = WISDOM_BANK[stableIndex(safeKey + ':source', WISDOM_BANK.length)];
    var lens = REFLECTION_LENSES[stableIndex(safeKey + ':lens', REFLECTION_LENSES.length)];
    var practice = PRACTICES[stableIndex(safeKey + ':practice', PRACTICES.length)];

    return {
      id: 'daily-' + safeKey + '-' + source.id,
      dateKey: safeKey,
      dateLabel: formatDate(safeKey),
      tradition: source.tradition,
      source: source.source,
      teaching: source.teaching,
      reflection: lens + ' Practice: ' + practice,
      baseReflection: source.reflection,
      baseId: source.id,
      generated: true
    };
  }

  function recent(count, endKey) {
    var key = endKey && !isFuture(endKey) ? endKey : todayKey();
    var entries = [];
    for (var i = 0; i < count; i += 1) {
      entries.push(wisdomForDate(addDays(key, -i)));
    }
    return entries;
  }

  window.CosmicDailyWisdom = {
    addDays: addDays,
    compareDateKeys: compareDateKeys,
    dateKey: dateKey,
    formatDate: formatDate,
    fromUrl: fromUrl,
    isFuture: isFuture,
    parseDateKey: parseDateKey,
    recent: recent,
    todayKey: todayKey,
    updateUrl: updateUrl,
    wisdomForDate: wisdomForDate,
    yesterdayKey: yesterdayKey
  };
})();
