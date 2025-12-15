const AVATAR_SOURCES = [
  "/avatar/avatar1.png",
  "/avatar/avatar2.png",
  "/avatar/avatar3.png",
  "/avatar/avatar4.jpg",
  "/avatar/avatar5.jpg",
  "/avatar/avatar6.jpg",
] as const

function hashStringToInt(input: string) {
  // djb2
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  return hash >>> 0
}

export function getAvatarSrc(seed: string | null | undefined) {
  if (!seed) return AVATAR_SOURCES[0]
  const idx = hashStringToInt(seed) % AVATAR_SOURCES.length
  return AVATAR_SOURCES[idx]
}

