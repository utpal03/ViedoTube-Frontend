// src/app/trending/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient, type Video } from "@/lib/api"; //
import VideoCard from "@/components/VideoCard"; //
import { Button } from "@/components/ui/button"; //
import { Loader2 } from "lucide-react";

export default function TrendingPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadTrendingVideos = async (pageNum = 1) => {
    try {
      setLoading(true);
      // You will need to implement a backend API for trending videos.
      // For now, it reuses getVideos, assuming your backend can handle a 'trending' query or similar.
      // You might pass a specific query parameter like 'sort=trending'.
      const response = await apiClient.getVideos(pageNum, 12, "trending"); // Example: pass "trending" as a query
      // Adjust this API call based on your actual backend trending endpoint.

      if (pageNum === 1) {
        setVideos(response.videos || []);
      } else {
        setVideos((prev) => [...prev, ...(response.videos || [])]);
      }

      setHasMore((response.videos || []).length === 12);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load trending videos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrendingVideos();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadTrendingVideos(nextPage);
  };

  const handleRetry = () => {
    setError("");
    loadTrendingVideos(1);
    setPage(1);
  };

  if (loading && videos.length === 0) {
    return (
      <div className="ml-0 md:ml-64">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="ml-0 md:ml-64">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetry}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Trending Videos</h1>
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
    </div>
  );
}
