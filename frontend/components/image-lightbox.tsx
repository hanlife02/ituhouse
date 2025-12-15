"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"

type ImageLightboxProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt: string
}

export function ImageLightbox({ open, onOpenChange, src, alt }: ImageLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[92vw] max-w-[1100px] p-0 bg-transparent border-0 shadow-none gap-0 sm:max-w-[1100px]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Image preview</DialogTitle>
        <div className="relative h-[80vh] w-full overflow-hidden rounded-xl bg-black/70">
          <DialogClose asChild>
            <button
              type="button"
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 focus:outline-hidden focus:ring-2 focus:ring-white/60"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
          <Image src={src} alt={alt} fill className="object-contain" sizes="92vw" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
