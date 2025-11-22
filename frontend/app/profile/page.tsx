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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) {
      setMyPosts([])
      return
    }
    let cancelled = false
    const fetchMyPosts = async () => {
      setPostsLoading(true)
      try {
        const data = await apiFetch<PaginatedPosts>("/posts?page=1&page_size=100")
        if (!cancelled) {
          setMyPosts(data.items.filter((post) => post.author_id === user.id))
        }
      } catch (error) {
        if (!cancelled) {
          setMyPosts([])
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

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-6 text-center">
        <p className="text-sm text-muted-foreground">{loading ? "加载中..." : "请登录后查看个人资料"}</p>
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
    <div className="container mx-auto py-8 px-6 md:px-12 lg:px-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("profile")}</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle>{user.username}</CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">用户角色</span>
                <span className="text-sm text-muted-foreground">{getRoleName(user.role)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">注册时间</span>
                <span className="text-sm text-muted-foreground">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString("zh-CN") : "未知"}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">权限说明</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
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
          <CardHeader>
            <CardTitle>我的帖子</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {postsLoading ? (
              <p className="text-sm text-muted-foreground">加载中...</p>
            ) : myPosts.length ? (
              <ul className="space-y-3">
                {myPosts.map((post) => (
                  <li key={post.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{post.title || `${t("posts")} #${post.id.slice(0, 6)}`}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(post.created_at).toLocaleString("zh-CN")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">暂无帖子。</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
