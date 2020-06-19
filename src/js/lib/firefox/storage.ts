export function getStorage(keys: string[]): Promise<Record<string, unknown>> {
  return browser.storage.sync.get(keys);
}

export function setStorage(obj: Record<string, unknown>): Promise<void> {
  return browser.storage.sync.set(obj);
}
