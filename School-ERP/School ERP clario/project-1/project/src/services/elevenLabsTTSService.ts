/**
 * ElevenLabs Text-to-Speech Service
 * Provides high-quality voice synthesis with Indian language support
 */

export type ElevenLabsVoice = 'Aria' | 'Roger' | 'Sarah' | 'Laura' | 'Charlie' | 'George';

interface ElevenLabsOptions {
  voiceId?: string;
  stability?: number;
  similarity?: number;
}

export const ELEVENLABS_VOICES: Record<string, { id: string; language: string; accent: string }> = {
  'Aria': { id: '9BWtsMINqrJLrRacOk9x', language: 'English', accent: 'Indian' },
  'Roger': { id: 'CZu28sBg5rHl1huqFOP5', language: 'English', accent: 'Indian' },
  'Sarah': { id: 'EXAVITQu4vr4xnSDxMaL', language: 'English', accent: 'Indian' },
  'Laura': { id: 'FGY2WhTi5UI1Wpl9JlCJ', language: 'English', accent: 'Indian' },
  'Charlie': { id: 'IZ5qqLFbTvqaJbqKZwQX', language: 'English', accent: 'Indian' },
  'George': { id: 'JBFqnCBsd6RMkjW3snWj', language: 'English', accent: 'Indian' },
};

class ElevenLabsTTSService {
  private apiKey: string;
  private apiUrl: string = 'https://api.elevenlabs.io/v1/text-to-speech';
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    if (!this.apiKey || this.apiKey.startsWith('your_')) {
      console.log('ℹ️ ElevenLabs API key not configured. Using browser TTS instead.');
      console.log('📝 To enable ElevenLabs: Add VITE_ELEVENLABS_API_KEY to .env.local');
    } else {
      console.log('✓ ElevenLabs API key configured (length: ' + this.apiKey.length + ')');
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Convert language code to voice preference
   */
  private getVoiceForLanguage(language: string): string {
    const voiceMap: Record<string, string> = {
      'en': 'Aria',
      'hi': 'Roger',
      'mr': 'Sarah',
      'ta': 'Laura',
      'te': 'Charlie',
      'kn': 'George',
      'bn': 'Aria',
    };
    return voiceMap[language] || 'Aria';
  }

  /**
   * Speak text using ElevenLabs API
   */
  async speak(text: string, language: string = 'en', voiceId?: string): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('ElevenLabs API key not configured');
      return;
    }

    try {
      // Stop any ongoing speech
      this.stop();

      const voice = voiceId || this.getVoiceForLanguage(language);
      const voiceData = ELEVENLABS_VOICES[voice];

      if (!voiceData) {
        console.error(`Voice ${voice} not found`);
        return;
      }

      console.log('ElevenLabs TTS Request:', {
        voiceId: voiceData.id,
        text: text.substring(0, 50) + '...',
        apiKeyLength: this.apiKey.length,
      });

      const response = await fetch(`${this.apiUrl}/${voiceData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      console.log('ElevenLabs Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        console.error('ElevenLabs API error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        if (response.status === 401) {
          throw new Error('ElevenLabs API Key Invalid - Check your API key configuration');
        } else if (response.status === 429) {
          throw new Error('ElevenLabs Rate Limited - Too many requests');
        } else {
          throw new Error(`ElevenLabs API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      this.currentAudio = new Audio(audioUrl);
      this.isSpeaking = true;

      this.currentAudio.onended = () => {
        this.isSpeaking = false;
        URL.revokeObjectURL(audioUrl);
      };

      this.currentAudio.onerror = () => {
        this.isSpeaking = false;
        URL.revokeObjectURL(audioUrl);
        console.error('Error playing audio');
      };

      // Set reasonable volume
      this.currentAudio.volume = 0.8;
      await this.currentAudio.play();
    } catch (error) {
      console.error('Error in ElevenLabs TTS:', error);
      this.isSpeaking = false;
    }
  }

  /**
   * Stop speaking
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.isSpeaking = false;
    }
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): string[] {
    return Object.keys(ELEVENLABS_VOICES);
  }

  /**
   * Get voice details
   */
  getVoiceDetails(voiceName: string) {
    return ELEVENLABS_VOICES[voiceName];
  }
}

// Export singleton instance
export const elevenLabsTTS = new ElevenLabsTTSService();
