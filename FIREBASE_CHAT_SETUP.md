# Firebase Chat Setup Guide

This guide will help you set up Firebase for the chat saving functionality in your personal finance chatbot.

## Firebase Configuration

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "personal-finance-chatbot")
4. Follow the setup wizard

### 2. Enable Firestore Database

1. In your Firebase project console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (you can change this later)
4. Select your preferred location

### 3. Get Firebase Configuration

1. In your Firebase project console, click the gear icon (Project settings)
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Register your app with a nickname
5. Copy the configuration object

### 4. Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Groq API Key (existing)
GROQ_API_KEY=your_groq_api_key_here
```

Replace the placeholder values with your actual Firebase configuration values.

## Firestore Security Rules (Optional)

For production, you should set up proper security rules. Go to Firestore Database > Rules and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own chat conversations
    match /chat_conversations/{document} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Features Implemented

✅ **Chat Saving**: All conversations are automatically saved to Firebase
✅ **Chat History**: View all your previous conversations in the sidebar
✅ **Search**: Search through your chat history by content
✅ **Chat Loading**: Click on any conversation to continue where you left off
✅ **Auto Titles**: Conversations get automatic titles based on the first message
✅ **Real-time Updates**: Chat history updates as you use the app

## How It Works

1. **New Conversations**: When you start a new chat, it gets saved to Firebase after the first exchange
2. **Conversation Updates**: Each new message updates the conversation in Firebase
3. **Chat History**: The sidebar shows all your conversations, sorted by most recent
4. **Search Functionality**: You can search through conversation titles and content
5. **Resume Chats**: Click any conversation in the history to continue it

## File Structure

```
src/
├── lib/
│   ├── firebase.ts          # Firebase configuration
│   ├── chat-service.ts      # Firebase operations for chats
│   └── types.ts            # Updated with chat types
├── app/(user)/chat/
│   ├── page.tsx            # Main chat page with conversation handling
│   ├── chat.tsx            # Chat component with Firebase integration
│   └── history.tsx         # Chat history sidebar with Firebase data
```

## Troubleshooting

### Common Issues

1. **Firebase not initializing**: Make sure all environment variables are set correctly
2. **Permission denied**: Check your Firestore security rules
3. **Chat not saving**: Check the browser console for any Firebase errors
4. **History not loading**: Verify the user ID is being passed correctly

### Testing

1. Start a new conversation by clicking any prompt
2. Send a few messages back and forth
3. Go back to the main page
4. Check if the conversation appears in the chat history
5. Click on the conversation to resume it

The chat saving feature is now fully integrated and ready to use! 