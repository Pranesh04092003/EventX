import { firebaseEventsService } from '@/services/firebaseEvents';
import { firebaseAuthService } from '@/services/firebaseAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface Event {
  attendees: any;
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  college: string;
  department: string;
  organizer: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  registeredUsers: string[];
  maxCapacity: number;
  imageUrl?: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  phone: string;
  isAdmin: boolean;
  registeredEvents: string[];
}

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  
  // Events state
  events: Event[];
  selectedEvent: Event | null;
  
  // Filters
  filterCollege: string;
  filterDepartment: string;
  filterDate: string;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  setEvents: (events: Event[]) => void;
  loadEvents: () => Promise<void>;
  selectEvent: (event: Event) => void;
  registerForEvent: (eventId: string) => void;
  setFilters: (filters: { filterCollege?: string; filterDepartment?: string; filterDate?: string }) => void;
  markAttendance: (eventId: string, userId: string) => void;
  testFirebaseConnection: () => Promise<boolean>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  events: [],
  selectedEvent: null,
  filterCollege: '',
  filterDepartment: '',
  filterDate: '',

  // Actions
  login: async (user: User) => {
    try {
      // Get fresh user data from Firebase to ensure we have latest registered events
      const freshUserData = await firebaseAuthService.getCurrentUser();
      const userToStore = freshUserData || user;
      
      await AsyncStorage.setItem('user', JSON.stringify(userToStore));
      set({ user: userToStore, isAuthenticated: true });
      
      // Load events after login to sync registration status
      await get().loadEvents();
    } catch (error: any) {
      console.error('Error during login setup:', error);
      // Fallback to provided user data if Firebase fails
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  setEvents: (events: Event[]) => set({ events }),

  loadEvents: async () => {
    try {
      console.log('Store: Starting to load events from Firebase...');
      console.log('Store: firebaseEventsService available:', !!firebaseEventsService);
      
      if (!firebaseEventsService) {
        console.warn('Firebase Events Service not available, using mock data');
        set({ events: mockEvents });
        return;
      }
      
      const firebaseEvents = await firebaseEventsService.getAllEvents();
      console.log('Store: Successfully loaded events from Firebase:', firebaseEvents.length);
      console.log('Store: Events:', firebaseEvents.map(e => ({ id: e.id, title: e.title })));
      set({ events: firebaseEvents });
    } catch (error: any) {
      console.error('Store: Error loading events from Firebase:', error);
      console.error('Store: Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });
      // Fallback to mock data if Firebase fails
      console.log('Store: Falling back to mock events');
      set({ events: mockEvents });
    }
  },

  selectEvent: (event: Event) => set({ selectedEvent: event }),

  registerForEvent: async (eventId: string) => {
    const { user, events } = get();
    if (!user) return;

    try {
      // Check if already registered
      if (user.registeredEvents.includes(eventId)) {
        throw new Error('Already registered for this event');
      }

      // First, update the event in Firebase (add user to event's registeredUsers)
      await firebaseEventsService.registerForEvent(eventId, user.id);
      
      // Second, update the user's registeredEvents in Firebase
      const updatedRegisteredEvents = [...user.registeredEvents, eventId];
      await firebaseAuthService.updateUserProfile(user.id, {
        registeredEvents: updatedRegisteredEvents
      });
      
      // Then update local state
      const updatedEvents = events.map(event => {
        if (event.id === eventId && !event.registeredUsers.includes(user.id)) {
          return {
            ...event,
            registeredUsers: [...event.registeredUsers, user.id]
          };
        }
        return event;
      });

      const updatedUser = {
        ...user,
        registeredEvents: updatedRegisteredEvents
      };

      set({ events: updatedEvents, user: updatedUser });
      
      // Save updated user to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Reload events to ensure sync
      await get().loadEvents();
    } catch (error: any) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  setFilters: (filters) => set((state) => ({ ...state, ...filters })),

  markAttendance: (eventId: string, userId: string) => {
    // This would typically update attendance in backend
    console.log(`Marking attendance for user ${userId} in event ${eventId}`);
  },

  testFirebaseConnection: async () => {
    try {
      console.log('Store: Testing Firebase connection...');
      const result = await firebaseEventsService.testConnection();
      console.log('Store: Firebase connection test result:', result);
      return result;
    } catch (error: any) {
      console.error('Store: Firebase connection test failed:', error);
      return false;
    }
  },

  initializeUser: async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // Get fresh user data from Firebase to ensure latest registration status
        const freshUserData = await firebaseAuthService.getCurrentUser();
        const userToUse = freshUserData || user;
        
        set({ user: userToUse, isAuthenticated: true });
        // Load events to sync registration status
        await get().loadEvents();
      }
    } catch (error: any) {
      console.error('Error initializing user:', error);
    }
  },
}));

