// adapted from https://stackoverflow.com/a/33145009/2601552
export default function embed () {
  const s = document.createElement('script')
  s.src = chrome.runtime.getURL('scryfallEmbed.bundle.js')
  s.onload = function () {
    this.remove()
  };

  (document.head || document.documentElement).appendChild(s)
}
