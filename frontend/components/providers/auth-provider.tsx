"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { apiFetch } from "@/lib/api"
import type { TokenResponse, User } from "@/lib/types"

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  setSession: (token: string, user: User) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_STORAGE_KEY = "ituhouse_token"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(
    async (tokenValue?: string | null) => {
      if (!tokenValue) {
        setUser(null)
        return
      }
      try {
        const profile = await apiFetch<User>("/auth/me", {
          token: tokenValue,
        })
        setUser(profile)
      } catch (error) {
        console.error("Failed to fetch profile", error)
        setUser(null)
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
      }
    },
    [],
  )

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null
    if (storedToken) {
      setToken(storedToken)
      fetchProfile(storedToken).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [fetchProfile])

  const login = useCallback(
    async (identifier: string, password: string) => {
      const response = await apiFetch<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      })
      localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token)
      setToken(response.access_token)
      await fetchProfile(response.access_token)
    },
    [fetchProfile],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    await fetchProfile(token)
  }, [fetchProfile, token])

  const setSession = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
    setToken(newToken)
    setUser(newUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshProfile, setSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
