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

  const login = (user: User) => setUser(user)
  const logout = () => setUser(null)

  useEffect(() => {
    // Any initialization logic can go here
    // For example, checking localStorage for existing user session
    // const savedUser = localStorage.getItem('user')
    // if (savedUser) {
    //   setUser(JSON.parse(savedUser))
    // }
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