import EDHRecSuggestions from '../features/edhrec-suggestions'

export default function () {
  const feature = new EDHRecSuggestions()
  feature.addToDeckEditPage()

  // TODO extract
  const s = document.createElement('script')
  s.src = chrome.runtime.getURL('scryfallEmbed.bundle.js')
  s.onload = function () {
    this.remove()
  };
  (document.head || document.documentElement).appendChild(s)
}
