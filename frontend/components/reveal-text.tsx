import { cn } from "@/lib/utils"

type RevealTextProps = {
  text: string
  className?: string
  baseDelayMs?: number
  staggerMs?: number
}

export function RevealText({ text, className, baseDelayMs = 120, staggerMs = 90 }: RevealTextProps) {
  const chars = Array.from(text)

  return (
    <span className={cn("reveal-text", className)} aria-label={text} role="text">
      {chars.map((char, index) => {
        if (char === "\n") return <br key={`br-${index}`} />
        const displayChar = char === " " ? "\u00A0" : char
        return (
          <span
            key={`${displayChar}-${index}`}
            className="reveal-char"
            style={{ animationDelay: `${baseDelayMs + index * staggerMs}ms` }}
          >
            {displayChar}
          </span>
        )
      })}
    </span>
  )
}
