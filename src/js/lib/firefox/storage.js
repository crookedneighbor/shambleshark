export function getStorage (keys) {
  return browser.storage.sync.get(keys)
}

export function setStorage (obj, cb) {
  return browser.storage.sync.set(obj)
}
