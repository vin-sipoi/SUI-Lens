"use client"
import React, { createContext, useContext, useState, useEffect } from "react"

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
  eventsAttended?: number;
  poapsCollected?: number;
  avatarUrl?: string
}

type UserContextType = {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  const login = (user: User) => setUser(user)
  const logout = () => setUser(null)

  useEffect(() => {
    // Theme handling removed as setTheme is not defined
}, []);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}
