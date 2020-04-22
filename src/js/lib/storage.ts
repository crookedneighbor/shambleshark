import { browser } from "webextension-polyfill-ts";

export function get(...keys: string[]): any | any[] {
  return browser.storage.sync.get(keys).then((result) => {
    if (keys.length === 1) {
      return result[keys[0]];
    }

    return result;
  });
}

export function set(obj: string | { [key: string]: any }, value?: any) {
  if (typeof obj === "string") {
    obj = {
      [obj]: value,
    };
  }

  return browser.storage.sync.set(obj);
}

export default {
  get,
  set,
};
