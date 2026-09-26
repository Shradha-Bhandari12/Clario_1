# Indian Regional Text-to-Speech (TTS) Feature

## Overview
The StudentChatbot now includes advanced Text-to-Speech (TTS) capabilities with support for multiple Indian regional languages and accents.

## Supported Languages
- **Hindi (hi-IN)** - North India
- **Tamil (ta-IN)** - South India
- **Telugu (te-IN)** - South India
- **Kannada (kn-IN)** - South India
- **Bengali (bn-IN)** - East India
- **English (Indian Accent) (en-IN)** - Pan-India

## Features

### 1. **Language Selection**
- Click the language selector button in the top header
- Choose from 6 different Indian regional languages
- Selection persists for the session

### 2. **Voice Characteristics**
- **Rate**: 0.85 (slower, clearer speech for better understanding)
- **Pitch**: 1.0 (natural pitch)
- **Volume**: 1.0 (full volume)
- Optimized for Indian accent and regional tone

### 3. **Smart Voice Selection**
The TTS service automatically selects the best available voice from your system:
- Prioritizes exact language match (e.g., Hindi for hi-IN)
- Falls back to any Indian voice if exact match not available
- Uses first available voice as last resort

### 4. **Voice Controls**
- **Mic Button**: Enable/disable voice input (speech recognition)
- **Volume Button**: Stop ongoing speech (visible only when speaking)
- Messages are automatically spoken when received
- Quick action responses are also spoken

### 5. **Browser Support**
- Works in Chrome, Edge, Safari, and Firefox
- Requires Speech Synthesis API support
- Graceful fallback if not supported

## How to Use

### Basic Usage
1. Send a message to the chatbot
2. The response will be automatically spoken in the selected language
3. Change language anytime using the language selector

### Voice Input
1. Click the microphone button
2. Speak your query
3. The app will recognize and convert to text (Hindi language by default)
4. Send the message

### Stop Speaking
1. If a message is being read, click the animated volume icon
2. Speech will stop immediately

## Technical Implementation

### TTS Service (`src/services/ttsService.ts`)
- Singleton service for managing text-to-speech
- Supports pause, resume, and stop functionality
- Automatic voice selection for Indian languages
- Error handling and browser compatibility checks

### Integration Points
- **StudentChatbot Component**: Main UI integration
- **handleSendMessage**: Speaks assistant responses
- **handleQuickAction**: Speaks quick action responses
- **Language Menu**: Allows dynamic language switching

## Configuration

You can customize TTS behavior in the `handleSendMessage` and `handleQuickAction` functions:

```typescript
ttsService.speak(response, {
  language: selectedLanguage,
  rate: 0.85,      // 0.1 to 10 (lower = slower)
  pitch: 1.0,      // 0 to 2 (1 = normal)
  volume: 1.0,     // 0 to 1
});
```

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | Best voice selection |
| Firefox | ✅ Full | System voices available |
| Safari | ✅ Full | Good Indian voice support |
| IE 11 | ❌ None | No Speech Synthesis API |

## Performance Notes

- Speech synthesis runs in browser (no external API calls for TTS)
- Minimal performance impact
- Each language switch is instant
- Multiple languages can be tested without page reload

## Future Enhancements

- Persistent language preference (localStorage)
- Speed/pitch customization UI
- Voice preview before setting
- Speech rate adjustment slider
- Regional accent variants
