"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Language = "zh" | "en"

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  zh: {
    language: "zh",
    serviceName: "小兔书",
    welcomeLine1: "欢迎来到小兔书",
    welcomeLine2: "一起记录可爱的兔兔们！",
    welcomeBanner: "欢迎来到小兔书🐰，一起记录可爱的兔兔！",
    home: "首页",
    posts: "记录",
    postsDescription: "分享你与兔兔的故事",
    aboutDescription: "了解兔兔护理知识",
    profileDescription: "查看个人信息",
    about: "关于",
    profile: "我的",
    login: "登录",
    logout: "登出",
    register: "注册",
    forgotPassword: "找回密码",
    email: "邮箱",
    verificationCode: "验证码",
    username: "用户名",
    password: "密码",
    confirmPassword: "确认密码",
    sendCode: "发送验证码",
    submit: "提交",
    loadMore: "加载更多",
    noMorePosts: "没有更多帖子了",
    aboutRabbits: "关于兔兔们",
    aboutTeam: "关于兔兔护理队",
    aboutFeeding: "关于喂兔",
    copyrightTitle: "版权",
    copyrightLine1: "All Rights Reserved",
    copyrightLine2: "@ 2025-now 北京大学校园公益营建社",
    contact: "联系我们",
    friendlyLinks: "友情链接",
    pkuhub: "PKUHub笔记平台",
    postTitle: "标题",
    postContent: "内容",
    createPost: "发布帖子",
    loginRequired: "请先登录",
    contentRequired: "请输入帖子内容",
    postCreated: "帖子发布成功！",
    loginToPost: "登录后即可发布帖子",
    shareYourStory: "分享你和兔兔的故事",
    postContentPlaceholder: "分享你的想法...",
    addImage: "添加图片",
    cancel: "取消",
    publish: "发布",
    publishing: "发布中...",
    comment: "发表评论...",
    comments: "评论",
    icpLicense: "备案信息",
    noIcpLicense: "未配置备案信息",
    agreeToTermsPrefix: "我已阅读并同意",
    mustAgreeToTerms: "请先阅读并同意用户须知",
    placeholderEmailOrUsername: "输入用户名或邮箱",
    placeholderPassword: "输入密码",
    placeholderEmail: "输入邮箱地址",
    placeholderVerificationCode: "输入验证码",
    placeholderUsername: "设置用户名",
    placeholderSetPassword: "设置密码",
    placeholderConfirmPassword: "再次输入密码",
    placeholderNewPassword: "输入新密码",
    placeholderConfirmNewPassword: "再次输入新密码",
    loggingIn: "登录中...",
    registering: "注册中...",
    resetting: "重置中...",
    resetPassword: "重置密码",
    backToLogin: "返回登录",
    alreadyHaveAccount: "已有账户？",
    passwordResetSuccess: "密码重置成功",
    passwordResetSuccessDesc: "您的密码已成功重置",
    passwordMismatch: "两次密码输入不一致",
    scrollToTop: "回到顶部",
  },
  en: {
    language: "en",
    serviceName: "ituhouse",
    welcomeLine1: "Welcome to ituhouse",
    welcomeLine2: "Let's record cute rabbits together!",
    welcomeBanner: "Welcome to ituhouse🐰, let's record cute rabbits together!",
    home: "Home",
    posts: "Posts",
    postsDescription: "Share your stories with rabbits",
    aboutDescription: "Learn about rabbit care",
    profileDescription: "View your profile",
    about: "About",
    profile: "My Profile",
    login: "Login",
    logout: "Logout",
    register: "Register",
    forgotPassword: "Forgot Password",
    email: "Email",
    verificationCode: "Verification Code",
    username: "Username",
    password: "Password",
    confirmPassword: "Confirm Password",
    sendCode: "Send Code",
    submit: "Submit",
    loadMore: "Load More",
    noMorePosts: "No more posts",
    aboutRabbits: "About Rabbits",
    aboutTeam: "About Rabbit Care Team",
    aboutFeeding: "About Feeding",
    copyrightTitle: "Copyright",
    copyrightLine1: "All Rights Reserved",
    copyrightLine2: "@ 2025-now PKU Campus Public Welfare Construction Society",
    contact: "Contact",
    friendlyLinks: "Links",
    pkuhub: "PKUHub Note Platform",
    postTitle: "Title",
    postContent: "Content",
    createPost: "Create Post",
    loginRequired: "Please login first",
    contentRequired: "Please enter post content",
    postCreated: "Post created successfully!",
    loginToPost: "Login to create posts",
    shareYourStory: "Share your story with rabbits",
    postContentPlaceholder: "Share your thoughts...",
    addImage: "Add Image",
    cancel: "Cancel",
    publish: "Publish",
    publishing: "Publishing...",
    comment: "Write a comment...",
    comments: "Comments",
    icpLicense: "ICP License",
    noIcpLicense: "No ICP License Configured",
    agreeToTermsPrefix: "I have read and agree to the",
    mustAgreeToTerms: "Please read and agree to the Terms of Service first",
    placeholderEmailOrUsername: "Enter username or email",
    placeholderPassword: "Enter password",
    placeholderEmail: "Enter email address",
    placeholderVerificationCode: "Enter verification code",
    placeholderUsername: "Set username",
    placeholderSetPassword: "Set password",
    placeholderConfirmPassword: "Enter password again",
    placeholderNewPassword: "Enter new password",
    placeholderConfirmNewPassword: "Enter new password again",
    loggingIn: "Logging in...",
    registering: "Registering...",
    resetting: "Resetting...",
    resetPassword: "Reset Password",
    backToLogin: "Back to Login",
    alreadyHaveAccount: "Already have an account?",
    passwordResetSuccess: "Password Reset Successfully",
    passwordResetSuccessDesc: "Your password has been reset successfully",
    passwordMismatch: "Passwords do not match",
    scrollToTop: "Scroll to Top",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh")

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language | null
    if (savedLang) {
      setLanguage(savedLang)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.zh] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
