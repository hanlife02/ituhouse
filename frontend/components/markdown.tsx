"use client"

/* eslint-disable @next/next/no-img-element */

import type React from "react"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import { cn } from "@/lib/utils"

type MarkdownProps = {
  children: string
  className?: string
}

const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: Array.from(
    new Set([
      ...(defaultSchema.tagNames ?? []),
      "figure",
      "figcaption",
      "iframe",
    ]),
  ),
  attributes: {
    ...defaultSchema.attributes,
    a: Array.from(new Set([...(defaultSchema.attributes?.a ?? []), "className", "target", "rel"])),
    img: Array.from(
      new Set([
        ...(defaultSchema.attributes?.img ?? []),
        "className",
        "width",
        "height",
        "align",
        "caption",
        "data-caption",
        "loading",
        "decoding",
      ]),
    ),
    figure: ["className"],
    figcaption: ["className"],
    iframe: [
      "className",
      "src",
      "title",
      "width",
      "height",
      "allow",
      "allowFullScreen",
      "referrerPolicy",
      "loading",
    ],
    div: Array.from(new Set([...(defaultSchema.attributes?.div ?? []), "className"])),
    span: Array.from(new Set([...(defaultSchema.attributes?.span ?? []), "className"])),
    p: Array.from(new Set([...(defaultSchema.attributes?.p ?? []), "className"])),
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto", "tel"],
    src: ["http", "https"],
  },
}

function parseWidthToCss(width: unknown) {
  if (width == null) return null

  const raw = typeof width === "number" ? String(width) : String(width).trim()
  if (!raw) return null

  if (raw.endsWith("%")) {
    const num = Number(raw.slice(0, -1))
    if (!Number.isFinite(num)) return null
    return `${Math.max(0, Math.min(num, 100))}%`
  }

  const num = Number(raw)
  if (!Number.isFinite(num)) return null

  if (num > 0 && num <= 1) return `${num * 100}%`
  if (num > 1 && num <= 100) return `${num}%`
  if (num > 100) return `${num}px`
  return null
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("prose", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          // `rehypeRaw` 会把 Markdown 中的 HTML 解析成节点；随后必须 sanitize，避免存储型 XSS。
          [rehypeSanitize, markdownSanitizeSchema],
        ]}
        components={{
          img: ({ className: imgClassName, alt, title, ...props }) => {
            const { width, height, align, caption, ["data-caption"]: dataCaption, ...imgProps } = props as any
            const widthCss = parseWidthToCss(width)
            const alignValue = typeof align === "string" ? align.toLowerCase() : null
            const captionText =
              typeof caption === "string"
                ? caption
                : typeof dataCaption === "string"
                  ? dataCaption
                  : typeof title === "string"
                    ? title
                    : null

            if (!captionText) {
              const style: React.CSSProperties = {
                maxWidth: "100%",
                height: "auto",
                ...(widthCss ? { width: widthCss } : null),
              }

              if (alignValue === "left" || alignValue === "right") {
                style.float = alignValue as "left" | "right"
                style.margin = alignValue === "left" ? "0.25rem 1rem 0.75rem 0" : "0.25rem 0 0.75rem 1rem"
              } else if (alignValue === "center") {
                style.display = "block"
                style.marginLeft = "auto"
                style.marginRight = "auto"
              } else {
                style.display = "block"
              }

              return (
                <img
                  alt={alt ?? ""}
                  title={title}
                  className={cn("md-img", imgClassName)}
	                  width={typeof width === "number" ? width : undefined}
	                  height={typeof height === "number" ? height : undefined}
	                  style={style}
	                  {...imgProps}
	                />
              )
            }

            const figureStyle: React.CSSProperties = { maxWidth: "100%" }
            if (widthCss) figureStyle.width = widthCss
            figureStyle.display = "table"

            if (alignValue === "left" || alignValue === "right") {
              figureStyle.float = alignValue as "left" | "right"
              figureStyle.margin = alignValue === "left" ? "0.25rem 1rem 0.75rem 0" : "0.25rem 0 0.75rem 1rem"
              if (!widthCss) figureStyle.maxWidth = "min(50%, 22rem)"
            } else {
              const shouldCenter = alignValue === "center" || (!alignValue && !!widthCss)
              if (shouldCenter) {
                figureStyle.marginLeft = "auto"
                figureStyle.marginRight = "auto"
              }
            }

            const imgStyle: React.CSSProperties = {
              display: "block",
              maxWidth: "100%",
              height: "auto",
              ...(widthCss ? { width: "100%" } : null),
            }

            return (
              <figure className="md-figure" style={figureStyle}>
                <img
                  alt={alt ?? ""}
                  title={title}
                  className={cn("md-img", imgClassName)}
	                  width={typeof width === "number" ? width : undefined}
	                  height={typeof height === "number" ? height : undefined}
	                  style={imgStyle}
	                  {...imgProps}
	                />
                <figcaption className="md-figcaption">{captionText}</figcaption>
              </figure>
            )
          },
          a: ({ className: aClassName, href, ...props }) => {
            const isExternal = typeof href === "string" && /^https?:\/\//i.test(href)
            return (
              <a
                href={href}
                className={cn("md-link", aClassName)}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer noopener" : undefined}
                {...props}
              />
            )
          },
          iframe: ({ className: iframeClassName, ...props }) => (
            <div className="md-embed">
              <iframe className={cn("md-iframe", iframeClassName)} {...props} />
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
