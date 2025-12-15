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
import { useAuth } from "@/components/providers/auth-provider"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { login } = useAuth()
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      alert(t("mustAgreeToTerms"))
      return
    }

    setLoading(true)
    setError(null)
    try {
      await login(emailOrUsername, password)
      router.push("/")
    } catch (err: any) {
      setError(err?.message || "登录失败，请稍后再试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center py-16 px-5">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1.5 p-5">
          <CardTitle className="text-2xl font-semibold">{t("login")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-5">
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername" className="text-sm">
                {t("username")} / {t("email")}
              </Label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder={t("placeholderEmailOrUsername")}
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                className="h-10 text-sm rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("placeholderPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? t("loggingIn") : t("login")}
            </Button>
            <div className="flex justify-between text-sm w-full">
              <Link href="/register" className="text-primary hover:underline">
                {t("register")}
              </Link>
              <Link href="/forgot-password" className="text-primary hover:underline">
                {t("forgotPassword")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
