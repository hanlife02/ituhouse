"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"
import { useAuth } from "@/components/providers/auth-provider"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()
  const { user, logout, loading } = useAuth()

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/posts", label: t("posts") },
    { href: "/about", label: t("about") },
    { href: "/profile", label: t("profile") },
  ]

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="fixed right-4 top-20 z-50 w-48 rounded-lg border bg-card shadow-lg">
          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                  pathname === item.href ? "bg-accent text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="my-1 h-px bg-border" />

            {user ? (
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="w-full rounded-full"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
              >
                {t("logout")}
              </Button>
            ) : (
              <Button asChild className="w-full rounded-full">
                <Link href="/login" onClick={() => setOpen(false)}>
                  {t("login")}
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
