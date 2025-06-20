"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
// Update the import path if AuthContext is located elsewhere, for example:
import { useAuth } from "../contexts/AuthContext"
// Or, if the file does not exist, create 'src/contexts/AuthContext.tsx' and export useAuth from it.
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Upload, User, LogOut, Settings, Menu } from "lucide-react"

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">VT</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">VideoTube</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Upload</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.fullname} />
                      <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.fullname}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">@{user?.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user?.username}`}>
                      <User className="mr-2 h-4 w-4" />
                      Your Channel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
