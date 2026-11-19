// Speech Synthesis Voice Engine for Chemical Compounds & Bonding
class SpeechEngine {
  private isSpeaking: boolean = false;

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public speak(text: string, lang: 'tr' | 'en' = 'tr') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any previous speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'tr' ? 'tr-TR' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      // Select best voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const matchingVoice = voices.find(
          (v) => v.lang.startsWith(lang === 'tr' ? 'tr' : 'en') && !v.name.includes('Google')
        ) || voices.find((v) => v.lang.startsWith(lang === 'tr' ? 'tr' : 'en'));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
      };
      utterance.onend = () => {
        this.isSpeaking = false;
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      // Graceful fallback if speech synthesis is blocked
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }
}

export const speech = new SpeechEngine();
