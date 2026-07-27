"""Seed the database with 5 complete multi-unit language courses (Spanish, French, German, Japanese, Italian) using authentic Duolingo exercise prompts and visual choice options."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Course, DailyXPLog, Exercise, Lesson, Skill, SkillProgress, Unit, User,
)


def _build_course_curriculum(course_id: int, lang_name: str) -> list[dict]:
    """Generates 6-7 units with 3 skills each, and 3 lessons per skill for a given language."""
    
    if lang_name == "Spanish":
        units_spec = [
            ("Unit 1: Spanish Foundations", "Greetings, polite expressions, and everyday words", "#58CC02", [
                ("Greetings & Courtesy", "👋", [
                    ("Hola", "Hello", "Used as a friendly informal & formal greeting at any time of day."),
                    ("Buenos días", "Good morning", "Used in morning hours until noon."),
                    ("Gracias", "Thank you", "Expression of gratitude."),
                ]),
                ("People & Family", "👥", [
                    ("El hombre", "The man", "Noun for an adult male."),
                    ("La mujer", "The woman", "Noun for an adult female."),
                    ("La familia", "The family", "Noun for a family unit."),
                ]),
                ("Food & Drinks", "🌮", [
                    ("El pan", "Bread", "Staple baked food item."),
                    ("El agua", "Water", "Essential drink."),
                    ("La manzana", "Apple", "Fresh fruit."),
                ]),
            ]),
            ("Unit 2: Phrases & Café", "Ordering food, coffee, and asking questions", "#1CB0F6", [
                ("At the Café", "☕", [
                    ("Un café por favor", "A coffee please", "Common polite request when ordering."),
                    ("La cuenta", "The check", "Asked when ready to pay at a restaurant."),
                    ("El té", "Tea", "Hot beverage."),
                ]),
                ("Introductions", "🤝", [
                    ("Me llamo", "My name is", "Used when introducing yourself."),
                    ("Mucho gusto", "Nice to meet you", "Polite response after introductions."),
                    ("De dónde eres", "Where are you from", "Question asking for origin."),
                ]),
                ("Shopping & Prices", "🛍️", [
                    ("Cuánto cuesta", "How much does it cost", "Essential shopping question."),
                    ("El dinero", "Money", "Currency/cash."),
                    ("La tienda", "The shop", "Retail store."),
                ]),
            ]),
            ("Unit 3: Travel & Exploring", "Hotels, airports, and city directions", "#CE82FF", [
                ("Airport & Flight", "✈️", [
                    ("El aeropuerto", "The airport", "Travel hub."),
                    ("El pasaporte", "The passport", "Identification document for travel."),
                    ("El vuelo", "The flight", "Airplane trip."),
                ]),
                ("Hotel & Stay", "🏨", [
                    ("La habitación", "The room", "Hotel room."),
                    ("La reserva", "The reservation", "Booking confirmation."),
                    ("La llave", "The key", "Room key."),
                ]),
                ("City Directions", "🗺️", [
                    ("Dónde está", "Where is", "Direction question."),
                    ("A la derecha", "To the right", "Direction."),
                    ("A la izquierda", "To the left", "Direction."),
                ]),
            ]),
            ("Unit 4: Daily Life & Routines", "Time, weather, and weekly schedules", "#FF4B4B", [
                ("Days of the Week", "📅", [
                    ("Lunes", "Monday", "First weekday."),
                    ("Viernes", "Friday", "End of weekday."),
                    ("Hoy", "Today", "Current day."),
                ]),
                ("Weather & Seasons", "☀️", [
                    ("Hace sol", "It is sunny", "Weather expression."),
                    ("Hace frío", "It is cold", "Weather expression."),
                    ("La lluvia", "The rain", "Precipitation."),
                ]),
                ("Time & Clock", "⏰", [
                    ("Qué hora es", "What time is it", "Asking time."),
                    ("La mañana", "The morning", "Time of day."),
                    ("La noche", "The night", "Evening/night."),
                ]),
            ]),
            ("Unit 5: Hobbies & Leisure", "Sports, music, and weekend activities", "#FFC800", [
                ("Sports & Games", "⚽", [
                    ("El fútbol", "Soccer", "Popular sport."),
                    ("Jugar", "To play", "Verb for games/sports."),
                    ("El partido", "The match", "Game match."),
                ]),
                ("Music & Art", "🎨", [
                    ("La música", "Music", "Audio art."),
                    ("Cantar", "To sing", "Vocal performance."),
                    ("Escuchar", "To listen", "Auditory attention."),
                ]),
                ("Free Time", "🎮", [
                    ("El libro", "Book", "Reading material."),
                    ("Leer", "To read", "Literary activity."),
                    ("La película", "The movie", "Cinema film."),
                ]),
            ]),
            ("Unit 6: Work & Education", "Professions, school, and career talks", "#2B70C9", [
                ("Professions", "💼", [
                    ("El profesor", "The teacher", "Educator."),
                    ("El médico", "The doctor", "Medical professional."),
                    ("El estudiante", "The student", "Learner."),
                ]),
                ("School & Study", "📚", [
                    ("La escuela", "The school", "Educational institution."),
                    ("Estudiar", "To study", "Learning activity."),
                    ("El examen", "The exam", "Test."),
                ]),
                ("Office & Work", "💻", [
                    ("El trabajo", "The job", "Employment."),
                    ("La computadora", "The computer", "Digital device."),
                    ("El mensaje", "The message", "Communication."),
                ]),
            ]),
            ("Unit 7: Advanced Conversation", "Expressing opinions, emotions, and future plans", "#CE82FF", [
                ("Opinions & Thoughts", "💭", [
                    ("Creo que", "I think that", "Expressing belief."),
                    ("Me gusta", "I like", "Expressing preference."),
                    ("Importante", "Important", "Adjective of value."),
                ]),
                ("Emotions & Feelings", "😊", [
                    ("Feliz", "Happy", "Positive emotion."),
                    ("Cansado", "Tired", "Physical state."),
                    ("Emocionado", "Excited", "Enthusiastic state."),
                ]),
                ("Future & Dreams", "🌟", [
                    ("El futuro", "The future", "Time ahead."),
                    ("Viajar", "To travel", "Exploring places."),
                    ("El sueño", "The dream", "Aspiration."),
                ]),
            ]),
        ]
    elif lang_name == "French":
        units_spec = [
            ("Unit 1: French Foundations", "Greetings, basic courtesy, and identity", "#58CC02", [
                ("Greetings & Politeness", "🥐", [("Bonjour", "Hello / Good day", "Standard French greeting."), ("Merci", "Thank you", "Expression of thanks."), ("Au revoir", "Goodbye", "Standard farewell.")]),
                ("People & Family", "👨‍👩‍👧", [("L'homme", "The man", "Adult male."), ("La femme", "The woman", "Adult female."), ("La famille", "The family", "Family unit.")]),
                ("Bistro Basics", "☕", [("Le café", "Coffee", "Hot drink."), ("L'eau", "Water", "Fresh drink."), ("Le croissant", "Croissant", "French pastry.")]),
            ]),
            ("Unit 2: Travel & Places", "Navigating Paris, hotels, and transport", "#1CB0F6", [
                ("Paris Directions", "🗼", [("Où est", "Where is", "Location query."), ("La gare", "Train station", "Transit hub."), ("L'hôtel", "The hotel", "Lodging.")]),
                ("Transportation", "🚆", [("Le train", "The train", "Railway car."), ("Le taxi", "The taxi", "Cab."), ("Le billet", "The ticket", "Pass.")]),
                ("At the Hotel", "🔑", [("La chambre", "The room", "Lodging room."), ("La clé", "The key", "Room key."), ("La nuit", "The night", "Evening.")]),
            ]),
            ("Unit 3: Dining & Food", "Ordering meals, wine, and dessert", "#CE82FF", [
                ("Ordering Food", "🍽️", [("L'addition", "The bill", "Check at bistro."), ("S'il vous plaît", "Please", "Polite phrase."), ("Le menu", "The menu", "Food choices.")]),
                ("Drinks & Wine", "🍷", [("Le vin", "Wine", "Beverage."), ("Le fromage", "Cheese", "Dairy food."), ("Le pain", "Bread", "Bake.")]),
                ("Desserts", "🧁", [("Le chocolat", "Chocolate", "Sweet treat."), ("La glace", "Ice cream", "Cold dessert."), ("Le gâteau", "Cake", "Pastry.")]),
            ]),
            ("Unit 4: Daily Life", "Time, days, and routines", "#FF4B4B", [
                ("Days of Week", "📅", [("Lundi", "Monday", "Weekday."), ("Vendredi", "Friday", "End week."), ("Aujourd'hui", "Today", "Current day.")]),
                ("Weather", "🌤️", [("Il fait beau", "Weather is nice", "Sunny day."), ("La pluie", "Rain", "Rainfall."), ("Le soleil", "Sun", "Sunlight.")]),
                ("Time", "🕰️", [("Quelle heure", "What time", "Asking hour."), ("Le matin", "Morning", "AM hours."), ("Le soir", "Evening", "PM hours.")]),
            ]),
            ("Unit 5: Hobbies & Sports", "Culture, leisure, and activities", "#FFC800", [
                ("Culture & Cinema", "🎬", [("Le film", "The movie", "Film."), ("La musique", "Music", "Tune."), ("Lire", "To read", "Reading.")]),
                ("Sports", "⚽", [("Le football", "Soccer", "Sport."), ("Nager", "To swim", "Water sport."), ("Le vélo", "Bicycle", "Cycling.")]),
                ("Activities", "🎨", [("Dessiner", "To draw", "Art."), ("Chanter", "To sing", "Vocals."), ("Danser", "To dance", "Dance.")]),
            ]),
            ("Unit 6: Work & School", "Career, education, and office", "#2B70C9", [
                ("Professions", "💼", [("Professeur", "Teacher", "Educator."), ("Étudiant", "Student", "Learner."), ("Médecin", "Doctor", "Medical.")]),
                ("Office", "🖥️", [("Le travail", "Work", "Job."), ("L'ordinateur", "Computer", "PC."), ("Le bureau", "Office", "Desk.")]),
                ("Studies", "📖", [("Étudier", "To study", "Study."), ("Le livre", "Book", "Textbook."), ("L'école", "School", "Academy.")]),
            ]),
        ]
    elif lang_name == "German":
        units_spec = [
            ("Unit 1: German Basics", "Greetings, courtesy, and foundational nouns", "#58CC02", [
                ("Greetings", "🥨", [("Hallo", "Hello", "Greeting."), ("Danke", "Thank you", "Thanks."), ("Tschüss", "Goodbye", "Bye.")]),
                ("People", "👥", [("Der Mann", "The man", "Male adult."), ("Die Frau", "The woman", "Female adult."), ("Das Kind", "The child", "Kid.")]),
                ("Food & Water", "🍎", [("Das Wasser", "Water", "Water drink."), ("Das Brot", "Bread", "Bread loaf."), ("Der Apfel", "Apple", "Fruit.")]),
            ]),
            ("Unit 2: Phrases & Café", "Café orders and introductions", "#1CB0F6", [
                ("At the Café", "☕", [("Kaffee bitte", "Coffee please", "Order."), ("Die Rechnung", "The bill", "Check."), ("Tee", "Tea", "Drink.")]),
                ("Introductions", "🤝", [("Ich heiße", "My name is", "Intro."), ("Freut mich", "Pleased to meet you", "Nice to meet."), ("Woher", "Where from", "Origin.")]),
                ("Shopping", "🛒", [("Wie viel kostet", "How much costs", "Price check."), ("Das Geld", "Money", "Cash."), ("Der Laden", "Store", "Shop.")]),
            ]),
            ("Unit 3: Travel & City", "Transport, hotel, and navigation", "#CE82FF", [
                ("Transport", "🚆", [("Der Bahnhof", "Train station", "Station."), ("Der Zug", "Train", "Train."), ("Das Ticket", "Ticket", "Pass.")]),
                ("Hotel", "🏨", [("Das Zimmer", "The room", "Hotel room."), ("Der Schlüssel", "The key", "Key."), ("Die Buchung", "Booking", "Res.")]),
                ("Directions", "🗺️", [("Wo ist", "Where is", "Query."), ("Rechts", "Right", "Right side."), ("Links", "Left", "Left side.")]),
            ]),
            ("Unit 4: Routine & Days", "Days, weather, and clock", "#FF4B4B", [
                ("Days", "📅", [("Montag", "Monday", "Mon."), ("Freitag", "Friday", "Fri."), ("Heute", "Today", "Today.")]),
                ("Weather", "☀️", [("Sonne", "Sun", "Sunny."), ("Regen", "Rain", "Rainy."), ("Kalt", "Cold", "Cold weather.")]),
                ("Clock", "⏰", [("Wie spät ist es", "What time is it", "Clock question."), ("Morgen", "Morning", "Morning."), ("Nacht", "Night", "Night.")]),
            ]),
            ("Unit 5: Hobbies & Leisure", "Sports, games, and hobbies", "#FFC800", [
                ("Sports", "⚽", [("Fußball", "Soccer", "Football."), ("Spielen", "To play", "Play verb."), ("Das Spiel", "The game", "Match.")]),
                ("Music & Books", "🎵", [("Musik", "Music", "Tune."), ("Lesen", "To read", "Read verb."), ("Das Buch", "Book", "Literature.")]),
                ("Leisure", "🚴", [("Fahrrad", "Bicycle", "Bike."), ("Schwimmen", "Swim", "Swimming."), ("Reisen", "Travel", "Travel verb.")]),
            ]),
            ("Unit 6: Work & Study", "Career and school vocabulary", "#2B70C9", [
                ("Career", "💼", [("Der Lehrer", "Teacher", "Teacher."), ("Der Arzt", "Doctor", "Doctor."), ("Der Student", "Student", "Student.")]),
                ("Office", "💻", [("Die Arbeit", "Work", "Job."), ("Der Computer", "Computer", "PC."), ("Das Büro", "Office", "Office desk.")]),
                ("School", "🏫", [("Die Schule", "School", "School."), ("Lernen", "Learn", "Learn verb."), ("Die Prüfung", "Exam", "Test.")]),
            ]),
        ]
    elif lang_name == "Japanese":
        units_spec = [
            ("Unit 1: Japanese Basics", "Greetings, Hiragana, and essential courtesy", "#58CC02", [
                ("Greetings", "⛩️", [("Konnichiwa (こんにちは)", "Hello", "Standard greeting."), ("Arigatou (ありがとう)", "Thank you", "Expressing thanks."), ("Sayounara (さようなら)", "Goodbye", "Farewell.")]),
                ("People", "👤", [("Watashi (私)", "I / Me", "Self reference."), ("Hito (人)", "Person", "Human."), ("Tomodachi (友達)", "Friend", "Companion.")]),
                ("Food & Tea", "🍵", [("Ocha (お茶)", "Green tea", "Tea beverage."), ("Gohan (ご飯)", "Meal / Rice", "Food staple."), ("Mizu (水)", "Water", "Fresh water.")]),
            ]),
            ("Unit 2: Daily Expressions & Dining", "Café orders, polite phrases, and shopping", "#1CB0F6", [
                ("Dining Out", "🍱", [("Kudasa (ください)", "Please give me", "Polite order."), ("Oishii (美味しい)", "Delicious", "Tasty food."), ("Okaikei (お会計)", "The check", "Restaurant bill.")]),
                ("Introductions", "🤝", [("Hajimemashite (初めまして)", "Nice to meet you", "First meeting greeting."), ("Namae (名前)", "Name", "Person name."), ("Desu (です)", "To be", "Polite copula.")]),
                ("Shopping", "🛍️", [("Ikura (いくら)", "How much", "Price query."), ("Kore (これ)", "This one", "Item selector."), ("En (円)", "Yen", "Japanese currency.")]),
            ]),
            ("Unit 3: Travel & Places", "Stations, Tokyo directions, and hotels", "#CE82FF", [
                ("Station & Trains", "🚅", [("Eki (駅)", "Train station", "Transit hub."), ("Densha (電車)", "Train", "Electric train."), ("Kippu (切符)", "Ticket", "Transit pass.")]),
                ("Hotel Stay", "🏨", [("Heya (部屋)", "Room", "Hotel room."), ("Kagi (鍵)", "Key", "Door key."), ("Yoyaku (予約)", "Reservation", "Booking.")]),
                ("Directions", "🗺️", [("Doko (どこ)", "Where", "Location question."), ("Migi (右)", "Right", "Right side."), ("Hidari (左)", "Left", "Left side.")]),
            ]),
            ("Unit 4: Calendar & Weather", "Days, seasons, and times", "#FF4B4B", [
                ("Days of Week", "📅", [("Getsuyoubi (月曜日)", "Monday", "Mon."), ("Kinyoubi (金曜日)", "Friday", "Fri."), ("Kyou (今日)", "Today", "Current day.")]),
                ("Weather", "🌸", [("Hare (晴れ)", "Sunny weather", "Clear sky."), ("Ame (雨)", "Rain", "Rainfall."), ("Sakura (桜)", "Cherry blossom", "Spring flower.")]),
                ("Time", "⏰", [("Ima (今)", "Now", "Current moment."), ("Nanji (何時)", "What time", "Hour query."), ("Asa (朝)", "Morning", "AM hours.")]),
            ]),
            ("Unit 5: Anime & Culture", "Hobbies, games, and entertainment", "#FFC800", [
                ("Media & Anime", "🎮", [("Anime (アニメ)", "Anime", "Animation."), ("Manga (漫画)", "Manga", "Japanese comic."), ("Game (ゲーム)", "Game", "Video game.")]),
                ("Music & Art", "🎵", [("Ongaku (音楽)", "Music", "Audio tune."), ("Uta (歌)", "Song", "Vocal song."), ("Hon (本)", "Book", "Reading book.")]),
                ("Sports", "⚾", [("Yakyuu (野球)", "Baseball", "Popular sport."), ("Sakka (サッカー)", "Soccer", "Football."), ("Sumo (相撲)", "Sumo wrestling", "Traditional sport.")]),
            ]),
            ("Unit 6: Work & School", "Studies, office, and career", "#2B70C9", [
                ("School & Study", "🏫", [("Gakkou (学校)", "School", "Education."), ("Sensei (先生)", "Teacher", "Instructor."), ("Gakusei (学生)", "Student", "Learner.")]),
                ("Workplace", "💻", [("Shigoto (仕事)", "Work / Job", "Employment."), ("Kaisha (会社)", "Company", "Business corp."), ("Pasonkon (パソコン)", "PC", "Personal computer.")]),
                ("Communication", "📧", [("Denwa (電話)", "Telephone", "Phone call."), ("Meru (メール)", "Email", "Digital mail."), ("Hanashi (話)", "Talk / Story", "Conversation.")]),
            ]),
        ]
    else:  # Italian
        units_spec = [
            ("Unit 1: Italian Foundations", "Greetings, polite words, and food basics", "#58CC02", [
                ("Greetings & Courtesy", "🍕", [("Ciao", "Hello / Goodbye", "Informal greeting."), ("Grazie", "Thank you", "Gratitude."), ("Prego", "You're welcome", "Polite reply.")]),
                ("People & Family", "👨‍👩‍👦", [("L'uomo", "The man", "Male adult."), ("La donna", "The woman", "Female adult."), ("La famiglia", "Family", "Family.")]),
                ("Food & Gelato", "🍨", [("La pizza", "Pizza", "Classic dish."), ("Il gelato", "Gelato / Ice cream", "Sweet treat."), ("L'acqua", "Water", "Water drink.")]),
            ]),
            ("Unit 2: Dining & Café", "Ordering espresso, pasta, and check", "#1CB0F6", [
                ("At the Bar / Café", "☕", [("Un caffè per favore", "A coffee please", "Espresso order."), ("Il conto", "The check", "Restaurant bill."), ("Il vino", "Wine", "Italian wine.")]),
                ("Introductions", "🤝", [("Mi chiamo", "My name is", "Intro."), ("Piacere", "Nice to meet you", "Pleasure."), ("Di dove sei", "Where are you from", "Origin.")]),
                ("Shopping", "🛍️", [("Quanto costa", "How much costs", "Price."), ("I soldi", "Money", "Cash."), ("Il negozio", "Store", "Shop.")]),
            ]),
            ("Unit 3: Travel & Rome", "Trains, hotels, and directions", "#CE82FF", [
                ("Transit & Trains", "🚆", [("La stazione", "Station", "Train station."), ("Il treno", "Train", "Train."), ("Il biglietto", "Ticket", "Pass.")]),
                ("Hotel Stay", "🏨", [("La camera", "The room", "Hotel room."), ("La chiave", "The key", "Key."), ("La prenotazione", "Reservation", "Res.")]),
                ("Directions", "🗺️", [("Dov'è", "Where is", "Location."), ("A destra", "To the right", "Right."), ("A sinistra", "To the left", "Left.")]),
            ]),
            ("Unit 4: Calendar & Weather", "Days, clock, and weather", "#FF4B4B", [
                ("Days", "📅", [("Lunedì", "Monday", "Mon."), ("Venerdì", "Friday", "Fri."), ("Oggi", "Today", "Today.")]),
                ("Weather", "☀️", [("Fa caldo", "It is warm", "Sunny."), ("La pioggia", "Rain", "Rainfall."), ("Il sole", "Sun", "Sunlight.")]),
                ("Time", "⏰", [("Che ora è", "What time is it", "Clock question."), ("La mattina", "Morning", "AM."), ("La sera", "Evening", "PM.")]),
            ]),
            ("Unit 5: Leisure & Music", "Opera, soccer, and hobbies", "#FFC800", [
                ("Sports & Calcio", "⚽", [("Il calcio", "Soccer", "Football."), ("Giocare", "To play", "Play verb."), ("La partita", "The match", "Game match.")]),
                ("Music & Art", "🎻", [("La musica", "Music", "Tune."), ("Cantare", "To sing", "Sing verb."), ("Il libro", "Book", "Book.")]),
                ("Free Time", "🛵", [("La vespa", "Scooter", "Vespa."), ("Viaggiare", "To travel", "Travel."), ("Il mare", "The sea", "Sea.")]),
            ]),
            ("Unit 6: Work & School", "Professions and education", "#2B70C9", [
                ("Professions & Work", "💼", [("Il professore", "Teacher", "Educator."), ("Il lavoro", "Work", "Job."), ("Studiare", "To study", "Study.")]),
            ]),
        ]

    units_data = []
    for u_idx, (u_title, u_desc, u_color, skills_list) in enumerate(units_spec, start=1):
        unit_item = {
            "order": u_idx,
            "title": u_title,
            "description": u_desc,
            "color": u_color,
            "skills": []
        }
        for s_idx, (s_title, s_icon, vocab_items) in enumerate(skills_list, start=1):
            w1, t1, d1 = vocab_items[0]
            w2, t2, d2 = vocab_items[1] if len(vocab_items) > 1 else (w1, t1, d1)
            w3, t3, d3 = vocab_items[2] if len(vocab_items) > 2 else (w1, t1, d1)

            # Map vocabulary words to visual icons
            icon_map = {
                "café": "☕", "té": "🍵", "agua": "🥛", "pan": "🍞", "manzana": "🍎",
                "perro": "🐶", "gato": "🐱", "vino": "🍷", "croissant": "🥐", "pizza": "🍕",
                "coffee": "☕", "tea": "🍵", "water": "🥛", "bread": "🍞", "apple": "🍎",
            }
            w1_icon = icon_map.get(w1.lower(), s_icon)
            w2_icon = icon_map.get(w2.lower(), "☕")
            w3_icon = icon_map.get(w3.lower(), "🥪")

            # Lesson 1: Vocabulary & Sound Foundation (8 Interactive Exercises)
            l1_exercises = [
                {
                    "type": "multiple_choice",
                    "prompt": f'Which one of these is "{t1.lower()}"?',
                    "target_sentence": w1,
                    "correct_answer": w1,
                    "options": [
                        {"text": w1, "icon": w1_icon, "hint": d1},
                        {"text": w2, "icon": w2_icon, "hint": d2},
                        {"text": w3, "icon": w3_icon, "hint": d3},
                    ]
                },
                {
                    "type": "multiple_choice",
                    "prompt": f'Which one of these is "{t2.lower()}"?',
                    "target_sentence": w2,
                    "correct_answer": w2,
                    "options": [
                        {"text": w2, "icon": w2_icon, "hint": d2},
                        {"text": w1, "icon": w1_icon, "hint": d1},
                        {"text": w3, "icon": w3_icon, "hint": d3},
                    ]
                },
                {
                    "type": "word_bank",
                    "prompt": "Write this in English",
                    "target_sentence": w1,
                    "correct_answer": t1,
                    "sentence_parts": [t1, t2, t3, "want", "please", "a"]
                },
                {
                    "type": "word_bank",
                    "prompt": f"Write this in {lang_name}",
                    "target_sentence": t2,
                    "correct_answer": w2,
                    "sentence_parts": [w2, w1, w3, "por", "favor", "un"]
                },
                {
                    "type": "fill_blank",
                    "prompt": f"Complete the sentence in {lang_name}",
                    "target_sentence": f"{w1} ___ {w2}",
                    "correct_answer": w1
                },
                {
                    "type": "match_pairs",
                    "prompt": "Match the vocabulary pairs",
                    "target_sentence": f"{w1}, {w2}, {w3}",
                    "correct_answer": f'{{"{w1}":"{t1}","{w2}":"{t2}","{w3}":"{t3}"}}',
                    "options": {"left": [w1, w2, w3], "right": [t1, t2, t3]}
                },
                {
                    "type": "type_answer",
                    "prompt": f"Type this in {lang_name}",
                    "target_sentence": w1,
                    "correct_answer": w1
                },
                {
                    "type": "word_bank",
                    "prompt": "Translate this full sentence",
                    "target_sentence": f"{w1}, {w2}",
                    "correct_answer": f"{t1}, {t2}",
                    "sentence_parts": [t1, t2, t3, "want", "please", "thanks"]
                }
            ]

            # Lesson 2: Grammar & Sentence Building (8 Interactive Exercises)
            l2_exercises = [
                {
                    "type": "multiple_choice",
                    "prompt": f'Which one of these is "{t3.lower()}"?',
                    "target_sentence": w3,
                    "correct_answer": w3,
                    "options": [
                        {"text": w3, "icon": w3_icon, "hint": d3},
                        {"text": w1, "icon": w1_icon, "hint": d1},
                        {"text": w2, "icon": w2_icon, "hint": d2},
                    ]
                },
                {
                    "type": "fill_blank",
                    "prompt": f"Fill in the missing word in {lang_name}",
                    "target_sentence": f"{w1} ___ {w2}",
                    "correct_answer": w1
                },
                {
                    "type": "word_bank",
                    "prompt": "Write this in English",
                    "target_sentence": f"{w1} {w2}",
                    "correct_answer": f"{t1} {t2}",
                    "sentence_parts": [t1, t2, t3, "a", "please", "hot"]
                },
                {
                    "type": "type_answer",
                    "prompt": f"Type in {lang_name}",
                    "target_sentence": w2,
                    "correct_answer": w2
                },
                {
                    "type": "match_pairs",
                    "prompt": "Speed Match Pairs",
                    "target_sentence": f"{w1}, {w2}, {w3}",
                    "correct_answer": f'{{"{w1}":"{t1}","{w2}":"{t2}","{w3}":"{t3}"}}',
                    "options": {"left": [w1, w2, w3], "right": [t1, t2, t3]}
                },
                {
                    "type": "word_bank",
                    "prompt": "Translate this phrase",
                    "target_sentence": f"{w1}, {w3}",
                    "correct_answer": f"{t1}, {t3}",
                    "sentence_parts": [t1, t3, t2, "thanks", "yes", "and"]
                },
                {
                    "type": "fill_blank",
                    "prompt": f"Complete the expression in {lang_name}",
                    "target_sentence": f"___ {w3}",
                    "correct_answer": w2
                },
                {
                    "type": "type_answer",
                    "prompt": f"Write this in {lang_name}",
                    "target_sentence": w3,
                    "correct_answer": w3
                }
            ]

            # Lesson 3: Fluency & Speed Challenge (9 Interactive Exercises)
            l3_exercises = [
                {
                    "type": "multiple_choice",
                    "prompt": f'Which one of these is "{t1.lower()}"?',
                    "target_sentence": w1,
                    "correct_answer": w1,
                    "options": [
                        {"text": w1, "icon": w1_icon, "hint": d1},
                        {"text": w2, "icon": w2_icon, "hint": d2},
                        {"text": w3, "icon": w3_icon, "hint": d3},
                    ]
                },
                {
                    "type": "word_bank",
                    "prompt": "Rapid Translation to English",
                    "target_sentence": f"{w2} {w1}",
                    "correct_answer": f"{t2} {t1}",
                    "sentence_parts": [t2, t1, t3, "good", "night", "sir"]
                },
                {
                    "type": "fill_blank",
                    "prompt": f"Complete sentence in {lang_name}",
                    "target_sentence": f"{w1} {w2} ___",
                    "correct_answer": w3
                },
                {
                    "type": "type_answer",
                    "prompt": f"Type in {lang_name}",
                    "target_sentence": w2,
                    "correct_answer": w2
                },
                {
                    "type": "match_pairs",
                    "prompt": "Mastery Match Pairs",
                    "target_sentence": f"{w1}, {w2}, {w3}",
                    "correct_answer": f'{{"{w1}":"{t1}","{w2}":"{t2}","{w3}":"{t3}"}}',
                    "options": {"left": [w1, w2, w3], "right": [t1, t2, t3]}
                },
                {
                    "type": "word_bank",
                    "prompt": f"Write this in {lang_name}",
                    "target_sentence": f"{t1} {t2}",
                    "correct_answer": f"{w1} {w2}",
                    "sentence_parts": [w1, w2, w3, "por", "favor", "gracias"]
                },
                {
                    "type": "type_answer",
                    "prompt": f"Write this in {lang_name}",
                    "target_sentence": w1,
                    "correct_answer": w1
                },
                {
                    "type": "type_answer",
                    "prompt": f"Write this in {lang_name}",
                    "target_sentence": w3,
                    "correct_answer": w3
                },
                {
                    "type": "word_bank",
                    "prompt": "Translate this complete sentence",
                    "target_sentence": f"{w1}, {w2}, {w3}",
                    "correct_answer": f"{t1}, {t2}, {t3}",
                    "sentence_parts": [t1, t2, t3, "want", "please", "thanks", "a"]
                }
            ]

            skill_item = {
                "title": s_title,
                "icon": s_icon,
                "lessons": [
                    {"title": f"Lesson 1: New Words ({s_title})", "exercises": l1_exercises},
                    {"title": f"Lesson 2: Sentence Building ({s_title})", "exercises": l2_exercises},
                    {"title": f"Lesson 3: Fluency Challenge ({s_title})", "exercises": l3_exercises},
                ]
            }
            unit_item["skills"].append(skill_item)

        units_data.append(unit_item)

    return units_data


async def seed_database(db: AsyncSession) -> None:
    """Populate database with multi-language demo data if empty."""
    result = await db.execute(select(User))
    if result.scalars().first() is not None:
        return

    courses = [
        Course(id=1, language="Spanish", code="es", flag_emoji="🇪🇸"),
        Course(id=2, language="French", code="fr", flag_emoji="🇫🇷"),
        Course(id=3, language="German", code="de", flag_emoji="🇩🇪"),
        Course(id=4, language="Japanese", code="ja", flag_emoji="🇯🇵"),
        Course(id=5, language="Italian", code="it", flag_emoji="🇮🇹"),
    ]
    db.add_all(courses)

    users = [
        User(id=1, username="learner", display_name="Learner", avatar_url="🧑‍🎓", xp=0, hearts=5, streak_days=0, gems=500, active_course_id=1),
        User(id=2, username="maria_g", display_name="María García", avatar_url="👩‍🦰", xp=1250, hearts=5, streak_days=14, gems=800, active_course_id=1),
        User(id=3, username="james_k", display_name="James Kim", avatar_url="👨‍💼", xp=980, hearts=5, streak_days=7, gems=650, active_course_id=2),
        User(id=4, username="aiko_t", display_name="Aiko Tanaka", avatar_url="👩‍🔬", xp=1100, hearts=5, streak_days=21, gems=900, active_course_id=4),
    ]
    db.add_all(users)

    skill_global_id = 1
    lesson_global_id = 1
    exercise_global_id = 1

    for c in courses:
        units_spec = _build_course_curriculum(c.id, c.language)
        for u_data in units_spec:
            unit = Unit(
                course_id=c.id,
                order=u_data["order"],
                title=u_data["title"],
                description=u_data["description"],
                color=u_data["color"],
            )
            db.add(unit)
            await db.flush()

            for s_index, s_data in enumerate(u_data["skills"], start=1):
                skill = Skill(
                    id=skill_global_id,
                    unit_id=unit.id,
                    order=s_index,
                    title=s_data["title"],
                    icon=s_data["icon"],
                )
                db.add(skill)
                await db.flush()

                for l_index, l_data in enumerate(s_data["lessons"], start=1):
                    lesson = Lesson(
                        id=lesson_global_id,
                        skill_id=skill.id,
                        order=l_index,
                    )
                    db.add(lesson)
                    await db.flush()

                    for e_index, e_data in enumerate(l_data["exercises"], start=1):
                        exercise = Exercise(
                            id=exercise_global_id,
                            lesson_id=lesson.id,
                            order=e_index,
                            type=e_data["type"],
                            prompt=e_data["prompt"],
                            target_sentence=e_data.get("target_sentence"),
                            correct_answer=e_data["correct_answer"],
                            options=e_data.get("options"),
                            sentence_parts=e_data.get("sentence_parts"),
                        )
                        db.add(exercise)
                        exercise_global_id += 1

                    lesson_global_id += 1

                for u in users:
                    is_unlocked = (u_data["order"] == 1 and s_index == 1)
                    sp = SkillProgress(
                        user_id=u.id,
                        skill_id=skill.id,
                        completed_lessons=0,
                        total_lessons=3,
                        is_locked=not is_unlocked,
                    )
                    db.add(sp)

                skill_global_id += 1

    await db.commit()
