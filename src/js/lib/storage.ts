import { getStorage, setStorage } from "Browser/storage";

// TODO no any
export function get(key: string): any {
  return getStorage([key]).then((result) => {
    return result[key];
  });
}

export function set(key: string, value: any) {
  return setStorage({
    [key]: value,
  });
}

export default {
  get,
  set,
};
