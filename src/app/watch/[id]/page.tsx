// src/app/watch/[id]/page.tsx
"use client"

import { useEffect, useState } from "react" // Removed `use as ReactUse`
import { apiClient, type Video } from "@/lib/api" //
import VideoPlayer from "@/components/VideoPlayer" //
import CommentSection from "@/components/CommentSection" //
import { useAuth } from "@/contexts/AuthContext" //
import { Button } from "@/components/ui/button" //
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" //
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from "date-fns" //
import { Alert, AlertDescription } from "@/components/ui/alert" //
import Link from "next/link"

interface WatchPageProps {
  params: {
    id: string
  }
}

export default function WatchPage({ params }: WatchPageProps) {
  const { id: videoId } = params;

  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { isAuthenticated, user: loggedInUser } = useAuth()
  const isMyVideo = loggedInUser?._id === video?.owner._id

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getVideoById(videoId)
        setVideo(response.video)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load video"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (videoId) {
      fetchVideo()
    }
  }, [videoId])

  const handleLike = async () => {
    if (!video || !isAuthenticated) return
    try {
      await apiClient.likeVideo(video._id) //
      setVideo((prev) => {
        if (!prev) return null
        return {
          ...prev,
          likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
          dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes, // Remove dislike if previously disliked
          isLiked: !prev.isLiked,
          isDisliked: false,
        }
      })
    } catch (err) {
      console.error("Failed to like video:", err)
      setError(err instanceof Error ? err.message : "Failed to like video")
    }
  }

  const handleDislike = async () => {
    if (!video || !isAuthenticated) return
    try {
      await apiClient.dislikeVideo(video._id) //
      setVideo((prev) => {
        if (!prev) return null
        return {
          ...prev,
          dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
          likes: prev.isLiked ? prev.likes - 1 : prev.likes, // Remove like if previously liked
          isDisliked: !prev.isDisliked,
          isLiked: false,
        }
      })
    } catch (err) {
      console.error("Failed to dislike video:", err)
      setError(err instanceof Error ? err.message : "Failed to dislike video")
    }
  }

  const handleSubscribe = async () => {
    if (!video?.owner || !isAuthenticated) return
    try {
      if (video.owner.isSubscribed) {
        await apiClient.unsubscribeFromChannel(video.owner._id) //
        setVideo((prev) =>
          prev
            ? {
                ...prev,
                owner: {
                  ...prev.owner,
                  isSubscribed: false,
                  subscribersCount: (prev.owner.subscribersCount || 0) - 1,
                },
              }
            : null,
        )
      } else {
        await apiClient.subscribeToChannel(video.owner._id) //
        setVideo((prev) =>
          prev
            ? {
                ...prev,
                owner: {
                  ...prev.owner,
                  isSubscribed: true,
                  subscribersCount: (prev.owner.subscribersCount || 0) + 1,
                },
              }
            : null,
        )
      }
    } catch (err) {
      console.error("Subscription failed:", err)
      setError(err instanceof Error ? err.message : "Failed to update subscription")
    }
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
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
        <p className="text-center text-muted-foreground mt-4">Could not load video. Please try again.</p>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="ml-0 md:ml-64 container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Video not found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="ml-0 md:ml-64">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <VideoPlayer videoId={video._id} videoUrl={video.videofile} />
            {
              /* Video title and details */
            } 

            <h1 className="text-xl font-bold mt-4">{video.title}</h1>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{formatViews(video.views)} views</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={!isAuthenticated}
                  className={video.isLiked ? "text-primary" : ""}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {video.likes > 0 && video.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDislike}
                  disabled={!isAuthenticated}
                  className={video.isDisliked ? "text-destructive" : ""}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  {video.dislikes > 0 && video.dislikes}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-6 border-t pt-4">
              <Link href={`/channel/${video.owner.username}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={video.owner.avatar || "/placeholder.svg"} alt={video.owner.fullname} /> {/* */}
                  <AvatarFallback>{video.owner.fullname?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link href={`/channel/${video.owner.username}`}>
                  <h2 className="font-semibold">{video.owner.fullname}</h2>
                </Link>
                <p className="text-sm text-muted-foreground">
                  {video.owner.subscribersCount?.toLocaleString() || 0} subscribers
                </p>
              </div>
              {!isMyVideo && isAuthenticated && (
                <Button onClick={handleSubscribe}>
                  {video.owner.isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              )}
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
              <p className="whitespace-pre-line">{video.description}</p>
            </div>

            <div className="mt-8">
              <CommentSection videoId={video._id} /> {/* */}
            </div>
          </div>
          {/* You can add related videos sidebar here */}
          <div className="lg:col-span-1">
            {/* Related videos or other content */}
            <h3 className="text-xl font-bold mb-4">Related Videos</h3>
            {/* Implement logic to fetch and display related videos here */}
            <div className="space-y-4">
              <p className="text-muted-foreground">No related videos found.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}