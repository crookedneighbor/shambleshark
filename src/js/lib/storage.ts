import { getStorage, setStorage } from "Browser/storage";

import type { AnyJsonValue } from "Js/types/json";

export function get(key: string): Promise<AnyJsonValue> {
  return getStorage([key]).then((result) => {
    return result[key] as AnyJsonValue;
  });
}

export function set(key: string, value: AnyJsonValue): Promise<void> {
  return setStorage({
    [key]: value,
  });
}

export default {
  get,
  set,
};
