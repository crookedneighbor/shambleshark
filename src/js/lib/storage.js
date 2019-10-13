import {
  getStorage,
  setStorage
} from 'Browser/storage'

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

export function set (obj, value) {
  const singleKey = typeof obj === 'string'

  if (singleKey) {
    obj = {
      [obj]: value
    }
  }

  return setStorage(obj)
}

export default {
  get,
  set
}
