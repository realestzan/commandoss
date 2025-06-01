# Firebase Setup Guide

This guide will help you set up Firebase Authentication, Firestore, and Storage for your Next.js project.

## Prerequisites

- A Google account
- Node.js installed
- This Next.js project

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "commandoss-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following sign-in providers:
   - **Email/Password**: Click to enable
   - **Google**: Click to enable and configure
     - Choose a project support email
     - Click "Save"

## 3. Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll configure security rules later)
4. Choose a location for your database
5. Click "Done"

## 4. Set up Storage

1. Go to "Storage" in the left sidebar
2. Click "Get started"
3. Review the security rules and click "Next"
4. Choose a location for your storage bucket
5. Click "Done"

## 5. Get Firebase Configuration

1. Go to "Project settings" (gear icon in the left sidebar)
2. Scroll down to "Your apps" section
3. Click "Add app" and choose the web icon `</>`
4. Register your app with a nickname (e.g., "commandoss-web")
5. Copy the configuration object

## 6. Configure Environment Variables

1. Create a `.env.local` file in your project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

2. Replace the placeholder values with your actual Firebase configuration values

## 7. Configure Firestore Security Rules (Optional)

For production, you should configure proper security rules. Go to Firestore Database > Rules and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 8. Configure Storage Security Rules (Optional)

Go to Storage > Rules and update:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 9. Test the Setup

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `/auth` in your browser
3. Try creating a new account with email/password
4. Try signing in with Google
5. Test the forgot password functionality

## Files Created

The following files have been created for Firebase integration:

- `src/lib/firebase.ts` - Firebase configuration and initialization
- `src/lib/auth.ts` - Authentication service functions
- `src/hooks/useAuth.ts` - React hook for authentication state
- `src/app/dashboard/page.tsx` - Protected dashboard page
- Updated `src/app/auth/page.tsx` - Complete authentication UI

## Available Functions

### Authentication (`src/lib/auth.ts`)

- `signInWithEmail(email, password)` - Sign in with email/password
- `signUpWithEmail(email, password, firstName, lastName)` - Create new account
- `signInWithGoogle()` - Sign in with Google
- `resetPassword(email)` - Send password reset email
- `logout()` - Sign out current user
- `getCurrentUser()` - Get current Firebase user
- `getUserData(uid)` - Get user data from Firestore

### Authentication Hook (`src/hooks/useAuth.ts`)

- `user` - Current Firebase user object
- `userData` - User data from Firestore
- `loading` - Loading state
- `isAuthenticated` - Boolean authentication status

## User Data Structure

When users sign up, a document is created in Firestore with the following structure based on your types:

```typescript
{
  name: string,
  email: string,
  createdAt: Date,
  diary: [],
  relationships: [],
  tasks: [],
  projects: [],
  reminders: [],
  goals: [],
  locations: [],
  events: [],
  habits: [],
  resources: [],
  problems: []
}
```

## Troubleshooting

1. **"Firebase not configured"** - Make sure your `.env.local` file is properly set up
2. **Authentication errors** - Check that you've enabled the correct sign-in methods in Firebase Console
3. **Permission denied** - Update your Firestore security rules
4. **Google sign-in not working** - Make sure you've properly configured the Google sign-in provider

## Next Steps

You can now build upon this authentication system to:
- Create protected routes
- Implement role-based access control
- Add more user profile fields
- Implement real-time features with Firestore
- Add file upload functionality with Storage 