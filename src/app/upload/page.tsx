// src/app/upload/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Loader2, Video as VideoIcon } from "lucide-react"

export default function UploadPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "video" | "thumbnail"
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === "video") {
        setVideoFile(file)
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.onloadedmetadata = () => {
          URL.revokeObjectURL(videoElement.src);
          setDuration(videoElement.duration);
        };
        videoElement.src = URL.createObjectURL(file);
      } else {
        setThumbnailFile(file)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!isAuthenticated) {
      setError("You must be logged in to upload videos.")
      return
    }

    if (!title.trim() || !description.trim() || !videoFile || !thumbnailFile || duration === 0) {
      setError("Please fill in all required fields and select both video and thumbnail files. Ensure video duration is loaded.")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("videoFile", videoFile)
      formData.append("thumbnail", thumbnailFile)
      formData.append("duration", duration.toString())

      await apiClient.uploadVideo(formData)
      alert("Video uploaded successfully!")
      router.push("/")
    } catch (err: unknown) {
      let errorMessage = "Failed to upload video."
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === "string") {
        errorMessage = err
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoFileClick = () => {
    const videoInput = document.getElementById("videoFile") as HTMLInputElement
    videoInput?.click()
  }

  const handleThumbnailFileClick = () => {
    const thumbnailInput = document.getElementById("thumbnailFile") as HTMLInputElement
    thumbnailInput?.click()
  }

  if (!isAuthenticated) {
    return (
      <div className="ml-0 md:ml-64"> {/* This block will also need the classes removed from its outer div */}
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Please log in to upload videos.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Upload New Video
          </CardTitle>
          <CardDescription className="text-center">
            Fill in the details to upload your video to VideoTube
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter video description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoFile">Video File *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="videoFile"
                  name="videoFile"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, "video")}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVideoFileClick}
                  className="w-full"
                >
                  <VideoIcon className="h-4 w-4 mr-2" />
                  {videoFile ? videoFile.name : "Choose Video File"}
                </Button>
              </div>
              {videoFile && duration > 0 && (
                <p className="text-sm text-muted-foreground mt-1">Duration: {Math.round(duration)} seconds</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailFile">Thumbnail Image *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="thumbnailFile"
                  name="thumbnailFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "thumbnail")}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleThumbnailFileClick}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {thumbnailFile ? thumbnailFile.name : "Choose Thumbnail Image"}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                "Upload Video"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}