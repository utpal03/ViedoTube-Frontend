// src/app/subscriptions/page.tsx
"use client"

import { useEffect, useState } from "react"
import { apiClient, type SubscribedChannel } from "@/lib/api" //
import { useAuth } from "@/contexts/AuthContext" //
import { Button } from "@/components/ui/button" //
import { Card, CardContent } from "@/components/ui/card" //
import { Alert, AlertDescription } from "@/components/ui/alert" //
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" //
import { ShoppingCartIcon as SubscriptionsIcon, Loader2 } from 'lucide-react'
import Link from "next/link"
import { formatDistanceToNow } from "date-fns" //


export default function SubscriptionsPage() {
  const [channels, setChannels] = useState<SubscribedChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        // Now using the dedicated apiClient.getSubscribedChannels()
        const response = await apiClient.getSubscribedChannels() // Call the new API client method
        setChannels(response.data.channels || []) // Assuming backend returns { data: { channels: [...] } }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load subscriptions"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptions()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Please log in to view your subscriptions.</AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="ml-0 md:ml-64 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="ml-0 md:ml-64 container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="text-center text-muted-foreground mt-4">Could not load subscriptions. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="ml-0 md:ml-64">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <SubscriptionsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Subscriptions</h1>
        </div>

        {channels.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <SubscriptionsIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
              <p className="text-muted-foreground text-center">Subscribe to channels to see their content here!</p>
              {/* You might want to link to a discovery page or home page */}
              <Link href="/" className="mt-4">
                <Button>Discover Channels</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {channels.map((channel) => (
              <div key={channel._id} className="text-center">
                <Link href={`/channel/${channel.username}`} className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 mb-2">
                    <AvatarImage src={channel.avatar || "/placeholder.svg"} alt={channel.fullname} /> {/* */}
                    <AvatarFallback className="text-3xl">{channel.fullname?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{channel.fullname}</h3>
                  <p className="text-muted-foreground text-sm">@{channel.username}</p>
                  <p className="text-muted-foreground text-sm">
                    {channel.subscribersCount?.toLocaleString() || 0} subscribers
                  </p>
                  {channel.subscribedAt && (
                    <p className="text-muted-foreground text-xs mt-1">
                      Subscribed {formatDistanceToNow(new Date(channel.subscribedAt), { addSuffix: true })}
                    </p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}