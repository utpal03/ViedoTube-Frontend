// src/app/search/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient, type Video } from "@/lib/api"; //
import VideoCard from "@/components/VideoCard"; //
import { Button } from "@/components/ui/button"; //
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert"; //

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadSearchResults = async (pageNum = 1) => {
    if (!searchQuery.trim()) {
      setLoading(false);
      setVideos([]);
      setHasMore(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.getVideos(pageNum, 12, searchQuery); //

      if (pageNum === 1) {
        setVideos(response.videos || []);
      } else {
        setVideos((prev) => [...prev, ...(response.videos || [])]);
      }

      setHasMore((response.videos || []).length === 12);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load search results";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset page when search query changes
    setVideos([]); // Clear previous videos
    setHasMore(true); // Assume there's more until proven otherwise
    loadSearchResults(1);
  }, [searchQuery]); // Rerun effect when searchQuery changes

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadSearchResults(nextPage);
  };

  const handleRetry = () => {
    setError("");
    loadSearchResults(1);
    setPage(1);
  };

  if (!searchQuery.trim()) {
    return (
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Please enter a search query.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold mb-8">
          Search Results for &quot;{searchQuery}&quot;
        </h1>
        {videos.length === 0 && !loading && !error ? (
          <Alert>
            <AlertDescription>
              No videos found for &quot;{searchQuery}&quot;.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}

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
