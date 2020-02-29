import deckParser from 'Lib/deck-parser'
import createElement from '../../create-element'

export default class DeckSectionChooser {
  constructor (options = {}) {
    const deck = options.deck
    const id = options.id
    this.element = createElement(`<div
      ${id ? 'id="' + id + '"' : ''}
      class="form-row-content-band"
    >
        <select class="section-selection form-input auto small-select">
          <option value="" selected disabled>Section (auto)</option>
        </select>
      </div>
    `).firstChild
    this.sectionSelect = this.element.querySelector('select.section-selection')

    deckParser.getSections(deck).sort().forEach(section => {
      const option = document.createElement('option')
      const sectionLabel = section[0].toUpperCase() + section.slice(1)

      option.value = section
      option.innerText = `Add to ${sectionLabel}`

      this.sectionSelect.appendChild(option)
    })
  }

  getValue () {
    return this.sectionSelect.value
  }
}
