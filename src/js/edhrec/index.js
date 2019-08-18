import bus from 'framebus'

export default function start () {
  bus.emit('EDHREC_READY', function () {
    const buttons = Array.from(document.querySelectorAll('.toggle-card-in-decklist-button'))

    buttons.forEach((btn) => {
      const cardName = btn.getAttribute('onclick').replace('toggleCardInDecklistButtonOnClick(event,\'', '').replace('\')', '').replace(/\\/g, '')
      const newButton = document.createElement('div')
      newButton.classList.add('toggle-card-in-decklist-button')
      newButton.style.background = '#634496'
      newButton.innerHTML = btn.innerHTML
      const icon = newButton.querySelector('.toggle-card-in-decklist-button-icon')

      // TODO set data-present-in-scryafll-decklist and gylphicon class
      // on initialization

      newButton.addEventListener('click', (e) => {
        e.preventDefault()
        icon.classList.toggle('glyphicon-plus')
        icon.classList.toggle('glyphicon-ok')

        if (!newButton.hasAttribute('data-present-in-scryfall-decklist')) {
          newButton.setAttribute('data-present-in-scryfall-decklist', true)
          bus.emit('ADD_CARD_FROM_EDHREC', {
            cardName
          })
        } else {
          // TODO remove from scryfall deck
          newButton.removeAttribute('data-present-in-scryfall-decklist')
        }
      })

      const parentNode = btn.parentNode

      parentNode.appendChild(newButton)
      parentNode.removeChild(btn)
    })

    // TODO set an observer instead to know when scroll into view
    // can be used?
    setTimeout(() => {
      document.getElementById('cardlists').scrollIntoView()
    }, 100)
  })
}

start()
