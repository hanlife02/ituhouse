"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"

// 用户须知内容（硬编码，后续可由管理员编辑）
const termsContent = {
  zh: `# 小兔书用户须知

## 1. 服务说明
小兔书（ituhouse）是一个专注于兔兔护理知识分享和交流的社区平台，由北京大学校园公益营建社运营。

## 2. 用户行为规范
- 尊重他人，文明发言，不得发布攻击性、侮辱性内容
- 分享真实、有价值的兔兔护理经验和知识
- 不得发布虚假信息、广告或垃圾内容
- 尊重他人隐私，不得未经许可发布他人信息
- 不得从事任何违反法律法规的行为

## 3. 内容规范
- 发布的内容应与兔兔护理、饲养相关
- 上传的图片应清晰、健康、积极向上
- 禁止发布任何形式的虐待动物内容
- 禁止发布不适当或违法违规的内容

## 4. 账号管理
- 用户需对自己的账号安全负责
- 不得将账号转让或出借他人使用
- 发现账号异常应及时联系管理员

## 5. 免责声明
- 平台内容仅供参考，具体饲养问题请咨询专业兽医
- 用户发布的内容代表其个人观点，与平台无关
- 平台保留删除违规内容和封禁违规账号的权利

## 6. 隐私保护
- 我们重视用户隐私，会妥善保管用户信息
- 不会在未经同意的情况下向第三方提供用户信息

## 7. 服务变更
- 平台保留随时修改或终止服务的权利
- 重要变更会提前通知用户

感谢您使用小兔书，让我们一起为兔兔们创造更好的生活环境！`,
  en: `# ituhouse Terms of Service

## 1. Service Description
ituhouse is a community platform focused on sharing and exchanging rabbit care knowledge, operated by PKU Campus Public Welfare Construction Society.

## 2. User Code of Conduct
- Respect others, communicate civilly, no offensive or insulting content
- Share authentic and valuable rabbit care experiences and knowledge
- No false information, advertisements, or spam
- Respect others' privacy, no unauthorized disclosure of personal information
- No activities that violate laws and regulations

## 3. Content Guidelines
- Posted content should be related to rabbit care and breeding
- Uploaded images should be clear, healthy, and positive
- Any form of animal abuse content is strictly prohibited
- No inappropriate or illegal content

## 4. Account Management
- Users are responsible for their account security
- Accounts cannot be transferred or lent to others
- Report any account anomalies to administrators immediately

## 5. Disclaimer
- Platform content is for reference only; consult professional veterinarians for specific issues
- User-posted content represents personal views and does not reflect the platform
- Platform reserves the right to remove violating content and ban violating accounts

## 6. Privacy Protection
- We value user privacy and will properly protect user information
- Will not provide user information to third parties without consent

## 7. Service Changes
- Platform reserves the right to modify or terminate services at any time
- Important changes will be notified in advance

Thank you for using ituhouse. Let's create a better living environment for rabbits together!`,
}

export function TermsOfService() {
  const { language } = useLanguage()
  const [open, setOpen] = useState(false)

  const content = termsContent[language]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto font-normal text-primary hover:underline">
          {language === "zh" ? "用户须知" : "Terms of Service"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{language === "zh" ? "用户须知" : "Terms of Service"}</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {content.split("\n").map((line, index) => {
            if (line.startsWith("# ")) {
              return (
                <h1 key={index} className="text-2xl font-bold mt-4 mb-2">
                  {line.replace("# ", "")}
                </h1>
              )
            }
            if (line.startsWith("## ")) {
              return (
                <h2 key={index} className="text-xl font-semibold mt-3 mb-2">
                  {line.replace("## ", "")}
                </h2>
              )
            }
            if (line.startsWith("- ")) {
              return (
                <li key={index} className="ml-4">
                  {line.replace("- ", "")}
                </li>
              )
            }
            if (line.trim() === "") {
              return <br key={index} />
            }
            return (
              <p key={index} className="mb-2">
                {line}
              </p>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
