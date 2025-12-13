"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Info, User } from "lucide-react"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="container max-w-5xl mx-auto min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 md:px-6">
      <div className="w-full max-w-4xl mx-auto space-y-12">
        {/* 欢迎区域 */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 shadow-lg overflow-hidden">
              <Image src="/logo.ico" alt="Logo" width={96} height={96} className="object-cover" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-center">
              <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                Beta · 开发中
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance">{t("welcomeLine1")}</h1>
            <p className="text-2xl md:text-3xl text-muted-foreground text-balance">{t("welcomeLine2")}</p>
          </div>
        </div>

        {/* 导航卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/posts" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-primary/50">
              <CardContent className="flex flex-col items-center justify-center p-5 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="text-base font-semibold">{t("posts")}</h2>
              </CardContent>
            </Card>
          </Link>

          <Link href="/about" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-primary/50">
              <CardContent className="flex flex-col items-center justify-center p-5 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Info className="h-6 w-6" />
                </div>
                <h2 className="text-base font-semibold">{t("about")}</h2>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-primary/50">
              <CardContent className="flex flex-col items-center justify-center p-5 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <User className="h-6 w-6" />
                </div>
                <h2 className="text-base font-semibold">{t("profile")}</h2>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
