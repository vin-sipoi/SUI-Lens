export interface Event {
  id: string;
  type?: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  time: string;
  endTime?: string;
  location: string;
  category?: string;
  capacity?: string;
  ticketPrice?: string;
  isFree?: boolean;
  requiresApproval?: boolean;
  isPrivate?: boolean;
  timezone?: string;
  poapEnabled?: boolean;
  rsvps?: string[];
  attendance?: string[];
  qrCode?: string;
  eventUrl?: string;
  image?: string;
  organizer?: {
    name?: string;
    title?: string;
    avatar?: string;
  };
}
