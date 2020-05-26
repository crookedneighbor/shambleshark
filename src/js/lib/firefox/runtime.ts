import type {
  FirefoxBrowserExtension,
  OnHeadersReceivedOptions,
} from "Js/types/browser";

// @ts-ignore
const be = browser as FirefoxBrowserExtension;

export function openOptionsPage(): void {
  be.runtime.openOptionsPage();
}

export function getManifest() {
  return be.runtime.getManifest();
}

export function onInstalled() {
  return be.runtime.onInstalled;
}

// https://stackoverflow.com/a/15534822/2601552
export function onHeadersReceived(options: OnHeadersReceivedOptions) {
  // coerce to chrome type here so we don't have to write types for Firefox in
  // addition to types for Chrome
  return be.webRequest.onHeadersReceived.addListener(
    options.addListener,
    options.config,
    options.permissions
  );
}
