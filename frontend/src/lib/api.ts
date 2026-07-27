/**
 * API client - wraps fetch with base URL and X-User-ID header.
 * Local dev uses Next.js rewrites to FastAPI backend (http://127.0.0.1:8000).
 * If backend endpoint is offline or 404s (e.g. static host), falls back gracefully.
 */

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const API_BASE = configuredApiUrl ? `${configuredApiUrl}/api/v1` : "/api/v1";

interface FetchOptions extends RequestInit {
  userId?: number;
}

// Memory cache for active course in fallback mode with localStorage persistence
let fallbackActiveCourseId = 1;
let fallbackUserGems = 1500;
let fallbackUserHearts = 5;

function getActiveCourseId(): number {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("duo_active_course_id");
    if (saved) return parseInt(saved, 10);
  }
  return fallbackActiveCourseId;
}

function setActiveCourseId(id: number): void {
  fallbackActiveCourseId = id;
  if (typeof window !== "undefined") {
    localStorage.setItem("duo_active_course_id", String(id));
  }
}

const LANGUAGE_EXERCISES: Record<number, typeof FALLBACK_EXERCISES> = {
  1: [ // Spanish
    {
      id: 1, order: 1, type: "multiple_choice",
      prompt: 'Which one of these means "hello"?', target_sentence: "Hola",
      options: [
        { text: "Hola", icon: "👋", hint: "Used as a friendly informal & formal greeting." },
        { text: "Buenos días", icon: "☕", hint: "Morning greeting until noon." },
        { text: "Gracias", icon: "🥪", hint: "Expression of gratitude." },
        { text: "Por favor", icon: "🙏", hint: "Polite request expression." },
      ],
    },
    {
      id: 2, order: 2, type: "image_choice",
      prompt: 'Select the correct image for "el café" (coffee)', target_sentence: "El café",
      image_options: [
        { id: "c1", label: "El café", icon: "☕" },
        { id: "c2", label: "El pan", icon: "🍞" },
        { id: "c3", label: "El agua", icon: "💧" },
        { id: "c4", label: "La leche", icon: "🥛" },
      ],
    },
    {
      id: 3, order: 3, type: "word_bank",
      prompt: 'Translate to English: "Yo quiero agua, por favor"', target_sentence: "Yo quiero agua, por favor",
      sentence_parts: ["I", "want", "water", "please", "hello", "coffee", "thank you"],
    },
    {
      id: 4, order: 4, type: "fill_blank",
      prompt: "Complete the sentence with the correct verb", target_sentence: "Ella ___ una manzana cada mañana",
      sentence_parts: ["come", "bebe", "corre", "habla"],
    },
    {
      id: 5, order: 5, type: "match_pairs",
      prompt: "Tap the matching pairs of words", target_sentence: "Matching Pairs",
      pairs: [
        { left: "Hola", right: "Hello" },
        { left: "Gracias", right: "Thank you" },
        { left: "Por favor", right: "Please" },
        { left: "Agua", right: "Water" },
      ],
    },
    {
      id: 6, order: 6, type: "type_answer",
      prompt: 'Type in Spanish: "Good morning, how are you?"', target_sentence: "Buenos días, ¿cómo estás?",
    },
    {
      id: 7, order: 7, type: "word_bank",
      prompt: 'Translate to Spanish: "A coffee and bread, please"', target_sentence: "Un café y pan, por favor",
      sentence_parts: ["Un", "café", "y", "pan", "por", "favor", "hola", "gracias"],
    },
    {
      id: 8, order: 8, type: "multiple_choice",
      prompt: 'How do you say "Thank you very much"?', target_sentence: "Muchas gracias",
      options: [
        { text: "Muchas gracias", icon: "🙏", hint: "Expresses deep gratitude." },
        { text: "De nada", icon: "🤝", hint: "You're welcome." },
        { text: "Hasta luego", icon: "👋", hint: "See you later." },
        { text: "Lo siento", icon: "😔", hint: "I'm sorry." },
      ],
    },
  ],
  2: [ // French
    {
      id: 1, order: 1, type: "multiple_choice",
      prompt: 'Which one of these means "hello"?', target_sentence: "Bonjour",
      options: [
        { text: "Bonjour", icon: "👋", hint: "Standard French greeting." },
        { text: "Bonsoir", icon: "🌙", hint: "Evening greeting." },
        { text: "Merci", icon: "🙏", hint: "Thank you." },
        { text: "S'il vous plaît", icon: "☕", hint: "Please." },
      ],
    },
    {
      id: 2, order: 2, type: "image_choice",
      prompt: 'Select the correct image for "le café" (coffee)', target_sentence: "Le café",
      image_options: [
        { id: "f1", label: "Le café", icon: "☕" },
        { id: "f2", label: "Le croissant", icon: "🥐" },
        { id: "f3", label: "L'eau", icon: "💧" },
        { id: "f4", label: "Le fromage", icon: "🧀" },
      ],
    },
    {
      id: 3, order: 3, type: "word_bank",
      prompt: 'Translate to English: "Je veux de l\'eau, s\'il vous plaît"', target_sentence: "Je veux de l'eau, s'il vous plaît",
      sentence_parts: ["I", "want", "some", "water", "please", "bread", "coffee"],
    },
    {
      id: 4, order: 4, type: "fill_blank",
      prompt: "Complete the French sentence", target_sentence: "Elle ___ une pomme le matin",
      sentence_parts: ["mange", "boit", "parle", "court"],
    },
    {
      id: 5, order: 5, type: "match_pairs",
      prompt: "Tap the matching pairs of words", target_sentence: "Matching Pairs",
      pairs: [
        { left: "Bonjour", right: "Hello" },
        { left: "Merci", right: "Thank you" },
        { left: "Oui", right: "Yes" },
        { left: "Eau", right: "Water" },
      ],
    },
    {
      id: 6, order: 6, type: "type_answer",
      prompt: 'Type in French: "Thank you very much"', target_sentence: "Merci beaucoup",
    },
    {
      id: 7, order: 7, type: "word_bank",
      prompt: 'Translate to French: "A coffee and bread, please"', target_sentence: "Un café et du pain, s'il vous plaît",
      sentence_parts: ["Un", "café", "et", "du", "pain", "s'il", "vous", "plaît"],
    },
    {
      id: 8, order: 8, type: "multiple_choice",
      prompt: 'How do you say "Goodbye" in French?', target_sentence: "Au revoir",
      options: [
        { text: "Au revoir", icon: "👋", hint: "Standard goodbye expression." },
        { text: "À bientôt", icon: "⌛", hint: "See you soon." },
        { text: "Pardon", icon: "🙏", hint: "Excuse me / sorry." },
        { text: "Salut", icon: "🤝", hint: "Hi / bye (informal)." },
      ],
    },
  ],
  3: [ // German
    {
      id: 1, order: 1, type: "multiple_choice",
      prompt: 'Which one of these means "hello"?', target_sentence: "Hallo",
      options: [
        { text: "Hallo", icon: "👋", hint: "Friendly German greeting." },
        { text: "Guten Morgen", icon: "☕", hint: "Good morning." },
        { text: "Danke", icon: "🙏", hint: "Thank you." },
        { text: "Bitte", icon: "🤝", hint: "Please / You're welcome." },
      ],
    },
    {
      id: 2, order: 2, type: "image_choice",
      prompt: 'Select the correct image for "der Kaffee" (coffee)', target_sentence: "Der Kaffee",
      image_options: [
        { id: "g1", label: "Der Kaffee", icon: "☕" },
        { id: "g2", label: "Das Brot", icon: "🍞" },
        { id: "g3", label: "Das Wasser", icon: "💧" },
        { id: "g4", label: "Die Milch", icon: "🥛" },
      ],
    },
    {
      id: 3, order: 3, type: "word_bank",
      prompt: 'Translate to English: "Ich möchte Wasser, bitte"', target_sentence: "Ich möchte Wasser, bitte",
      sentence_parts: ["I", "would like", "water", "please", "tea", "bread", "thanks"],
    },
    {
      id: 4, order: 4, type: "fill_blank",
      prompt: "Complete the German sentence", target_sentence: "Er ___ einen Apfel jeden Tag",
      sentence_parts: ["isst", "trinkt", "spielt", "läuft"],
    },
    {
      id: 5, order: 5, type: "match_pairs",
      prompt: "Tap the matching pairs of words", target_sentence: "Matching Pairs",
      pairs: [
        { left: "Hallo", right: "Hello" },
        { left: "Danke", right: "Thank you" },
        { left: "Bitte", right: "Please" },
        { left: "Wasser", right: "Water" },
      ],
    },
    {
      id: 6, order: 6, type: "type_answer",
      prompt: 'Type in German: "Thank you very much"', target_sentence: "Vielen Dank",
    },
    {
      id: 7, order: 7, type: "word_bank",
      prompt: 'Translate to German: "A coffee and bread, please"', target_sentence: "Ein Kaffee und Brot, bitte",
      sentence_parts: ["Ein", "Kaffee", "und", "Brot", "bitte", "Wasser", "Tee"],
    },
    {
      id: 8, order: 8, type: "multiple_choice",
      prompt: 'How do you say "Goodbye" in German?', target_sentence: "Auf Wiedersehen",
      options: [
        { text: "Auf Wiedersehen", icon: "👋", hint: "Formal goodbye." },
        { text: "Tschüss", icon: "😃", hint: "Informal bye." },
        { text: "Entschuldigung", icon: "🙏", hint: "Excuse me." },
        { text: "Gute Nacht", icon: "🌙", hint: "Good night." },
      ],
    },
  ],
  4: [ // Japanese
    {
      id: 1, order: 1, type: "multiple_choice",
      prompt: 'Which one of these means "hello"?', target_sentence: "こんにちは (Konnichiwa)",
      options: [
        { text: "こんにちは", icon: "👋", hint: "Standard afternoon greeting." },
        { text: "おはようございます", icon: "☕", hint: "Good morning (polite)." },
        { text: "ありがとう", icon: "🙏", hint: "Thank you." },
        { text: "すみません", icon: "🤝", hint: "Excuse me." },
      ],
    },
    {
      id: 2, order: 2, type: "image_choice",
      prompt: 'Select the correct image for "お茶" (tea/beverage)', target_sentence: "お茶",
      image_options: [
        { id: "j1", label: "お茶 (Tea)", icon: "🍵" },
        { id: "j2", label: "パン (Bread)", icon: "🍞" },
        { id: "j3", label: "水 (Water)", icon: "💧" },
        { id: "j4", label: "ご飯 (Rice)", icon: "🍚" },
      ],
    },
    {
      id: 3, order: 3, type: "word_bank",
      prompt: 'Translate to English: "水をください (Mizu wo kudasai)"', target_sentence: "水をください",
      sentence_parts: ["Water", "please", "I", "want", "tea", "thanks", "hello"],
    },
    {
      id: 4, order: 4, type: "fill_blank",
      prompt: "Complete the Japanese sentence", target_sentence: "私はりんごを ___ ます",
      sentence_parts: ["食べ", "飲み", "行き", "話し"],
    },
    {
      id: 5, order: 5, type: "match_pairs",
      prompt: "Tap the matching pairs of Japanese words", target_sentence: "Matching Pairs",
      pairs: [
        { left: "こんにちは", right: "Hello" },
        { left: "ありがとう", right: "Thank you" },
        { left: "水", right: "Water" },
        { left: "お茶", right: "Tea" },
      ],
    },
    {
      id: 6, order: 6, type: "type_answer",
      prompt: 'Type in Japanese: "Thank you very much"', target_sentence: "ありがとうございます",
    },
    {
      id: 7, order: 7, type: "word_bank",
      prompt: 'Translate to Japanese: "Tea and bread, please"', target_sentence: "お茶 と パン を ください",
      sentence_parts: ["お茶", "と", "パン", "を", "ください", "水", "これ"],
    },
    {
      id: 8, order: 8, type: "multiple_choice",
      prompt: 'How do you say "Goodbye" in Japanese?', target_sentence: "さようなら (Sayounara)",
      options: [
        { text: "さようなら", icon: "👋", hint: "Goodbye." },
        { text: "またね", icon: "😃", hint: "See you later." },
        { text: "いただきます", icon: "🥢", hint: "Said before meals." },
        { text: "ごちそうさま", icon: "🙏", hint: "Said after meals." },
      ],
    },
  ],
  5: [ // Italian
    {
      id: 1, order: 1, type: "multiple_choice",
      prompt: 'Which one of these means "hello"?', target_sentence: "Ciao",
      options: [
        { text: "Ciao", icon: "👋", hint: "Informal hi & bye." },
        { text: "Buongiorno", icon: "☕", hint: "Good morning." },
        { text: "Grazie", icon: "🙏", hint: "Thank you." },
        { text: "Per favore", icon: "🤝", hint: "Please." },
      ],
    },
    {
      id: 2, order: 2, type: "image_choice",
      prompt: 'Select the correct image for "il caffè" (coffee)', target_sentence: "Il caffè",
      image_options: [
        { id: "i1", label: "Il caffè", icon: "☕" },
        { id: "i2", label: "Il pane", icon: "🍞" },
        { id: "i3", label: "L'acqua", icon: "💧" },
        { id: "i4", label: "Il gelato", icon: "🍦" },
      ],
    },
    {
      id: 3, order: 3, type: "word_bank",
      prompt: 'Translate to English: "Vorrei dell\'acqua, per favore"', target_sentence: "Vorrei dell'acqua, per favore",
      sentence_parts: ["I", "would like", "some", "water", "please", "coffee", "thanks"],
    },
    {
      id: 4, order: 4, type: "fill_blank",
      prompt: "Complete the Italian sentence", target_sentence: "Lei ___ una mela ogni mattina",
      sentence_parts: ["mangia", "beve", "parla", "corre"],
    },
    {
      id: 5, order: 5, type: "match_pairs",
      prompt: "Tap the matching pairs of words", target_sentence: "Matching Pairs",
      pairs: [
        { left: "Ciao", right: "Hello" },
        { left: "Grazie", right: "Thank you" },
        { left: "Per favore", right: "Please" },
        { left: "Acqua", right: "Water" },
      ],
    },
    {
      id: 6, order: 6, type: "type_answer",
      prompt: 'Type in Italian: "Thank you very much"', target_sentence: "Grazie mille",
    },
    {
      id: 7, order: 7, type: "word_bank",
      prompt: 'Translate to Italian: "A coffee and bread, please"', target_sentence: "Un caffè e pane, per favore",
      sentence_parts: ["Un", "caffè", "e", "pane", "per", "favore", "acqua"],
    },
    {
      id: 8, order: 8, type: "multiple_choice",
      prompt: 'How do you say "Goodbye" in Italian?', target_sentence: "Arrivederci",
      options: [
        { text: "Arrivederci", icon: "👋", hint: "Formal goodbye." },
        { text: "A presto", icon: "⌛", hint: "See you soon." },
        { text: "Prego", icon: "🤝", hint: "You're welcome." },
        { text: "Scusa", icon: "😔", hint: "Sorry." },
      ],
    },
  ],
};

