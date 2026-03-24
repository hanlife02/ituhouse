import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { LanguageProvider } from "@/components/providers/language-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RouteTransition } from "@/components/route-transition"
import { APP_SCROLL_CONTAINER_ID } from "@/lib/scroll-container"

export const metadata: Metadata = {
  title: "小兔书 | ituhouse",
  description: "北京大学校园公益营建社 - 关注兔兔护理的社区平台",
  generator: "v0.app",
  icons: {
    icon: "/logo.ico",
    apple: "/logo.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`font-sans antialiased overflow-hidden`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <div className="h-[100dvh] overflow-hidden">
                <div id={APP_SCROLL_CONTAINER_ID} className="h-full overflow-y-auto overscroll-none">
                  <div className="min-h-full flex flex-col">
                    <Header />
                    <main className="flex-1 pb-16">
                      <RouteTransition>{children}</RouteTransition>
                    </main>
                    <Footer />
                  </div>
                </div>
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
