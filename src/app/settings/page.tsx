// src/app/settings/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api"; // Import apiClient
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
import { Loader2 } from "lucide-react"; // User, Mail, Lock

export default function SettingsPage() {
  const { user, loading: authLoading, isAuthenticated, } = useAuth(); // Added logout from useAuth
  const [fullname, setFullname] = useState(user?.fullname || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Only update state if user object changes (e.g., after initial load or a user data refresh)
    if (user) {
      setFullname(user.fullname);
      setEmail(user.email);
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setProfileLoading(true);

    try {
      // Use apiClient to update user profile
      // Assuming you only want to update fullname and email here.
      // If you add avatar/coverImage inputs, you'll need to handle file selection and pass them here.
      const response = await apiClient.updateUserProfile(fullname, email); // Integrate API call
      setSuccessMessage(response.message || "Profile updated successfully!");
      // Optionally, update user in AuthContext if the response contains updated user data
      // useAuth().setUser(response.data.user); // if your backend returns updated user
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile.";
      setError(errorMessage);
    } finally {
      setProfileLoading(false);
    }
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
      // Use apiClient to change password
      const response = await apiClient.changePassword(oldPassword, newPassword); // Integrate API call
      setSuccessMessage(response.message || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change password.";
      setError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading) {
    return (
      // REMOVED 'ml-0 md:ml-64'
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      // REMOVED 'ml-0 md:ml-64'
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
    // REMOVED redundant outer container and 'ml-0 md:ml-64'
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
              {/* Add avatar and cover image update fields here if desired,
                  remembering to handle file states and pass them to apiClient.updateUserProfile */}
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
                <Label htmlFor="confirmNewPassword">
                  Confirm New Password
                </Label>
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