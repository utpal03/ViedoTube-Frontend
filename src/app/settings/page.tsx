// src/app/settings/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload } from "lucide-react"; // Import Upload icon
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components

export default function SettingsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth(); // Added login from useAuth for user state update
  const [fullname, setFullname] = useState(user?.fullname || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // New state for avatar file
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null); // New state for cover image file
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize state only when user data is available
  useEffect(() => {
    if (user) {
      setFullname(user.fullname);
      setEmail(user.email);
      // No need to set initial file states, as they are for new uploads
    }
  }, [user]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "coverImage"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "avatar") {
        setAvatarFile(file);
      } else {
        setCoverImageFile(file);
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setProfileLoading(true);

    try {
      // Pass avatarFile and coverImageFile to apiClient.updateUserProfile
      const response = await apiClient.updateUserProfile(
        fullname,
        email,
        avatarFile || undefined, // Pass undefined if no new file is selected
        coverImageFile || undefined
      );
      setSuccessMessage(response.message || "Profile updated successfully!");

      // Refresh user data from backend to update AuthContext and UI globally
      // This is crucial as apiClient doesn't manage AuthContext state directly
      const currentUserResponse = await apiClient.getCurrentUser();
      // Use the login function from AuthContext to set the user (it handles localStorage too)
      // This is a simplified way to "refresh" the user in AuthContext if your login
      // function updates the user state based on a user object.
      // A more direct way would be useAuth().setUser(currentUserResponse.data.user);
      // For now, assuming login also updates the user state in context correctly if passed the user object.
      // If `useAuth()` doesn't expose a `setUser` directly, you might need to refactor `AuthContext`
      // For this example, let's directly update localStorage and the user state if possible.
      localStorage.setItem(
        "user",
        JSON.stringify(currentUserResponse.data.user)
      );
      // You would need to expose `setUser` from `useAuth` or rely on the `useEffect` in AuthProvider
      // to pick up the localStorage change on the next component render cycle/refresh.
      // For immediate update within AuthContext itself, useAuth needs a setUser function.
      // Since setUser is not exposed by useAuth, rely on next refresh or direct localStorage read by AuthContext.
      // For immediate component update, we can update local state, but AuthContext won't see it until refresh.

      // A simple solution if AuthContext doesn't expose setUser:
      // Trigger a soft re-fetch of current user for AuthContext to update itself,
      // or simply rely on the next page refresh to update AuthContext.
      // For now, the user data will be refreshed on the next page reload or any component
      // that directly calls getCurrentUser again.
      // If you need it immediately reflected in Header etc., `AuthContext` would need a `refreshUser` method.
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile.";
      setError(errorMessage);
      setSuccessMessage("");
    } finally {
      setProfileLoading(false);
      setAvatarFile(null); // Clear file inputs after submission
      setCoverImageFile(null);
    }
  };

  const handleAvatarClick = () => {
    const avatarInput = document.getElementById(
      "avatar-upload"
    ) as HTMLInputElement;
    avatarInput?.click();
  };

  const handleCoverImageClick = () => {
    const coverImageInput = document.getElementById(
      "cover-image-upload"
    ) as HTMLInputElement;
    coverImageInput?.click();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setPasswordLoading(true);

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm password do not match.");
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await apiClient.changePassword(oldPassword, newPassword);
      setSuccessMessage(response.message || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change password.";
      setError(errorMessage);
      setSuccessMessage("");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Please log in to view your settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert className="mb-4">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your account&#39;s profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Avatar Update Section */}
              <div className="space-y-2">
                <Label htmlFor="avatar-upload">Avatar Image</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20 flex-shrink-0">
                    <AvatarImage
                      src={
                        avatarFile
                          ? URL.createObjectURL(avatarFile)
                          : user?.avatar || "/placeholder.svg"
                      }
                      alt="User Avatar"
                    />
                    <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "avatar")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAvatarClick}
                    className="flex-grow"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {avatarFile ? avatarFile.name : "Choose New Avatar"}
                  </Button>
                </div>
              </div>

              {/* Cover Image Update Section */}
              <div className="space-y-2">
                <Label htmlFor="cover-image-upload">
                  Cover Image (Optional)
                </Label>
                <div className="flex items-center space-x-4">
                  {user?.coverImage && !coverImageFile && (
                    <img
                      src={user.coverImage}
                      alt="Current Cover"
                      className="h-20 w-32 object-cover rounded-md flex-shrink-0"
                    />
                  )}
                  {coverImageFile && (
                    <img
                      src={URL.createObjectURL(coverImageFile)}
                      alt="Selected Cover"
                      className="h-20 w-32 object-cover rounded-md flex-shrink-0"
                    />
                  )}
                  <Input
                    id="cover-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "coverImage")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCoverImageClick}
                    className="flex-grow"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {coverImageFile
                      ? coverImageFile.name
                      : "Choose New Cover Image"}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account&#39;s password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* You can add other settings sections like notifications, privacy etc. */}
      </div>
    </div>
  );
}
