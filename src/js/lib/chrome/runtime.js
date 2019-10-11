export function openOptionsPage () {
  chrome.runtime.openOptionsPage()
}

export function getManifest () {
  return chrome.runtime.getManifest()
}

export function onInstalled () {
  return chrome.runtime.onInstalled
}
