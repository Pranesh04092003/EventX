import { db } from '@/config/firebase';
import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';

interface Attendance {
  eventId: string;
  userId: string;
  timestamp: any;
}

export async function markAttendance(eventId: string, userId: string) {
  try {
    // Create attendance record
    const attendanceRef = collection(db, 'attendance');
    await addDoc(attendanceRef, {
      eventId,
      userId,
      timestamp: serverTimestamp()
    });

    // Update event's attendance array
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      attendees: arrayUnion(userId)
    });

    return true;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
}
