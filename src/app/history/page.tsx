"use client";

import { useEffect, useState } from "react";
import { apiClient, type WatchHistoryItem } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import VideoCard from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function WatchHistoryPage() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadWatchHistory();
    }
  }, [isAuthenticated]);

  const loadWatchHistory = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getWatchHistory();
      setHistory(response.data.history || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load watch history";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      setClearing(true);
      await apiClient.clearWatchHistory();
      setHistory([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to clear watch history";
      setError(errorMessage);
    } finally {
      setClearing(false);
    }
  };

  const formatWatchTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>
              Please log in to view your watch history.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ml-0 md:ml-64">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Watch History</h1>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              onClick={clearHistory}
              disabled={clearing}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {clearing ? "Clearing..." : "Clear All"}
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {history.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No watch history</h3>
              <p className="text-muted-foreground text-center">
                Videos you watch will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {history.map((item) => (
              <div
                key={item._id}
                className="flex space-x-4 p-4 border rounded-lg"
              >
                <div className="w-48 flex-shrink-0">
                  <VideoCard video={item.video} showChannel={false} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {item.video.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.video.owner.fullname}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.video.views.toLocaleString()} views
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>
                      Watched{" "}
                      {formatDistanceToNow(new Date(item.watchedAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {item.watchTime > 0 && (
                      <span>Progress: {formatWatchTime(item.watchTime)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
