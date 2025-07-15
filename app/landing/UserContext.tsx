"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

type User = {
  name: string
  email: string
  bio?: string
  instagram?: string
  twitter?: string
  youtube?: string
  tiktok?: string
  linkedin?: string
  website?: string
  mobile?: string
  username?: string
  walletAddress?: string
  emails: { address: string; primary: boolean; verified: boolean }[]
  eventsAttended?: number
  poapsCollected?: number
  avatarUrl?: string
}

type UserContextType = {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = (user: User) => {
    setUser(user)
    // Save to localStorage to persist across page navigations
    if (typeof window !== 'undefined') {
      localStorage.setItem('sui-lens-user', JSON.stringify(user))
    }
  }

  const logout = () => {
    setUser(null)
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sui-lens-user')
    }
  }

  useEffect(() => {
    // Check localStorage for existing user session on mount
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('sui-lens-user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error('Error parsing saved user:', error)
          localStorage.removeItem('sui-lens-user')
        }
      }
      setIsLoading(false)
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}