"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/components/providers/language-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { apiFetch } from "@/lib/api"
import type { PaginatedPosts, Post } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user, loading } = useAuth()
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsLoadingMore, setPostsLoadingMore] = useState(false)
  const [postsPage, setPostsPage] = useState(1)
  const [postsHasMore, setPostsHasMore] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) {
      setMyPosts([])
      setPostsPage(1)
      setPostsHasMore(false)
      return
    }
    let cancelled = false
    const fetchMyPosts = async () => {
      setPostsLoading(true)
      try {
        const data = await apiFetch<PaginatedPosts>(`/posts?page=1&page_size=20&author_id=${user.id}`)
        if (!cancelled) {
          setMyPosts(data.items)
          setPostsHasMore(data.has_more)
          setPostsPage(2)
        }
      } catch (error) {
        if (!cancelled) {
          setMyPosts([])
          setPostsHasMore(false)
          setPostsPage(1)
        }
      } finally {
        if (!cancelled) {
          setPostsLoading(false)
        }
      }
    }
    fetchMyPosts()
    return () => {
      cancelled = true
    }
  }, [user])

  const loadMorePosts = async () => {
    if (!user || postsLoadingMore || !postsHasMore) return
    setPostsLoadingMore(true)
    try {
      const data = await apiFetch<PaginatedPosts>(`/posts?page=${postsPage}&page_size=20&author_id=${user.id}`)
      setMyPosts((prev) => [...prev, ...data.items])
      setPostsHasMore(data.has_more)
      setPostsPage((prev) => prev + 1)
    } catch {
      setPostsHasMore(false)
    } finally {
      setPostsLoadingMore(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-6 text-center">
        <p className="text-lg text-muted-foreground">{loading ? "加载中..." : "请登录后查看个人资料"}</p>
      </div>
    )
  }

  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      visitor: "游客",
      user: "普通用户",
      admin: "管理员",
      super_admin: "超级管理员",
    }
    return roleMap[role] || "未知"
  }

  return (
    <div className="container mx-auto py-12 px-6 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold">{t("profile")}</h1>
        </div>

        <Card>
          <CardHeader className="p-8">
            <div className="flex items-center gap-6 md:gap-8">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-3xl">{user.username}</CardTitle>
                <p className="text-lg text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-8 pt-0">
            <div className="grid gap-6">
              <div className="flex justify-between">
                <span className="text-lg font-medium">用户角色</span>
                <span className="text-lg text-muted-foreground">{getRoleName(user.role)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg font-medium">注册时间</span>
                <span className="text-lg text-muted-foreground">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString("zh-CN") : "未知"}
                </span>
              </div>
            </div>

            <div className="pt-5 border-t">
              <h3 className="text-lg font-medium mb-3">权限说明</h3>
              <ul className="text-lg text-muted-foreground space-y-2 list-disc list-inside">
                {user.role === "visitor" && (
                  <>
                    <li>可以浏览帖子</li>
                    <li>不能发布帖子和评论</li>
                  </>
                )}
                {user.role === "user" && (
                  <>
                    <li>可以浏览帖子</li>
                    <li>可以发布帖子和评论</li>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <li>可以浏览、发布帖子和评论</li>
                    <li>可以编辑关于页面内容</li>
                    <li>可以管理用户帖子</li>
                  </>
                )}
                {user.role === "super_admin" && (
                  <>
                    <li>拥有所有权限</li>
                    <li>可以指定管理员</li>
                    <li>可以管理所有内容</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-8">
            <CardTitle className="text-3xl">我的帖子</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-8 pt-0">
            {postsLoading && myPosts.length === 0 ? (
              <p className="text-lg text-muted-foreground">加载中...</p>
            ) : myPosts.length ? (
              <>
                <ul className="space-y-4">
                  {myPosts.map((post) => (
                    <li key={post.id} className="rounded-lg border p-5">
                      <p className="text-lg font-medium">{post.title || `${t("posts")} #${post.id.slice(0, 6)}`}</p>
                      <p className="text-base md:text-lg text-muted-foreground line-clamp-2 mt-2">{post.content}</p>
                      <p className="text-sm md:text-base text-muted-foreground mt-3">
                        {new Date(post.created_at).toLocaleString("zh-CN")}
                      </p>
                    </li>
                  ))}
                </ul>
                {postsHasMore && (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline disabled:opacity-60"
                      onClick={loadMorePosts}
                      disabled={postsLoadingMore}
                    >
                      {postsLoadingMore ? "加载中..." : t("loadMore")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-lg text-muted-foreground">暂无帖子。</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
