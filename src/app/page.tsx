// src/app/page.tsx
"use client"

import { useEffect, useState } from "react"
import { apiClient, type Video } from "@/lib/api"
import VideoCard from "@/components/VideoCard"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadVideos = async (pageNum = 1) => {
    try {
      setLoading(true)
      // Assuming apiClient.getVideos fetches all videos for the home page
      const response = await apiClient.getVideos(pageNum, 12)

      if (pageNum === 1) {
        setVideos(response.videos || []) // Adjust based on your API response structure (e.g., response.data.videos)
      } else {
        setVideos((prev) => [...prev, ...(response.videos || [])]) // Adjust based on your API response structure
      }

      setHasMore((response.videos || []).length === 12) // Assuming 12 items per page for 'hasMore' check
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load videos"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, []) // Empty dependency array means this runs once on mount

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadVideos(nextPage)
  }

  const handleRetry = () => { // This function is now used
    setError("")
    loadVideos(1) // Reloads videos from page 1
    setPage(1)
  }

  if (loading && videos.length === 0) {
    return (
      // REMOVED 'ml-0 md:ml-64'
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error && videos.length === 0) {
    return (
      // REMOVED 'ml-0 md:ml-64'
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRetry}>Try Again</Button> {/* ADDED: Button to call handleRetry */}
        </div>
      </div>
    )
  }

  return (
    // REMOVED 'ml-0 md:ml-64'
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMore} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}