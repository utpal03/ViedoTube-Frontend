"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Home, TrendingUp, ShoppingCartIcon as Subscriptions, History, ThumbsUp, Clock, PlaySquare, Settings, HelpCircle, LucideIcon } from 'lucide-react'

interface SidebarItemType {
  title: string
  href: string
  icon: LucideIcon
  requireAuth?: boolean
}

const sidebarItems: SidebarItemType[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Trending",
    href: "/trending",
    icon: TrendingUp,
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: Subscriptions,
    requireAuth: true,
  },
]

const libraryItems: SidebarItemType[] = [
  {
    title: "Your Videos",
    href: "/your-videos",
    icon: PlaySquare,
    requireAuth: true,
  },
  {
    title: "Watch History",
    href: "/history",
    icon: History,
    requireAuth: true,
  },
  {
    title: "Liked Videos",
    href: "/liked",
    icon: ThumbsUp,
    requireAuth: true,
  },
  {
    title: "Watch Later",
    href: "/watch-later",
    icon: Clock,
    requireAuth: true,
  },
]

const bottomItems: SidebarItemType[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
  },
]

interface SidebarItemProps {
  item: SidebarItemType
}

export default function Sidebar() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  const SidebarItem = ({ item }: SidebarItemProps) => {
    const Icon = item.icon
    const isActive = pathname === item.href

    if (item.requireAuth && !isAuthenticated) {
      return null
    }

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{item.title}</span>
      </Link>
    )
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background overflow-y-auto">
      <div className="p-4 space-y-6">
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem key={item.href} item={item} />
          ))}
        </nav>

        {isAuthenticated && (
          <>
            <div className="border-t pt-4">
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Library
              </h3>
              <nav className="space-y-1">
                {libraryItems.map((item) => (
                  <SidebarItem key={item.href} item={item} />
                ))}
              </nav>
            </div>
          </>
        )}

        <div className="border-t pt-4">
          <nav className="space-y-1">
            {bottomItems.map((item) => (
              <SidebarItem key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </aside>
  )
}