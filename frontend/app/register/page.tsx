"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { TermsOfService } from "@/components/terms-of-service"
import { useLanguage } from "@/components/providers/language-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { apiFetch } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const { theme } = useTheme()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [codeHint, setCodeHint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSendCode = async () => {
    if (!email) return
    setError(null)
    try {
      const response = await apiFetch<{ code?: string }>("/auth/request-code", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      if (response.code) {
        setCodeHint(language === "zh" ? `测试验证码：${response.code}` : `Test code: ${response.code}`)
      } else {
        setCodeHint(language === "zh" ? "验证码已发送至邮箱。" : "Verification code sent to your inbox.")
      }
    } catch (err: any) {
      setError(err?.message || "验证码发送失败，请稍后再试")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert(t("passwordMismatch"))
      return
    }

    if (!agreedToTerms) {
      alert(t("mustAgreeToTerms"))
      return
    }

    setLoading(true)
    setError(null)

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          verification_code: verificationCode,
          username,
          password,
          preferred_locale: language === "zh" ? "zh-CN" : "en-US",
          preferred_theme: theme ?? "system",
        }),
      })
      await login(username || email, password)
      router.push("/")
    } catch (err: any) {
      setError(err?.message || "注册失败，请稍后再试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center py-12 px-5">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1.5 p-5">
          <CardTitle className="text-2xl font-semibold">{t("register")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">{t("email")}</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder={t("placeholderEmail")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 text-sm rounded-xl"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={!email || countdown > 0}
                  className="whitespace-nowrap h-10 text-sm px-4 rounded-full"
                >
                  {countdown > 0 ? `${countdown}s` : t("sendCode")}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm">{t("verificationCode")}</Label>
              <Input
                id="code"
                type="text"
                placeholder={t("placeholderVerificationCode")}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="h-10 text-sm rounded-xl"
              />
              {codeHint && <p className="text-xs text-muted-foreground">{codeHint}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm">{t("username")}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t("placeholderUsername")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-10 text-sm rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("placeholderSetPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 text-sm rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("placeholderConfirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-10 text-sm rounded-xl"
              />
            </div>

            <div className="flex items-start gap-2.5">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-0.5"
              />
              <label
                htmlFor="terms"
                className="text-sm leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("agreeToTermsPrefix")} <TermsOfService />
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-5 pt-2">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full h-10 text-sm rounded-full" disabled={loading || !agreedToTerms}>
              {loading ? t("registering") : t("register")}
            </Button>
            <div className="text-sm text-center w-full">
              {t("alreadyHaveAccount")}{" "}
              <Link href="/login" className="text-primary hover:underline">
                {t("login")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
