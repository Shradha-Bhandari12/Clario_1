# Multi-Language Support Feature

## Overview
The StudentChatbot now supports **3 UI languages**: English, Hindi, and Marathi, with a dedicated language selector in the header.

## Supported Languages
1. **English** (en) - Default interface language
2. **हिन्दी - Hindi** (hi) - North Indian language
3. **मराठी - Marathi** (mr) - Western Indian language

## Key Features

### 1. **UI Language Selector** 
- Located in the header with a **Globe icon** (green button)
- Switches the entire interface to the selected language
- Includes button labels, placeholders, and messages
- Selection is **persisted** in browser localStorage

### 2. **Separate TTS Voice Language**
- Located in the header with a **Speaker icon** (purple button)
- Independent from UI language
- Supports 6 Indian regional languages for voice output
- Users can have UI in English but TTS in Hindi, for example

### 3. **Bilingual Features**
All interface elements translated:
- ✅ Button labels (Fees, Marks, Attendance, Profile, Apply)
- ✅ Input placeholder text
- ✅ Welcome messages (personalized with student name)
- ✅ Error messages
- ✅ Logout button and tooltips
- ✅ Quick action messages

## File Structure

### New Files
- **[src/lib/translations.ts](src/lib/translations.ts)** - Translation dictionary for all 3 languages
- **[src/contexts/LanguageContext.tsx](src/contexts/LanguageContext.tsx)** - Language context provider and hook

### Modified Files
- **[src/main.tsx](src/main.tsx)** - Added LanguageProvider wrapper
- **[src/components/StudentChatbot.tsx](src/components/StudentChatbot.tsx)** - Integrated language support with translations

## How to Use

### Changing UI Language
1. Click the **Globe icon** button in the header
2. Select desired language (English, हिन्दी, मराठी)
3. Entire interface changes to selected language immediately
4. Selection is saved and persists on page reload

### Changing Voice Language
1. Click the **Speaker icon** button in the header
2. Select desired voice language (Hindi, Tamil, Telugu, etc.)
3. All TTS responses will use the selected voice accent

### Example
- UI Language: English, Voice Language: Marathi
- Interface shows in English, but chatbot speaks in Marathi accent

## Translation System

### Adding New Translations
To add more languages, update [src/lib/translations.ts](src/lib/translations.ts):

```typescript
export const translations: Record<Language, Record<string, string>> = {
  en: { /* English */ },
  hi: { /* Hindi */ },
  mr: { /* Marathi */ },
  // Add new language here
  gu: { /* Gujarati */ },
};

export const LANGUAGE_OPTIONS = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  mr: { name: 'Marathi', nativeName: 'मराठी' },
  // Add here
};
```

### Using Translations in Components
```typescript
import { useLanguage } from '../contexts/LanguageContext';

export function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <button>{t('logout')}</button>
    <p>{t('welcome', { name: 'John' })}</p>
  );
}
```

## Browser Support
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ All modern browsers with localStorage support

## Implementation Details

### Language Context Hook
```typescript
const { language, setLanguage, t, languageOptions } = useLanguage();

// language: Current language ('en', 'hi', 'mr')
// setLanguage(lang): Switch to new language
// t(key, params?): Get translated text with optional parameters
// languageOptions: Available language options
```

### Persistent Storage
- Language preference stored in `localStorage` as `'selectedLanguage'`
- Auto-loaded on page refresh
- Defaults to 'en' if not set

## Performance
- Zero external API calls for translations
- All translations bundled at build time
- Instant language switching with no page reload
- Minimal memory footprint

## Future Enhancements
- Add more languages (Gujarati, Kannada, etc.)
- Translate error messages and API responses
- Language detection based on browser settings
- Partial translations support
- RTL language support (Arabic, Urdu if added)
