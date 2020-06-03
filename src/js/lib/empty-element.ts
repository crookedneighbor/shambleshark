// https://stackoverflow.com/a/5057771/2601552
export default function emptyElement(node: HTMLElement): void {
  while (node.hasChildNodes()) {
    if (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }
  node.innerText = "";
}
