type Container = "body" | "head";

export default function createElement(
  string: string,
  options?: { container: Container }
) {
  const container = options?.container || "body";
  const fragment = document.createDocumentFragment();
  const parser = new window.DOMParser();
  const parsed: Document = parser.parseFromString(string, "text/html");
  const elements = parsed.getElementsByTagName(container)[0].children;

  Array.from(elements).forEach((e) => fragment.appendChild(e));

  return fragment;
}