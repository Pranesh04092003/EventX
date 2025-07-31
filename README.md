# EventX - Event Management Mobile App

A modern event management mobile application built with **React Native (Expo)** and **Firebase** backend. Create, manage, and attend events with real-time updates and QR code attendance tracking.

## 🚀 Features

### 📱 **Mobile App (React Native + Expo)**
- **Modern UI** with dark/light theme support
- **User Authentication** (register/login with Firebase Auth)
- **Event Management** - Browse, filter, and register for events
- **Admin Panel** - Create, edit, and manage events
- **QR Code Scanner** - For attendance tracking
- **Real-time Updates** - Live event data from Firebase Firestore
- **Offline Support** - Works without internet after initial setup
- **Profile Management** - User profiles with college/department info

### 🔥 **Backend (Firebase)**
- **Firebase Authentication** - Secure user login/registration
- **Firestore Database** - Real-time NoSQL database for events and users
- **Cloud Storage** - For event images and files
- **Real-time Sync** - Automatic updates across all devices
- **Security Rules** - Protected data access

## 📁 Project Structure

```
EventX/
├── app/                     # App screens (Expo Router file-based routing)
│   ├── (tabs)/             # Tab navigation screens
│   │   ├── index.tsx       # Home/Events list screen
│   │   ├── events.tsx      # Events browser
│   │   ├── profile.tsx     # User profile
│   │   ├── admin.tsx       # Admin panel
│   │   └── explore.tsx     # Event discovery
│   ├── admin/              # Admin-only screens
│   │   ├── create-event.tsx # Create new events
│   │   ├── edit-event.tsx  # Edit existing events
│   │   ├── manage-events.tsx # Event management
│   │   └── qr-scanner.tsx  # QR attendance scanner
│   ├── _layout.tsx         # Root layout with navigation
│   ├── login.tsx           # User login screen
│   ├── register.tsx        # User registration
│   ├── event-details.tsx   # Event details view
│   └── +not-found.tsx      # 404 screen
├── components/             # Reusable UI components
│   ├── CustomButton.tsx    # Styled button component
│   ├── EventCard.tsx       # Event display card
│   ├── FilterBar.tsx       # Event filtering
│   ├── LoadingScreen.tsx   # Loading indicator
│   ├── ErrorBoundary.tsx   # Error handling
│   ├── ThemedText.tsx      # Themed text component
│   ├── ThemedView.tsx      # Themed container
│   └── ui/                 # UI primitives
├── services/               # Firebase & API services
│   ├── firebaseAuth.ts     # Authentication service
│   ├── firebaseEvents.ts   # Events CRUD operations
│   ├── attendance.ts       # Attendance management
│   └── api.ts              # General API utilities
├── hooks/                  # Custom React hooks
│   ├── useStore.ts         # Global state management (Zustand)
│   ├── useColorScheme.ts   # Theme management
│   └── useThemeColor.ts    # Color utilities
├── config/                 # Configuration files
│   └── firebase.ts         # Firebase initialization
├── constants/              # App constants
│   ├── Theme.ts            # Design system (colors, spacing, fonts)
│   └── Colors.ts           # Color definitions
├── types/                  # TypeScript type definitions
│   └── attendance.ts       # Attendance types
├── assets/                 # Static assets
│   ├── android/            # Android app icons
│   ├── images/             # Images and icons
│   └── fonts/              # Custom fonts
├── android/                # Android native project
├── app.json                # Expo configuration
├── google-services.json    # Firebase Android config
└── package.json            # Dependencies and scripts
```

## 🛠️ Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Android Studio** (for Android development)
- **Firebase Account** (free tier available)

## 🚀 Quick Start

### 1. **Clone the Repository**

```bash
git clone https://github.com/Pranesh04092003/EventX.git
cd EventX
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Firebase Setup**

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** and **Firestore Database**
3. Download `google-services.json` and place it in the `android/app/` directory
4. Update Firebase config in `config/firebase.ts` with your project credentials

### 4. **Development**

```bash
# Start Expo development server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run in web browser
npm run web
```

### 5. **Build Production APK**

```bash
# Build standalone APK for offline use
npx expo run:android --variant release
```

The APK will be generated at: `android/app/build/outputs/apk/release/app-release.apk`

## 🔧 Configuration

### **Firebase Configuration**

Update `config/firebase.ts` with your Firebase project credentials:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### **App Configuration**

Update `app.json` for your app details:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "android": {
      "package": "com.yourname.yourapp"
    }
  }
}
```

## 📱 Key Features

### **Authentication System**
- Email/password registration and login
- User profile management
- Admin role-based access control
- Persistent login sessions

### **Event Management**
- Create and edit events (admin only)
- Event browsing and filtering
- Event registration for users
- Real-time event updates

### **Attendance Tracking**
- QR code generation for events
- QR code scanning for attendance
- Attendance reports and analytics

### **Real-time Updates**
- Live event data synchronization
- Instant notifications for event changes
- Real-time attendance tracking

## 🗄️ Database Schema

### **Users Collection (Firestore)**
```typescript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  college: string,
  department: string,
  isAdmin: boolean,
  registeredEvents: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Events Collection (Firestore)**
```typescript
{
  id: string,
  title: string,
  description: string,
  date: string,
  time: string,
  location: string,
  college: string,
  department: string,
  organizer: string,
  maxCapacity: number,
  registeredUsers: string[],
  attendees: string[],
  status: 'upcoming' | 'ongoing' | 'completed',
  imageUrl?: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string
}
```

## 📦 Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device
npm run web        # Run in web browser
npm run lint       # Run ESLint for code quality
```

### **Production Build Commands**
```bash
# Build standalone APK (works offline)
npx expo run:android --variant release

# Clear cache and restart
npx expo start --clear

# Build for app store distribution
npx eas build --platform android
```

## 🔐 Security Features

- **Firebase Authentication** with email/password
- **Firestore Security Rules** for data protection
- **Role-based Access Control** (admin/user permissions)
- **Input Validation** and sanitization
- **Secure API calls** with Firebase SDK

## 🚀 Deployment

### **Mobile App Deployment**
1. **Build Release APK**: `npx expo run:android --variant release`
2. **Test APK** on physical devices
3. **Upload to Google Play Store** using EAS Build
4. **Configure app signing** for production

### **Firebase Deployment**
1. **Configure Firestore Security Rules**
2. **Set up Authentication providers**
3. **Configure Firebase hosting** (if needed)
4. **Monitor usage** in Firebase Console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Commit changes: `git commit -m "Add new feature"`
5. Push to branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### **Common Issues**

1. **Splash Screen Freezing**
   - Ensure Firebase configuration is correct
   - Check internet connection for initial setup
   - Use release build for offline functionality

2. **Build Errors**
   - Clear Metro cache: `npx expo start --clear`
   - Clean Android build: `cd android && ./gradlew clean`
   - Check Firebase configuration

3. **Firebase Connection Issues**
   - Verify `google-services.json` placement
   - Check Firebase project settings
   - Ensure Firestore rules allow read/write

### **Getting Help**
- Check Firebase Console for errors
- Review Expo logs during development
- Ensure all dependencies are up to date

## 🔄 Version History

- **v1.0.0** - Initial release with Firebase integration
- Core event management features
- QR code attendance system
- Offline support for mobile app

---

**Built with ❤️ using React Native, Expo, and Firebase**

**Happy Coding! 🎉**