const FALLBACK_EXERCISES = [
  {
    id: 1,
    order: 1,
    type: "multiple_choice",
    prompt: 'Which one of these means "hello"?',
    target_sentence: "Hola",
    options: [
      { text: "Hola", icon: "👋", hint: "Used as a friendly informal & formal greeting at any time of day." },
      { text: "Buenos días", icon: "☕", hint: "Used in morning hours until noon." },
      { text: "Gracias", icon: "🥪", hint: "Expression of gratitude." },
      { text: "Por favor", icon: "🙏", hint: "Polite request expression." },
    ],
  },
  {
    id: 2,
    order: 2,
    type: "image_choice",
    prompt: 'Select the correct image for "el café" (coffee)',
    target_sentence: "El café",
    image_options: [
      { id: "c1", label: "El café", icon: "☕" },
      { id: "c2", label: "El pan", icon: "🍞" },
      { id: "c3", label: "El agua", icon: "💧" },
      { id: "c4", label: "La leche", icon: "🥛" },
    ],
  },
  {
    id: 3,
    order: 3,
    type: "word_bank",
    prompt: 'Translate to English: "Yo quiero agua, por favor"',
    target_sentence: "Yo quiero agua, por favor",
    sentence_parts: ["I", "want", "water", "please", "hello", "coffee", "thank you"],
  },
  {
    id: 4,
    order: 4,
    type: "fill_blank",
    prompt: "Complete the sentence with the correct verb",
    target_sentence: "Ella ___ una manzana cada mañana",
    sentence_parts: ["come", "bebe", "corre", "habla"],
  },
  {
    id: 5,
    order: 5,
    type: "match_pairs",
    prompt: "Tap the matching pairs of words",
    target_sentence: "Matching Pairs",
    pairs: [
      { left: "Hola", right: "Hello" },
      { left: "Gracias", right: "Thank you" },
      { left: "Por favor", right: "Please" },
      { left: "Agua", right: "Water" },
    ],
  },
  {
    id: 6,
    order: 6,
    type: "type_answer",
    prompt: 'Type in Spanish: "Good morning, how are you?"',
    target_sentence: "Buenos días, ¿cómo estás?",
  },
  {
    id: 7,
    order: 7,
    type: "word_bank",
    prompt: 'Translate to Spanish: "A coffee and bread, please"',
    target_sentence: "Un café y pan, por favor",
    sentence_parts: ["Un", "café", "y", "pan", "por", "favor", "hola", "gracias"],
  },
  {
    id: 8,
    order: 8,
    type: "multiple_choice",
    prompt: 'How do you say "Thank you very much"?',
    target_sentence: "Muchas gracias",
    options: [
      { text: "Muchas gracias", icon: "🙏", hint: "Expresses deep gratitude." },
      { text: "De nada", icon: "🤝", hint: "You're welcome." },
      { text: "Hasta luego", icon: "👋", hint: "See you later." },
      { text: "Lo siento", icon: "😔", hint: "I'm sorry." },
    ],
  },
];

