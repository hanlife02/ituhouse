"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/providers/theme-provider"
import { useLanguage } from "@/components/providers/language-provider"
import { MobileNav } from "@/components/mobile-nav"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useAuth } from "@/components/providers/auth-provider"

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { user, logout, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDiff = currentScrollY - lastScrollY.current

      // 在顶部时始终显示
      if (currentScrollY < 10) {
        setIsVisible(true)
        setIsAtTop(true)
      } else {
        setIsAtTop(false)
        // 向上滚动时显示，向下滚动时隐藏
        if (scrollDiff < -5) {
          setIsVisible(true)
        } else if (scrollDiff > 5) {
          setIsVisible(false)
        }
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/posts", label: t("posts") },
    { href: "/about", label: t("about") },
    { href: "/profile", label: t("profile") },
  ]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh")
  }

  const headerClasses = `
    sticky top-0 z-50 w-full
    transition-all duration-300 ease-out
    ${isVisible ? "translate-y-0" : "-translate-y-full"}
    ${isAtTop ? "bg-transparent" : "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"}
  `

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-transparent">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex h-14 md:h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 md:h-10 md:w-10 rounded-full overflow-hidden">
                <Image src="/logo.ico" alt="Logo" fill className="object-cover" />
              </div>
              <span className="text-base md:text-lg font-semibold tracking-tight">
                {language === "zh" ? "小兔书" : "ituhouse"}
              </span>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={headerClasses}>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* 左侧 Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 md:h-10 md:w-10 rounded-full overflow-hidden transition-transform group-hover:scale-105">
              <Image src="/logo.ico" alt="Logo" fill className="object-cover" />
            </div>
            <span className="text-base md:text-lg font-semibold tracking-tight">
              {language === "zh" ? "小兔书" : "ituhouse"}
            </span>
          </Link>

          {/* 中间导航 */}
          <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm md:text-base font-medium rounded-full transition-all ${
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 右侧操作 */}
          <div className="flex items-center gap-1.5">
            {/* 主题切换 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 md:h-11 md:w-11 rounded-full hover:bg-muted/60"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {/* 语言切换 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 md:h-11 md:w-11 rounded-full hover:bg-muted/60"
              onClick={toggleLanguage}
            >
              <span className="text-xs md:text-sm font-medium">{language === "zh" ? "中" : "EN"}</span>
            </Button>

            {/* 登录按钮 */}
            <div className="hidden md:block ml-1.5">
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  disabled={loading}
                  className="h-10 px-4 rounded-full text-sm md:text-base"
                >
                  {t("logout")}
                </Button>
              ) : (
                <Button asChild size="sm" className="h-10 px-4 rounded-full text-sm md:text-base">
                  <Link href="/login">{t("login")}</Link>
                </Button>
              )}
            </div>

            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
