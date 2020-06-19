import type { OnHeadersReceivedOptions } from "Js/types/browser";

export function openOptionsPage(): void {
  chrome.runtime.openOptionsPage();
}

export function onInstalled(): chrome.runtime.RuntimeInstalledEvent {
  return chrome.runtime.onInstalled;
}

// https://stackoverflow.com/a/15534822/2601552
export function onHeadersReceived(options: OnHeadersReceivedOptions): void {
  return chrome.webRequest.onHeadersReceived.addListener(
    options.addListener,
    options.config,
    options.permissions
  );
}

export function getURL(path: string): string {
  if (typeof chrome === "undefined") {
    return "";
  }

  return chrome.runtime.getURL(path);
}
