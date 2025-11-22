"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/components/providers/language-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { MessageSquare, ChevronDown, X, Plus, ArrowUp } from "lucide-react"
import Image from "next/image"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { apiFetch } from "@/lib/api"
import type { Comment, PaginatedPosts, Post } from "@/lib/types"

export default function PostsPage() {
  const { t, language } = useLanguage()
  const { user, token } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [allComments, setAllComments] = useState<Comment[]>([])
  const [displayedComments, setDisplayedComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [commentsToShow, setCommentsToShow] = useState(5)
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const dedupePosts = useCallback((list: Post[]) => {
    const seen = new Set<string>()
    const result: Post[] = []
    for (const item of list) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      result.push(item)
    }
    return result
  }, [])

  const handlePostCreated = useCallback(
    (post: Post) => {
      setPosts((prev) => dedupePosts([post, ...prev]))
      setSelectedPost(post)
      setAllComments([])
      setDisplayedComments([])
    },
    [dedupePosts],
  )

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    setErrorMessage(null)
    try {
      const data = await apiFetch<PaginatedPosts>(`/posts?page=${page}&page_size=20`)
      setPosts((prev) => dedupePosts([...prev, ...data.items]))
      setHasMore(data.has_more)
      setPage((prev) => prev + 1)
    } catch (error: any) {
      setErrorMessage(error?.message || "无法加载帖子，请稍后再试")
    } finally {
      setLoading(false)
    }
  }, [page, hasMore, loading, dedupePosts])

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSelectPost = async (post: Post) => {
    setSelectedPost(post)
    setCommentText("")
    setCommentsToShow(5)
    setAllComments([])
    setDisplayedComments([])
    try {
      const comments = await apiFetch<Comment[]>(`/posts/${post.id}/comments`)
      setAllComments(comments)
      setDisplayedComments(comments.slice(0, 5))
    } catch (error: any) {
      alert(error?.message || "无法加载评论")
    }
  }

  const handleCloseComments = () => {
    setSelectedPost(null)
    setAllComments([])
    setDisplayedComments([])
    setCommentText("")
  }

  const loadMoreComments = () => {
    const nextCount = commentsToShow + 5
    setDisplayedComments(allComments.slice(0, nextCount))
    setCommentsToShow(nextCount)
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedPost) return
    if (!user || !token) {
      alert(t("loginRequired"))
      return
    }
    try {
      await apiFetch<Comment>(`/posts/${selectedPost.id}/comments`, {
        method: "POST",
        token,
        body: JSON.stringify({ content: commentText.trim() }),
      })
      setCommentText("")
      const updatedComments = await apiFetch<Comment[]>(`/posts/${selectedPost.id}/comments`)
      setAllComments(updatedComments)
      setDisplayedComments(updatedComments.slice(0, commentsToShow))
    } catch (error: any) {
      alert(error?.message || "评论失败，请稍后再试")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)

    if (hours < 1) return "刚刚"
    if (hours < 24) return `${hours}小时前`
    if (hours < 48) return "1天前"
    return date.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")
  }

  return (
    <div className="container py-8 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto">
      <div className={`${selectedPost ? "grid grid-cols-1 lg:grid-cols-12 gap-6" : ""}`}>
        {/* 左侧帖子列表 */}
        <div className={`space-y-6 ${selectedPost ? "lg:col-span-7" : ""}`}>
          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

          {/* 帖子列表 */}
          {posts.map((post) => (
            <Card
              key={post.id}
              className={`overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
                selectedPost?.id === post.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleSelectPost(post)}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(post.title?.[0] || "兔").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {post.title || `${t("posts")} #${post.id.slice(0, 6)}`}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>
                {post.image_url && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                    <Image
                      src={post.image_url || "/placeholder.svg"}
                      alt="Post image"
                      fill
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 gap-4">
                <Button variant="ghost" size="sm" className="gap-2" disabled>
                  <MessageSquare className="h-4 w-4" />
                  <span>{t("comments")}</span>
                </Button>
              </CardFooter>
            </Card>
          ))}

          {/* 加载更多按钮 */}
          {hasMore && (
            <div className="flex justify-center py-8">
              <Button
                onClick={loadPosts}
                disabled={loading || !hasMore}
                variant="outline"
                size="lg"
                className="min-w-40 bg-transparent"
              >
                {loading ? (language === "zh" ? "加载中..." : "Loading...") : t("loadMore")}
              </Button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">{t("noMorePosts")}</p>
          )}
        </div>

        {/* 右侧评论区 */}
        {selectedPost && (
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <Card className="max-h-[calc(100vh-8rem)] flex flex-col bg-background/80 backdrop-blur-sm border-2">
                <CardHeader className="border-b flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {t("comments")} ({allComments.length})
                    </h2>
                    <Button variant="ghost" size="icon" onClick={handleCloseComments}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* 发表评论 */}
                  <div className="space-y-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={t("comment")}
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSubmitComment} size="sm">
                        {t("submit")}
                      </Button>
                    </div>
                  </div>

                  {/* 评论列表 */}
                  <div className="space-y-4 pt-4 border-t">
                    {displayedComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {comment.author_id?.[0] || "兔"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {comment.author_id ? comment.author_id.slice(0, 8) : "ituhouse"}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed break-words">{comment.content}</p>
                        </div>
                      </div>
                    ))}

                    {displayedComments.length < allComments.length && (
                      <div className="flex justify-center pt-4">
                        <Button onClick={loadMoreComments} variant="outline" size="sm" className="gap-2 bg-transparent">
                          <ChevronDown className="h-4 w-4" />
                          {language === "zh" ? "展开更多评论" : "See more comments"}
                        </Button>
                      </div>
                    )}

                    {allComments.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        {language === "zh" ? "暂无评论" : "No comments yet"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* 回到顶部按钮 */}
      {showScrollTop && (
        <Button
          size="lg"
          variant="outline"
          className="fixed bottom-24 right-8 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-background dark:bg-black dark:text-white dark:border-white"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* 发帖按钮 */}
      <Button
        size="lg"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 dark:bg-black dark:text-white dark:hover:bg-black/90"
        onClick={() => {
          if (!user || user.role === "visitor") {
            alert(t("loginRequired"))
            return
          }
          setIsCreatePostOpen(true)
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* 发帖对话框 */}
      <CreatePostDialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen} onPostCreated={handlePostCreated} />
    </div>
  )
}
