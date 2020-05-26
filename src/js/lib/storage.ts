import { getStorage, setStorage } from "Browser/storage";

// TODO no any
export function get(...keys: string[]): any | any[] {
  return getStorage(keys).then((result) => {
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

  return setStorage(obj);
}

export default {
  get,
  set,
};
