import bus from 'framebus'
import mutation from '../lib/mutation'

function removeElement (element) {
  element.parentNode.removeChild(element)
}

export default function start () {
  bus.emit('EDHREC_READY', function () {
    mutation.ready('.toggle-card-in-decklist-button', (btn) => {
      const onclick = btn.getAttribute('onclick')
      const cardName = onclick.replace('toggleCardInDecklistButtonOnClick(event,\'', '').replace('\')', '').replace(/\\/g, '')
      btn.style.background = '#634496'
      const icon = btn.querySelector('.toggle-card-in-decklist-button-icon')

      // TODO set data-present-in-scryafll-decklist and gylphicon class
      // on initialization

      btn.addEventListener('click', (e) => {
        e.preventDefault()

        icon.classList.toggle('glyphicon-plus')
        icon.classList.toggle('glyphicon-ok')

        if (!btn.hasAttribute('data-present-in-scryfall-decklist')) {
          btn.setAttribute('data-present-in-scryfall-decklist', true)
          bus.emit('ADD_CARD_FROM_EDHREC', {
            cardName
          })
        } else {
          bus.emit('REMOVE_CARD_FROM_EDHREC', {
            cardName
          })
          btn.removeAttribute('data-present-in-scryfall-decklist')
        }
      })
    })

    mutation.ready('.cards a', (element) => {
      element.removeAttribute('href')
    })

    mutation.ready('#leaderboard', removeElement)
    mutation.ready('.navbar-header .navbar-toggle', removeElement)
    mutation.ready('.edhrec2__panels-outer', removeElement)
    mutation.ready('.decklist', removeElement)
    mutation.ready('.footer', removeElement)
  })
}
