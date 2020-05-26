// TODO no any
export function getStorage(keys: string[]): Promise<Record<string, any>> {
  return new Promise(function (resolve) {
    chrome.storage.sync.get(keys, resolve);
  });
}

export function setStorage(obj: Record<string, any>): Promise<void> {
  return new Promise(function (resolve) {
    chrome.storage.sync.set(obj, resolve);
  });
}