const fallbackSessionMap: Record<string, { currentIndex: number; correct: number; xpEarned: number }> = {};

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { userId = 1, ...fetchOptions } = options;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": String(userId),
        ...fetchOptions.headers,
      },
    });

    if (res.ok) {
      return (await res.json()) as T;
    }
  } catch (e) {
    console.warn(`Backend fetch failed for ${path}, using client fallback data.`, e);
  }

  // Graceful fallback for offline / static host deployments
  return getFallbackData<T>(path, fetchOptions.body ? String(fetchOptions.body) : null);
}

function getFallbackData<T>(path: string, requestBody: string | null): T {
  const currentId = getActiveCourseId();
  const courseNames: Record<number, string> = { 1: "Spanish", 2: "French", 3: "German", 4: "Japanese", 5: "Italian" };

  if (path.includes("/user/me")) {
    return {
      id: 1,
      username: "learner",
      display_name: "Learner",
      avatar_url: "🧑‍🎓",
      xp: 450,
      hearts: fallbackUserHearts,
      streak_days: 5,
      gems: fallbackUserGems,
      active_course_id: currentId,
      created_at: new Date().toISOString(),
    } as unknown as T;
  }

  if (path.includes("/profile")) {
    return {
      id: 1,
      username: "learner",
      display_name: "Learner",
      avatar_url: "🧑‍🎓",
      xp: 450,
      hearts: fallbackUserHearts,
      streak_days: 5,
      gems: fallbackUserGems,
      active_course_id: currentId,
      created_at: new Date().toISOString(),
      total_lessons_completed: 12,
      current_course: courseNames[currentId] || "Spanish",
    } as unknown as T;
  }

  if (path.includes("/courses")) {
    return [
      { id: 1, language: "Spanish", code: "es", flag_emoji: "🇪🇸" },
      { id: 2, language: "French", code: "fr", flag_emoji: "🇫🇷" },
      { id: 3, language: "German", code: "de", flag_emoji: "🇩🇪" },
      { id: 4, language: "Japanese", code: "ja", flag_emoji: "🇯🇵" },
      { id: 5, language: "Italian", code: "it", flag_emoji: "🇮🇹" },
    ] as unknown as T;
  }

  if (path.includes("/user/active-course")) {
    if (requestBody) {
      try {
        const parsed = JSON.parse(requestBody);
        if (parsed.course_id) setActiveCourseId(parsed.course_id);
      } catch (e) {}
    }
    const newId = getActiveCourseId();
    return { success: true, active_course_id: newId, language: courseNames[newId] || "Spanish" } as unknown as T;
  }

  if (path.includes("/path")) {
    const courseInfo: Record<number, { name: string; flag: string }> = {
      1: { name: "Spanish", flag: "🇪🇸" },
      2: { name: "French", flag: "🇫🇷" },
      3: { name: "German", flag: "🇩🇪" },
      4: { name: "Japanese", flag: "🇯🇵" },
      5: { name: "Italian", flag: "🇮🇹" },
    };
    const active = courseInfo[currentId] || courseInfo[1];

    const generateSkills = (unitIdx: number) => [
      {
        skill_id: unitIdx * 10 + 1,
        title: `Basics ${unitIdx}.1`,
        icon: "☕",
        completed_lessons: 1,
        total_lessons: 3,
        is_locked: false,
        first_incomplete_lesson_id: unitIdx * 100 + 2,
        lessons: [
          { id: unitIdx * 100 + 1, order: 1, title: "Lesson 1: New Words", xp_reward: 10 },
          { id: unitIdx * 100 + 2, order: 2, title: "Lesson 2: Sentence Construction", xp_reward: 10 },
          { id: unitIdx * 100 + 3, order: 3, title: "Lesson 3: Fluency Mastery", xp_reward: 15 },
        ],
      },
      {
        skill_id: unitIdx * 10 + 2,
        title: `Phrases ${unitIdx}.2`,
        icon: "🥪",
        completed_lessons: 0,
        total_lessons: 3,
        is_locked: false,
        first_incomplete_lesson_id: unitIdx * 100 + 4,
        lessons: [
          { id: unitIdx * 100 + 4, order: 1, title: "Lesson 1: Daily Greetings", xp_reward: 10 },
          { id: unitIdx * 100 + 5, order: 2, title: "Lesson 2: Expressions", xp_reward: 10 },
          { id: unitIdx * 100 + 6, order: 3, title: "Lesson 3: Fluency Challenge", xp_reward: 15 },
        ],
      },
      {
        skill_id: unitIdx * 10 + 3,
        title: `Travel ${unitIdx}.3`,
        icon: "✈️",
        completed_lessons: 0,
        total_lessons: 3,
        is_locked: unitIdx > 1,
        first_incomplete_lesson_id: unitIdx * 100 + 7,
        lessons: [
          { id: unitIdx * 100 + 7, order: 1, title: "Lesson 1: Directions", xp_reward: 10 },
          { id: unitIdx * 100 + 8, order: 2, title: "Lesson 2: Hotel & Airport", xp_reward: 10 },
          { id: unitIdx * 100 + 9, order: 3, title: "Lesson 3: Travel Mastery", xp_reward: 15 },
        ],
      },
    ];

    return {
      course: active.name,
      flag_emoji: active.flag,
      units: [
        { id: 1, order: 1, title: `Unit 1: ${active.name} Essentials (CEFR A1)`, description: "Greetings, polite expressions, and dining vocabulary", color: "#58CC02", skills: generateSkills(1) },
        { id: 2, order: 2, title: `Unit 2: ${active.name} Daily Life (CEFR A1)`, description: "Shopping, family, and daily routines", color: "#1CB0F6", skills: generateSkills(2) },
        { id: 3, order: 3, title: `Unit 3: ${active.name} Travel & Culture (CEFR A2)`, description: "Hotel booking, directions, and sightseeing", color: "#CE82FF", skills: generateSkills(3) },
        { id: 4, order: 4, title: `Unit 4: ${active.name} Conversation (CEFR A2)`, description: "Socializing, hobbies, and personal opinions", color: "#FF4B4B", skills: generateSkills(4) },
        { id: 5, order: 5, title: `Unit 5: ${active.name} Business & Work (CEFR B1)`, description: "Workplace communication and appointments", color: "#FF9200", skills: generateSkills(5) },
        { id: 6, order: 6, title: `Unit 6: ${active.name} Advanced Expression (CEFR B1)`, description: "Complex sentences, storytelling, and fluency", color: "#00CD9C", skills: generateSkills(6) },
      ],
    } as unknown as T;
  }

  if (path.includes("/leaderboard")) {
    return {
      entries: [
        { rank: 1, id: 4, username: "aiko_t", display_name: "Aiko Tanaka", avatar_url: "👩‍🔬", xp: 1850 },
        { rank: 2, id: 2, username: "maria_g", display_name: "María García", avatar_url: "👩‍🦰", xp: 1420 },
        { rank: 3, id: 1, username: "learner", display_name: "Learner (You)", avatar_url: "🧑‍🎓", xp: 450 },
        { rank: 4, id: 3, username: "james_k", display_name: "James Kim", avatar_url: "👨‍💼", xp: 380 },
      ],
      current_user_rank: 3,
    } as unknown as T;
  }

  const activeExercises = LANGUAGE_EXERCISES[currentId] || LANGUAGE_EXERCISES[1];

  if (path.includes("/lessons/") && path.includes("/start")) {
    const sId = `demo-fallback-session-${currentId}`;
    fallbackSessionMap[sId] = { currentIndex: 0, correct: 0, xpEarned: 0 };
    return {
      session_id: sId,
      total_exercises: activeExercises.length,
      current_index: 0,
      exercise: activeExercises[0],
    } as unknown as T;
  }

  if (path.includes("/lessons/sessions/") && path.includes("/submit")) {
    const sId = `demo-fallback-session-${currentId}`;
    const sess = fallbackSessionMap[sId] || { currentIndex: 0, correct: 0, xpEarned: 0 };
    sess.currentIndex += 1;
    sess.correct += 1;
    sess.xpEarned += 10;
    fallbackSessionMap[sId] = sess;

    const completed = sess.currentIndex >= activeExercises.length;
    const nextEx = completed ? null : activeExercises[sess.currentIndex];

    return {
      is_correct: true,
      correct_answer: "Correct!",
      xp_earned: sess.xpEarned,
      hearts: fallbackUserHearts,
      current_index: sess.currentIndex,
      total: activeExercises.length,
      completed: completed,
      exercise: nextEx,
    } as unknown as T;
  }

  if (path.includes("/lessons/sessions/")) {
    const sId = `demo-fallback-session-${currentId}`;
    const sess = fallbackSessionMap[sId] || { currentIndex: 0, correct: 0, xpEarned: 0 };
    const completed = sess.currentIndex >= activeExercises.length;
    return {
      session_id: sId,
      current_index: sess.currentIndex,
      total: activeExercises.length,
      correct: sess.correct,
      xp_earned: sess.xpEarned,
      hearts: fallbackUserHearts,
      completed: completed,
      exercise: completed ? null : activeExercises[sess.currentIndex],
    } as unknown as T;
  }

  if (path.includes("/shop/redeem-coupon")) {
    fallbackUserGems += 1000;
    return {
      success: true,
      message: "Coupon 'scaler95' redeemed! +1000 Diamonds added to your balance.",
      gems_added: 1000,
      new_gem_balance: fallbackUserGems,
    } as unknown as T;
  }

  if (path.includes("/shop/buy-gems")) {
    fallbackUserGems += 500;
    return {
      success: true,
      message: "+500 Diamonds added to your balance!",
      gems_added: 500,
      new_gem_balance: fallbackUserGems,
    } as unknown as T;
  }

  if (path.includes("/progress/hearts/refill")) {
    fallbackUserHearts = 5;
    return { hearts: 5, gems: fallbackUserGems, message: "Hearts fully refilled!" } as unknown as T;
  }

  return {} as T;
}

