"use client"

import { useEffect, useRef } from "react"
import { apiClient } from "../lib/api"
import { useAuth } from "../contexts/AuthContext"

interface VideoPlayerProps {
  videoId: string
  videoUrl: string
  onTimeUpdate?: (currentTime: number) => void
}

export default function VideoPlayer({ videoId, videoUrl, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  // Removed unused currentTime state
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const time = video.currentTime
      onTimeUpdate?.(time)

      // Add to watch history every 30 seconds
      if (isAuthenticated && Math.floor(time) % 30 === 0) {
        apiClient.addToWatchHistory(videoId, time).catch(console.error)
      }
    }

    const handleEnded = () => {
      if (isAuthenticated) {
        apiClient.addToWatchHistory(videoId, video.duration).catch(console.error)
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("ended", handleEnded)
    }
  }, [videoId, isAuthenticated, onTimeUpdate])

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video ref={videoRef} src={videoUrl} controls className="w-full h-full" preload="metadata">
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
