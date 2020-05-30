import type { FirefoxBrowserExtension } from "Js/types/browser";

// Too much work for too little gain to handle this the TS way
// so just ignore it and work around it for now
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const be = browser as FirefoxBrowserExtension;

// TODO no any
export function getStorage(keys: string[]): Promise<Record<string, any>> {
  return be.storage.sync.get(keys);
}

export function setStorage(obj: Record<string, any>): Promise<void> {
  return be.storage.sync.set(obj);
}
