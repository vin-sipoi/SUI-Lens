// filepath: /home/ashleymwende/SUI-Lens/lib/createEvent.ts
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function createEvent(eventData: any) {
  const docRef = await addDoc(collection(db, "events"), eventData);
  return docRef.id; // Unique event ID
}