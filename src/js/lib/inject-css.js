import createElement from './create-element'

export default function injectCSS (css) {
  const frag = createElement(`<style>
    ${css}
</style>`, {
    container: 'head'
  })

  document.head.appendChild(frag)
}
