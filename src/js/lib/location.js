export function isIframe (windowContext = window) {
  return windowContext.location !== windowContext.parent.location
}

export default {
  isIframe
}
