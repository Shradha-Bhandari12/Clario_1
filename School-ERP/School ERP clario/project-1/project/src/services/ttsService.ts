/**
 * Text-to-Speech Service with Indian Regional Language Support
 * Supports Hindi, Marathi, Tamil, Telugu, Kannada, and Bengali with native voice characteristics
 */

export type IndianLanguage = 'hi-IN' | 'mr-IN' | 'ta-IN' | 'te-IN' | 'kn-IN' | 'bn-IN' | 'en-IN';

interface TTSOptions {
  language?: IndianLanguage;
  rate?: number;
  pitch?: number;
  volume?: number;
}

const DEFAULT_OPTIONS: TTSOptions = {
  language: 'hi-IN',
  rate: 0.9,
  pitch: 1.0,
  volume: 1.0,
};

export const INDIAN_LANGUAGES = {
  'hi-IN': { name: 'Hindi', region: 'North India' },
  'mr-IN': { name: 'Marathi', region: 'West India' },
  'ta-IN': { name: 'Tamil', region: 'South India' },
  'te-IN': { name: 'Telugu', region: 'South India' },
  'kn-IN': { name: 'Kannada', region: 'South India' },
  'bn-IN': { name: 'Bengali', region: 'East India' },
  'en-IN': { name: 'English (Indian)', region: 'Pan-India' },
};

class TTSService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;

  /**
   * Speak text with Indian regional tone
   */
  speak(text: string, options: TTSOptions = {}): void {
    // Stop any ongoing speech
    this.stop();

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    if (!('speechSynthesis' in window)) {
      console.warn('Speech Synthesis not supported in this browser');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = mergedOptions.language || 'hi-IN';
    utterance.rate = mergedOptions.rate || 0.9;
    utterance.pitch = mergedOptions.pitch || 1.0;
    utterance.volume = mergedOptions.volume || 1.0;

    // Select appropriate voice for Indian accent
    this.selectIndianVoice(utterance, mergedOptions.language);

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech Synthesis Error:', event.error);
      this.isSpeaking = false;
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Select the best available voice for Indian accent
   */
  private selectIndianVoice(
    utterance: SpeechSynthesisUtterance,
    language?: IndianLanguage
  ): void {
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      console.warn('No voices available');
      return;
    }

    const targetLang = language || 'hi-IN';

    // Try to find exact language match
    let selectedVoice = voices.find(
      (voice) => voice.lang.startsWith(targetLang.split('-')[0])
    );

    // Fallback to any Indian voice
    if (!selectedVoice) {
      selectedVoice = voices.find(
        (voice) => voice.lang.includes('IN') || voice.lang.includes('India')
      );
    }

    // Last resort: use first available voice with reasonable language
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  /**
   * Check if currently speaking
   */
  isSpeakingNow(): boolean {
    return this.isSpeaking;
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (window.speechSynthesis && this.isSpeaking) {
      window.speechSynthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }

  /**
   * Get available voices information
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return window.speechSynthesis?.getVoices() || [];
  }

  /**
   * Get supported Indian languages
   */
  getSupportedLanguages(): typeof INDIAN_LANGUAGES {
    return INDIAN_LANGUAGES;
  }
}

// Export singleton instance
export const ttsService = new TTSService();
