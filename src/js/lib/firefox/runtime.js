export function openOptionsPage () {
  browser.runtime.openOptionsPage()
}

export function getManifest () {
  return browser.runtime.getManifest()
}

export function onInstalled () {
  return browser.runtime.onInstalled
}
