// src/app/layout.tsx
"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../contexts/AuthContext"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import { useState } from "react"

const inter = Inter({ subsets: ["latin"] })

// Metadata block remains removed as per previous fix.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default to closed on mobile

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Header onMenuClick={toggleSidebar} />
            <div className="flex relative"> {/* Added relative to flex container */}
              {/* Sidebar component handles its own responsive visibility */}
              <Sidebar isOpen={isSidebarOpen} />

              {/* Mobile overlay for when sidebar is open */}
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/50 z-30 md:hidden"
                  onClick={toggleSidebar}
                />
              )}

              {/* Main content area */}
              {/* The ml-64 will be handled by the Sidebar's static position on desktop,
                  and this flex-1 will take full width on mobile as sidebar is an overlay. */}
              <main className="flex-1 transition-all duration-300">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}