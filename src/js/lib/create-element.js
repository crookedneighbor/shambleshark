export default function createElement(string, options = {}) {
  const container = options.container || 'body'
  const fragment = document.createDocumentFragment()
  const parser = new DOMParser()
  const parsed = parser.parseFromString(string, 'text/html')
  const elements = parsed[container].children

  Array.from(elements).forEach(e => fragment.appendChild(e))

  return fragment
}
