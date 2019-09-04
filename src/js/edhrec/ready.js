import bus from 'framebus'
import mutation from '../lib/mutation'

function removeElement (element) {
  element.parentNode.removeChild(element)
}

function setCardInDeckState (btn, cardInDeck) {
  const icon = btn.querySelector('.toggle-card-in-decklist-button-icon')
  const iconClass = `glyphicon-${cardInDeck ? 'ok' : 'plus'}`

  icon.classList.remove('glyphicon-plus')
  icon.classList.remove('glyphicon-ok')

  btn.setAttribute('data-present-in-scryfall-decklist', String(cardInDeck))
  icon.classList.add(iconClass)
}

export default function start () {
  // TODO move to constant
  bus.emit('EDHREC_READY', function ({ cardsInDeck }) {
    mutation.ready('.toggle-card-in-decklist-button', (btn) => {
      const onclick = btn.getAttribute('onclick')

      if (!onclick) {
        return
      }

      const newButton = document.createElement('div')

      newButton.classList.add('toggle-card-in-decklist-button')
      // TODO move to constant
      newButton.style.background = '#634496'

      const cardName = onclick.replace('toggleCardInDecklistButtonOnClick(event,\'', '').replace('\')', '').replace(/\\/g, '')
      const cardInDeck = cardsInDeck[cardName] === true

      newButton.innerHTML = btn.innerHTML

      setCardInDeckState(newButton, cardInDeck)

      newButton.addEventListener('click', (e) => {
        e.preventDefault()

        const inDeckAlready = newButton.getAttribute('data-present-in-scryfall-decklist') === 'true'
        const eventToEmit = inDeckAlready ? 'REMOVE_CARD_FROM_EDHREC' : 'ADD_CARD_FROM_EDHREC'

        setCardInDeckState(newButton, !inDeckAlready)

        bus.emit(eventToEmit, {
          cardName
        })
      })

      const parentNode = btn.parentNode

      parentNode.appendChild(newButton)
      parentNode.removeChild(btn)
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
