"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/components/providers/language-provider"
import { useAuth } from "@/components/providers/auth-provider"
import ReactMarkdown from "react-markdown"
import { apiFetch } from "@/lib/api"
import type { AboutSection } from "@/lib/types"

export default function AboutPage() {
  const { t, language } = useLanguage()
  const { user, token } = useAuth()
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editBody, setEditBody] = useState("")
  const isAdmin = user && (user.role === "admin" || user.role === "super_admin")

  const fetchSections = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<AboutSection[]>("/about/sections")
      setSections(data)
    } catch (err: any) {
      setError(err?.message || "无法加载内容，请稍后再试")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSections()
  }, [])

  const openEditor = (section: AboutSection) => {
    setEditingSection(section)
    setEditTitle(section.title)
    setEditBody(section.body_markdown)
  }

  const handleSave = async () => {
    if (!editingSection || !token) return
    try {
      const updated = await apiFetch<AboutSection>(`/about/sections/${editingSection.slug}`, {
        method: "PUT",
        token,
        body: JSON.stringify({
          title: editTitle,
          body_markdown: editBody,
        }),
      })
      setSections((prev) => prev.map((section) => (section.id === updated.id ? updated : section)))
      setEditingSection(null)
    } catch (err: any) {
      alert(err?.message || "更新失败，请稍后再试")
    }
  }

  return (
    <div className="container mx-auto py-8 px-6 md:px-12 lg:px-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("about")}</h1>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">加载中...</p>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <Card key={section.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{section.title}</CardTitle>
                  {isAdmin && (
                    <Button size="sm" variant="outline" onClick={() => openEditor(section)}>
                      {language === "zh" ? "编辑" : "Edit"}
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{section.body_markdown}</ReactMarkdown>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === "zh" ? "编辑" : "Edit"} {editingSection?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{language === "zh" ? "标题" : "Title"}</label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">
                {language === "zh" ? "Markdown 内容" : "Markdown Content"}
              </label>
              <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={10} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSection(null)}>
              {language === "zh" ? "取消" : "Cancel"}
            </Button>
            <Button onClick={handleSave} disabled={!token}>
              {language === "zh" ? "保存" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
