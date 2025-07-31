import { auth, db } from '@/config/firebase';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  isAdmin: boolean;
  registeredEvents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  password: string;
  isAdmin?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  isAdmin?: boolean;
}

class FirebaseAuthService {
  // Register new user
  async register(userData: RegisterData): Promise<User> {
    try {
      // Create user with email and password
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const userDoc = {
        id: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        college: userData.college,
        department: userData.department,
        isAdmin: userData.isAdmin || false,
        registeredEvents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save user data to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);

      return userDoc;
    } catch (error: any) {
      console.error('Firebase registration error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('User with this email already exists');
        case 'auth/invalid-email':
          throw new Error('Please provide a valid email address');
        case 'auth/weak-password':
          throw new Error('Password must be at least 6 characters');
        default:
          throw new Error(error.message || 'Registration failed');
      }
    }
  }

  // Login user
  async login(credentials: LoginData): Promise<User> {
    try {
      // Sign in with email and password
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data() as User;

      // Check if user is admin when admin login is requested
      if (credentials.isAdmin && !userData.isAdmin) {
        await signOut(auth);
        throw new Error('Admin access denied. This account is not an admin.');
      }

      // Check if user is student when student login is requested
      if (!credentials.isAdmin && userData.isAdmin) {
        await signOut(auth);
        throw new Error('Student access denied. This account is an admin account.');
      }

      return userData;
    } catch (error: any) {
      console.error('Firebase login error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          throw new Error('Invalid email or password');
        case 'auth/invalid-email':
          throw new Error('Please provide a valid email address');
        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please try again later');
        default:
          throw new Error(error.message || 'Login failed');
      }
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Firebase logout error:', error);
      throw new Error('Logout failed');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) return null;

      return userDoc.data() as User;
    } catch (error: any) {
      console.error('Firebase get current user error:', error);
      return null;
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            callback(userDoc.data() as User);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Firebase update user error:', error);
      throw new Error('Failed to update user profile');
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService(); 