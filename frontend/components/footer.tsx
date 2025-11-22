"use client"
import { useLanguage } from "@/components/providers/language-provider"
import friendlyLinksData from "@/config/friendly-links.json"

export function Footer() {
  const { t, language } = useLanguage()

  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "ethan@hanlife02.com"
  const icpLicense = process.env.NEXT_PUBLIC_ICP_LICENSE
  const extraLicense = process.env.NEXT_PUBLIC_ADDITIONAL_LICENSE
  const extraLicenseUrl = process.env.NEXT_PUBLIC_ADDITIONAL_LICENSE_URL || "https://beian.miit.gov.cn/"

  const friendlyLinks = friendlyLinksData as { name: string; name_en: string; url: string }[]

  return (
    <footer className="border-t bg-muted/50">
      <div className="container max-w-7xl mx-auto py-8 px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 版权信息 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{t("copyrightTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("copyrightLine1")}</p>
            <p className="text-sm text-muted-foreground">{t("copyrightLine2")}</p>
          </div>

          {/* 联系方式 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{t("contact")}</h3>
            <a
              href={`mailto:${contactEmail}`}
              className="block text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {contactEmail}
            </a>
          </div>

          {/* 友情链接 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{t("friendlyLinks")}</h3>
            {friendlyLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {language === "zh" ? link.name : link.name_en}
              </a>
            ))}
          </div>

          {/* 备案信息 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{t("icpLicense")}</h3>
            {icpLicense ? (
              <>
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {icpLicense}
                </a>
                {extraLicense && (
                  <a
                    href={extraLicenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {extraLicense}
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noIcpLicense")}</p>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
