"use client";
import { use, useEffect, useState } from "react";
import { apiClient, type User, type Video } from "@/lib/api"; //
import { useAuth } from "@/contexts/AuthContext"; //
import { Button } from "@/components/ui/button"; //
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; //
import VideoCard from "@/components/VideoCard"; //
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert"; //

interface ChannelPageProps {
  params: Promise<{ username: string }>;
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const { username } = use(params);
  const [channel, setChannel] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, user: loggedInUser } = useAuth();
  const isMyChannel = loggedInUser?.username === username;

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        const channelResponse = await apiClient.getChannelProfile(username);
        setChannel(channelResponse.data);
        // console.log(channelResponse.data);
        const videosResponse = await apiClient.getVideoByownerId(
          channelResponse.data.username,
          1,
          10
        );
        console.log(videosResponse.videos);
        setVideos(videosResponse.videos || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load channel";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchChannelData();
    }
  }, [username, isAuthenticated]); // Re-fetch if auth status changes to update isSubscribed state

  const handleSubscribe = async () => {
    if (!channel || !isAuthenticated) return;
    try {
      if (channel.isSubscribed) {
        await apiClient.unsubscribeFromChannel(channel._id); //
        setChannel((prev) =>
          prev
            ? {
                ...prev,
                isSubscribed: false,
                subscribersCount: (prev.subscribersCount || 0) - 1,
              }
            : null
        );
      } else {
        await apiClient.subscribeToChannel(channel._id); //
        setChannel((prev) =>
          prev
            ? {
                ...prev,
                isSubscribed: true,
                subscribersCount: (prev.subscribersCount || 0) + 1,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Subscription failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update subscription"
      );
    }
  };

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

        <div className="flex items-center space-x-4 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={channel.avatar || "/placeholder.svg"}
              alt={channel.fullname}
            />{" "}
            {/* */}
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
              <Button onClick={handleSubscribe} className="mt-4">
                {channel.isSubscribed ? "Subscribed" : "Subscribe"}
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
