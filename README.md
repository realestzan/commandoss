# 💰 Personal Finance Chatbot

An intelligent personal finance management platform with AI-powered chatbot capabilities, crypto wallet integration, and comprehensive financial tracking.

## 🌟 Features

### 💬 AI-Powered Chat Assistant
- **Smart Financial Insights**: Get personalized financial advice and analysis
- **Voice Interaction**: Text-to-Speech powered by ElevenLabs for natural conversations
- **Multi-LLM Support**: Powered by GPT and Groq for diverse AI capabilities

### 📊 Financial Management
- **Budget Creation & Tracking**: Create and monitor budgets with real-time updates
- **Transaction Management**: Add, categorize, and track income/expenses
- **Bill Reminders**: Never miss a payment with smart reminder system
- **Financial Goals**: Set and track progress towards your financial objectives
- **Multi-Currency Support**: Handle finances in multiple currencies

### 🔐 Crypto Integration
- **Wallet Connectivity**: Support for Phantom and Slush wallets
- **SUI Blockchain**: Send and receive SUI cryptocurrency
- **Secure Transactions**: Safe and encrypted crypto operations

### 🎨 Modern UI/UX
- **Responsive Design**: Beautiful interface powered by Tailwind CSS and shadcn/ui
- **Smooth Animations**: Enhanced user experience with Framer Motion
- **Dark/Light Mode**: Customizable theme preferences

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion

### Backend & Services
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Hosting**: Vercel
- **AI/LLM**: OpenAI GPT, Groq
- **Text-to-Speech**: ElevenLabs
- **Crypto Wallets**: Phantom Wallet, Slush Wallet

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Required API keys (OpenAI, Groq, ElevenLabs)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal-finance-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # AI Services
   OPENAI_API_KEY=your_openai_api_key
   GROQ_API_KEY=your_groq_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key

   # Crypto (if needed)
   NEXT_PUBLIC_NETWORK=mainnet-beta
   ```

4. **Firebase Configuration**
   - Create a Firebase project
   - Enable Authentication (Email/Password, Google)
   - Set up Firestore database
   - Configure security rules

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### Getting Started with the Chatbot
1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Complete Profile**: Set up your financial preferences and monthly income
3. **Connect Wallet** (Optional): Link your crypto wallets for full functionality
4. **Start Chatting**: Begin conversations with the AI assistant

### Available Chat Commands
- `Create a budget for groceries`
- `Add a transaction for $50 coffee`
- `Set a financial goal to save $10,000`
- `Remind me to pay rent on the 1st`
- `Send 10 SUI to [address]`
- `Show my spending insights`

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
├── components/             # Reusable UI components
├── lib/
│   ├── types.ts           # TypeScript type definitions
│   ├── firebase.ts        # Firebase configuration
│   ├── ai/                # AI service integrations
│   └── crypto/            # Crypto wallet utilities
├── hooks/                 # Custom React hooks
└── utils/                 # Utility functions
```

## 🔧 API Routes

- `/api/chat` - Chat with AI assistant
- `/api/transactions` - CRUD operations for transactions
- `/api/budgets` - Budget management
- `/api/goals` - Financial goals
- `/api/crypto/send` - Crypto transaction handling

## 🎯 Core Types

### User Management
```typescript
type User = {
    id: string
    email: string
    name: string
    avatar: string
    preferredCurrency: string
    monthlyIncome?: number
    defaultBudgetId?: string
    financialGoals?: FinancialGoal[]
}
```

### Financial Tracking
```typescript
type Transaction = {
    id: string
    userId: string
    type: 'income' | 'expense' | 'transfer'
    amount: number
    description: string
    date: string
    category?: ExpenseCategory
    budgetId?: string
}
```

## 🔒 Security

- **Authentication**: Secure user authentication via Firebase Auth
- **Data Protection**: Firestore security rules for user data isolation
- **API Security**: Rate limiting and input validation
- **Crypto Security**: Wallet connections use secure protocols

## 🆘 Support

For support, email franbow1177@gmail.com

## 🙏 Acknowledgments

- OpenAI for GPT integration
- Groq for additional LLM capabilities
- ElevenLabs for voice synthesis
- Firebase for backend infrastructure
- The amazing open-source community
