// from https://github.com/microsoft/TypeScript/issues/1897#issuecomment-338650717
export type AnyJson = boolean | number | string | JsonArray | JsonMap;
export type AnyJsonValue = AnyJson | null;
export interface JsonMap {
  [key: string]: AnyJsonValue;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JsonArray extends Array<AnyJsonValue> {}
