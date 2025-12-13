"use client"

import { useRef, useState, type ChangeEvent } from "react"
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
import { ImagePlus, Link2, X } from "lucide-react"
import Image from "next/image"
import { apiFetch } from "@/lib/api"
import type { ImageUploadResponse, Post } from "@/lib/types"

type CreatePostDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPostCreated?: (post: Post) => void
}

export function CreatePostDialog({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) {
  const { t } = useLanguage()
  const { user, token } = useAuth()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [showImageUrlInput, setShowImageUrlInput] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState("")

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
      setShowImageUrlInput(false)
      setImageUrlInput("")
      onOpenChange(false)
      onPostCreated?.(newPost)
      alert(t("postCreated"))
    } catch (error: any) {
      alert(error?.message || "发布失败，请稍后再试")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUrlSelect = () => {
    if (isGuest) {
      alert(t("loginRequired"))
      return
    }
    setShowImageUrlInput((prev) => !prev)
  }

  const handleImageUrlSave = () => {
    if (!imageUrlInput.trim()) {
      alert(t("imageUrlRequired"))
      return
    }
    setImage(imageUrlInput.trim())
    setImageUrlInput("")
    setShowImageUrlInput(false)
  }

  const handleFileButtonClick = () => {
    if (isGuest) {
      alert(t("loginRequired"))
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (isGuest) {
      alert(t("loginRequired"))
      event.target.value = ""
      return
    }
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await apiFetch<ImageUploadResponse>("/api/uploads/images", {
        method: "POST",
        token: token ?? undefined,
        body: formData,
      })
      setImage(response.url)
    } catch (error: any) {
      alert(error?.message || t("imageUploadFailed"))
    } finally {
      setImageUploading(false)
      event.target.value = ""
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
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
                disabled={isGuest || imageUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {!image && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                variant="outline"
                onClick={handleFileButtonClick}
                disabled={isGuest || imageUploading}
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                {imageUploading ? t("uploadingImage") : t("chooseFromDevice")}
              </Button>
              <Button
                className="flex-1"
                variant="secondary"
                onClick={handleImageUrlSelect}
                disabled={isGuest || imageUploading}
              >
                <Link2 className="mr-2 h-4 w-4" />
                {t("insertImageUrl")}
              </Button>
            </div>
          )}

          {showImageUrlInput && !image && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder={t("imageUrlPrompt")}
                disabled={isGuest || imageUploading}
              />
              <Button variant="secondary" onClick={handleImageUrlSave} disabled={isGuest || imageUploading}>
                {t("submit")}
              </Button>
            </div>
          )}

          {imageUploading && !image && (
            <p className="text-sm text-muted-foreground">{t("uploadingImage")}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isGuest || isSubmitting || imageUploading}>
            {isSubmitting ? t("publishing") : t("publish")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