// --- Types ---

export interface CourseData {
  id: number;
  language: string;
  code: string;
  flag_emoji: string;
}

export interface UserData {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  xp: number;
  hearts: number;
  streak_days: number;
  gems: number;
  active_course_id: number;
  created_at: string;
}

export interface ProfileData extends UserData {
  total_lessons_completed: number;
  current_course: string;
}

export interface LessonInfo {
  id: number;
  order: number;
  title: string;
  xp_reward: number;
}

export interface SkillProgress {
  skill_id: number;
  title: string;
  icon: string;
  completed_lessons: number;
  total_lessons: number;
  is_locked: boolean;
  first_incomplete_lesson_id: number | null;
  lessons?: LessonInfo[];
}

export interface UnitData {
  id: number;
  order: number;
  title: string;
  description: string;
  color: string;
  skills: SkillProgress[];
}

export interface PathData {
  course: string;
  flag_emoji: string;
  units: UnitData[];
}

export interface ExerciseData {
  id: number;
  order: number;
  type: "multiple_choice" | "word_bank" | "match_pairs" | "fill_blank" | "type_answer";
  prompt: string;
  target_sentence?: string;
  options?: any;
  sentence_parts?: string[];
}

export interface SessionStart {
  session_id: string;
  total_exercises: number;
  current_index: number;
  exercise: ExerciseData;
}

