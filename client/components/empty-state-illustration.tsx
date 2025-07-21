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

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      
      <h3 className="text-2xl font-bold text-[#101928] mb-3">{title}</h3>
      <p className="text-gray-600 max-w-md mb-8 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-[#4DA2FF] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {actionText}
        </Button>
      )}
    </div>
  )
}

// No Events Found Illustration

// No Created Events Illustration

// No Registered Events Illustration

// No Search Results Illustration

// No Notifications Illustration
