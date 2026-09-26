// Language translations for the entire application
export type Language = 'en' | 'hi' | 'mr';

// Map UI languages to speech recognition language codes
export const LANGUAGE_TO_SPEECH_CODE: Record<Language, string> = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'mr': 'mr-IN',
};

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'logout': 'Logout',
    'language': 'Language',
    
    // Welcome message
    'welcome': 'Hey {name}! How are you? 😄\n\nI am your school assistant! Tell me what help you need?\n\nWant to check fees? View marks? Or fill some application? Just say! 🔥',
    
    // Quick action buttons
    'fees': 'Fees',
    'marks': 'Marks',
    'attendance': 'Attendance',
    'profile': 'Profile',
    'apply': 'Apply',
    
    // Input placeholder
    'messagePlaceholder': 'Type your message... (or use voice 🎤)',
    
    // Error message
    'error': 'Oops! Some technical issue! 🤔 Try again later!',
    
    // Voice messages
    'voiceNotSupported': 'Voice input not supported in your browser 😅',
    
    // Quick response prefixes
    'feesStatus': 'Check fees status',
    'myMarks': 'Show my marks',
    'attendanceStatus': 'How much attendance?',
    'myProfile': 'Show my profile',
  },
  hi: {
    // Header
    'logout': 'लॉगआउट',
    'language': 'भाषा',
    
    // Welcome message
    'welcome': 'अरे {name}! क्या हाल है भाई? 😄\n\nमैं तेरा स्कूल असिस्टेंट हूं! बता क्या help चाहिए?\n\nFees check करनी है? Marks देखने हैं? या कोई application fill करनी है? बस बोल! 🔥',
    
    // Quick action buttons
    'fees': 'फीस',
    'marks': 'अंक',
    'attendance': 'उपस्थिति',
    'profile': 'प्रोफाइल',
    'apply': 'आवेदन करें',
    
    // Input placeholder
    'messagePlaceholder': 'अपना संदेश लिखें... (या voice का उपयोग करें 🎤)',
    
    // Error message
    'error': 'ओह! कोई तकनीकी समस्या है यार 🤔 थोड़ी देर बाद try करो!',
    
    // Voice messages
    'voiceNotSupported': 'तुम्हारे ब्राउज़र में voice input supported नहीं है 😅',
    
    // Quick response prefixes
    'feesStatus': 'Fees status check कर',
    'myMarks': 'मेरे marks दिखा',
    'attendanceStatus': 'Attendance कितना है?',
    'myProfile': 'मेरी profile दिखा',
  },
  mr: {
    // Header
    'logout': 'लॉगआउट',
    'language': 'भाषा',
    
    // Welcome message
    'welcome': 'अरे {name}! कसे आहात? 😄\n\nमी तुमचा स्कूल असिस्टंट आहे! मला सांगा काय मदत हवी?\n\nफी check करायची आहे? अंक पाहायचे आहेत? किंवा कोणतेही application भरायचे आहे? बोल! 🔥',
    
    // Quick action buttons
    'fees': 'फी',
    'marks': 'अंक',
    'attendance': 'उपस्थिति',
    'profile': 'प्रोफाइल',
    'apply': 'अर्ज करा',
    
    // Input placeholder
    'messagePlaceholder': 'आपला संदेश लिहा... (किंवा व्हॉइस वापरा 🎤)',
    
    // Error message
    'error': 'अरे! काही तांत्रिक समस्या आहे यार 🤔 थोड्या वेळाने पुन्हा प्रयत्न करा!',
    
    // Voice messages
    'voiceNotSupported': 'तुमच्या ब्राउজरमध्ये व्हॉइस इनपुट समर्थित नाही 😅',
    
    // Quick response prefixes
    'feesStatus': 'फी status check कर',
    'myMarks': 'माझे marks दाखवा',
    'attendanceStatus': 'Attendance किती आहे?',
    'myProfile': 'माझे profile दाखवा',
  },
};

export const LANGUAGE_OPTIONS: Record<Language, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  mr: { name: 'Marathi', nativeName: 'मराठी' },
};

export function getTranslation(key: string, language: Language, params?: Record<string, string>): string {
  let text = translations[language][key] || translations['en'][key] || key;
  
  // Replace parameters in curly braces
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      text = text.replace(`{${key}}`, value);
    });
  }
  
  return text;
}
