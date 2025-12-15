"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type RouteTransitionProps = {
  children: React.ReactNode
  className?: string
}

export function RouteTransition({ children, className }: RouteTransitionProps) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out fill-mode-both motion-reduce:animate-none",
        className,
      )}
    >
      {children}
    </div>
  )
}

