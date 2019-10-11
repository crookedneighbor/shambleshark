export function getStorage (keys) {
  return new Promise(function (resolve) {
    chrome.storage.sync.get(keys, resolve)
  })
}

export function setStorage (obj) {
  return new Promise(function (resolve) {
    chrome.storage.sync.set(obj, resolve)
  })
}
