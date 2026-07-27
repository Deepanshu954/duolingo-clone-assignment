"use client";

import { useEffect, useState } from "react";
import { Languages, Volume2, Sparkles, Check, Play, BookOpen } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { RefillModal } from "@/components/RefillModal";
import { api, UserData, CourseData } from "@/lib/api";
import { soundFX } from "@/utils/soundFX";
import { speakText } from "@/utils/speech";

interface LetterTile {
  letter: string;
  category: "vowel" | "consonant" | "special";
  englishEquivalent: string;
  pronunciationIPA: string;
  exampleWord: string;
  exampleTranslation: string;
  usageNotes: string;
}

export default function LettersPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [activeCourse, setActiveCourse] = useState<CourseData | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "vowel" | "consonant" | "special">("all");
  const [selectedLetter, setSelectedLetter] = useState<LetterTile | null>(null);
  const [isRefillOpen, setIsRefillOpen] = useState(false);

  const loadData = async () => {
    try {
      const u = await api.getUser();
      setUser(u);
      const list = await api.getCourses();
      setCourses(list);
      const active = list.find((c) => c.id === u.active_course_id) || list[0];
      setActiveCourse(active);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const getLettersForLanguage = (code: string): LetterTile[] => {
    switch (code) {
      case "fr":
        return [
          { letter: "A", category: "vowel", englishEquivalent: "ah (as in father)", pronunciationIPA: "/a/", exampleWord: "Ami", exampleTranslation: "Friend", usageNotes: "Pure open front vowel." },
          { letter: "B", category: "consonant", englishEquivalent: "b (as in boy)", pronunciationIPA: "/b/", exampleWord: "Bonjour", exampleTranslation: "Hello", usageNotes: "Standard voiced bilabial." },
          { letter: "C", category: "consonant", englishEquivalent: "k / s", pronunciationIPA: "/k/, /s/", exampleWord: "Café", exampleTranslation: "Coffee", usageNotes: "Hard before A,O,U; soft before E,I." },
          { letter: "Ç", category: "special", englishEquivalent: "soft s (as in see)", pronunciationIPA: "/s/", exampleWord: "Garçon", exampleTranslation: "Boy", usageNotes: "Cedilla makes C soft before A, O, U." },
          { letter: "D", category: "consonant", englishEquivalent: "d (dental)", pronunciationIPA: "/d/", exampleWord: "Deux", exampleTranslation: "Two", usageNotes: "Tongue touches upper teeth." },
          { letter: "E", category: "vowel", englishEquivalent: "uh (as in her)", pronunciationIPA: "/ə/", exampleWord: "Le", exampleTranslation: "The", usageNotes: "Neutral schwa sound." },
          { letter: "É", category: "special", englishEquivalent: "ay (as in say)", pronunciationIPA: "/e/", exampleWord: "Café", exampleTranslation: "Coffee", usageNotes: "Accent aigu: sharp closed vowel." },
          { letter: "È", category: "special", englishEquivalent: "eh (as in bed)", pronunciationIPA: "/ɛ/", exampleWord: "Père", exampleTranslation: "Father", usageNotes: "Accent grave: open vowel." },
          { letter: "F", category: "consonant", englishEquivalent: "f (as in fan)", pronunciationIPA: "/f/", exampleWord: "Femme", exampleTranslation: "Woman", usageNotes: "Labiodental fricative." },
          { letter: "G", category: "consonant", englishEquivalent: "g / zh", pronunciationIPA: "/ɡ/, /ʒ/", exampleWord: "Gare", exampleTranslation: "Station", usageNotes: "Soft 'zh' sound before E, I." },
          { letter: "H", category: "consonant", englishEquivalent: "silent (never spoken)", pronunciationIPA: "-", exampleWord: "Hôtel", exampleTranslation: "Hotel", usageNotes: "French H is ALWAYS silent." },
          { letter: "I", category: "vowel", englishEquivalent: "ee (as in see)", pronunciationIPA: "/i/", exampleWord: "Iliade", exampleTranslation: "Iliad", usageNotes: "High front vowel." },
          { letter: "J", category: "consonant", englishEquivalent: "zh (as in measure)", pronunciationIPA: "/ʒ/", exampleWord: "Jour", exampleTranslation: "Day", usageNotes: "Soft voiced palatal fricative." },
          { letter: "K", category: "consonant", englishEquivalent: "k (as in key)", pronunciationIPA: "/k/", exampleWord: "Kilo", exampleTranslation: "Kilo", usageNotes: "Used in foreign loanwords." },
          { letter: "L", category: "consonant", englishEquivalent: "l (as in love)", pronunciationIPA: "/l/", exampleWord: "Livre", exampleTranslation: "Book", usageNotes: "Alveolar lateral." },
          { letter: "M", category: "consonant", englishEquivalent: "m (as in mother)", pronunciationIPA: "/m/", exampleWord: "Merci", exampleTranslation: "Thank you", usageNotes: "Bilabial nasal." },
          { letter: "N", category: "consonant", englishEquivalent: "n (nasal vowel ending)", pronunciationIPA: "/n/", exampleWord: "Nuit", exampleTranslation: "Night", usageNotes: "Nasalized at word end." },
          { letter: "O", category: "vowel", englishEquivalent: "oh (as in boat)", pronunciationIPA: "/o/", exampleWord: "Oui", exampleTranslation: "Yes", usageNotes: "Rounded back vowel." },
          { letter: "P", category: "consonant", englishEquivalent: "p (as in pen)", pronunciationIPA: "/p/", exampleWord: "Paris", exampleTranslation: "Paris", usageNotes: "Unaspirated French P." },
          { letter: "Q", category: "consonant", englishEquivalent: "k (followed by U)", pronunciationIPA: "/k/", exampleWord: "Quatre", exampleTranslation: "Four", usageNotes: "Always paired with U." },
          { letter: "R", category: "consonant", englishEquivalent: "guttural r (back throat)", pronunciationIPA: "/ʁ/", exampleWord: "Rouge", exampleTranslation: "Red", usageNotes: "Uvular friction sound." },
          { letter: "S", category: "consonant", englishEquivalent: "s / z", pronunciationIPA: "/s/, /z/", exampleWord: "Soleil", exampleTranslation: "Sun", usageNotes: "Sounds like Z between vowels." },
          { letter: "T", category: "consonant", englishEquivalent: "t (dental)", pronunciationIPA: "/t/", exampleWord: "Train", exampleTranslation: "Train", usageNotes: "Tongue against upper teeth." },
          { letter: "U", category: "vowel", englishEquivalent: "ew (rounded lips)", pronunciationIPA: "/y/", exampleWord: "Une", exampleTranslation: "One", usageNotes: "Say 'ee' with lips shaped like 'oo'." },
          { letter: "V", category: "consonant", englishEquivalent: "v (as in van)", pronunciationIPA: "/v/", exampleWord: "Vin", exampleTranslation: "Wine", usageNotes: "Voiced labiodental." },
          { letter: "W", category: "consonant", englishEquivalent: "v / w", pronunciationIPA: "/v/", exampleWord: "Wagon", exampleTranslation: "Wagon", usageNotes: "Germanic loanwords." },
          { letter: "X", category: "consonant", englishEquivalent: "ks / gz", pronunciationIPA: "/ks/", exampleWord: "Taxi", exampleTranslation: "Taxi", usageNotes: "Silent at word end." },
          { letter: "Y", category: "vowel", englishEquivalent: "ee (double i)", pronunciationIPA: "/i/", exampleWord: "Yeux", exampleTranslation: "Eyes", usageNotes: "Greek I sound." },
          { letter: "Z", category: "consonant", englishEquivalent: "z (as in zoo)", pronunciationIPA: "/z/", exampleWord: "Zéro", exampleTranslation: "Zero", usageNotes: "Voiced alveolar." },
        ];

      case "de":
        return [
          { letter: "A", category: "vowel", englishEquivalent: "ah (as in father)", pronunciationIPA: "/aː/", exampleWord: "Abend", exampleTranslation: "Evening", usageNotes: "Long open German A." },
          { letter: "Ä", category: "special", englishEquivalent: "eh (as in bed)", pronunciationIPA: "/ɛː/", exampleWord: "Äpfel", exampleTranslation: "Apples", usageNotes: "A-Umlaut." },
          { letter: "B", category: "consonant", englishEquivalent: "b / p", pronunciationIPA: "/b/", exampleWord: "Brot", exampleTranslation: "Bread", usageNotes: "Sounds like P at word end." },
          { letter: "C", category: "consonant", englishEquivalent: "ts / k", pronunciationIPA: "/ts/", exampleWord: "Computer", exampleTranslation: "Computer", usageNotes: "Hard K in loanwords." },
          { letter: "D", category: "consonant", englishEquivalent: "d / t", pronunciationIPA: "/d/", exampleWord: "Danke", exampleTranslation: "Thanks", usageNotes: "Sounds like T at word end." },
          { letter: "E", category: "vowel", englishEquivalent: "eh (as in met)", pronunciationIPA: "/eː/", exampleWord: "Essen", exampleTranslation: "Food", usageNotes: "Mid-front vowel." },
          { letter: "F", category: "consonant", englishEquivalent: "f (as in fan)", pronunciationIPA: "/f/", exampleWord: "Frau", exampleTranslation: "Woman", usageNotes: "Unvoiced labiodental." },
          { letter: "G", category: "consonant", englishEquivalent: "g / k", pronunciationIPA: "/ɡ/", exampleWord: "Geld", exampleTranslation: "Money", usageNotes: "Soft ch ending in Northern Germany." },
          { letter: "H", category: "consonant", englishEquivalent: "h (aspirated)", pronunciationIPA: "/h/", exampleWord: "Hallo", exampleTranslation: "Hello", usageNotes: "Lengthens preceding vowel." },
          { letter: "I", category: "vowel", englishEquivalent: "ee (as in see)", pronunciationIPA: "/iː/", exampleWord: "Ich", exampleTranslation: "I", usageNotes: "High front vowel." },
          { letter: "J", category: "consonant", englishEquivalent: "y (as in yes)", pronunciationIPA: "/j/", exampleWord: "Ja", exampleTranslation: "Yes", usageNotes: "German J sounds like English Y." },
          { letter: "K", category: "consonant", englishEquivalent: "k (as in key)", pronunciationIPA: "/k/", exampleWord: "Kind", exampleTranslation: "Child", usageNotes: "Aspirated hard K." },
          { letter: "L", category: "consonant", englishEquivalent: "l (as in love)", pronunciationIPA: "/l/", exampleWord: "Laden", exampleTranslation: "Shop", usageNotes: "Clear German L." },
          { letter: "M", category: "consonant", englishEquivalent: "m (as in mother)", pronunciationIPA: "/m/", exampleWord: "Mann", exampleTranslation: "Man", usageNotes: "Bilabial nasal." },
          { letter: "N", category: "consonant", englishEquivalent: "n (as in no)", pronunciationIPA: "/n/", exampleWord: "Nacht", exampleTranslation: "Night", usageNotes: "Alveolar nasal." },
          { letter: "O", category: "vowel", englishEquivalent: "oh (as in go)", pronunciationIPA: "/oː/", exampleWord: "Oder", exampleTranslation: "Or", usageNotes: "Long rounded back vowel." },
          { letter: "Ö", category: "special", englishEquivalent: "er (as in her)", pronunciationIPA: "/øː/", exampleWord: "Öl", exampleTranslation: "Oil", usageNotes: "O-Umlaut vowel." },
          { letter: "P", category: "consonant", englishEquivalent: "p (as in pen)", pronunciationIPA: "/p/", exampleWord: "Party", exampleTranslation: "Party", usageNotes: "Aspirated P." },
          { letter: "Q", category: "consonant", englishEquivalent: "kv (as in quack)", pronunciationIPA: "/kv/", exampleWord: "Quelle", exampleTranslation: "Source", usageNotes: "Paired with U as 'KV'." },
          { letter: "R", category: "consonant", englishEquivalent: "guttural r / vocalic", pronunciationIPA: "/ʁ/", exampleWord: "Regen", exampleTranslation: "Rain", usageNotes: "Uvular trill or vocalized." },
          { letter: "S", category: "consonant", englishEquivalent: "z (before vowels) / sh", pronunciationIPA: "/z/", exampleWord: "Sonne", exampleTranslation: "Sun", usageNotes: "Sounds like Z starting words." },
          { letter: "ß", category: "special", englishEquivalent: "sharp double ss", pronunciationIPA: "/s/", exampleWord: "Straße", exampleTranslation: "Street", usageNotes: "Eszett (sharp unvoiced S)." },
          { letter: "T", category: "consonant", englishEquivalent: "t (as in tea)", pronunciationIPA: "/t/", exampleWord: "Tee", exampleTranslation: "Tea", usageNotes: "Strong aspirated T." },
          { letter: "U", category: "vowel", englishEquivalent: "oo (as in boot)", pronunciationIPA: "/uː/", exampleWord: "Uhr", exampleTranslation: "Clock", usageNotes: "High back vowel." },
          { letter: "Ü", category: "special", englishEquivalent: "ew (rounded lips)", pronunciationIPA: "/yː/", exampleWord: "Über", exampleTranslation: "Over", usageNotes: "U-Umlaut vowel." },
          { letter: "V", category: "consonant", englishEquivalent: "f (as in fan)", pronunciationIPA: "/f/", exampleWord: "Vater", exampleTranslation: "Father", usageNotes: "German V sounds like English F!" },
          { letter: "W", category: "consonant", englishEquivalent: "v (as in van)", pronunciationIPA: "/v/", exampleWord: "Wasser", exampleTranslation: "Water", usageNotes: "German W sounds like English V!" },
          { letter: "X", category: "consonant", englishEquivalent: "ks (as in box)", pronunciationIPA: "/ks/", exampleWord: "Xylophon", exampleTranslation: "Xylophone", usageNotes: "Unvoiced consonant combo." },
          { letter: "Y", category: "vowel", englishEquivalent: "ü (rounded lips)", pronunciationIPA: "/y/", exampleWord: "Typ", exampleTranslation: "Type", usageNotes: "Pronounced like Ü." },
          { letter: "Z", category: "consonant", englishEquivalent: "ts (as in cats)", pronunciationIPA: "/ts/", exampleWord: "Zug", exampleTranslation: "Train", usageNotes: "German Z sounds like 'TS'!" },
        ];

      case "ja":
        return [
          { letter: "あ (A)", category: "vowel", englishEquivalent: "ah (as in father)", pronunciationIPA: "/a/", exampleWord: "朝 (asa)", exampleTranslation: "Morning", usageNotes: "Hiragana basic A vowel." },
          { letter: "い (I)", category: "vowel", englishEquivalent: "ee (as in see)", pronunciationIPA: "/i/", exampleWord: "犬 (inu)", exampleTranslation: "Dog", usageNotes: "Hiragana basic I vowel." },
          { letter: "う (U)", category: "vowel", englishEquivalent: "oo (unrounded)", pronunciationIPA: "/ɯ/", exampleWord: "海 (umi)", exampleTranslation: "Sea", usageNotes: "Japanese unrounded U sound." },
          { letter: "え (E)", category: "vowel", englishEquivalent: "eh (as in met)", pronunciationIPA: "/e/", exampleWord: "駅 (eki)", exampleTranslation: "Station", usageNotes: "Hiragana basic E vowel." },
          { letter: "お (O)", category: "vowel", englishEquivalent: "oh (as in boat)", pronunciationIPA: "/o/", exampleWord: "お茶 (ocha)", exampleTranslation: "Green tea", usageNotes: "Hiragana basic O vowel." },
          { letter: "か (KA)", category: "consonant", englishEquivalent: "ka (as in kite)", pronunciationIPA: "/ka/", exampleWord: "川 (kawa)", exampleTranslation: "River", usageNotes: "K-row Hiragana syllable." },
          { letter: "き (KI)", category: "consonant", englishEquivalent: "key (as in key)", pronunciationIPA: "/ki/", exampleWord: "木 (ki)", exampleTranslation: "Tree", usageNotes: "K-row Hiragana syllable." },
          { letter: "く (KU)", category: "consonant", englishEquivalent: "koo (as in cool)", pronunciationIPA: "/kɯ/", exampleWord: "車 (kuruma)", exampleTranslation: "Car", usageNotes: "K-row Hiragana syllable." },
          { letter: "け (KE)", category: "consonant", englishEquivalent: "keh (as in kettle)", pronunciationIPA: "/ke/", exampleWord: "毛 (ke)", exampleTranslation: "Hair", usageNotes: "K-row Hiragana syllable." },
          { letter: "こ (KO)", category: "consonant", englishEquivalent: "koh (as in coat)", pronunciationIPA: "/ko/", exampleWord: "子供 (kodomo)", exampleTranslation: "Child", usageNotes: "K-row Hiragana syllable." },
          { letter: "さ (SA)", category: "consonant", englishEquivalent: "sah (as in saw)", pronunciationIPA: "/sa/", exampleWord: "魚 (sakana)", exampleTranslation: "Fish", usageNotes: "S-row Hiragana syllable." },
          { letter: "し (SHI)", category: "consonant", englishEquivalent: "shee (as in sheet)", pronunciationIPA: "/ɕi/", exampleWord: "塩 (shio)", exampleTranslation: "Salt", usageNotes: "Soft palatal S sound." },
          { letter: "す (SU)", category: "consonant", englishEquivalent: "soo (unrounded)", pronunciationIPA: "/sɯ/", exampleWord: "寿司 (sushi)", exampleTranslation: "Sushi", usageNotes: "S-row Hiragana syllable." },
          { letter: "せ (SE)", category: "consonant", englishEquivalent: "seh (as in set)", pronunciationIPA: "/se/", exampleWord: "世界 (sekai)", exampleTranslation: "World", usageNotes: "S-row Hiragana syllable." },
          { letter: "そ (SO)", category: "consonant", englishEquivalent: "soh (as in soap)", pronunciationIPA: "/so/", exampleWord: "空 (sora)", exampleTranslation: "Sky", usageNotes: "S-row Hiragana syllable." },
          { letter: "た (TA)", category: "consonant", englishEquivalent: "tah (as in top)", pronunciationIPA: "/ta/", exampleWord: "卵 (tamago)", exampleTranslation: "Egg", usageNotes: "T-row Hiragana syllable." },
          { letter: "ち (CHI)", category: "consonant", englishEquivalent: "chee (as in cheese)", pronunciationIPA: "/tɕi/", exampleWord: "父 (chichi)", exampleTranslation: "Father", usageNotes: "Soft palatal T sound." },
          { letter: "つ (TSU)", category: "consonant", englishEquivalent: "tsoo (as in tsunami)", pronunciationIPA: "/tsɯ/", exampleWord: "月 (tsuki)", exampleTranslation: "Moon", usageNotes: "Affricate syllable." },
          { letter: "て (TE)", category: "consonant", englishEquivalent: "teh (as in ten)", pronunciationIPA: "/te/", exampleWord: "手 (te)", exampleTranslation: "Hand", usageNotes: "T-row Hiragana syllable." },
          { letter: "と (TO)", category: "consonant", englishEquivalent: "toh (as in toe)", pronunciationIPA: "/to/", exampleWord: "友達 (tomodachi)", exampleTranslation: "Friend", usageNotes: "T-row Hiragana syllable." },
          { letter: "な (NA)", category: "consonant", englishEquivalent: "nah (as in not)", pronunciationIPA: "/na/", exampleWord: "夏 (natsu)", exampleTranslation: "Summer", usageNotes: "N-row Hiragana syllable." },
          { letter: "に (NI)", category: "consonant", englishEquivalent: "nee (as in knee)", pronunciationIPA: "/ɲi/", exampleWord: "肉 (niku)", exampleTranslation: "Meat", usageNotes: "N-row Hiragana syllable." },
          { letter: "ぬ (NU)", category: "consonant", englishEquivalent: "noo (as in noon)", pronunciationIPA: "/nɯ/", exampleWord: "犬 (inu)", exampleTranslation: "Dog", usageNotes: "N-row Hiragana syllable." },
          { letter: "ね (NE)", category: "consonant", englishEquivalent: "neh (as in net)", pronunciationIPA: "/ne/", exampleWord: "猫 (neko)", exampleTranslation: "Cat", usageNotes: "N-row Hiragana syllable." },
          { letter: "の (NO)", category: "consonant", englishEquivalent: "noh (as in no)", pronunciationIPA: "/no/", exampleWord: "飲物 (nomimono)", exampleTranslation: "Drink", usageNotes: "N-row Hiragana syllable." },
          { letter: "ん (N)", category: "special", englishEquivalent: "n (nasal end)", pronunciationIPA: "/n/", exampleWord: "日本 (nihon)", exampleTranslation: "Japan", usageNotes: "Only standalone consonant." },
          { letter: "ア (A)", category: "special", englishEquivalent: "ah (Katakana)", pronunciationIPA: "/a/", exampleWord: "アメリカ", exampleTranslation: "America", usageNotes: "Katakana script for foreign words." },
          { letter: "カ (KA)", category: "special", englishEquivalent: "ka (Katakana)", pronunciationIPA: "/ka/", exampleWord: "カメラ", exampleTranslation: "Camera", usageNotes: "Katakana script for foreign words." },
        ];

      case "it":
        return [
          { letter: "A", category: "vowel", englishEquivalent: "ah (as in father)", pronunciationIPA: "/a/", exampleWord: "Amore", exampleTranslation: "Love", usageNotes: "Pure open Italian vowel." },
          { letter: "B", category: "consonant", englishEquivalent: "b (as in boy)", pronunciationIPA: "/b/", exampleWord: "Bello", exampleTranslation: "Beautiful", usageNotes: "Voiced bilabial stop." },
          { letter: "C", category: "consonant", englishEquivalent: "k (hard) / ch (soft)", pronunciationIPA: "/k/, /tʃ/", exampleWord: "Ciao", exampleTranslation: "Hello / Bye", usageNotes: "Soft 'ch' sound before E, I." },
          { letter: "D", category: "consonant", englishEquivalent: "d (dental)", pronunciationIPA: "/d/", exampleWord: "Donna", exampleTranslation: "Woman", usageNotes: "Dental voiced stop." },
          { letter: "E", category: "vowel", englishEquivalent: "eh (as in bed)", pronunciationIPA: "/e/", exampleWord: "Erba", exampleTranslation: "Grass", usageNotes: "Mid-front Italian vowel." },
          { letter: "F", category: "consonant", englishEquivalent: "f (as in fan)", pronunciationIPA: "/f/", exampleWord: "Famiglia", exampleTranslation: "Family", usageNotes: "Unvoiced labiodental." },
          { letter: "G", category: "consonant", englishEquivalent: "g (hard) / j (soft)", pronunciationIPA: "/ɡ/, /dʒ/", exampleWord: "Gelato", exampleTranslation: "Gelato", usageNotes: "Soft 'j' sound before E, I." },
          { letter: "H", category: "consonant", englishEquivalent: "silent (hardens C/G)", pronunciationIPA: "-", exampleWord: "Hanno", exampleTranslation: "They have", usageNotes: "Italian H is ALWAYS completely silent!" },
          { letter: "I", category: "vowel", englishEquivalent: "ee (as in see)", pronunciationIPA: "/i/", exampleWord: "Italia", exampleTranslation: "Italy", usageNotes: "High front vowel." },
          { letter: "L", category: "consonant", englishEquivalent: "l (as in love)", pronunciationIPA: "/l/", exampleWord: "Lavoro", exampleTranslation: "Work", usageNotes: "Alveolar lateral." },
          { letter: "M", category: "consonant", englishEquivalent: "m (as in mother)", pronunciationIPA: "/m/", exampleWord: "Mare", exampleTranslation: "Sea", usageNotes: "Bilabial nasal." },
          { letter: "N", category: "consonant", englishEquivalent: "n (as in no)", pronunciationIPA: "/n/", exampleWord: "Notte", exampleTranslation: "Night", usageNotes: "Alveolar nasal." },
          { letter: "O", category: "vowel", englishEquivalent: "oh (as in boat)", pronunciationIPA: "/o/", exampleWord: "Ora", exampleTranslation: "Hour", usageNotes: "Mid back rounded vowel." },
          { letter: "P", category: "consonant", englishEquivalent: "p (as in pen)", pronunciationIPA: "/p/", exampleWord: "Pizza", exampleTranslation: "Pizza", usageNotes: "Unaspirated bilabial stop." },
          { letter: "Q", category: "consonant", englishEquivalent: "kw (paired with U)", pronunciationIPA: "/kw/", exampleWord: "Questo", exampleTranslation: "This", usageNotes: "Always followed by U." },
          { letter: "R", category: "consonant", englishEquivalent: "rolled r (trill)", pronunciationIPA: "/r/", exampleWord: "Roma", exampleTranslation: "Rome", usageNotes: "Tongue tip trill." },
          { letter: "S", category: "consonant", englishEquivalent: "s (unvoiced) / z (voiced)", pronunciationIPA: "/s/", exampleWord: "Sole", exampleTranslation: "Sun", usageNotes: "Soft between vowels." },
          { letter: "T", category: "consonant", englishEquivalent: "t (dental)", pronunciationIPA: "/t/", exampleWord: "Treno", exampleTranslation: "Train", usageNotes: "Dental unvoiced stop." },
          { letter: "U", category: "vowel", englishEquivalent: "oo (as in boot)", pronunciationIPA: "/u/", exampleWord: "Uovo", exampleTranslation: "Egg", usageNotes: "High back rounded vowel." },
          { letter: "V", category: "consonant", englishEquivalent: "v (as in van)", pronunciationIPA: "/v/", exampleWord: "Vino", exampleTranslation: "Wine", usageNotes: "Voiced labiodental." },
          { letter: "Z", category: "consonant", englishEquivalent: "ts / dz", pronunciationIPA: "/ts/", exampleWord: "Zucchero", exampleTranslation: "Sugar", usageNotes: "Ts sound as in pizza." },
          { letter: "ZZ", category: "special", englishEquivalent: "ts (double z)", pronunciationIPA: "/ts/", exampleWord: "Pizza", exampleTranslation: "Pizza", usageNotes: "Emphasized double Z sound." },
          { letter: "GLI", category: "special", englishEquivalent: "lyee (as in million)", pronunciationIPA: "/ʎ/", exampleWord: "Famiglia", exampleTranslation: "Family", usageNotes: "Italian palatal lateral sound." },
          { letter: "GN", category: "special", englishEquivalent: "ny (as in canyon)", pronunciationIPA: "/ɲ/", exampleWord: "Gnocchi", exampleTranslation: "Gnocchi", usageNotes: "Italian palatal nasal sound." },
        ];

      default: // ALL 27 OFFICIAL SPANISH LETTERS + Traditional Digraphs (CH, LL, RR)
        return [
          { letter: "A", category: "vowel", englishEquivalent: "ah (as in father)", pronunciationIPA: "/a/", exampleWord: "Amigo", exampleTranslation: "Friend", usageNotes: "1st letter: Pure open Spanish vowel." },
          { letter: "B", category: "consonant", englishEquivalent: "b (as in boy)", pronunciationIPA: "/b/", exampleWord: "Bueno", exampleTranslation: "Good", usageNotes: "2nd letter: Soft bilabial sound." },
          { letter: "C", category: "consonant", englishEquivalent: "k (hard) / s (soft)", pronunciationIPA: "/k/, /s/", exampleWord: "Casa", exampleTranslation: "House", usageNotes: "3rd letter: Soft 's' before E, I." },
          { letter: "CH", category: "special", englishEquivalent: "ch (as in chair)", pronunciationIPA: "/tʃ/", exampleWord: "Chico", exampleTranslation: "Boy", usageNotes: "Traditional Spanish digraph." },
          { letter: "D", category: "consonant", englishEquivalent: "d (th sound between vowels)", pronunciationIPA: "/d/", exampleWord: "Día", exampleTranslation: "Day", usageNotes: "4th letter: Dental consonant." },
          { letter: "E", category: "vowel", englishEquivalent: "eh (as in bed)", pronunciationIPA: "/e/", exampleWord: "El", exampleTranslation: "The", usageNotes: "5th letter: Mid-front vowel." },
          { letter: "F", category: "consonant", englishEquivalent: "f (as in fan)", pronunciationIPA: "/f/", exampleWord: "Familia", exampleTranslation: "Family", usageNotes: "6th letter: Unvoiced labiodental." },
          { letter: "G", category: "consonant", englishEquivalent: "g (hard) / h (soft)", pronunciationIPA: "/ɡ/, /x/", exampleWord: "Gato", exampleTranslation: "Cat", usageNotes: "7th letter: Soft 'h' before E, I." },
          { letter: "H", category: "consonant", englishEquivalent: "silent (never spoken)", pronunciationIPA: "-", exampleWord: "Hola", exampleTranslation: "Hello", usageNotes: "8th letter: ALWAYS completely silent!" },
          { letter: "I", category: "vowel", englishEquivalent: "ee (as in see)", pronunciationIPA: "/i/", exampleWord: "Isla", exampleTranslation: "Island", usageNotes: "9th letter: High front vowel." },
          { letter: "J", category: "consonant", englishEquivalent: "h (as in house)", pronunciationIPA: "/x/", exampleWord: "Jardín", exampleTranslation: "Garden", usageNotes: "10th letter: Sounds like English H!" },
          { letter: "K", category: "consonant", englishEquivalent: "k (as in key)", pronunciationIPA: "/k/", exampleWord: "Kilo", exampleTranslation: "Kilo", usageNotes: "11th letter: Used in loanwords." },
          { letter: "L", category: "consonant", englishEquivalent: "l (as in love)", pronunciationIPA: "/l/", exampleWord: "Libro", exampleTranslation: "Book", usageNotes: "12th letter: Clear alveolar L." },
          { letter: "LL", category: "special", englishEquivalent: "y (as in yes)", pronunciationIPA: "/ʝ/", exampleWord: "Llama", exampleTranslation: "Llama", usageNotes: "Double L pronounced like Y." },
          { letter: "M", category: "consonant", englishEquivalent: "m (as in mother)", pronunciationIPA: "/m/", exampleWord: "Manzana", exampleTranslation: "Apple", usageNotes: "13th letter: Bilabial nasal." },
          { letter: "N", category: "consonant", englishEquivalent: "n (as in no)", pronunciationIPA: "/n/", exampleWord: "Noche", exampleTranslation: "Night", usageNotes: "14th letter: Alveolar nasal." },
          { letter: "Ñ", category: "special", englishEquivalent: "ny (as in canyon)", pronunciationIPA: "/ɲ/", exampleWord: "Niño", exampleTranslation: "Boy", usageNotes: "15th letter: Official 27th RAE Spanish letter with tilde!" },
          { letter: "O", category: "vowel", englishEquivalent: "oh (as in boat)", pronunciationIPA: "/o/", exampleWord: "Ojo", exampleTranslation: "Eye", usageNotes: "16th letter: Mid-back rounded vowel." },
          { letter: "P", category: "consonant", englishEquivalent: "p (as in pen)", pronunciationIPA: "/p/", exampleWord: "Pan", exampleTranslation: "Bread", usageNotes: "17th letter: Unaspirated bilabial stop." },
          { letter: "Q", category: "consonant", englishEquivalent: "k (paired with U)", pronunciationIPA: "/k/", exampleWord: "Queso", exampleTranslation: "Cheese", usageNotes: "18th letter: Paired with silent U." },
          { letter: "R", category: "consonant", englishEquivalent: "tap r (as in butter)", pronunciationIPA: "/ɾ/", exampleWord: "Rosa", exampleTranslation: "Rose", usageNotes: "19th letter: Single tongue tap." },
          { letter: "RR", category: "special", englishEquivalent: "rolled r (strong trill)", pronunciationIPA: "/r/", exampleWord: "Perro", exampleTranslation: "Dog", usageNotes: "Vibrating tongue trill." },
          { letter: "S", category: "consonant", englishEquivalent: "s (as in sun)", pronunciationIPA: "/s/", exampleWord: "Sol", exampleTranslation: "Sun", usageNotes: "20th letter: Unvoiced sibilant." },
          { letter: "T", category: "consonant", englishEquivalent: "t (dental)", pronunciationIPA: "/t/", exampleWord: "Té", exampleTranslation: "Tea", usageNotes: "21st letter: Tongue against upper teeth." },
          { letter: "U", category: "vowel", englishEquivalent: "oo (as in boot)", pronunciationIPA: "/u/", exampleWord: "Uno", exampleTranslation: "One", usageNotes: "22nd letter: High back vowel." },
          { letter: "V", category: "consonant", englishEquivalent: "b (same as Spanish B!)", pronunciationIPA: "/b/", exampleWord: "Vino", exampleTranslation: "Wine", usageNotes: "23rd letter: Spanish V sounds identical to B!" },
          { letter: "W", category: "consonant", englishEquivalent: "w (as in water)", pronunciationIPA: "/w/", exampleWord: "Web", exampleTranslation: "Web", usageNotes: "24th letter: Used in loanwords." },
          { letter: "X", category: "consonant", englishEquivalent: "ks (as in box)", pronunciationIPA: "/ks/", exampleWord: "Examen", exampleTranslation: "Exam", usageNotes: "25th letter: Sounds like 'ks' or 'h' in Mexico." },
          { letter: "Y", category: "consonant", englishEquivalent: "y (as in yes) / ee", pronunciationIPA: "/ʝ/", exampleWord: "Yo", exampleTranslation: "I / Me", usageNotes: "26th letter: Known as 'I griega'." },
          { letter: "Z", category: "consonant", englishEquivalent: "th (Spain) / s (Latin America)", pronunciationIPA: "/θ/", exampleWord: "Zapato", exampleTranslation: "Shoe", usageNotes: "27th letter: Th sound in Spain." },
        ];
    }
  };

  const allLetters = getLettersForLanguage(activeCourse?.code || "es");
  const filteredLetters = selectedFilter === "all" ? allLetters : allLetters.filter((l) => l.category === selectedFilter);

  const handleLetterClick = (tile: LetterTile) => {
    setSelectedLetter(tile);
    soundFX.playCorrect();
    speakText(tile.exampleWord, activeCourse?.code || "es");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-slate-900 dark:text-slate-100 md:pl-64">
      <Header user={user} onRefillHearts={() => setIsRefillOpen(true)} onCourseChange={loadData} />
      <Sidebar />

      <div className="flex justify-center">
        <main className="flex-1 px-4 py-8 pb-24 md:max-w-3xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500 text-white shadow-md">
              <Languages className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 dark:text-slate-100">
              {activeCourse ? activeCourse.language : "Spanish"} Alphabet &amp; Phonetics Chart ({allLetters.length} Letters)
            </h1>
            <p className="mt-1 text-sm font-bold text-gray-500 dark:text-slate-400">
              Complete official alphabet, vowels, consonants, IPA phonetics, and audio sound synthesis for {activeCourse?.flag_emoji} {activeCourse?.language}!
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: `ALL (${allLetters.length})`, icon: Sparkles },
              { id: "vowel", label: "VOWELS 🗣️", icon: BookOpen },
              { id: "consonant", label: "CONSONANTS 🔡", icon: Play },
              { id: "special", label: "SPECIAL & ACCENTS ✍️", icon: Check },
            ].map((f) => {
              const Icon = f.icon;
              const isActive = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedFilter(f.id as any);
                  }}
                  className={`flex items-center gap-1.5 rounded-2xl border-2 px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? "border-sky-500 bg-sky-500 text-white shadow-md scale-102"
                      : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-sky-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Alphabet Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
            {filteredLetters.map((tile) => {
              const isSelected = selectedLetter?.letter === tile.letter;
              return (
                <button
                  key={tile.letter}
                  onClick={() => handleLetterClick(tile)}
                  className={`flex flex-col items-center justify-between rounded-3xl border-2 border-b-4 p-4 text-center transition-all cursor-pointer bg-white dark:bg-slate-900 ${
                    isSelected
                      ? "border-4 border-sky-400 bg-sky-50 dark:bg-sky-950/40 shadow-lg scale-105"
                      : "border-gray-200 dark:border-slate-800 hover:border-sky-300 hover:scale-102"
                  }`}
                >
                  <span className="text-4xl font-black text-sky-500 mb-1">{tile.letter}</span>
                  <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                    {tile.pronunciationIPA}
                  </span>
                  <div className="mt-2 text-xs font-bold text-gray-700 dark:text-slate-200">
                    {`= "${tile.englishEquivalent.split(" ")[0]}"`}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-extrabold text-sky-500">
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{tile.exampleWord}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Letter Detail Drawer Card */}
          {selectedLetter && (
            <div className="rounded-3xl border-2 border-sky-300 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/30 p-6 shadow-md animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-500 text-white font-black text-5xl shadow-md">
                    {selectedLetter.letter}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-sky-200 dark:bg-sky-900/60 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-800 dark:text-sky-200">
                        {selectedLetter.category}
                      </span>
                      <span className="text-xs font-black text-gray-400">IPA {selectedLetter.pronunciationIPA}</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-slate-100 mt-1">
                      English Equivalent: {selectedLetter.englishEquivalent}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mt-0.5">
                      {selectedLetter.usageNotes}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-900 p-4 text-center min-w-44">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Example Word</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => speakText(selectedLetter.exampleWord, activeCourse?.code || "es")}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white shadow-xs hover:scale-105 transition-transform"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <span className="text-xl font-black text-sky-500">{selectedLetter.exampleWord}</span>
                  </div>
                  <span className="text-xs font-extrabold text-gray-500 dark:text-slate-400 block mt-1">
                    = {selectedLetter.exampleTranslation}
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>

        <RightSidebar user={user} />
      </div>

      <RefillModal
        isOpen={isRefillOpen}
        onClose={() => setIsRefillOpen(false)}
        onConfirmRefill={async () => {
          await api.refillHearts();
          setUser(await api.getUser());
          setIsRefillOpen(false);
        }}
        userGems={user?.gems || 0}
      />
    </div>
  );
}
