import bus from 'framebus'
import Feature from '../../feature'
import { sections } from '../../constants'
import iframe from '../../../lib/iframe'
import createElement from '../../../lib/create-element'
import mutation from '../../../lib/mutation'
import './index.css'

import {
  TAGGER_SYMBOL,
  ILLUSTRATION_SYMBOL,
  CARD_SYMBOL,
  PRINTING_SYMBOL,
  CREATURE_BODY_SYMBOL,
  DEPICTS_SYMBOL,
  SEEN_BEFORE_SYMBOL,
  BETTER_THAN_SYMBOL,
  COLORSHIFTED_SYMBOL,
  MIRRORS_SYMBOL,
  RELATED_TO_SYMBOL,
  SIMILAR_TO_SYMBOL
} from '../../../resources/svg'

const TAG_SYMBOLS = {
  ILLUSTRATION_TAG: ILLUSTRATION_SYMBOL,
  ORACLE_CARD_TAG: CARD_SYMBOL,
  PRINTING_TAG: PRINTING_SYMBOL
}

const RELATIONSHIP_SYMBOLS = {
  BETTER_THAN: BETTER_THAN_SYMBOL,
  COLORSHIFTED: COLORSHIFTED_SYMBOL,
  COMES_AFTER: SEEN_BEFORE_SYMBOL,
  COMES_BEFORE: SEEN_BEFORE_SYMBOL,
  DEPICTED_IN: DEPICTS_SYMBOL,
  DEPICTS: DEPICTS_SYMBOL,
  MIRRORS: MIRRORS_SYMBOL,
  REFERENCED_BY: DEPICTS_SYMBOL,
  REFERENCES_TO: DEPICTS_SYMBOL,
  RELATED_TO: RELATED_TO_SYMBOL,
  SIMILAR_TO: SIMILAR_TO_SYMBOL,
  WITHOUT_BODY: CREATURE_BODY_SYMBOL,
  WITH_BODY: CREATURE_BODY_SYMBOL,
  WORSE_THAN: BETTER_THAN_SYMBOL
}

const SYMBOLS_THAT_MUST_BE_FLIPPED = {
  WITHOUT_BODY: true
}

const SYMBOLS_THAT_MUST_BE_REVERSED = {
  COMES_BEFORE: true,
  DEPICTS: true,
  REFERENCES_TO: true,
  BETTER_THAN: true
}

// TODOS nice to haves
// * handle small screens
// * simple animations when opening the tag menu
// * fixup Firefox styles

function getTaggerData (link) {
  const parts = link.split('https://scryfall.com/card/')[1].split('/')

  return {
    set: parts[0],
    number: parts[1]
  }
}

function convertPageLinkToTagger (data) {
  return `https://tagger.scryfall.com/card/${data.set}/${data.number}`
}

class TaggerLink extends Feature {
  async run () {
    bus.on('TAGGER_READY', () => {
      mutation.ready('.card-grid-item a.card-grid-item-card', (link) => {
        const button = this.makeButton(link.href)

        link.parentNode.appendChild(button)
      })
    })

    iframe.create({
      id: 'tagger-link-tagger-iframe',
      src: 'https://tagger.scryfall.com'
    })
  }

  makeButton (link) {
    const taggerData = getTaggerData(link)
    const taggerLink = convertPageLinkToTagger(taggerData)
    const button = createElement(`<a
      href="${taggerLink}"
      class="tagger-link-button button-n primary icon-only subdued"
      alt="Open in Tagger"
    >
      <div class="tagger-link-hover">
      <div class="menu-container"></div>
      <!-- TODO use constant -->
      <img src="https://assets.scryfall.com/assets/spinner-0e5953300e953759359ad94bcff35ac64ff73a403d3a0702e809d6c43e7e5ed5.gif" class="modal-dialog-spinner" aria-hidden="true">
      </div>
      ${TAGGER_SYMBOL}
    </a>`).firstChild

    button.addEventListener('mouseover', this.createMouseoverHandler(button, taggerData))

    return button
  }

  createMouseoverHandler (button, taggerData) {
    let request
    const self = this

    const tooltip = button.querySelector('.tagger-link-hover')

    return (event) => {
      const pageWidth = document.body.clientWidth
      const mousePosition = event.pageX

      // if the mouse position is just over half the page
      // switch tooltip to the left instead of the default right
      if (mousePosition / pageWidth > 0.55) {
        tooltip.classList.add('left-aligned')
      } else {
        tooltip.classList.remove('left-aligned')
      }

      if (!request) {
        request = new Promise((resolve) => {
          bus.emit('TAGGER_TAGS_REQUEST', taggerData, resolve)
        }).then(payload => {
          self.addTags(tooltip, payload)
        })
      }

      return request
    }
  }

