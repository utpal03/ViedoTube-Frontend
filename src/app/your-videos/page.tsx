// src/app/your-videos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient, type Video } from "@/lib/api"; //
import { useAuth } from "@/contexts/AuthContext"; //
import VideoCard from "@/components/VideoCard"; //
import { Button } from "@/components/ui/button"; //
import { Card, CardContent } from "@/components/ui/card"; //
import { Alert, AlertDescription } from "@/components/ui/alert"; //
import { PlaySquare, Loader2 } from "lucide-react";
import Link from "next/link";

export default function YourVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const loadYourVideos = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // You'll need a new API method in apiClient and a backend endpoint for this
        // For demonstration, let's assume apiClient.getYourVideos() exists
        // Or you can modify getVideos to accept an ownerId parameter.
        // For now, I'll use a placeholder that would ideally fetch videos by the logged-in user.
        const response = await apiClient.getVideos(
          1,
          12,
          `ownerId:${user._id}`
        ); // Placeholder: Modify your backend getVideos to filter by ownerId if desired.
        setVideos(response.videos || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load your videos";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadYourVideos();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>
              Please log in to view your videos.
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

  if (loading) {
    return (
      <div className="ml-0 md:ml-64 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-0 md:ml-64 container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="text-center text-muted-foreground mt-4">
          Could not load your videos. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="ml-0 md:ml-64">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <PlaySquare className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Your Videos</h1>
        </div>

        {videos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <PlaySquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No videos uploaded yet
              </h3>
              <p className="text-muted-foreground text-center">
                Upload your first video to see it here!
              </p>
              {/* Assuming you have an upload page */}
              <Link href="/upload" className="mt-4">
                <Button>Upload Video</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.length > 0 ? (
              videos.map((video) => <VideoCard key={video._id} video={video} />)
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No videos found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
