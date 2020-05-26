export function openOptionsPage() {
  browser.runtime.openOptionsPage();
}

export function getManifest() {
  return browser.runtime.getManifest();
}

export function onInstalled() {
  return browser.runtime.onInstalled;
}

// https://stackoverflow.com/a/15534822/2601552
export function onHeadersReceived(options) {
  return browser.webRequest.onHeadersReceived.addListener(
    options.addListener,
    options.config,
    options.permissions
  );
}
