import bus from 'framebus'
import openEDHRecFrame from './open-edhrec-frame'
import makeEDHRecModal from './make-edhrec-modal'

export default function makeEDHRecButton () {
  const button = document.createElement('button')
  const modal = makeEDHRecModal()

  button.id = 'edhrec-suggestions'
  button.classList.add('button-n', 'tiny')
  button.innerText = 'EDHRec Suggestions'

  button.addEventListener('click', (e) => {
    e.preventDefault()

    bus.emit('REQUEST_DECK', (deck) => {
      document.getElementById('deckbuilder').appendChild(modal)
      modal.removeAttribute('style')

      openEDHRecFrame(deck)
    })
  })

  return button
}
