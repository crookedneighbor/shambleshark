// https://stackoverflow.com/a/5057771/2601552
export default function emptyElement(node: HTMLElement): void {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild!);
  }
  node.innerText = "";
}
