# Firebase Setup for EventX

## 🔥 Setting up Firebase for EventX

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `eventx-app`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Click "Save"

### 3. Create Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### 4. Get Firebase Config

1. In Firebase Console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → "Web"
4. Enter app nickname: "EventX Web"
5. Click "Register app"
6. Copy the config object

### 5. Update Firebase Config

Replace the config in `config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 6. Set Firestore Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow read access to events for all authenticated users
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### 7. Test the Setup

1. Start your React Native app
2. Try registering a new user
3. Try logging in with the registered user
4. Check Firebase Console → Authentication → Users
5. Check Firebase Console → Firestore → Data

## 🎯 Features Now Available

- ✅ **User Registration** with email/password
- ✅ **User Login** with email/password
- ✅ **User Data Storage** in Firestore
- ✅ **Admin/Student Roles**
- ✅ **Secure Authentication**
- ✅ **Real-time Database**

## 🔧 Troubleshooting

### Common Issues:

1. **"Firebase not initialized"**
   - Check if config is correct
   - Make sure Firebase is imported in your app

2. **"Permission denied"**
   - Check Firestore rules
   - Make sure user is authenticated

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project settings

### Testing Commands:

```bash
# Test Firebase connection
npm start
# Then try login/register in the app
```

## 📱 Next Steps

After Firebase is set up, you can add:
- Real-time event updates
- Push notifications
- File uploads
- Social login (Google, Facebook)
- User profile management

## 🔐 Security Notes

- Never commit Firebase config with real keys to public repos
- Use environment variables for production
- Set up proper Firestore rules for production
- Enable Firebase App Check for additional security 