// Mock data for development
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2024',
    description: 'Annual technology conference featuring the latest innovations in AI, blockchain, and web development. Join industry leaders and innovators for a day of learning and networking.',
    date: '2024-03-15',
    time: '09:00 AM',
    location: 'Main Auditorium',
    college: 'MIT',
    department: 'Computer Science',
    organizer: 'Tech Club MIT',
    status: 'upcoming',
    maxCapacity: 200,
    registeredUsers: ['user1', 'user2'],
    attendees: [],
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: '2',
    title: 'Cultural Fest 2024',
    description: 'Celebrate diversity with music, dance, and art from around the world. Experience the rich tapestry of global cultures through performances, exhibitions, and interactive workshops.',
    date: '2024-03-20',
    time: '06:00 PM',
    location: 'Campus Ground',
    college: 'Stanford',
    department: 'Arts',
    organizer: 'Cultural Committee',
    status: 'upcoming',
    maxCapacity: 500,
    registeredUsers: ['user3'],
    attendees: [],
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: '3',
    title: 'Startup Pitch Competition',
    description: 'Present your innovative startup ideas to industry experts and investors. Network with entrepreneurs and get valuable feedback on your business concepts.',
    date: '2024-03-10',
    time: '02:00 PM',
    location: 'Business Hall',
    college: 'Harvard',
    department: 'Business',
    organizer: 'Entrepreneurship Club',
    status: 'ongoing',
    maxCapacity: 100,
    registeredUsers: ['user1'],
    attendees: [],
    imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
  },
  {
    id: '4',
    title: 'Science Fair 2024',
    description: 'Showcase groundbreaking research and scientific discoveries. Explore cutting-edge projects from students and faculty across various scientific disciplines.',
    date: '2024-02-28',
    time: '10:00 AM',
    location: 'Science Building',
    college: 'Caltech',
    department: 'Physics',
    organizer: 'Science Society',
    status: 'completed',
    maxCapacity: 150,
    registeredUsers: ['user2', 'user3'],
    attendees: [],
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: '5',
    title: 'Music Festival 2024',
    description: 'An electrifying music festival featuring local bands and renowned artists. Experience live performances across multiple genres in an outdoor setting.',
    date: '2024-03-25',
    time: '07:00 PM',
    location: 'Outdoor Amphitheater',
    college: 'Berkeley',
    department: 'Music',
    organizer: 'Music Society',
    status: 'upcoming',
    maxCapacity: 1000,
    registeredUsers: ['user1', 'user3'],
    attendees: [],
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    id: '6',
    title: 'Hackathon 2024',
    description: '48-hour coding marathon where teams build innovative solutions to real-world problems. Prizes, mentorship, and networking opportunities await.',
    date: '2024-03-30',
    time: '09:00 AM',
    location: 'Innovation Lab',
    college: 'CMU',
    department: 'Computer Science',
    organizer: 'Coding Club',
    status: 'upcoming',
    maxCapacity: 300,
    registeredUsers: ['user2'],
    attendees: [],
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
];
