import type { Student } from '../types/database';
import type { Language } from '../lib/translations';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Generate language-specific system prompt
function getSystemPrompt(student: Student, language: Language): string {
  const baseInfo = `Student Information:
- Name: ${student.student_name}
- Registration No: ${student.registration_no}
- Class: ${student.class} ${student.division}
- Roll Number: ${student.roll_number}
- Fees Status: ${student.fees_status} (₹${student.fees_paid}/${student.fees_amount})
- Attendance: ${student.attendance_percentage}%
- Marks: ${JSON.stringify(student.marks)}

You can help with:
1. Fees status queries
2. Marks and results
3. Attendance information
4. Timetable
5. Application filling (Bonafide, Scholarship)
6. Staff details
7. School notices`;

  const languagePrompts: Record<Language, string> = {
    en: `You are a friendly, helpful AI chatbot assistant for a School ERP system. Help students with their queries in a professional yet casual English style.

CRITICAL COMMUNICATION STYLE:
- Be professional but friendly and approachable
- Use clear, simple English
- Be casual like a helpful senior
- Use phrases like: "Hey", "Sounds good", "Absolutely", "No problem", "Of course"
- Keep replies SHORT and clear
- Use emojis occasionally: 😊 👍 🎓 💼 ✅ 🔥 💪 😄 🤔
- Be positive and supportive

${baseInfo}

Example responses:
- "Hey! Great news! Your fees are fully paid ✅"
- "Let me check that for you! Your attendance is at 92.5% - that's excellent! 🔥"
- "Perfect! Your marks are looking good - Math: 85, Science: 90 💪 Keep it up!"

Always respond in clear, friendly English!`,

    hi: `आप एक School ERP system के लिए एक दोस्ताना और सहायक AI चैटबॉट असिस्टेंट हैं। छात्रों की सहायता करें।

महत्वपूर्ण संचार शैली:
- भारतीय छात्रों की तरह हिंदी में बात करें
- सरल और समझने में आसान हिंदी का उपयोग करें
- दोस्ताना और सहायक बें
- शब्द उपयोग करें: अरे, हाँ, नहीं, ठीक है, चलो, बिल्कुल, एकदम, भाई, यार
- जवाब छोटे रखें
- इमोजी का उपयोग करें: 😊 👍 🎓 💼 ✅ 🔥 💪 😄 🤔
- सकारात्मक और सहायक रहें

${baseInfo}

उदाहरण प्रतिक्रियाएं:
- "भाई! अच्छी खबर है! तुम्हारी फीस पूरी तरह जमा है ✅"
- "चलो देखता हूँ! तुम्हारी उपस्थिति 92.5% है - बहुत अच्छा! 🔥"
- "बिल्कुल! तुम्हारे अंक अच्छे हैं - गणित: 85, विज्ञान: 90 💪"

हमेशा हिंदी में जवाब दें!`,

    mr: `आप एक School ERP system के लिए एक दोस्ताना आणि मदत करणारे AI चॅटबॉट असिस्टंट आहात। विद्यार्थ्यांना मदत करा।

महत्वाचे संवाद शैली:
- मराठीमध्ये बोला
- सोपी आणि समजायला सोपी मराठी वापरा
- दोस्ताना आणि सहाय्यकारी व्हा
- शब्द वापरा: अरे, हो, नाही, ठीक आहे, चल, बिलकुल, एकदमी, भाई, यार
- उत्तरे लहान ठेवा
- इमोजी वापरा: 😊 👍 🎓 💼 ✅ 🔥 💪 😄 🤔
- सकारात्मक आणि सहाय्यकारी राहा

${baseInfo}

उदाहरण प्रतिक्रिया:
- "भाई! चांगली बातमी! तुमची फी पूर्ण झाली ✅"
- "चल पाहत आहे! तुमची उपस्थिती 92.5% आहे - खूप चांगले! 🔥"
- "बिलकुल! तुमचे गुण चांगले आहेत - गणित: 85, विज्ञान: 90 💪"

नेहमी मराठीत उत्तर दे!`,
  };

  return languagePrompts[language];
}

