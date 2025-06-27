// src/app/liked/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient, type Video } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import VideoCard from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThumbsUp, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LikedVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // Assuming pagination support for liked videos
  const { isAuthenticated } = useAuth();

  const loadLikedVideos = async (pageNum = 1) => {
    if (!isAuthenticated) {
      setLoading(false);
      setVideos([]);
      setHasMore(false);
      return; // Don't try to fetch if not authenticated
    }

    try {
      setLoading(true);
      // This calls the new API method. Adjust backend endpoint as necessary.
      const response = await apiClient.getLikedVideos(pageNum, 12);
      // Assuming response contains videos directly or in response.data.videos
      if (pageNum === 1) {
        setVideos(response.videos || []); // Adjust if response structure is different (e.g., response.data.videos)
      } else {
        setVideos((prev) => [...prev, ...(response.videos || [])]); // Adjust if response structure is different
      }
      setHasMore((response.videos || []).length === 12); // Adjust based on your API's pagination logic
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load liked videos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setVideos([]);
    setHasMore(true);
    loadLikedVideos(1);
  }, [isAuthenticated]); // Dependency array includes isAuthenticated

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadLikedVideos(nextPage);
  };

  if (!isAuthenticated) {
    return (
      <div>
        {" "}
        {/* No ml-0 md:ml-64 */}
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>
              Please log in to view your liked videos.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading && videos.length === 0) {
    return (
      <div>
        {" "}
        {/* No ml-0 md:ml-64 */}
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div>
        {" "}
        {/* No ml-0 md:ml-64 */}
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <p className="text-center text-muted-foreground mt-4">
            Could not load liked videos. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {" "}
      {/* No ml-0 md:ml-64 */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <ThumbsUp className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Liked Videos</h1>
        </div>

        {videos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ThumbsUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No liked videos yet
              </h3>
              <p className="text-muted-foreground text-center">
                Like videos to see them appear here!
              </p>
              <Link href="/" className="mt-4">
                <Button>Discover Videos</Button>
              </Link>
            </CardContent>
          </Card>
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
