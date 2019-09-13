import bus from 'framebus'
import openEDHRecFrame from './open-edhrec-frame'

export default function makeEDHRecButton (modal) {
  const button = document.createElement('button')

  button.id = 'edhrec-suggestions'
  button.classList.add('button-n', 'tiny')
  button.innerText = 'EDHRec Suggestions'

  button.addEventListener('click', (e) => {
    e.preventDefault()

    bus.emit('REQUEST_DECK', (deck) => {
      openEDHRecFrame(deck, modal)
    })
  })

  return button
}
