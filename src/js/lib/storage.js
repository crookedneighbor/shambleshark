import {
  getStorage,
  setStorage
} from 'BrowserStorage'

export function get (keys) {
  let key
  const singleKey = !Array.isArray(keys)

  if (singleKey) {
    key = keys
    keys = [keys]
  }

  return getStorage(keys).then(function (result) {
    if (singleKey) {
      return result[key]
    }

    return result
  })
}

export function set (obj) {
  return setStorage(obj)
}

export default {
  get,
  set
}
