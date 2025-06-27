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
  subscribedAt: string;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  videofile: string;
  thumbnail: string;
  duration?: number;
  views: number;
  ispublished: boolean;
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
  private isRefreshing = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void; }[] = [];

  // getAuthHeaders will ONLY set Content-Type if specified.
  // It will NOT set Authorization header as tokens are now assumed to be in cookies.
  private getAuthHeaders(contentType?: string) {
    const headers: Record<string, string> = {};
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  }

  // handleResponse now just parses and throws on !response.ok
  private async handleResponse(response: Response) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedBody: any;

    try {
      parsedBody = await response.json();
    } catch {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
      const message =
        parsedBody.message || parsedBody.error || "Something went wrong";
      // Throw an error that includes the HTTP status for easier handling
      throw new Error(`HTTP ${response.status}: ${message}`);
    }

    return parsedBody;
  }

  // NEW METHOD: fetchWithAuth - wraps all authenticated API calls for token refresh logic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async fetchWithAuth(url: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, options);
      return await this.handleResponse(response); // This will throw for 401, 404, etc.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const isUnauthorized = error.message && error.message.includes("HTTP 401");
      const isRefreshEndpoint = url.includes(`${API_BASE_URL}/users/refresh-token`);

      if (isUnauthorized && !isRefreshEndpoint) {
        // This is a 401 from an endpoint other than refresh-token
        if (this.isRefreshing) {
          // If a refresh is already in progress, queue the original request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
            // After refresh, retry the original request
            return this.fetchWithAuth(url, options);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        // No refresh in progress, so start one
        this.isRefreshing = true;

        return new Promise(async (resolve, reject) => {
          try {
            await this.refreshToken(); // Attempt to refresh token (gets new cookie)
            this.isRefreshing = false;
            this.processQueue(null); // Process all queued requests (signal success)

            // Retry the original failed request immediately
            resolve(await this.fetchWithAuth(url, options));

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (refreshError: any) {
            this.isRefreshing = false;
            this.processQueue(refreshError); // Process all queued requests with the refresh error

            // Trigger global logout (e.g., redirect to login page)
            console.error("Session expired, please log in again.");
            // This redirect should ideally be handled by AuthContext via router.push
            // For now, we'll re-throw the error, and AuthContext can catch it.
            reject(refreshError);
          }
        });
      }
      return Promise.reject(error); // Re-throw other errors or non-401s
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private processQueue(error: any | null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(true); // Signal success for queued requests to retry
      }
    });
    this.failedQueue = [];
  }

  // Auth endpoints (most will now use fetchWithAuth)
  async register(formData: FormData) {
    return this.fetchWithAuth(`${API_BASE_URL}/users/register`, { method: "POST", body: formData, credentials: "include" });
  }

  // login does NOT use fetchWithAuth to avoid recursion/queuing for initial auth
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    return await this.handleResponse(response);
  }

  async logout() {
    return this.fetchWithAuth(`${API_BASE_URL}/users/logout`, { method: "POST", headers: this.getAuthHeaders(), credentials: "include" });
  }

  async forgotPassword(email: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/users/forget-password`, { method: "POST", headers: this.getAuthHeaders(), body: JSON.stringify({ email }), credentials: "include" });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/users/reset-password/${token}`, { method: "POST", headers: this.getAuthHeaders(), body: JSON.stringify({ newPassword }), credentials: "include" });
  }

  // refreshToken does NOT use fetchWithAuth to avoid recursion
  // It's called internally by fetchWithAuth when a refresh is needed
  async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/users/refresh-token`, { method: "POST", credentials: "include" });
    return await this.handleResponse(response); // This can also throw a 401 if refresh token is expired/invalid
  }

  // Current user endpoint
  async getCurrentUser() {
    return this.fetchWithAuth(`${API_BASE_URL}/users/current-user`, { method: "GET", headers: this.getAuthHeaders(), credentials: "include" });
  }

  // Channel profile endpoint
  async getChannelProfile(username: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/users/getChannelInfo/${username}`, { method: "GET", headers: this.getAuthHeaders(), credentials: "include" });
  }

  // User profile update endpoint
  async updateUserProfile(fullname: string, email: string, avatar?: File, coverImage?: File) {
    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("email", email);
    if (avatar) formData.append("avatar", avatar);
    if (coverImage) formData.append("coverImage", coverImage);
    return this.fetchWithAuth(`${API_BASE_URL}/users/update-profile`, { method: "PATCH", headers: this.getAuthHeaders(undefined), body: formData, credentials: "include" });
  }

  // Change password endpoint
  async changePassword(oldPassword: string, newPassword: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/users/change-password`, { method: "POST", headers: this.getAuthHeaders(), body: JSON.stringify({ oldPassword, newPassword }), credentials: "include" });
  }

  // Video endpoints
  async getVideos(page = 1, limit = 10, searchQuery?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), ...(searchQuery && { search: searchQuery }), ...(sortBy && { sortBy: sortBy }), ...(sortOrder && { sortOrder: sortOrder }) });
    return this.fetchWithAuth(`${API_BASE_URL}/videos?${params}`, { method: "GET", headers: this.getAuthHeaders(), credentials: "include" });
  }

  async getVideoById(videoId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/videos/${videoId}`, { method: "GET", headers: this.getAuthHeaders(), credentials: "include" });
  }

  async getVideoByownerId(ownerId: string, page = 1, limit = 10) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return this.fetchWithAuth(`${API_BASE_URL}/videos/owner/${ownerId}?${params}`, { method: "GET", headers: this.getAuthHeaders(), credentials: "include" });
  }

  async uploadVideo(formData: FormData) {
    return this.fetchWithAuth(`${API_BASE_URL}/videos/uploadVideo`, { method: "POST", headers: this.getAuthHeaders(undefined), body: formData, credentials: "include" });
  }

  async likeVideo(videoId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/videos/${videoId}/like`, { method: "POST", headers: this.getAuthHeaders(), credentials: "include" });
  }

  async dislikeVideo(videoId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/videos/${videoId}/dislike`, { method: "POST", headers: this.getAuthHeaders(), credentials: "include" });
  }

  // Comment endpoints
  async getComments(videoId: string, page = 1, limit = 10) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return this.fetchWithAuth(`${API_BASE_URL}/videos/${videoId}/comments?${params}`, { method: "GET", headers: this.getAuthHeaders(), credentials: "include" });
  }

  async addComment(videoId: string, content: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/videos/${videoId}/comments`, { method: "POST", headers: this.getAuthHeaders(), body: JSON.stringify({ content }), credentials: "include" });
  }

  async likeComment(commentId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/comments/${commentId}/like`, { method: "POST", headers: this.getAuthHeaders(), credentials: "include" });
  }

  // Subscription endpoints
  async subscribeToChannel(channelId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/users/subscribe/${channelId}`, { method: "POST", headers: this.getAuthHeaders(), credentials: "include" });
  }

  async unsubscribeFromChannel(channelId: string) {
    return this.fetchWithAuth(`${API_BASE_URL}/unsubscribe/${channelId}`, { method: "DELETE", headers: this.getAuthHeaders(), credentials: "include" });
  }

  async getYourVideos(page = 1, limit = 12) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return this.fetchWithAuth(`${API_BASE_URL}/videos/my-videos?${params}`, { method: "GET", headers: this.getAuthHeaders(), credentials: "include" });
  }

  async getSubscribedChannels() {
    return this.fetchWithAuth(`${API_BASE_URL}/users/subscriptions`, { method: "GET", headers: this.getAuthHeaders(), credentials: "include" });
  }

  async getLikedVideos(page = 1, limit = 12) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    // Assuming your backend has an endpoint like /likes/videos or /users/liked-videos
    // Adjust the endpoint path below to match your actual backend implementation.
    return this.fetchWithAuth(`${API_BASE_URL}/likes/videos?${params}`, { method: "GET", headers: this.getAuthHeaders(), credentials: "include" });
  }

  // Watch History endpoints
  async getWatchHistory(page = 1, limit = 20) {
    // const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return this.fetchWithAuth(`${API_BASE_URL}/users/watch-history?page=${page}&limit=${limit}`, { method: "GET", headers: this.getAuthHeaders(), credentials: "include" });
  }

  async addToWatchHistory(videoId: string, watchTime: number) {
    return this.fetchWithAuth(`${API_BASE_URL}/users/watch-history`, { method: "POST", headers: this.getAuthHeaders(), body: JSON.stringify({ videoId, watchTime }), credentials: "include" });
  }

  async clearWatchHistory() {
    return this.fetchWithAuth(`${API_BASE_URL}/users/watch-history`, { method: "DELETE", headers: this.getAuthHeaders(), credentials: "include" });
  }
}

export const apiClient = new ApiClient();