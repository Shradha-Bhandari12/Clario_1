# School ERP Chatbot System

Arrey bhai! Welcome to the School ERP Chatbot - ek ekdum modern, AI-powered school management system with a super friendly chatbot assistant! 🔥

## Features

### For Students
- **Casual Hinglish Chatbot** - Talk naturally like WhatsApp chats
- **Voice Support** - Speak in Hindi/English, bot responds with voice too
- **Quick Actions**:
  - Check fees status
  - View marks and results
  - Check attendance
  - View profile info
- **Application Filling** - Apply for Bonafide, Scholarship, etc.
- **AI-Powered Responses** - Smart replies using Groq API (fast & efficient)

### For Admins
- **Student Management** - Add, edit, delete students
- **Fees Management** - Update fees status
- **Applications** - Approve/reject student applications
- **Notices** - Post important announcements
- **Dashboard** - Complete overview of all data

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq API (Mixtral 8x7B model)
- **Voice**: Web Speech API (Browser built-in)
- **Icons**: Lucide React

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root and add your credentials:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### 2. Get Supabase Credentials

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API
4. Copy the `URL` and `anon public` key
5. The database tables and sample data are already created via migrations!

### 3. Get Groq API Key

1. Go to [Groq Console](https://console.groq.com)
2. Sign up and create an API key
3. Copy and paste it in your `.env` file

### 4. Install & Run

```bash
npm install
npm run dev
```

## Demo Credentials

### Student Login
- **Registration No**: `2024001`
- **Password**: `Rahul Sharma` (case-insensitive)

Other demo students:
- `2024002` / `Priya Patel`
- `2024003` / `Arjun Singh`

### Admin Login
- **Username**: `admin`
- **Password**: `admin123`

## Database Schema

### Tables Created
1. **students** - Student records with fees, marks, attendance
2. **applications** - Student applications (bonafide, scholarship, etc.)
3. **staff** - Staff/teacher information
4. **notices** - School announcements
5. **timetable** - Class schedules
6. **admins** - Admin user accounts

All tables have RLS (Row Level Security) enabled!

## Features Walkthrough

### Student Features

1. **Login**: Use Registration Number + Name as password
2. **Chat**: Talk naturally in Hinglish - "mujhe fees check karni hai"
3. **Quick Actions**: Click buttons for instant info
4. **Voice Input**: Click mic icon, speak your query
5. **Applications**: Click "Apply" button to fill forms
6. **Voice Output**: Bot reads responses aloud

### Admin Features

1. **Students Tab**: View all students, update fees, delete records
2. **Applications Tab**: Approve/reject student applications
3. **Notices Tab**: View all school notices
4. **Search**: Find students by name or registration number

## Sample Interactions

### Student Chatbot Examples

**User**: "mujhe fees check karni hai"
**Bot**: "Haan bhai! Check kar raha hoon 🔍\nEkdum clear hai — fees PAID hai ✅😄\nAur kuch chahiye kya?"

**User**: "marks dikha"
**Bot**: "Arrey dekh le apne marks bhai! 📊\n\nMath: 85\nScience: 90\nEnglish: 88\n\nBahut badhiya ja raha hai! Keep it up 💪🔥"

**User**: "bonafide chahiye"
**Bot**: *Opens application form*

## Multi-Language Support

The chatbot automatically detects and responds in:
- **English** → Responds in Hinglish
- **Hindi** → Responds in Hinglish
- **Marathi** → Responds in Marathi/Hinglish mix

## Voice Support

### Requirements
- Chrome/Edge browser (best support)
- Microphone access
- Internet connection

### How to Use
1. Click the microphone icon
2. Speak your query in Hindi/English
3. Bot transcribes and responds
4. Bot speaks the response aloud

## Chatbot Personality

The bot talks like your college senior:
- Super casual and friendly
- Uses Hinglish naturally
- Adds emojis
- Supportive and positive
- WhatsApp-style short messages

## Project Structure

```
src/
├── components/
│   ├── LoginPage.tsx          # Student/Admin login
│   ├── StudentChatbot.tsx     # Main chatbot interface
│   ├── AdminDashboard.tsx     # Admin panel
│   └── ApplicationForm.tsx    # Application modal
├── contexts/
│   └── AuthContext.tsx        # Authentication state
├── services/
│   └── geminiService.ts       # Groq API integration
├── types/
│   └── database.ts            # TypeScript types
├── lib/
│   └── supabase.ts            # Database client
└── App.tsx                    # Main router
```

## Security Features

- Row Level Security (RLS) on all tables
- Password-based authentication
- Secure admin access
- Protected database operations

## Customization

### Adding New Quick Actions

Edit `StudentChatbot.tsx`:
```typescript
const handleQuickAction = async (action: string) => {
  // Add your new action here
}
```

### Adding New Application Types

Edit `ApplicationForm.tsx`:
```typescript
<option value="your_type">Your Type</option>
```

### Customizing Bot Responses

Edit `geminiService.ts` to modify the Groq API system prompt or model

## Browser Support

- Chrome ✅
- Edge ✅
- Firefox ✅ (limited voice support)
- Safari ⚠️ (no voice input)

## Troubleshooting

### Voice not working?
- Use Chrome/Edge browser
- Allow microphone permissions
- Check internet connection

### Groq API not responding?
- Verify API key in `.env` file
- Check your Groq account quota/limits at console.groq.com
- Ensure internet connection
- Verify model availability (mixtral-8x7b-32768)

### Database errors?
- Verify Supabase credentials
- Check if tables exist
- Review RLS policies

## Future Enhancements

- WhatsApp integration
- SMS notifications
- Parent portal
- Exam scheduling
- Library management
- Fee payment gateway

## License

MIT License - Use freely for your school!

---

Bilkul sorted! Agar koi doubt hai toh bas bol bhai! 🔥😎
