import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// Update the import path if AuthContext is located elsewhere, for example:
import { AuthProvider } from "../contexts/AuthContext"
// Or, if the file does not exist, create 'src/contexts/AuthContext.tsx' with the AuthProvider definition.
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VideoTube - Share Your Videos",
  description: "A modern video sharing platform built with Next.js",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <div className="flex">
              <div className="hidden md:block">
                <Sidebar />
              </div>
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
