"use client"
import Image from "next/image"

interface EmptyStateProps {
  title: string
  actionText?: string

}

export function EmptyStateIllustration({ title, actionText }: EmptyStateProps) {

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-2xl font-bold text-[#101928] mb-3">{title}</h3>
      {(
        <Image
          src="/Group.svg"
          alt="Empty State Illustration"
          width={100}
          height={100}
        />
      )}
    </div>
  )
}

// No Events Found Illustration

// No Created Events Illustration

// No Registered Events Illustration

// No Search Results Illustration

// No Notifications Illustration
