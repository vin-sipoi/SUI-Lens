"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

type User = {
  id?: string
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
  picture?: string
  googleId?: string
  googleToken?: string
  isEnoki?: boolean
  jwt?: string
}

type UserContextType = {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  login: (user: User) => void
  logout: () => void
  updateUserProfile: (updates: Partial<User>) => void
  updateProfileImage: (imageUrl: string) => void
  updateUserName: (name: string) => void
  updateUserEmail: (email: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize user from localStorage on mount
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('Restoring user from localStorage:', parsedUser);
          return parsedUser;
        } catch (error) {
          console.error('Failed to parse saved user:', error);
        }
      }
    }
    return {
      name: "No Name",
      email: "",
      username: "Sui User",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens",
      walletAddress: "",
      emails: [],
    };
  });

  const updateUserProfile = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  };

  const updateProfileImage = (imageUrl: any) => {
    setUser(prev => prev ? { ...prev, avatarUrl: imageUrl } : prev);
  };

  const updateUserName = (name: any) => {
    setUser(prev => prev ? { ...prev, name } : prev);
  };

  const updateUserEmail = (email: any) => {
    setUser(prev => prev ? ({ ...prev, email }): prev);
  };

  const login = async (userData: User) => { // Make login async
        console.log("Login function called with:", userData); // Log input
        // Set isEnoki based on the presence of a JWT
        userData.isEnoki = !!userData.jwt;
        setUser(userData);
        // Save to localStorage immediately after login
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        console.log("User set in context and saved to localStorage:", userData); // Log after setUser
    };
  const logout = () => {
    setUser(null);
    // Clear localStorage on logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      console.log("User cleared from localStorage");
    }
  }

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      console.log("User saved to local storage:", user); // Log saved user data
    } else {
      localStorage.removeItem('user');
      console.log("User removed from local storage."); // Log removal
    }
  }, [user])

  return (
    <UserContext.Provider value={{ user, setUser,updateUserProfile, updateProfileImage, updateUserName, updateUserEmail, login, logout }}>
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