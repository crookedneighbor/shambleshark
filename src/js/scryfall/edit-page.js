import openEDHRecFrame from './open-edhrec-frame'
import bus from 'framebus'

function makeEDHRecButton () {
  const button = document.createElement('button')
  // TODO extract modal construction out or
  // change to an inline panel
  const modal = document.createElement('div')
  modal.id = 'edhrec-modal'
  modal.classList.add('modal-dialog-overlay')
  modal.style.display = 'none'

  modal.innerHTML = `
<div class="modal-dialog">
  <h6 class="modal-dialog-title">
    EDHRec Page
    <button type="button" title="Close this dialog" class="modal-dialog-close">
      <span class="vh">Close this dialog</span> <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M217.5 256l137.2-137.2c4.7-4.7 4.7-12.3 0-17l-8.5-8.5c-4.7-4.7-12.3-4.7-17 0L192 230.5 54.8 93.4c-4.7-4.7-12.3-4.7-17 0l-8.5 8.5c-4.7 4.7-4.7 12.3 0 17L166.5 256 29.4 393.2c-4.7 4.7-4.7 12.3 0 17l8.5 8.5c4.7 4.7 12.3 4.7 17 0L192 281.5l137.2 137.2c4.7 4.7 12.3 4.7 17 0l8.5-8.5c4.7-4.7 4.7-12.3 0-17L217.5 256z"></path></svg>
    </button>
  </h6>

  <div class="modal-dialog-content">
    <img src="https://assets.scryfall.com/assets/spinner-0e5953300e953759359ad94bcff35ac64ff73a403d3a0702e809d6c43e7e5ed5.gif" class="modal-dialog-spinner">
  </div>
  <!---->
  <div class="modal-dialog-stage" style="display:none">
  </div>
</div>
`

  // TODO close when backdrop is clicked
  // TODO refresh page on close
  modal.querySelector('.modal-dialog-close').addEventListener('click', () => {
    modal.style.display = 'none'
    modal.querySelector('.modal-dialog-stage').innerHTML = ''
    modal.querySelector('.modal-dialog-stage').style.display = 'none'
    modal.querySelector('.modal-dialog-content').removeAttribute('style')
  })

  button.classList.add('button-n', 'tiny')
  button.innerText = 'EDHRec Suggestions'

  button.addEventListener('click', (e) => {
    e.preventDefault()

    bus.emit('REQUEST_COMMANDERS', ({ commanders }) => {
      document.getElementById('deckbuilder').appendChild(modal)
      modal.removeAttribute('style')

      openEDHRecFrame(commanders)
    })
  })

  return button
}

export default function () {
  const buttonsContainer = document.querySelector('.deckbuilder-toolbar-items-right')
  const edhRecButton = makeEDHRecButton()

  // TODO extract
  const s = document.createElement('script')
  s.src = chrome.runtime.getURL('scryfallEmbed.bundle.js')
  s.onload = function () {
    this.remove()
  };
  (document.head || document.documentElement).appendChild(s)

  // TODO only put edhrec button on commander decks
  // TODO only put edhrec button on when configured in popup
  buttonsContainer.appendChild(edhRecButton)
}
