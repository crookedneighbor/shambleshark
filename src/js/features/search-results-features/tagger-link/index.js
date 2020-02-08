import Feature from '../../feature'
import { sections } from '../../constants'
import mutation from '../../../lib/mutation'
import injectCSS from '../../../lib/inject-css'
import css from './index.css'

import {
  TAGGER_SYMBOL
} from '../../../resources/svg'

injectCSS(css)

function convertPageLinkToTagger (link) {
  const parts = link.split('https://scryfall.com/card/')[1].split('/')

  return `https://tagger.scryfall.com/card/${parts[0]}/${parts[1]}`
}

function makeButton (link) {
  const taggerLink = convertPageLinkToTagger(link)
  const button = document.createElement('a')

  button.href = taggerLink
  button.classList.add('tagger-link-button', 'button-n', 'primary', 'icon-only', 'subdued')
  button.alt = 'Open in Tagger'
  button.innerHTML = TAGGER_SYMBOL

  return button
}

class TaggerLink extends Feature {
  async run () {
    mutation.ready('.card-grid-item a.card-grid-item-card', (link) => {
      const button = makeButton(link.href)

      link.parentNode.appendChild(button)
    })
  }
}

TaggerLink.metadata = {
  id: 'tagger-link',
  futureFeature: true,
  title: 'Tagger Link',
  section: sections.SEARCH_RESULTS,
  description: 'Provide a button to card\'s tagger page from search results.'
}
TaggerLink.settingsDefaults = {
  enabled: true
}

export default TaggerLink
