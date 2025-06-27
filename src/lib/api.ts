// src/lib/api.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface User {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  avatar: string;
  coverImage?: string;
  subscribersCount?: number;
  channelsSubscribedToCount?: number;
  isSubscribed?: boolean;
}

export interface SubscribedChannel extends User {
  subscribedAt: string; // Ensure this is not optional if your backend always returns it
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  videofile: string; // Changed from videofile to videoFile for consistency with upload frontend
  thumbnail: string;
  duration: number;
  views: number;
  isPublished: boolean;
  owner: User;
  createdAt: string;
  likes: number;
  dislikes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
}

export interface Comment {
  _id: string;
  content: string;
  video: string;
  owner: User;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

// NOTE: ChannelProfileData might be redundant if User interface already covers it.
// Consider merging or using User directly if it fits.
export interface ChannelProfileData {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  coverImage: string;
  subscribersCount: number;
  channelsSubscribedToCount: number;
}

export interface WatchHistoryItem {
  _id: string;
  video: Video;
  watchedAt: string;
  watchTime: number;
  completed: boolean;
}

class ApiClient {
  private getAuthHeaders(contentType = "application/json") {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": contentType,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedBody: any;

    try {
      parsedBody = await response.json();
      // console.log("Response body:", parsedBody); // Keep this commented or remove as needed
    } catch {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
      const message =
        parsedBody.message || parsedBody.error || "Something went wrong";
      throw new Error(message);
    }

    return parsedBody;
  }

  // Auth endpoints
  async register(formData: FormData) {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      body: formData,
    });
    return this.handleResponse(response);
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/users/logout`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async forgotPassword(email: string) {
    const response = await fetch(`${API_BASE_URL}/users/forget-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await fetch(
      `${API_BASE_URL}/users/reset-password/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      }
    );
    return this.handleResponse(response);
  }

  async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    return this.handleResponse(response);
  }

  async getChannelProfile(username: string) {
    const response = await fetch(
      `${API_BASE_URL}/users/getChannelInfo/${username}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  // NEW METHOD: Update User Profile
  async updateUserProfile(
    fullname: string,
    email: string,
    avatar?: File,
    coverImage?: File
  ) {
    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("email", email);
    if (avatar) {
      formData.append("avatar", avatar);
    }
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    const response = await fetch(`${API_BASE_URL}/users/update-profile`, {
      method: "PATCH", // PATCH is commonly used for partial updates
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // FormData requires explicit auth header
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  // NEW METHOD: Change Password
  async changePassword(oldPassword: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    return this.handleResponse(response);
  }

  // Video endpoints
  // MODIFIED: Added sortBy and sortOrder parameters for more flexible video fetching
  async getVideos(
    page = 1,
    limit = 10,
    searchQuery?: string,
    sortBy?: string, // e.g., 'views', 'createdAt', 'duration'
    sortOrder?: 'asc' | 'desc' // 'asc' or 'desc'
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(searchQuery && { search: searchQuery }),
      ...(sortBy && { sortBy: sortBy }),
      ...(sortOrder && { sortOrder: sortOrder }),
    });
    const response = await fetch(`${API_BASE_URL}/videos?${params}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getVideoById(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getVideoByownerId(ownerId: string, page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/videos/owner/${ownerId}?${params}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    const json = await this.handleResponse(response);

    return json;
  }

  async uploadVideo(formData: FormData) {
    const response = await fetch(`${API_BASE_URL}/videos/uploadVideo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async likeVideo(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/like`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async dislikeVideo(videoId: string) {
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/dislike`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Comment endpoints
  async getComments(videoId: string, page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE_URL}/videos/${videoId}/comments?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async addComment(videoId: string, content: string) {
    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/comments`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return this.handleResponse(response);
  }

  async likeComment(commentId: string) {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Subscription endpoints
  async subscribeToChannel(channelId: string) {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${channelId}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async unsubscribeFromChannel(channelId: string) {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${channelId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getYourVideos(page = 1, limit = 12) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await fetch(`${API_BASE_URL}/videos/my-videos?${params}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getSubscribedChannels() {
    const response = await fetch(`${API_BASE_URL}/users/subscriptions`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Watch History endpoints
  async getWatchHistory(page = 1, limit = 20) {
    const response = await fetch(
      `${API_BASE_URL}/users/watch-history?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async addToWatchHistory(videoId: string, watchTime: number) {
    const response = await fetch(`${API_BASE_URL}/users/watch-history`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ videoId, watchTime }),
    });
    return this.handleResponse(response);
  }

  async clearWatchHistory() {
    const response = await fetch(`${API_BASE_URL}/users/watch-history`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();