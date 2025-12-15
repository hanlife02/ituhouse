"use client"

import Image from "next/image"
import { useLanguage } from "@/components/providers/language-provider"
import { RevealText } from "@/components/reveal-text"

export default function HomePage() {
  const { t } = useLanguage()
  const welcomeLine1 = t("welcomeLine1")
  const welcomeLine2 = t("welcomeLine2")
  const welcomeLine1DelayMs = 200
  const welcomeLine1StaggerMs = 85
  const welcomeLine2DelayMs = welcomeLine1DelayMs + Array.from(welcomeLine1).length * welcomeLine1StaggerMs + 300

  return (
    <div className="px-6 md:px-12 py-12 md:py-24">
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero 区域 - 左文字右Logo */}
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between md:gap-12 xl:gap-24">
          {/* 左侧文字 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 space-y-8">
            <span className="inline-block rounded-full bg-primary/10 px-5 py-2 text-sm md:text-base font-medium text-primary">
              Beta
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
              <RevealText text={welcomeLine1} baseDelayMs={welcomeLine1DelayMs} staggerMs={welcomeLine1StaggerMs} />
            </h1>
            <p
              className="fade-in-up text-lg md:text-2xl text-muted-foreground leading-relaxed max-w-3xl"
              style={{ animationDelay: `${welcomeLine2DelayMs}ms` }}
            >
              {welcomeLine2}
            </p>
          </div>

          {/* 右侧圆形 Logo */}
          <div className="order-last md:order-none flex-shrink-0">
            <div className="h-56 w-56 sm:h-64 sm:w-64 md:h-56 md:w-56 lg:h-72 lg:w-72 rounded-full bg-primary/10 shadow-xl overflow-hidden">
              <Image src="/logo.ico" alt="Logo" width={288} height={288} className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
