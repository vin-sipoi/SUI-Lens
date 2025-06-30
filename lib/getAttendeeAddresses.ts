import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getAttendeeAddresses(eventId: string): Promise<string[]> {
  const snapshot = await getDocs(collection(db, "events", eventId, "attendees"));
  return snapshot.docs.map(doc => doc.data().address);
}