  addTags (tooltip, payload) {
    const menuContainer = tooltip.querySelector('.menu-container')
    const artMenu = document.createElement('ul')
    const cardMenu = document.createElement('ul')
    const spinner = tooltip.querySelector('.modal-dialog-spinner')

    const tags = this.collectTags(payload)
    const relationships = this.collectRelationships(payload)
    const artEntries = tags.art.concat(tags.print).concat(relationships.art)
    const oracleEntries = tags.oracle.concat(relationships.oracle)

    spinner.classList.add('hidden')

    if (artEntries.length) {
      menuContainer.appendChild(artMenu)
      this.addTagsToMenu(artEntries, artMenu)
    }

    if (oracleEntries.length) {
      menuContainer.appendChild(cardMenu)
      this.addTagsToMenu(oracleEntries, cardMenu)
    }

    if (menuContainer.children.length === 0) {
      menuContainer.innerText = 'No tags found. Add some!'
    }

    tooltip.style.top = `-${Math.floor(tooltip.offsetHeight / 3.75)}px`
  }

  collectTags (payload) {
    const tags = {
      art: [],
      oracle: [],
      print: []
    }
    const tagToCollectionMap = {
      ILLUSTRATION_TAG: 'art',
      ORACLE_CARD_TAG: 'oracle',
      PRINTING_TAG: 'print'
    }

    payload.taggings.forEach(t => {
      const type = t.tag.type
      const key = tagToCollectionMap[type]
      const tagsByType = tags[key]
      const symbol = TAG_SYMBOLS[type]

      if (tagsByType) {
        tagsByType.push({
          symbol,
          isTag: true,
          name: t.tag.name
        })
      }
    })

    return tags
  }

  collectRelationships (payload) {
    const relationships = {
      art: [],
      oracle: []
    }
    const typeToRelationshipMap = {
      illustrationId: 'art',
      oracleId: 'oracle'
    }

    payload.relationships.forEach(r => {
      let name, type
      let liClass = ''
      const isTheRelatedTag = payload[r.foreignKey] === r.relatedId
      if (isTheRelatedTag) {
        name = r.contentName
        type = r.classifier
      } else {
        name = r.relatedName
        type = r.classifierInverse
      }

      const symbol = RELATIONSHIP_SYMBOLS[type] || ''

      if (type in SYMBOLS_THAT_MUST_BE_FLIPPED) {
        liClass = 'icon-upside-down'
      } else if (type in SYMBOLS_THAT_MUST_BE_REVERSED) {
        liClass = 'icon-flipped'
      }

      const relationshipsFromType = relationships[typeToRelationshipMap[r.foreignKey]]

      if (relationshipsFromType) {
        relationshipsFromType.push({
          name,
          symbol,
          liClass
        })
      }
    })

    return relationships
  }

  addTagsToMenu (tags, menu) {
    // copied from the mdn page on array.sort
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    tags.sort((a, b) => {
      const nameA = a.name.toUpperCase() // ignore upper and lowercase
      const nameB = b.name.toUpperCase() // ignore upper and lowercase

      if (a.isTag && !b.isTag) {
        return -1
      } else if (!a.isTag && b.isTag) {
        return 1
      }

      if (nameA < nameB) {
        return -1
      }

      if (nameA > nameB) {
        return 1
      }

      // names must be equal
      return 0
    })

    tags.forEach(tag => {
      if (menu.children.length > 8) {
        return
      }

      if (menu.children.length === 8) {
        menu.appendChild(createElement(`<li>+ ${tags.length - 7} more</li>`))

        return
      }

      const li = createElement(`<li>
        ${tag.symbol} ${tag.name}
        </li>`)

      if (tag.liClass) {
        li.firstChild.classList.add(tag.liClass)
      }
      menu.appendChild(li)
    })
  }
}

TaggerLink.metadata = {
  id: 'tagger-link',
  title: 'Tagger Link',
  section: sections.SEARCH_RESULTS,
  description: 'Provide a button to card\'s tagger page from search results.'
}
TaggerLink.settingsDefaults = {
  enabled: true
}

export default TaggerLink
