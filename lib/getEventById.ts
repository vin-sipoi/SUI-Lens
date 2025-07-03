import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Fetches an event document by ID from Firestore.
 * @param eventId The Firestore document ID of the event.
 * @returns The event data object, or null if not found.
 */
export async function getEventById(eventId: string): Promise<any | null> {
  try {
    const docRef = doc(db, "events", eventId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    return null;
  }
}