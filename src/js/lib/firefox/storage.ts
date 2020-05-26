import type { FirefoxBrowserExtension } from "Js/types/browser";

// @ts-ignore
const be = browser as FirefoxBrowserExtension;

// TODO no any
export function getStorage(keys: string[]): Promise<Record<string, any>> {
  return be.storage.sync.get(keys);
}

export function setStorage(obj: Record<string, any>): Promise<void> {
  return be.storage.sync.set(obj);
}
