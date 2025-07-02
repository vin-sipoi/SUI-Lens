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
    <div className="p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">{event.description}</p>
      
      <div className="space-y-2">
        <div className="flex items-center text-gray-600 text-xs sm:text-sm">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{new Date(event.date).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-xs sm:text-sm">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-xs sm:text-sm">
          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{event.attendees} attendees</span>
        </div>
      </div>
      
      {event.link && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link 
            href={event.link} 
            className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm touch-target"
          >
            View event
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}
    </div>
  </div>
);
