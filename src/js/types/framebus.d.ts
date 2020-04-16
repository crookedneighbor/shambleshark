declare module "framebus" {
  export function on(event: string, cb: Function): void;
  export function emit(event: string, ...args: any[]): void;
}
