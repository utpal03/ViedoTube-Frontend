"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { apiClient, type User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (formData: FormData) => Promise<void>
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      const { user, accessToken } = response.data

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("user", JSON.stringify(user))
      setUser(user)
    } catch (error) {
      throw error
    }
  }

  const register = async (formData: FormData) => {
    try {
      const response = await apiClient.register(formData)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
