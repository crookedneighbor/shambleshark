export function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

export function getManifest() {
  return chrome.runtime.getManifest();
}

export function onInstalled() {
  return chrome.runtime.onInstalled;
}

// https://stackoverflow.com/a/15534822/2601552
export function onHeadersReceived(options) {
  return chrome.webRequest.onHeadersReceived.addListener(
    options.addListener,
    options.config,
    options.permissions
  );
}
