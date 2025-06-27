// src/contexts/AuthContext.tsx
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { apiClient, type User } from "@/lib/api"
import { useRouter } from "next/navigation" 

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
  const router = useRouter() // Initialize Next.js router for redirects

  useEffect(() => {
    const loadUserFromCookie = async () => {
      try {
        // Attempt to fetch current user data, which will rely on the browser sending the cookie.
        // apiClient.getCurrentUser will handle 401s by attempting refresh or redirecting to login.
        const response = await apiClient.getCurrentUser();
        // Backend's login response showed user directly under 'data' property
        setUser(response.data.user);
      } catch (error) {
        // If getCurrentUser fails (e.g., no valid cookie, refresh failed in apiClient),
        // apiClient will either retry or redirect to login. We just ensure user state is null.
        console.error("Failed to load user from cookie or session expired:", error);
        setUser(null); // Ensure user state is null on failed auto-auth
        // The redirect to login is now handled by apiClient's interceptor if refresh fails.
        // However, if the initial getCurrentUser itself fails without a redirect from apiClient,
        // we might want to redirect here. But apiClient should ultimately handle session expiry.
        // If you see issues here, ensure apiClient's redirect works or add router.push("/login")
      } finally {
        setLoading(false);
      }
    };

    loadUserFromCookie();
  }, []); // Empty dependency array means this runs once on mount

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      // CORRECTED: Destructure 'user' directly from response.data, as backend's login JSON shows user under 'data'
      const { user } = response.data;

      // No need to store accessToken or refreshToken in localStorage, as they are httpOnly cookies
      localStorage.setItem("user", JSON.stringify(user)) // Keep user data in localStorage for client-side access
      setUser(user)
    } catch (error) {
      throw error
    }
  }

  const register = async (formData: FormData) => {
    try {
      const response = await apiClient.register(formData)
      // After successful registration, you might want to automatically log them in or redirect
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
      // No need to remove tokens from localStorage as they are httpOnly cookies managed by the browser
      localStorage.removeItem("user") // Keep removing user data for client-side state cleanup
      setUser(null)
      // Manually redirect to login after explicit logout, as apiClient might not force it after successful backend logout call
      router.push("/login?loggedOut=true");
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