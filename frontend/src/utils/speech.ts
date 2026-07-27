/**
 * Web Speech API helper for native text-to-speech pronunciation.
 */

export function speakText(text: string, langCode: string = "es-ES"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  try {
    // Cancel any previous active speech
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/\[.*?\]/g, "").replace(/https?:\/\/\S+/g, "").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9; // Slightly slower for language learners
    utterance.pitch = 1.0;

    // Determine target speech synthesis language tag
    let targetLang = "es-ES";
    const code = langCode.toLowerCase();
    if (code.includes("fr")) targetLang = "fr-FR";
    else if (code.includes("de")) targetLang = "de-DE";
    else if (code.includes("ja")) targetLang = "ja-JP";
    else if (code.includes("it")) targetLang = "it-IT";
    else if (code.includes("en")) targetLang = "en-US";

    utterance.lang = targetLang;

    // Pick best voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Speech synthesis failed:", e);
  }
}
