export function getStorage(keys: string[]): Promise<Record<string, unknown>> {
  return new Promise(function (resolve) {
    chrome.storage.sync.get(keys, resolve);
  });
}

export function setStorage(obj: Record<string, unknown>): Promise<void> {
  return new Promise(function (resolve) {
    chrome.storage.sync.set(obj, resolve);
  });
}