export async function getChatResponse(
  userMessage: string,
  student: Student,
  conversationHistory: Message[] = [],
  language: Language = 'en'
): Promise<string> {
  try {
    const systemPrompt = getSystemPrompt(student, language);



    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...conversationHistory,
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.9,
        max_tokens: 1024,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error response:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });
      throw new Error(`Groq API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content ||
      'Arrey yaar! Thoda technical issue aa gaya 😅 Ek baar phir try kar!';

    return aiResponse;
  } catch (error) {
    console.error('Groq API error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Full error details:', errorMsg);
    return 'Oops! Kuch technical problem hai bhai 🤔 Thodi der baad try karo!';
  }
}

export function getQuickResponseForQuery(queryType: string, student: Student, language: Language = 'en'): string {
  const pendingFees = student.fees_amount - student.fees_paid;

  const responses: Record<Language, Record<string, string>> = {
    en: {
      fees: `Your Fees Status:\n${student.fees_status === 'Paid' ? '✅ PAID - All good! 🔥' : '⚠️ PENDING - Please pay soon!'}\n\nTotal Fees: ₹${student.fees_amount}\nPaid: ₹${student.fees_paid}\nPending: ₹${pendingFees}`,
      marks: `Here are your marks:\n${Object.entries(student.marks)
        .map(([subject, marks]) => `${subject}: ${marks}`)
        .join('\n')}\n\nYou're doing great! Keep it up! 💪`,
      attendance: `Your Attendance: ${student.attendance_percentage}%\n\n${
        student.attendance_percentage >= 75 ? 'Excellent! 🔥' : 'Please improve attendance!'
      }\n\nMinimum required: 75%`,
      profile: `Your Profile Details:\n\nName: ${student.student_name}\nReg No: ${student.registration_no}\nClass: ${student.class} ${student.division}\nRoll No: ${student.roll_number}`,
    },
    hi: {
      fees: `तुम्हारी फीस स्थिति:\n${student.fees_status === 'Paid' ? '✅ जमा हो गई - बहुत अच्छा! 🔥' : '⚠️ लंबित है - जल्दी जमा कर दो!'}\n\nकुल फीस: ₹${student.fees_amount}\nजमा की गई: ₹${student.fees_paid}\nबाकी: ₹${pendingFees}`,
      marks: `तुम्हारे अंक देख लो:\n${Object.entries(student.marks)
        .map(([subject, marks]) => `${subject}: ${marks}`)
        .join('\n')}\n\nभाई बहुत अच्छा चल रहा है! 💪`,
      attendance: `तुम्हारी उपस्थिति: ${student.attendance_percentage}%\n\n${
        student.attendance_percentage >= 75 ? 'एकदम शानदार! 🔥' : 'थोड़ा सुधार कर दो!'
      }\n\nकम से कम 75% चाहिए`,
      profile: `तुम्हारे विवरण:\n\nनाम: ${student.student_name}\nरजिस्ट्रेशन नंबर: ${student.registration_no}\nक्लास: ${student.class} ${student.division}\nरोल नंबर: ${student.roll_number}`,
    },
    mr: {
      fees: `तुमचा फी स्थिती:\n${student.fees_status === 'Paid' ? '✅ जमा झाली - खूप चांगले! 🔥' : '⚠️ बाकी आहे - लवकर जमा कर!'}\n\nएकूण फी: ₹${student.fees_amount}\nजमा केली: ₹${student.fees_paid}\nबाकी: ₹${pendingFees}`,
      marks: `तुमचे गुण पाहा:\n${Object.entries(student.marks)
        .map(([subject, marks]) => `${subject}: ${marks}`)
        .join('\n')}\n\nखूप चांगले चाल सुरू आहे! 💪`,
      attendance: `तुमची उपस्थिती: ${student.attendance_percentage}%\n\n${
        student.attendance_percentage >= 75 ? 'एकदमी बरोबर! 🔥' : 'थोडेसे सुधार कर!'
      }\n\nकमीतकमी 75% हवे`,
      profile: `तुमचे तपशील:\n\nनाव: ${student.student_name}\nनोंदणी क्रमांक: ${student.registration_no}\nवर्ग: ${student.class} ${student.division}\nक्रमांक: ${student.roll_number}`,
    },
  };

  const langResponses = responses[language] || responses['en'];
  return langResponses[queryType] || 'Tell me what you need! 😊';
}
