"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/components/providers/language-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { Markdown } from "@/components/markdown"
import { apiFetch } from "@/lib/api"
import type { AboutSection } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

export default function AboutPage() {
  const { t, language } = useLanguage()
  const { user, token } = useAuth()
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editBody, setEditBody] = useState("")
  const [originalTitle, setOriginalTitle] = useState("")
  const [originalBody, setOriginalBody] = useState("")
  const isAdmin = user && (user.role === "admin" || user.role === "super_admin")
  const isSuperAdmin = user?.role === "super_admin"

  const resetEditingState = useCallback(() => {
    setEditingSlug(null)
    setEditTitle("")
    setEditBody("")
    setOriginalTitle("")
    setOriginalBody("")
  }, [])

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
        if (editingRef.current.slug && editingRef.current.dirty && hash !== editingRef.current.slug) {
          const ok = window.confirm(
            language === "zh" ? "你有未保存的修改，确定要切换章节吗？" : "You have unsaved changes. Switch anyway?",
          )
          if (!ok) return
          resetEditingState()
        }
        setActiveSlug(hash)
      }
    }

    applyHash()
    window.addEventListener("hashchange", applyHash)
    return () => window.removeEventListener("hashchange", applyHash)
  }, [sections, language, resetEditingState])

  useEffect(() => {
    if (!sections.length) return
    setActiveSlug((prev) => {
      if (!prev) return sections[0].slug
      if (sections.some((section) => section.slug === prev)) return prev
      return sections[0].slug
    })
  }, [sections])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!activeSlug) {
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search)
      }
      return
    }
    const desired = `#${activeSlug}`
    if (window.location.hash !== desired) {
      window.history.replaceState(null, "", desired)
    }
  }, [activeSlug])

  const handleSelectSection = (slug: string) => {
    if (editingRef.current.slug && editingRef.current.dirty && slug !== editingRef.current.slug) {
      const ok = window.confirm(
        language === "zh" ? "你有未保存的修改，确定要切换章节吗？" : "You have unsaved changes. Switch anyway?",
      )
      if (!ok) return
      resetEditingState()
    }
    setActiveSlug(slug)
  }

  const openEditor = (section: AboutSection) => {
    setEditingSlug(section.slug)
    setEditTitle(section.title)
    setEditBody(section.body_markdown)
    setOriginalTitle(section.title)
    setOriginalBody(section.body_markdown)
  }

  const handleSave = async () => {
    if (!editingSlug || !token) return
    try {
      const updated = await apiFetch<AboutSection>(`/about/sections/${editingSlug}`, {
        method: "PUT",
        token,
        body: JSON.stringify({
          title: editTitle,
          body_markdown: editBody,
        }),
      })
      setSections((prev) => prev.map((section) => (section.id === updated.id ? updated : section)))
      setEditingSlug(null)
    } catch (err: any) {
      alert(err?.message || "更新失败，请稍后再试")
    }
  }

  const hasUnsavedChanges = useMemo(() => {
    if (!editingSlug) return false
    return editTitle !== originalTitle || editBody !== originalBody
  }, [editingSlug, editTitle, editBody, originalTitle, originalBody])

  const editingRef = useRef<{ slug: string | null; dirty: boolean }>({ slug: null, dirty: false })
  useEffect(() => {
    editingRef.current = { slug: editingSlug, dirty: hasUnsavedChanges }
  }, [editingSlug, hasUnsavedChanges])

  const cancelEditing = () => {
    if (typeof window !== "undefined" && editingSlug && hasUnsavedChanges) {
      const ok = window.confirm(language === "zh" ? "放弃未保存的修改？" : "Discard unsaved changes?")
      if (!ok) return
    }
    resetEditingState()
  }

  const handleCreateSection = async () => {
    if (!token) return
    if (editingRef.current.slug && editingRef.current.dirty) {
      const ok = window.confirm(
        language === "zh" ? "你有未保存的修改，确定要新建章节吗？" : "You have unsaved changes. Create a new section anyway?",
      )
      if (!ok) return
      resetEditingState()
    }
    try {
      const title = language === "zh" ? "新章节" : "New section"
      const body = language === "zh" ? "## 新章节\n\n" : "## New section\n\n"
      const created = await apiFetch<AboutSection>("/about/sections", {
        method: "POST",
        token,
        body: JSON.stringify({ title, body_markdown: body }),
      })
      setSections((prev) => [...prev, created].sort((a, b) => a.id - b.id))
      setActiveSlug(created.slug)
      openEditor(created)
    } catch (err: any) {
      alert(err?.message || (language === "zh" ? "新增失败" : "Failed to create section"))
    }
  }

  const handleDeleteSection = async (section: AboutSection) => {
    if (!token) return
    const ok = window.confirm(
      language === "zh" ? `确定删除「${section.title}」吗？此操作不可撤销。` : `Delete "${section.title}"? This cannot be undone.`,
    )
    if (!ok) return

    try {
      await apiFetch(`/about/sections/${section.slug}`, { method: "DELETE", token })
      if (editingSlug === section.slug) resetEditingState()

      setSections((prev) => prev.filter((item) => item.slug !== section.slug))
    } catch (err: any) {
      alert(err?.message || (language === "zh" ? "删除失败" : "Failed to delete section"))
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
                  <div className="flex items-center justify-between px-3">
                    <h2 className="text-sm font-medium text-muted-foreground">{language === "zh" ? "目录" : "Contents"}</h2>
                    {isSuperAdmin && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleCreateSection}
                        aria-label={language === "zh" ? "新增章节" : "Add section"}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <nav className="flex flex-col">
                    {sections.map((section) => {
                      const isActive = section.slug === activeSection?.slug
                      return (
                        <div key={section.id} className="relative group">
                          <button
                            type="button"
                            onClick={() => handleSelectSection(section.slug)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors pr-9 ${
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            }`}
                            aria-current={isActive ? "page" : undefined}
                          >
                            <span className="block truncate">{section.title}</span>
                          </button>
                          {isSuperAdmin && (
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                handleDeleteSection(section)
                              }}
                              aria-label={language === "zh" ? "删除章节" : "Delete section"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
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
                {isSuperAdmin && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleCreateSection}>
                      {language === "zh" ? "新增章节" : "Add section"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => activeSection && handleDeleteSection(activeSection)}
                      disabled={!activeSection}
                    >
                      {language === "zh" ? "删除当前" : "Delete current"}
                    </Button>
                  </div>
                )}
              </div>

              <article className="space-y-6">
                <div
                  key={activeSection?.slug}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out fill-mode-both motion-reduce:animate-none"
                >
                  {editingSlug && activeSection?.slug === editingSlug ? (
                    <div className="space-y-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-12 text-xl md:text-2xl font-semibold rounded-xl"
                          placeholder={language === "zh" ? "标题" : "Title"}
                        />
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Button variant="outline" onClick={cancelEditing}>
                            {language === "zh" ? "取消" : "Cancel"}
                          </Button>
                          <Button onClick={handleSave} disabled={!token || !hasUnsavedChanges}>
                            {language === "zh" ? "保存" : "Save"}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted-foreground">
                            {language === "zh" ? "内容（Markdown/HTML）" : "Content (Markdown/HTML)"}
                          </p>
                          {hasUnsavedChanges && (
                            <p className="text-sm text-muted-foreground">{language === "zh" ? "未保存" : "Unsaved"}</p>
                          )}
                        </div>
                        <Textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={18}
                          className="min-h-[520px] rounded-xl font-mono text-sm leading-relaxed"
                          placeholder={language === "zh" ? "在这里输入 Markdown/HTML…" : "Write Markdown/HTML here…"}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <header className="flex flex-row items-center justify-between gap-4">
                        <h2 className="text-2xl md:text-3xl font-semibold">{activeSection?.title}</h2>
                        {isAdmin && activeSection && (
                          <Button size="lg" variant="outline" className="px-6 text-base" onClick={() => openEditor(activeSection)}>
                            {language === "zh" ? "编辑" : "Edit"}
                          </Button>
                        )}
                      </header>
                      <Markdown className="prose-base md:prose-lg dark:prose-invert max-w-none mt-6">
                        {activeSection?.body_markdown ?? ""}
                      </Markdown>
                    </>
                  )}
                </div>
              </article>
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
