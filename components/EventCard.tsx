import React from "react";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
  category: string;
  link?: string;
};

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{event.description}</p>
      <div className="flex items-center text-gray-600 text-sm mb-2">
        <Calendar className="w-4 h-4 mr-2" />
        <span>{new Date(event.date).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center text-gray-600 text-sm mb-2">
        <MapPin className="w-4 h-4 mr-2" />
        <span>{event.location}</span>
      </div>
      <div className="flex items-center text-gray-600 text-sm mb-4">
        <Users className="w-4 h-4 mr-2" />
        <span>{event.attendees} attendees</span>
      </div>
      {event.link && (
        <Link href={event.link} className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
          View event
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      )}
    </div>
  </div>
);
