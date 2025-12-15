"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/components/providers/language-provider"

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSendCode = async () => {
    if (!email) return

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert(t("passwordMismatch"))
      return
    }

    setLoading(true)

    // 模拟重置密码
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 1000)
  }

  if (success) {
    return (
      <div className="container mx-auto flex items-center justify-center py-16 px-5">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1.5 p-5">
            <CardTitle className="text-2xl font-semibold">{t("passwordResetSuccess")}</CardTitle>
            <CardDescription className="text-sm">{t("passwordResetSuccessDesc")}</CardDescription>
          </CardHeader>
          <CardFooter className="p-5 pt-2">
            <Button asChild className="w-full h-10 text-sm rounded-full">
              <Link href="/login">{t("backToLogin")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex items-center justify-center py-16 px-5">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1.5 p-5">
          <CardTitle className="text-2xl font-semibold">{t("forgotPassword")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                {t("email")}
              </Label>
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
              <Label htmlFor="code" className="text-sm">
                {t("verificationCode")}
              </Label>
              <Input
                id="code"
                type="text"
                placeholder={t("placeholderVerificationCode")}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="h-10 text-sm rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm">
                {t("password")}
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder={t("placeholderNewPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="h-10 text-sm rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">
                {t("confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("placeholderConfirmNewPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-10 text-sm rounded-xl"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-5 pt-2">
            <Button type="submit" className="w-full h-10 text-sm rounded-full" disabled={loading}>
              {loading ? t("resetting") : t("resetPassword")}
            </Button>
            <div className="text-sm text-center w-full">
              <Link href="/login" className="text-primary hover:underline">
                {t("backToLogin")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
