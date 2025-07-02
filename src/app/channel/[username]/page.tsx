// src/app/channel/[username]/page.tsx
"use client";
import { use, useEffect, useState } from "react";
import { apiClient, type User, type Video } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VideoCard from "@/components/VideoCard";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChannelPageProps {
  params: Promise<{ username: string }>;
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const { username } = use(params);
  const [channel, setChannel] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscribeLoading, setSubscribeLoading] = useState(false); // NEW: State for subscribe button loading
  const [successMessage, setSuccessMessage] = useState(""); // NEW: State for success messages

  const { isAuthenticated, user: loggedInUser } = useAuth();
  const isMyChannel = loggedInUser?.username === username;
  const isSubscribed: boolean = channel?.isSubscribed || false;

  // Modified fetchChannelData to also clear messages
  const fetchChannelData = async () => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors
      setSuccessMessage(""); // Clear previous success messages
      const channelResponse = await apiClient.getChannelProfile(username);
      setChannel(channelResponse.data);

      const videosResponse = await apiClient.getVideoByownerId(
        channelResponse.data.username,
        1,
        10
      );
      setVideos(videosResponse.videos || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load channel";
      setError(errorMessage);
      setChannel(null); // Ensure channel is null on load error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchChannelData();
    }
  }, [username, isAuthenticated, loggedInUser?._id]); // Add loggedInUser?._id to dependencies

  // Modified handleSubscribe to re-fetch channel data and use loading/messages
  const handleSubscribe = async () => {
    if (!channel || !isAuthenticated) {
      setError("Please log in to subscribe or unsubscribe.");
      setSuccessMessage("");
      return;
    }
    setSubscribeLoading(true); // Start loading animation
    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages

    try {
      if (isSubscribed) {
        console.log(isSubscribed);
        await apiClient.unsubscribeFromChannel(channel._id);
        setSuccessMessage("Unsubscribed successfully!");
      } else {
        await apiClient.subscribeToChannel(channel._id);
        setSuccessMessage("Subscribed successfully!");
      }
      // CRUCIAL CHANGE: Re-fetch channel data to get the latest `isSubscribed` status and `subscribersCount`
      await fetchChannelData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update subscription";
      setError(errorMessage);
    } finally {
      setSubscribeLoading(false); // End loading animation
    }
  };

  if (loading) {
    return (
      <div className="ml-0 md:ml-64 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Display error message at the top if loading failed completely
  if (error && !channel) {
    // Only show full page error if channel data didn't load
    return (
      <div className="ml-0 md:ml-64 container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="text-center text-muted-foreground mt-4">
          Could not load channel. Please try again.
        </p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="ml-0 md:ml-64 container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Channel not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8">
        {channel.coverImage && (
          <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden mb-8">
            <img
              src={channel.coverImage}
              alt="Cover Image"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* NEW: Display general error/success messages for actions */}
        {successMessage && (
          <Alert className="mb-4">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        {error && ( // Display error message here if it's from an action, not initial load
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-4 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={channel.avatar || "/placeholder.svg"}
              alt={channel.fullname}
            />
            <AvatarFallback className="text-4xl">
              {channel.fullname?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{channel.fullname}</h1>
            <p className="text-muted-foreground text-lg">@{channel.username}</p>
            <p className="text-muted-foreground">
              {channel.subscribersCount?.toLocaleString() || 0} subscribers
            </p>
            {!isMyChannel && isAuthenticated && (
              // MODIFIED: Button to show loading state and correct text
              <Button
                onClick={handleSubscribe}
                className="mt-4"
                disabled={subscribeLoading} // Disable button while loading
              >
                {subscribeLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : isSubscribed ? ( // Use the derived `isSubscribed` state
                  "Unsubscribe"
                ) : (
                  "Subscribe"
                )}
              </Button>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">
          Videos from {channel.fullname}
        </h2>
        {videos.length === 0 ? (
          <p className="text-muted-foreground">
            No videos from this channel yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos?.length > 0 ? (
              videos.map((video) => <VideoCard key={video._id} video={video} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                No videos available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