export interface SessionStatus {
  session_id: string;
  lesson_id: number;
  current_index: number;
  total: number;
  correct: number;
  xp_earned: number;
  hearts: number;
  completed: boolean;
  exercise: ExerciseData | null;
}

export interface AnswerResult {
  is_correct: boolean;
  correct_answer: string;
  xp_earned: number;
  hearts: number;
  current_index: number;
  total: number;
  completed: boolean;
  exercise: ExerciseData | null;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  xp: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  current_user_rank: number;
}

export interface HeartRefillResult {
  hearts: number;
  gems: number;
  message: string;
}

export interface CouponResult {
  success: boolean;
  message: string;
  gems_added: number;
  new_gem_balance: number;
}

// --- API Functions ---

export const api = {
  getUser: () => apiFetch<UserData>("/user/me"),
  getProfile: () => apiFetch<ProfileData>("/profile"),
  getCourses: () => apiFetch<CourseData[]>("/courses"),
  setActiveCourse: (courseId: number) =>
    apiFetch<{ success: boolean; active_course_id: number; language: string }>("/user/active-course", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId }),
    }),
  getPath: () => apiFetch<PathData>("/path"),
  getLeaderboard: () => apiFetch<LeaderboardData>("/leaderboard"),

  startLesson: (lessonId: number) =>
    apiFetch<SessionStart>(`/lessons/${lessonId}/start`, { method: "POST" }),

  getSession: (sessionId: string) =>
    apiFetch<SessionStatus>(`/lessons/sessions/${sessionId}`),

  submitAnswer: (sessionId: string, answer: unknown) =>
    apiFetch<AnswerResult>(`/lessons/sessions/${sessionId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),

  refillHearts: () =>
    apiFetch<HeartRefillResult>("/progress/hearts/refill", { method: "POST" }),

  practiceForHeart: () =>
    apiFetch<HeartRefillResult>("/progress/hearts/practice", { method: "POST" }),

  redeemCoupon: (code: string) =>
    apiFetch<CouponResult>("/shop/redeem-coupon", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  buyGems: (gems: number) =>
    apiFetch<CouponResult>("/shop/buy-gems", {
      method: "POST",
      body: JSON.stringify({ gems }),
    }),

  simulateDay: () =>
    apiFetch("/test/simulate-day-passed", { method: "POST" }),
};
