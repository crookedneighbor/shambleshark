export function get (keys) {
  let key
  const singleKey = !Array.isArray(keys)

  if (singleKey) {
    key = keys
    keys = [keys]
  }

  return new Promise(function (resolve) {
    chrome.storage.sync.get(keys, function (result) {
      if (singleKey) {
        result = result[key]
      }

      resolve(result)
    })
  })
}

export function set (obj) {
  return new Promise(function (resolve) {
    chrome.storage.sync.set(obj, resolve)
  })
}

export default {
  get,
  set
}
