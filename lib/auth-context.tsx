"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  username: string
  nome?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null)
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds

  const performLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      // Even if API fails, clear user state and redirect
      setUser(null)
      router.push("/login")
    }
  }, [router])

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current)
    }

    if (user) {
      inactivityTimer.current = setTimeout(() => {
        console.log("User inactive for 5 minutes, logging out...")
        performLogout()
      }, INACTIVITY_TIMEOUT)
    }
  }, [user, performLogout, INACTIVITY_TIMEOUT])

  // Setup activity listeners
  useEffect(() => {
    if (!user) return

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    const handleActivity = () => {
      resetInactivityTimer()
    }

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    // Setup beforeunload listener for browser close
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable logout on page unload
      navigator.sendBeacon("/api/auth/logout", JSON.stringify({}))
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    // Start inactivity timer
    resetInactivityTimer()

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current)
      }
    }
  }, [user, resetInactivityTimer])

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = async () => {
    // Clear inactivity timer on manual logout
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current)
    }
    await performLogout()
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
