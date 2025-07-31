import { db } from '@/config/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  college: string;
  department: string;
  organizer: string;
  maxCapacity: number;
  registeredUsers: string[];
  attendees: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  imageUrl?: string;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  college: string;
  department: string;
  organizer: string;
  maxCapacity: number;
  imageUrl?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  college?: string;
  department?: string;
  organizer?: string;
  maxCapacity?: number;
  imageUrl?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
}

interface UserData {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  phone: string;
  registeredAt: string;
  isAdmin?: boolean;
}

class FirebaseEventsService {
  // Get user data
  async getUserData(userId: string): Promise<UserData> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      return { id: userDoc.id, ...userDoc.data() } as UserData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('Firebase: Testing database connection...');
      const testCollection = collection(db, 'test');
      await getDocs(testCollection);
      console.log('Firebase: Database connection successful');
      return true;
    } catch (error: any) {
      console.error('Firebase: Database connection failed:', error);
      return false;
    }
  }

  // Get all events
  async getAllEvents(): Promise<Event[]> {
    try {
      console.log('Firebase: Attempting to fetch all events...');
      console.log('Firebase: Database reference:', db);
      
      const eventsCollection = collection(db, 'events');
      console.log('Firebase: Events collection reference:', eventsCollection);
      
      const querySnapshot = await getDocs(eventsCollection);
      console.log('Firebase: Query snapshot received, size:', querySnapshot.size);
      
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const eventData = { id: doc.id, ...doc.data() } as Event;
        console.log('Firebase: Processing event:', eventData.id, eventData.title);
        events.push(eventData);
      });
      
      console.log('Firebase: Total events fetched:', events.length);
      
      const sortedEvents = events.sort((a, b) => {
        // Sort by date, then by time
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      console.log('Firebase: Events sorted successfully');
      return sortedEvents;
    } catch (error: any) {
      console.error('Firebase: Error fetching events:', error);
      console.error('Firebase: Error code:', error.code);
      console.error('Firebase: Error message:', error.message);
      console.error('Firebase: Full error object:', error);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Check Firestore rules.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firebase service unavailable. Check your internet connection.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('User not authenticated. Please login again.');
      } else {
        throw new Error(`Failed to fetch events: ${error.message}`);
      }
    }
  }

  // Get events by status
  async getEventsByStatus(status: 'upcoming' | 'ongoing' | 'completed'): Promise<Event[]> {
    try {
      const q = query(
        collection(db, 'events'),
        where('status', '==', status),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() } as Event);
      });
      return events;
    } catch (error: any) {
      console.error('Error fetching events by status:', error);
      throw new Error('Failed to fetch events');
    }
  }

  // Get single event by ID
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        return { id: eventDoc.id, ...eventDoc.data() } as Event;
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching event:', error);
      throw new Error('Failed to fetch event');
    }
  }

  // Create new event
  async createEvent(eventData: CreateEventData, createdBy: string): Promise<Event> {
    try {
      console.log('Firebase: Creating event with data:', eventData);
      console.log('Firebase: Created by user:', createdBy);
      
    // Create new event
    const newEvent = {
      ...eventData,
      registeredUsers: [],
      attendees: [],
      status: eventData.status || 'upcoming',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: createdBy,
    };      console.log('Firebase: Final event object:', newEvent);
      
      const docRef = await addDoc(collection(db, 'events'), newEvent);
      console.log('Firebase: Event created with ID:', docRef.id);
      
      return { id: docRef.id, ...newEvent } as Event;
    } catch (error: any) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  // Update event
  async updateEvent(eventId: string, updates: UpdateEventData): Promise<void> {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  // Delete event
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error: any) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }

  // Register user for event
  async registerForEvent(eventId: string, userId: string): Promise<void> {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const eventData = eventDoc.data() as Event;
      
      if (eventData.registeredUsers.includes(userId)) {
        throw new Error('User already registered for this event');
      }

      if (eventData.registeredUsers.length >= eventData.maxCapacity) {
        throw new Error('Event is at full capacity');
      }

      await updateDoc(eventRef, {
        registeredUsers: [...eventData.registeredUsers, userId],
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error registering for event:', error);
      throw new Error(error.message || 'Failed to register for event');
    }
  }

  // Unregister user from event
  async unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const eventData = eventDoc.data() as Event;
      const updatedUsers = eventData.registeredUsers.filter(id => id !== userId);

      await updateDoc(eventRef, {
        registeredUsers: updatedUsers,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error unregistering from event:', error);
      throw new Error('Failed to unregister from event');
    }
  }

  // Get events by college
  async getEventsByCollege(college: string): Promise<Event[]> {
    try {
      const q = query(
        collection(db, 'events'),
        where('college', '==', college),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() } as Event);
      });
      return events;
    } catch (error: any) {
      console.error('Error fetching events by college:', error);
      throw new Error('Failed to fetch events');
    }
  }

  // Get events by department
  async getEventsByDepartment(department: string): Promise<Event[]> {
    try {
      const q = query(
        collection(db, 'events'),
        where('department', '==', department),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() } as Event);
      });
      return events;
    } catch (error: any) {
      console.error('Error fetching events by department:', error);
      throw new Error('Failed to fetch events');
    }
  }

  // Search events by title
  async searchEvents(searchTerm: string): Promise<Event[]> {
    try {
      const allEvents = await this.getAllEvents();
      return allEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error: any) {
      console.error('Error searching events:', error);
      throw new Error('Failed to search events');
    }
  }

  // Get user's registered events
  async getUserRegisteredEvents(userId: string): Promise<Event[]> {
    try {
      const allEvents = await this.getAllEvents();
      return allEvents.filter(event => 
        event.registeredUsers.includes(userId)
      );
    } catch (error: any) {
      console.error('Error fetching user events:', error);
      throw new Error('Failed to fetch user events');
    }
  }

  // Get registered students for an event (for admin dashboard)
  async getRegisteredStudents(eventId: string): Promise<any[]> {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const event = eventDoc.data() as Event;
      const registeredStudents = [];

      // Get user details for each registered user
      for (const userId of event.registeredUsers) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            registeredStudents.push({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              college: userData.college,
              department: userData.department,
              phone: userData.phone,
              registeredAt: userData.updatedAt || userData.createdAt
            });
          }
        } catch (userError) {
          console.error(`Error fetching user ${userId}:`, userError);
          // Continue with other users even if one fails
        }
      }

      return registeredStudents;
    } catch (error: any) {
      console.error('Error fetching registered students:', error);
      throw new Error('Failed to fetch registered students');
    }
  }
}

export const firebaseEventsService = new FirebaseEventsService();