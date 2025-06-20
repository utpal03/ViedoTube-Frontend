"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { apiClient, type Comment } from "../lib/api"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ThumbsUp, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface CommentSectionProps {
  videoId: string
}

export default function CommentSection({ videoId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    loadComments()
  }, [videoId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getComments(videoId)
      setComments(response.data.comments || [])
    } catch (error) {
      console.error("Failed to load comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !isAuthenticated) return

    try {
      setSubmitting(true)
      const response = await apiClient.addComment(videoId, newComment.trim())
      setComments([response.data.comment, ...comments])
      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) return

    try {
      await apiClient.likeComment(commentId)
      setComments(
        comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1, isLiked: !comment.isLiked }
            : comment,
        ),
      )
    } catch (error) {
      console.error("Failed to like comment:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5" />
        <span className="font-semibold">{comments.length} Comments</span>
      </div>

      {isAuthenticated && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.fullname} />
              <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewComment("")}
                  disabled={!newComment.trim()}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={!newComment.trim() || submitting}>
                  {submitting ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.owner.avatar || "/placeholder.svg"} alt={comment.owner.fullname} />
                <AvatarFallback>{comment.owner.fullname.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{comment.owner.fullname}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm mb-2">{comment.content}</p>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeComment(comment._id)}
                    className={`h-8 px-2 ${comment.isLiked ? "text-primary" : ""}`}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {comment.likes > 0 && comment.likes}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
