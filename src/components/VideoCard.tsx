"use client"

import Link from "next/link"
// Update the import path below if the Video type is located elsewhere
import type { Video } from "../lib/api"
// If the correct path is different, adjust "../lib/api" accordingly
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface VideoCardProps {
  video: Video
  showChannel?: boolean
}

export default function VideoCard({ video, showChannel = true }: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  return (
    <div className="group cursor-pointer">
      <Link href={`/watch/${video._id}`}>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          <img
            src={video.thumbnail || "/placeholder.svg?height=180&width=320"}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>
      </Link>

      <div className="flex mt-3 space-x-3">
        {showChannel && (
          <Link href={`/channel/${video.owner.username}`}>
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={video.owner.avatar || "/placeholder.svg"} alt={video.owner.fullname} />
              <AvatarFallback>{video.owner.fullname.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        )}

        <div className="flex-1 min-w-0">
          <Link href={`/watch/${video._id}`}>
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
          </Link>

          {showChannel && (
            <Link href={`/channel/${video.owner.username}`}>
              <p className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-1">
                {video.owner.fullname}
              </p>
            </Link>
          )}

          <div className="flex items-center text-sm text-muted-foreground mt-1 space-x-1">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
