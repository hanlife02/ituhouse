"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/components/providers/language-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { ImagePlus, X } from "lucide-react"
import Image from "next/image"
import { apiFetch } from "@/lib/api"
import type { Post } from "@/lib/types"

type CreatePostDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPostCreated?: (post: Post) => void
}

export function CreatePostDialog({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) {
  const { t } = useLanguage()
  const { user, token } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isGuest = !user || user.role === "visitor"

  const handleSubmit = async () => {
    if (isGuest) {
      alert(t("loginRequired"))
      return
    }

    if (!title.trim() || !content.trim()) {
      alert(t("contentRequired"))
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        image_url: image,
      }
      const newPost = await apiFetch<Post>("/posts", {
        method: "POST",
        token: token ?? undefined,
        body: JSON.stringify(payload),
      })
      setContent("")
      setTitle("")
      setImage(null)
      onOpenChange(false)
      onPostCreated?.(newPost)
      alert(t("postCreated"))
    } catch (error: any) {
      alert(error?.message || "发布失败，请稍后再试")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageSelect = () => {
    const url = window.prompt("请输入图片链接（可选）")
    if (url) {
      setImage(url)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("createPost")}</DialogTitle>
          <DialogDescription>{isGuest ? t("loginToPost") : t("shareYourStory")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            placeholder={t("postTitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isGuest}
          />

          <Textarea
            placeholder={t("postContentPlaceholder")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32 resize-none"
            disabled={isGuest}
          />

          {image && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
              <Image src={image || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                disabled={isGuest}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {!image && (
            <Button variant="outline" className="w-full bg-transparent" onClick={handleImageSelect} disabled={isGuest}>
              <ImagePlus className="mr-2 h-4 w-4" />
              {t("addImage")}
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isGuest || isSubmitting}>
            {isSubmitting ? t("publishing") : t("publish")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
