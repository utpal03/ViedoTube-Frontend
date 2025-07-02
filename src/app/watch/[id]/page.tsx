// src/app/watch/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient, type Video } from "@/lib/api";
import VideoPlayer from "@/components/VideoPlayer";
import CommentSection from "@/components/CommentSection";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface WatchPageProps {
  params: {
    id: string;
  };
}

export default function WatchPage({ params }: WatchPageProps) {
  const { id: videoId } = params;

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // New state for success messages
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const { isAuthenticated, user: loggedInUser } = useAuth();

  // Determine if the current video is owned by the logged-in user
  const isMyVideo = isAuthenticated && loggedInUser?._id === video?.owner._id;

  useEffect(() => {
    const fetchVideoAndChannelInfo = async () => {
      try {
        setLoading(true);
        const videoResponse = await apiClient.getVideoById(videoId);
        const fetchedVideo = videoResponse.video;

        if (fetchedVideo && fetchedVideo.owner && fetchedVideo.owner.username) {
          // Call getChannelProfile with the viewer's ID (loggedInUser?._id)
          // This endpoint now returns the channel user object WITH isSubscribed flag
          const channelInfoResponse = await apiClient.getChannelProfile(
            fetchedVideo.owner.username
          );
          // Assuming getChannelProfile returns { data: { user: channelUserObjectWithIsSubscribed } }
          fetchedVideo.owner = channelInfoResponse.data; // Assign the comprehensive channel object back
        }

        setVideo(fetchedVideo);
        setError(""); // Clear previous errors on successful fetch
        setSuccessMessage(""); // Clear success messages
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load video or channel info.";
        setError(errorMessage);
        setSuccessMessage(""); // Clear success message on error
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoAndChannelInfo();
    }
  }, [videoId, isAuthenticated, loggedInUser?._id]); // Added loggedInUser._id to dependencies

  // Consolidated like/dislike handlers for better error reporting
  const handleInteraction = async (action: "like" | "dislike") => {
    if (!video || !isAuthenticated) {
      setError("Please log in to interact with this video.");
      setSuccessMessage("");
      return;
    }
    // Implement specific loading states for like/dislike buttons if desired

    try {
      if (action === "like") {
        await apiClient.likeVideo(video._id);
      } else {
        // action is 'dislike'
        await apiClient.dislikeVideo(video._id);
      }
      setVideo((prev) => {
        if (!prev) return null;
        let newLikes = prev.likes;
        let newDislikes = prev.dislikes;
        let isLiked = prev.isLiked;
        let isDisliked = prev.isDisliked;

        if (action === "like") {
          if (isLiked) {
            newLikes -= 1;
            isLiked = false;
          } else {
            newLikes += 1;
            isLiked = true;
            if (isDisliked) {
              newDislikes -= 1;
              isDisliked = false;
            }
          }
        } else {
          // action is 'dislike'
          if (isDisliked) {
            newDislikes -= 1;
            isDisliked = false;
          } else {
            newDislikes += 1;
            isDisliked = true;
            if (isLiked) {
              newLikes -= 1;
              isLiked = false;
            }
          }
        }
        return {
          ...prev,
          likes: newLikes,
          dislikes: newDislikes,
          isLiked,
          isDisliked,
        };
      });
      setError(""); // Clear previous errors on success
      setSuccessMessage(
        `Successfully ${action === "like" ? "liked" : "disliked"} video.`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : `Failed to ${action} video.`;
      setError(errorMessage);
      setSuccessMessage(""); // Clear success message on error
    }
  };

  const handleSubscribeToggle = async () => {
    if (!video?.owner || !isAuthenticated) {
      setError("Please log in to subscribe.");
      setSuccessMessage("");
      return;
    }
    setSubscribeLoading(true);

    try {
      // Use apiClient.subscribeToChannel (which is now a toggle in your service)
      const result = await apiClient.subscribeToChannel(video.owner._id); // Pass channel ID
      // Assuming result is { subscribed: boolean, message: string } from backend service
      setVideo((prev) =>
        prev
          ? {
              ...prev,
              owner: {
                ...prev.owner,
                isSubscribed: result.data.subscribed, // Update isSubscribed flag from backend response
                subscribersCount: result.data.subscribed // Update count based on backend's response status
                  ? (prev.owner.subscribersCount || 0) + 1
                  : (prev.owner.subscribersCount || 0) - 1,
              },
            }
          : null
      );
      setSuccessMessage(result.message); // Show backend message (e.g., "Subscribed successfully.")
      setError(""); // Clear previous errors on success
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update subscription.";
      setError(errorMessage); // Display error message from backend
      setSuccessMessage(""); // Clear success message on error
    } finally {
      setSubscribeLoading(false);
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !successMessage) {
    // Show error if it exists and no success message overrides it
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="text-center text-muted-foreground mt-4">
          Could not load video. Please try again.
        </p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Video not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <VideoPlayer videoId={video._id} videoUrl={video.videofile} />
            <h1 className="text-xl font-bold mt-4">{video.title}</h1>
            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{formatViews(video.views)} views</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(video.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleInteraction("like")}
                  disabled={!isAuthenticated}
                  className={video.isLiked ? "text-primary" : ""}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {video.likes > 0 && video.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleInteraction("dislike")}
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
                  <AvatarImage
                    src={video.owner.avatar || "/placeholder.svg"}
                    alt={video.owner.fullname}
                  />
                  <AvatarFallback>
                    {video.owner.fullname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <Link href={`/channel/${video.owner.username}`}>
                  <h2 className="font-semibold">{video.owner.fullname}</h2>
                </Link>
                <p className="text-sm text-muted-foreground">
                  {video.owner.subscribersCount?.toLocaleString() || 0}{" "}
                  subscribers
                </p>
              </div>
              {!isMyVideo && isAuthenticated && (
                <Button
                  onClick={handleSubscribeToggle}
                  disabled={subscribeLoading}
                  className={
                    video.owner.isSubscribed
                      ? "bg-muted text-muted-foreground hover:bg-muted/80"
                      : ""
                  }
                >
                  {subscribeLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : video.owner.isSubscribed ? (
                    "Unsubscribe" // <--- Changed from "Subscribed"
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              )}
            </div>

            {/* Display success/error messages for subscription/like/dislike */}
            {successMessage && (
              <Alert className="mt-4">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
              <p className="whitespace-pre-line">{video.description}</p>
            </div>

            <div className="mt-8">
              <CommentSection videoId={video._id} />
            </div>
          </div>
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Related Videos</h3>
            <div className="space-y-4">
              <p className="text-muted-foreground">No related videos found.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
