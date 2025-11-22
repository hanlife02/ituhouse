"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun, Monitor, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/providers/theme-provider"
import { useLanguage } from "@/components/providers/language-provider"
import { MobileNav } from "@/components/mobile-nav"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/components/providers/auth-provider"

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { user, logout, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/posts", label: t("posts") },
    { href: "/about", label: t("about") },
    { href: "/profile", label: t("profile") },
  ]

  const themeIcons = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Monitor className="h-4 w-4" />,
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full pt-4 px-4 md:px-6">
        <div className="mx-auto max-w-7xl rounded-2xl border bg-card shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/95">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative h-8 w-8 rounded-lg overflow-hidden">
                  <Image src="/logo.ico" alt="Logo" fill className="object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-none">{language === "zh" ? "小兔书" : "ituhouse"}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4 md:px-6">
      <div className="mx-auto max-w-7xl rounded-2xl border bg-card shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-8">
            {/* Logo 和服务名 */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8 rounded-lg overflow-hidden">
                <Image src="/logo.ico" alt="Logo" fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none">{language === "zh" ? "小兔书" : "ituhouse"}</span>
              </div>
            </Link>

            {/* 桌面端导航 */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* 主题切换 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {themeIcons[theme]}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 语言切换 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Languages className="h-4 w-4" />
                  <span className="sr-only">Toggle language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("zh")}>
                  <span className={language === "zh" ? "font-bold" : ""}>中文</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  <span className={language === "en" ? "font-bold" : ""}>English</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 登录/登出 - 桌面端 */}
            <div className="hidden md:block">
              {user ? (
                <Button variant="outline" size="sm" onClick={logout} disabled={loading}>
                  {t("logout")}
                </Button>
              ) : (
                <Button asChild size="sm" disabled={loading}>
                  <Link href="/login">{t("login")}</Link>
                </Button>
              )}
            </div>

            {/* 移动端菜单 */}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
