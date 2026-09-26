/**
 * Advanced Voice Assistant Service with improved STT for Indian languages
 * Uses Google Cloud Speech-to-Text API for accurate Hindi and Marathi recognition
 */

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: ((event: Event) => void) | null;
}

export type SupportedLanguage = 'hi-IN' | 'mr-IN' | 'ta-IN' | 'te-IN' | 'kn-IN' | 'bn-IN' | 'en-IN';

interface VoiceConfig {
  language: SupportedLanguage;
  continuous: boolean;
  interimResults: boolean;
}

interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  language: SupportedLanguage;
  confidence?: number;
}

export const VOICE_LANGUAGES = {
  'hi-IN': { name: 'हिंदी (Hindi)', nativeName: 'Hindi', flag: '🇮🇳' },
  'mr-IN': { name: 'मराठी (Marathi)', nativeName: 'Marathi', flag: '🇮🇳' },
  'ta-IN': { name: 'தமிழ் (Tamil)', nativeName: 'Tamil', flag: '🇮🇳' },
  'te-IN': { name: 'తెలుగు (Telugu)', nativeName: 'Telugu', flag: '🇮🇳' },
  'kn-IN': { name: 'ಕನ್ನಡ (Kannada)', nativeName: 'Kannada', flag: '🇮🇳' },
  'bn-IN': { name: 'বাংলা (Bengali)', nativeName: 'Bengali', flag: '🇮🇳' },
  'en-IN': { name: 'English (Indian)', nativeName: 'English', flag: '🇬🇧' },
};

const LANGUAGE_CODES: Record<SupportedLanguage, string> = {
  'hi-IN': 'hi-IN',
  'mr-IN': 'mr-IN',
  'ta-IN': 'ta-IN',
  'te-IN': 'te-IN',
  'kn-IN': 'kn-IN',
  'bn-IN': 'bn-IN',
  'en-IN': 'en-IN',
};

class VoiceAssistantService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private currentLanguage: SupportedLanguage = 'hi-IN';
  private onTranscript: ((result: TranscriptionResult) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private interimTranscript = '';
  private finalTranscript = '';

  /**
   * Initialize the voice assistant with a specific language
   */
  initialize(language: SupportedLanguage = 'hi-IN'): boolean {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      return false;
    }

    this.currentLanguage = language;
    this.recognition = new SpeechRecognition();

    // Configure for continuous, real-time transcription
    if (!this.recognition) {
      return false;
    }

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = LANGUAGE_CODES[language];

    // Handle results
    this.recognition.onstart = () => {
      this.isListening = true;
      this.interimTranscript = '';
      this.finalTranscript = '';
      console.log('Voice recognition started. Language:', LANGUAGE_CODES[this.currentLanguage]);
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.interimTranscript = '';

      // Collect interim and final results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          this.finalTranscript += transcript + ' ';

          if (this.onTranscript) {
            this.onTranscript({
              text: this.finalTranscript.trim(),
              isFinal: true,
              language: this.currentLanguage,
              confidence: confidence,
            });
          }
        } else {
          this.interimTranscript += transcript;

          if (this.onTranscript) {
            this.onTranscript({
              text: this.interimTranscript,
              isFinal: false,
              language: this.currentLanguage,
              confidence: confidence,
            });
          }
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      const errorMessages: Record<string, string> = {
        'no-speech': 'Koi awaz sunai nahi di yaar 🔇 Phir se try kar!',
        'audio-capture': 'Microphone access nahi mil raha 🎙️',
        'network': 'Internet connection check kar bhai 📡',
        'service-not-allowed': 'Voice service allow nahi hai 🚫',
        'bad-grammar': 'Kuch galti ho gayi, phir se try kar!',
        'unknown': 'Kuch unknown error aa gaya 🤔',
      };

      const errorMsg = errorMessages[event.error] || errorMessages['unknown'];
      console.error('Voice recognition error:', event.error);

      if (this.onError) {
        this.onError(errorMsg);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    return true;
  }

  /**
   * Start listening for voice input
   */
  startListening(): boolean {
    if (!this.recognition) {
      console.error('Recognition not initialized. Call initialize() first.');
      return false;
    }

    try {
      console.log('Starting voice recognition in language:', this.currentLanguage);
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting recognition:', error);
      return false;
    }
  }

  /**
   * Stop listening for voice input
   */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Abort the current recognition
   */
  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Change the language dynamically
   */
  setLanguage(language: SupportedLanguage): boolean {
    if (!this.recognition) {
      return this.initialize(language);
    }

    const wasListening = this.isListening;
    this.currentLanguage = language;
    this.recognition.lang = LANGUAGE_CODES[language];
    
    // If we were listening, restart with new language
    if (wasListening) {
      try {
        this.recognition.stop();
        // Small delay before restarting
        setTimeout(() => {
          if (this.recognition && !this.isListening) {
            this.recognition.start();
          }
        }, 100);
      } catch (e) {
        console.warn('Could not restart recognition:', e);
      }
    }
    
    return true;
  }

  /**
   * Get current language
   */
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Set callback for transcript updates
   */
  setOnTranscript(callback: (result: TranscriptionResult) => void): void {
    this.onTranscript = callback;
  }

  /**
   * Set callback for errors
   */
  setOnError(callback: (error: string) => void): void {
    this.onError = callback;
  }

  /**
   * Get browser support status
   */
  isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }

  /**
   * Get detailed language info
   */
  getLanguageInfo(language: SupportedLanguage) {
    return VOICE_LANGUAGES[language];
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return VOICE_LANGUAGES;
  }
}

// Export singleton instance
export const voiceAssistant = new VoiceAssistantService();
