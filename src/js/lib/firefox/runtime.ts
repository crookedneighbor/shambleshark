import type {
  FirefoxBrowserExtension,
  OnHeadersReceivedOptions,
} from "Js/types/browser";

// Too much work for too little gain to handle this the TS way
// so just ignore it and work around it for now
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
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
  return be.webRequest.onHeadersReceived.addListener(
    options.addListener,
    options.config,
    options.permissions
  );
}
