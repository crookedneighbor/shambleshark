import type {
  FirefoxBrowserExtension,
  OnHeadersReceivedOptions,
} from "Js/types/browser";

export function openOptionsPage(): void {
  browser.runtime.openOptionsPage();
}

export function onInstalled(): FirefoxBrowserExtension["runtime"]["onInstalled"] {
  return browser.runtime.onInstalled;
}

// https://stackoverflow.com/a/15534822/2601552
export function onHeadersReceived(options: OnHeadersReceivedOptions): void {
  return browser.webRequest.onHeadersReceived.addListener(
    options.addListener,
    options.config,
    options.permissions
  );
}

export function getURL(path: string): string {
  if (typeof browser === "undefined") {
    return "";
  }

  return browser.runtime.getURL(path);
}
