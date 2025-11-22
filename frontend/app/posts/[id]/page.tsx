"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/components/providers/language-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { MessageSquare, ArrowLeft, ChevronDown } from "lucide-react"
import Image from "next/image"
import { apiFetch } from "@/lib/api"
import type { Comment, Post } from "@/lib/types"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t, language } = useLanguage()
  const { token } = useAuth()
  const postId = useMemo(() => {
    const value = (params?.id ?? "") as string | string[]
    return Array.isArray(value) ? value[0] : value
  }, [params])

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [commentsToShow, setCommentsToShow] = useState(5)
  const [loadingPost, setLoadingPost] = useState(true)
  const [loadingComments, setLoadingComments] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPost = useCallback(async () => {
    if (!postId) return
    setLoadingPost(true)
    setError(null)
    try {
      const data = await apiFetch<Post>(`/posts/${postId}`)
      setPost(data)
    } catch (err: any) {
      setError(err?.message || "无法加载帖子")
    } finally {
      setLoadingPost(false)
    }
  }, [postId])

  const fetchComments = useCallback(async () => {
    if (!postId) return
    setLoadingComments(true)
    try {
      const data = await apiFetch<Comment[]>(`/posts/${postId}/comments`)
      setComments(data)
    } catch (err: any) {
      setError((prev) => prev || err?.message || "无法加载评论")
    } finally {
      setLoadingComments(false)
    }
  }, [postId])

  useEffect(() => {
    fetchPost()
    fetchComments()
    setCommentsToShow(5)
  }, [fetchPost, fetchComments])

  const loadMoreComments = () => {
    setCommentsToShow((prev) => prev + 5)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)

    if (hours < 1) return language === "zh" ? "刚刚" : "Just now"
    if (hours < 24) return language === "zh" ? `${hours}小时前` : `${hours}h ago`
    if (hours < 48) return language === "zh" ? "1天前" : "1 day ago"
    return date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !postId) return
    if (!token) {
      alert(t("loginRequired"))
      return
    }
    try {
      await apiFetch<Comment>(`/posts/${postId}/comments`, {
        method: "POST",
        token,
        body: JSON.stringify({ content: commentText.trim() }),
      })
      setCommentText("")
      await fetchComments()
    } catch (err: any) {
      alert(err?.message || "评论失败，请稍后再试")
    }
  }

  const displayedComments = comments.slice(0, commentsToShow)

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {language === "zh" ? "返回" : "Back"}
        </Button>

        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        {loadingPost ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {language === "zh" ? "加载中..." : "Loading..."}
            </CardContent>
          </Card>
        ) : post ? (
          <Card className="overflow-hidden">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {(post.title?.[0] || "兔").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{post.title}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base leading-relaxed whitespace-pre-line">{post.content}</p>
              {post.image_url && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image src={post.image_url || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 gap-4">
              <Button variant="ghost" size="sm" className="gap-2" disabled>
                <MessageSquare className="h-4 w-4" />
                <span>
                  {comments.length} {t("comments")}
                </span>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {language === "zh" ? "未找到帖子" : "Post not found"}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              {t("comments")} ({comments.length})
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("comment")}
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button onClick={handleSubmitComment} size="sm" disabled={loadingComments}>
                  {t("submit")}
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              {loadingComments && (
                <p className="text-sm text-muted-foreground">
                  {language === "zh" ? "加载评论中..." : "Loading comments..."}
                </p>
              )}
              {displayedComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {(comment.author_id?.[0] || "兔").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {comment.author_id ? comment.author_id.slice(0, 8) : "ituhouse"}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}

              {displayedComments.length < comments.length && (
                <div className="flex justify-center pt-4">
                  <Button onClick={loadMoreComments} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <ChevronDown className="h-4 w-4" />
                    {language === "zh" ? "展开更多评论" : "Load more"}
                  </Button>
                </div>
              )}

              {!comments.length && !loadingComments && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  {language === "zh" ? "暂无评论" : "No comments yet"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
