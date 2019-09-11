export default function makeEDHRecModal () {
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
  <div class="modal-dialog-stage" style="position:fixed;left:-100%;visibility:hidden">
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

  return modal
}
