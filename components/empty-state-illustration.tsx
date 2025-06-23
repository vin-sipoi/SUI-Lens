"use client"

import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  type: "no-events" | "no-created-events" | "no-registered-events" | "no-search-results" | "no-notifications"
  title: string
  description: string
  actionText?: string
  onAction?: () => void
}

export function EmptyStateIllustration({ type, title, description, actionText, onAction }: EmptyStateProps) {
  const renderIllustration = () => {
    switch (type) {
      case "no-events":
        return <NoEventsIllustration />
      case "no-created-events":
        return <NoCreatedEventsIllustration />
      case "no-registered-events":
        return <NoRegisteredEventsIllustration />
      case "no-search-results":
        return <NoSearchResultsIllustration />
      case "no-notifications":
        return <NoNotificationsIllustration />
      default:
        return <NoEventsIllustration />
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-8 transform hover:scale-105 transition-transform duration-300">{renderIllustration()}</div>
      <h3 className="text-2xl font-bold text-gray-200 mb-3">{title}</h3>
      <p className="text-gray-600 max-w-md mb-8 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {actionText}
        </Button>
      )}
    </div>
  )
}

// No Events Found Illustration
function NoEventsIllustration() {
  return (
    <svg width="300" height="240" viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background Circle */}
      <circle cx="150" cy="120" r="100" fill="url(#gradient1)" fillOpacity="0.1" />

      {/* Calendar Base */}
      <rect x="80" y="60" width="140" height="120" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="2" />

      {/* Calendar Header */}
      <rect x="80" y="60" width="140" height="30" rx="12" fill="url(#gradient2)" />

      {/* Calendar Rings */}
      <circle cx="110" cy="50" r="4" fill="#6B7280" />
      <circle cx="150" cy="50" r="4" fill="#6B7280" />
      <circle cx="190" cy="50" r="4" fill="#6B7280" />

      {/* Calendar Grid Lines */}
      <line x1="100" y1="110" x2="200" y2="110" stroke="#F3F4F6" strokeWidth="1" />
      <line x1="100" y1="130" x2="200" y2="130" stroke="#F3F4F6" strokeWidth="1" />
      <line x1="100" y1="150" x2="200" y2="150" stroke="#F3F4F6" strokeWidth="1" />

      <line x1="120" y1="100" x2="120" y2="170" stroke="#F3F4F6" strokeWidth="1" />
      <line x1="140" y1="100" x2="140" y2="170" stroke="#F3F4F6" strokeWidth="1" />
      <line x1="160" y1="100" x2="160" y2="170" stroke="#F3F4F6" strokeWidth="1" />
      <line x1="180" y1="100" x2="180" y2="170" stroke="#F3F4F6" strokeWidth="1" />

      {/* Empty Calendar Dots */}
      <circle cx="110" cy="120" r="2" fill="#D1D5DB" />
      <circle cx="130" cy="120" r="2" fill="#D1D5DB" />
      <circle cx="150" cy="140" r="2" fill="#D1D5DB" />
      <circle cx="170" cy="160" r="2" fill="#D1D5DB" />

      {/* Floating Elements */}
      <circle
        cx="60"
        cy="80"
        r="8"
        fill="url(#gradient3)"
        className="animate-bounce"
        style={{ animationDelay: "0s" }}
      />
      <circle
        cx="240"
        cy="100"
        r="6"
        fill="url(#gradient4)"
        className="animate-bounce"
        style={{ animationDelay: "1s" }}
      />
      <circle
        cx="50"
        cy="160"
        r="5"
        fill="url(#gradient5)"
        className="animate-bounce"
        style={{ animationDelay: "2s" }}
      />
      <circle
        cx="250"
        cy="180"
        r="7"
        fill="url(#gradient6)"
        className="animate-bounce"
        style={{ animationDelay: "0.5s" }}
      />

      {/* Search Icon */}
      <circle cx="150" cy="200" r="15" fill="none" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="162" y1="212" x2="170" y2="220" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />

      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// No Created Events Illustration
function NoCreatedEventsIllustration() {
  return (
    <svg width="300" height="240" viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="150" cy="120" r="110" fill="url(#createGradient1)" fillOpacity="0.05" />

      {/* Desk/Table */}
      <ellipse cx="150" cy="200" rx="120" ry="20" fill="#F3F4F6" />

      {/* Laptop */}
      <rect x="100" y="140" width="100" height="60" rx="8" fill="#374151" />
      <rect x="105" y="145" width="90" height="50" rx="4" fill="#1F2937" />

      {/* Laptop Screen Content */}
      <rect x="110" y="150" width="80" height="6" rx="3" fill="#4B5563" />
      <rect x="110" y="160" width="60" height="4" rx="2" fill="#6B7280" />
      <rect x="110" y="168" width="70" height="4" rx="2" fill="#6B7280" />
      <rect x="110" y="176" width="50" height="4" rx="2" fill="#6B7280" />

      {/* Plus Icon on Screen */}
      <circle cx="170" cy="170" r="8" fill="url(#createGradient2)" />
      <line x1="166" y1="170" x2="174" y2="170" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="170" y1="166" x2="170" y2="174" stroke="white" strokeWidth="2" strokeLinecap="round" />

      {/* Coffee Cup */}
      <ellipse cx="220" cy="170" rx="12" ry="15" fill="white" stroke="#E5E7EB" strokeWidth="2" />
      <ellipse cx="220" cy="165" rx="8" ry="3" fill="#8B4513" />
      <path d="M232 165 Q240 165 240 175 Q240 185 232 185" stroke="#E5E7EB" strokeWidth="2" fill="none" />

      {/* Steam */}
      <path
        d="M215 150 Q215 145 218 145 Q218 150 215 150"
        stroke="#D1D5DB"
        strokeWidth="1.5"
        fill="none"
        className="animate-pulse"
      />
      <path
        d="M220 148 Q220 143 223 143 Q223 148 220 148"
        stroke="#D1D5DB"
        strokeWidth="1.5"
        fill="none"
        className="animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />
      <path
        d="M225 150 Q225 145 228 145 Q228 150 225 150"
        stroke="#D1D5DB"
        strokeWidth="1.5"
        fill="none"
        className="animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Notebook */}
      <rect x="60" y="160" width="30" height="40" rx="2" fill="white" stroke="#E5E7EB" strokeWidth="2" />
      <line x1="65" y1="170" x2="85" y2="170" stroke="#F3F4F6" strokeWidth="1" />
      <line x1="65" y1="175" x2="85" y2="175" stroke="#F3F4F6" strokeWidth="1" />
      <line x1="65" y1="180" x2="85" y2="180" stroke="#F3F4F6" strokeWidth="1" />
      <line x1="65" y1="185" x2="85" y2="185" stroke="#F3F4F6" strokeWidth="1" />

      {/* Pen */}
      <rect
        x="95"
        y="175"
        width="20"
        height="3"
        rx="1.5"
        fill="url(#createGradient3)"
        transform="rotate(25 105 176.5)"
      />
      <circle cx="98" cy="176" r="1.5" fill="#374151" transform="rotate(25 105 176.5)" />

      {/* Floating Ideas */}
      <circle
        cx="80"
        cy="100"
        r="6"
        fill="url(#createGradient4)"
        className="animate-bounce"
        style={{ animationDelay: "0s" }}
      />
      <circle
        cx="220"
        cy="90"
        r="8"
        fill="url(#createGradient5)"
        className="animate-bounce"
        style={{ animationDelay: "1s" }}
      />
      <circle
        cx="50"
        cy="130"
        r="5"
        fill="url(#createGradient6)"
        className="animate-bounce"
        style={{ animationDelay: "2s" }}
      />
      <circle
        cx="250"
        cy="120"
        r="7"
        fill="url(#createGradient7)"
        className="animate-bounce"
        style={{ animationDelay: "0.5s" }}
      />

      {/* Light bulb */}
      <circle cx="150" cy="80" r="15" fill="none" stroke="url(#createGradient8)" strokeWidth="2" />
      <rect x="145" y="92" width="10" height="8" rx="2" fill="none" stroke="url(#createGradient8)" strokeWidth="2" />
      <line x1="147" y1="100" x2="153" y2="100" stroke="url(#createGradient8)" strokeWidth="2" strokeLinecap="round" />

      {/* Light rays */}
      <line
        x1="130"
        y1="65"
        x2="135"
        y2="70"
        stroke="#FCD34D"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-pulse"
      />
      <line
        x1="170"
        y1="65"
        x2="165"
        y2="70"
        stroke="#FCD34D"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-pulse"
        style={{ animationDelay: "0.3s" }}
      />
      <line
        x1="125"
        y1="80"
        x2="130"
        y2="80"
        stroke="#FCD34D"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-pulse"
        style={{ animationDelay: "0.6s" }}
      />
      <line
        x1="175"
        y1="80"
        x2="170"
        y2="80"
        stroke="#FCD34D"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-pulse"
        style={{ animationDelay: "0.9s" }}
      />

      <defs>
        <linearGradient id="createGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="createGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="createGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="createGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="createGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="createGradient6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="createGradient7" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
        <linearGradient id="createGradient8" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// No Registered Events Illustration
function NoRegisteredEventsIllustration() {
  return (
    <svg width="300" height="240" viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="150" cy="120" r="100" fill="url(#regGradient1)" fillOpacity="0.08" />

      {/* Ticket Base */}
      <rect
        x="75"
        y="90"
        width="150"
        height="80"
        rx="12"
        fill="white"
        stroke="#E5E7EB"
        strokeWidth="2"
        strokeDasharray="5,5"
      />

      {/* Ticket Perforation */}
      <line x1="75" y1="130" x2="225" y2="130" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3,3" />

      {/* Ticket Stub */}
      <rect x="75" y="90" width="40" height="80" rx="12" fill="#F9FAFB" />

      {/* Ticket Content Area */}
      <rect x="125" y="100" width="90" height="15" rx="4" fill="#F3F4F6" />
      <rect x="125" y="120" width="70" height="8" rx="2" fill="#E5E7EB" />
      <rect x="125" y="140" width="80" height="8" rx="2" fill="#E5E7EB" />
      <rect x="125" y="150" width="60" height="8" rx="2" fill="#E5E7EB" />

      {/* Question Mark in Ticket */}
      <circle cx="95" cy="130" r="12" fill="url(#regGradient2)" />
      <text x="95" y="136" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
        ?
      </text>

      {/* Magnifying Glass */}
      <circle cx="180" cy="200" r="20" fill="none" stroke="url(#regGradient3)" strokeWidth="3" />
      <line x1="195" y1="215" x2="210" y2="230" stroke="url(#regGradient3)" strokeWidth="3" strokeLinecap="round" />

      {/* Floating Tickets */}
      <rect
        x="40"
        y="60"
        width="30"
        height="20"
        rx="4"
        fill="url(#regGradient4)"
        className="animate-float"
        style={{ animationDelay: "0s" }}
        transform="rotate(-15 55 70)"
      />
      <rect
        x="230"
        y="70"
        width="25"
        height="18"
        rx="3"
        fill="url(#regGradient5)"
        className="animate-float"
        style={{ animationDelay: "1s" }}
        transform="rotate(20 242.5 79)"
      />
      <rect
        x="50"
        y="180"
        width="28"
        height="19"
        rx="4"
        fill="url(#regGradient6)"
        className="animate-float"
        style={{ animationDelay: "2s" }}
        transform="rotate(-10 64 189.5)"
      />
      <rect
        x="240"
        y="160"
        width="26"
        height="17"
        rx="3"
        fill="url(#regGradient7)"
        className="animate-float"
        style={{ animationDelay: "0.5s" }}
        transform="rotate(25 253 168.5)"
      />

      {/* Stars */}
      <polygon
        points="60,40 62,46 68,46 63,50 65,56 60,52 55,56 57,50 52,46 58,46"
        fill="#FCD34D"
        className="animate-pulse"
      />
      <polygon
        points="240,40 241,44 245,44 242,47 243,51 240,49 237,51 238,47 235,44 239,44"
        fill="#FCD34D"
        className="animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />
      <polygon
        points="270,120 271,123 274,123 272,125 273,128 270,126 267,128 268,125 266,123 269,123"
        fill="#FCD34D"
        className="animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <defs>
        <linearGradient id="regGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="regGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B7280" />
          <stop offset="100%" stopColor="#4B5563" />
        </linearGradient>
        <linearGradient id="regGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="regGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="regGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="regGradient6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="regGradient7" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// No Search Results Illustration
function NoSearchResultsIllustration() {
  return (
    <svg width="300" height="240" viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="150" cy="120" r="100" fill="url(#searchGradient1)" fillOpacity="0.06" />

      {/* Large Magnifying Glass */}
      <circle cx="130" cy="110" r="40" fill="none" stroke="url(#searchGradient2)" strokeWidth="4" />
      <line x1="160" y1="140" x2="190" y2="170" stroke="url(#searchGradient2)" strokeWidth="4" strokeLinecap="round" />

      {/* Glass Reflection */}
      <ellipse cx="115" cy="95" rx="8" ry="12" fill="white" fillOpacity="0.3" transform="rotate(-30 115 95)" />

      {/* Search Results Cards (Empty) */}
      <rect
        x="180"
        y="80"
        width="60"
        height="40"
        rx="6"
        fill="white"
        stroke="#E5E7EB"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      <rect x="185" y="85" width="50" height="6" rx="3" fill="#F3F4F6" />
      <rect x="185" y="95" width="35" height="4" rx="2" fill="#E5E7EB" />
      <rect x="185" y="102" width="40" height="4" rx="2" fill="#E5E7EB" />
      <rect x="185" y="109" width="30" height="4" rx="2" fill="#E5E7EB" />

      <rect
        x="180"
        y="130"
        width="60"
        height="40"
        rx="6"
        fill="white"
        stroke="#E5E7EB"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      <rect x="185" y="135" width="50" height="6" rx="3" fill="#F3F4F6" />
      <rect x="185" y="145" width="35" height="4" rx="2" fill="#E5E7EB" />
      <rect x="185" y="152" width="40" height="4" rx="2" fill="#E5E7EB" />
      <rect x="185" y="159" width="30" height="4" rx="2" fill="#E5E7EB" />

      {/* X mark in magnifying glass */}
      <line x1="120" y1="100" x2="140" y2="120" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      <line x1="140" y1="100" x2="120" y2="120" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />

      {/* Floating Search Terms */}
      <rect
        x="60"
        y="60"
        width="40"
        height="20"
        rx="10"
        fill="url(#searchGradient3)"
        className="animate-float"
        style={{ animationDelay: "0s" }}
      />
      <text x="80" y="72" textAnchor="middle" fill="white" fontSize="10" fontWeight="500">
        music
      </text>

      <rect
        x="40"
        y="140"
        width="35"
        height="18"
        rx="9"
        fill="url(#searchGradient4)"
        className="animate-float"
        style={{ animationDelay: "1s" }}
      />
      <text x="57.5" y="151" textAnchor="middle" fill="white" fontSize="9" fontWeight="500">
        food
      </text>

      <rect
        x="250"
        y="50"
        width="38"
        height="19"
        rx="9.5"
        fill="url(#searchGradient5)"
        className="animate-float"
        style={{ animationDelay: "2s" }}
      />
      <text x="269" y="61" textAnchor="middle" fill="white" fontSize="9" fontWeight="500">
        tech
      </text>

      <rect
        x="260"
        y="180"
        width="32"
        height="17"
        rx="8.5"
        fill="url(#searchGradient6)"
        className="animate-float"
        style={{ animationDelay: "0.5s" }}
      />
      <text x="276" y="190" textAnchor="middle" fill="white" fontSize="8" fontWeight="500">
        art
      </text>

      {/* Question marks */}
      <text x="100" y="200" fill="#9CA3AF" fontSize="24" fontWeight="bold" className="animate-pulse">
        ?
      </text>
      <text
        x="200"
        y="210"
        fill="#9CA3AF"
        fontSize="18"
        fontWeight="bold"
        className="animate-pulse"
        style={{ animationDelay: "0.5s" }}
      >
        ?
      </text>
      <text
        x="70"
        y="180"
        fill="#9CA3AF"
        fontSize="20"
        fontWeight="bold"
        className="animate-pulse"
        style={{ animationDelay: "1s" }}
      >
        ?
      </text>

      <defs>
        <linearGradient id="searchGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="searchGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B7280" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
        <linearGradient id="searchGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="searchGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="searchGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="searchGradient6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// No Notifications Illustration
function NoNotificationsIllustration() {
  return (
    <svg width="300" height="240" viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="150" cy="120" r="100" fill="url(#notifGradient1)" fillOpacity="0.05" />

      {/* Bell */}
      <path
        d="M150 60 C130 60 115 75 115 95 L115 120 C115 130 110 135 105 140 L195 140 C190 135 185 130 185 120 L185 95 C185 75 170 60 150 60 Z"
        fill="url(#notifGradient2)"
      />

      {/* Bell Top */}
      <rect x="145" y="50" width="10" height="15" rx="5" fill="url(#notifGradient3)" />

      {/* Bell Bottom */}
      <ellipse cx="150" cy="140" rx="40" ry="8" fill="url(#notifGradient4)" />

      {/* Bell Clapper */}
      <circle cx="150" cy="120" r="6" fill="#E5E7EB" />

      {/* Mute/Silent Symbol */}
      <circle cx="150" cy="120" r="25" fill="none" stroke="#EF4444" strokeWidth="4" />
      <line x1="130" y1="100" x2="170" y2="140" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />

      {/* Floating Zzz */}
      <text x="200" y="80" fill="url(#notifGradient5)" fontSize="20" fontWeight="bold" className="animate-pulse">
        Z
      </text>
      <text
        x="210"
        y="70"
        fill="url(#notifGradient5)"
        fontSize="16"
        fontWeight="bold"
        className="animate-pulse"
        style={{ animationDelay: "0.3s" }}
      >
        z
      </text>
      <text
        x="218"
        y="62"
        fill="url(#notifGradient5)"
        fontSize="12"
        fontWeight="bold"
        className="animate-pulse"
        style={{ animationDelay: "0.6s" }}
      >
        z
      </text>

      {/* Peaceful Elements */}
      <circle
        cx="80"
        cy="80"
        r="6"
        fill="url(#notifGradient6)"
        className="animate-pulse"
        style={{ animationDelay: "0s" }}
      />
      <circle
        cx="220"
        cy="160"
        r="8"
        fill="url(#notifGradient7)"
        className="animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <circle
        cx="60"
        cy="160"
        r="5"
        fill="url(#notifGradient8)"
        className="animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <circle
        cx="240"
        cy="100"
        r="7"
        fill="url(#notifGradient9)"
        className="animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />

      {/* Peaceful Waves */}
      <path
        d="M50 200 Q75 190 100 200 Q125 210 150 200 Q175 190 200 200 Q225 210 250 200"
        stroke="#E0E7FF"
        strokeWidth="2"
        fill="none"
        className="animate-pulse"
      />
      <path
        d="M50 210 Q75 200 100 210 Q125 220 150 210 Q175 200 200 210 Q225 220 250 210"
        stroke="#E0E7FF"
        strokeWidth="1.5"
        fill="none"
        className="animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />

      <defs>
        <linearGradient id="notifGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="notifGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D1D5DB" />
          <stop offset="100%" stopColor="#9CA3AF" />
        </linearGradient>
        <linearGradient id="notifGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B7280" />
          <stop offset="100%" stopColor="#4B5563" />
        </linearGradient>
        <linearGradient id="notifGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F3F4F6" />
          <stop offset="100%" stopColor="#E5E7EB" />
        </linearGradient>
        <linearGradient id="notifGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="notifGradient6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="100%" stopColor="#BFDBFE" />
        </linearGradient>
        <linearGradient id="notifGradient7" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
        <linearGradient id="notifGradient8" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D1FAE5" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </linearGradient>
        <linearGradient id="notifGradient9" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FECACA" />
          <stop offset="100%" stopColor="#FCA5A5" />
        </linearGradient>
      </defs>
    </svg>
  )
}
