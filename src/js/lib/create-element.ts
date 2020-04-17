export default function createElement(
  string: string,
  options?: { container: keyof Document }
) {
  const container = options?.container || "body";
  const fragment = document.createDocumentFragment();
  const parser = new window.DOMParser();
  const parsed: Document = parser.parseFromString(string, "text/html");
  const elements = parsed.getElementsByTagName(container);

  Array.from(elements).forEach((e) => fragment.appendChild(e));

  return fragment;
}
