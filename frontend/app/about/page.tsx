"use client"

import { useEffect, useMemo, useState } from "react"
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
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editBody, setEditBody] = useState("")
  const isAdmin = user && (user.role === "admin" || user.role === "super_admin")

  const activeSection = useMemo(() => {
    if (!sections.length) return null
    if (activeSlug) {
      const found = sections.find((section) => section.slug === activeSlug)
      if (found) return found
    }
    return sections[0]
  }, [activeSlug, sections])

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

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!sections.length) return

    const applyHash = () => {
      const hash = window.location.hash.replace(/^#/, "")
      if (!hash) return
      if (sections.some((section) => section.slug === hash)) {
        setActiveSlug(hash)
      }
    }

    applyHash()
    window.addEventListener("hashchange", applyHash)
    return () => window.removeEventListener("hashchange", applyHash)
  }, [sections])

  useEffect(() => {
    if (!sections.length) return
    setActiveSlug((prev) => prev ?? sections[0].slug)
  }, [sections])

  const setHash = (slug: string) => {
    if (typeof window === "undefined") return
    window.history.replaceState(null, "", `#${slug}`)
  }

  const handleSelectSection = (slug: string) => {
    setActiveSlug(slug)
    setHash(slug)
  }

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
    <div className="container mx-auto py-12 px-6 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold">{t("about")}</h1>
          {error && <p className="text-base md:text-lg text-red-500">{error}</p>}
        </div>

        {loading ? (
          <p className="text-base md:text-lg text-muted-foreground">加载中...</p>
        ) : !sections.length ? (
          <p className="text-base md:text-lg text-muted-foreground">{language === "zh" ? "暂无内容。" : "No content."}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
            {/* 左侧侧边栏（桌面端） */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20">
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-muted-foreground px-3">
                    {language === "zh" ? "目录" : "Contents"}
                  </h2>
                  <nav className="flex flex-col">
                    {sections.map((section) => {
                      const isActive = section.slug === activeSection?.slug
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => handleSelectSection(section.slug)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <span className="block truncate">{section.title}</span>
                        </button>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </aside>

            {/* 右侧内容 */}
            <main className="lg:col-span-9">
              {/* 移动端：下拉选择章节 */}
              <div className="lg:hidden mb-6">
                <label className="sr-only" htmlFor="about-section-select">
                  {language === "zh" ? "选择章节" : "Select section"}
                </label>
                <select
                  id="about-section-select"
                  value={activeSection?.slug ?? ""}
                  onChange={(e) => handleSelectSection(e.target.value)}
                  className="w-full h-10 rounded-xl border bg-background px-3 text-sm"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.slug}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>

              <article className="space-y-6">
                <header className="flex flex-row items-center justify-between gap-4">
                  <h2 className="text-2xl md:text-3xl font-semibold">{activeSection?.title}</h2>
                  {isAdmin && activeSection && (
                    <Button size="lg" variant="outline" className="px-6 text-base" onClick={() => openEditor(activeSection)}>
                      {language === "zh" ? "编辑" : "Edit"}
                    </Button>
                  )}
                </header>
                <div className="prose prose-base md:prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown>{activeSection?.body_markdown ?? ""}</ReactMarkdown>
                </div>
              </article>
            </main>
          </div>
        )}
      </div>

      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-3xl">
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
