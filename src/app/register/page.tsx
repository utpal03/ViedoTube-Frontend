"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
import { Eye, EyeOff, Upload } from "lucide-react";

interface FormData {
  fullname: string;
  username: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "coverImage"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "avatar") {
        setAvatar(file);
      } else {
        setCoverImage(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!avatar) {
      setError("Avatar is required");
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      submitData.append("avatar", avatar);
      if (coverImage) {
        submitData.append("coverImage", coverImage);
      }
      await register(submitData);
      router.push("/login?message=Registration successful! Please login.");
    } catch (err: unknown) {
      let errorMessage = "Something went wrong";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      setError(errorMessage);
      if (errorMessage.toLowerCase().includes("email already exists")) {
        setTimeout(() => {
          router.push("/login?alreadyRegistered=true");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    const avatarInput = document.getElementById("avatar") as HTMLInputElement;
    avatarInput?.click();
  };

  const handleCoverImageClick = () => {
    const coverImageInput = document.getElementById(
      "coverImage"
    ) as HTMLInputElement;
    coverImageInput?.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Join VideoTube and start sharing your videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                name="fullname"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullname}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "avatar")}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAvatarClick}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {avatar ? avatar.name : "Choose Avatar"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="coverImage"
                  name="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "coverImage")}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCoverImageClick}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {coverImage ? coverImage.name : "Choose Cover Image"}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
