export const APP_SCROLL_CONTAINER_ID = "app-scroll-container"

export function getAppScrollContainer() {
  if (typeof document === "undefined") return null
  return document.getElementById(APP_SCROLL_CONTAINER_ID)
}
