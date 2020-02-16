import DialogInterface from './dialog-interface'
import createElement from '../create-element'
import injectCSS from '../inject-css'
import css from './drawer.css'

injectCSS(css)

export default class Drawer extends DialogInterface {
  open () {
    super.open()

    this.element.classList.add('open')
  }

  close () {
    super.close()

    this.element.classList.remove('open')
  }

  getScrollableElement () {
    return this._scrollableEl
  }

  _constructElement (options) {
    const titleId = `drawer-title-${options.id}`

    this.position = options.position || 'right'

    const drawer = createElement(`<div
      class="drawer-dialog-overlay modal-dialog-overlay"
      aria-modal="true"
      role="dialog"
      aria-labelledby="${titleId}"
    >
      <!-- sometimes modal dialog classes are used to take advantage of existing style rules on the site -->
      <div class="drawer-dialog drawer-dialog-position-${this.position}">
        <h6 class="drawer-dialog-title modal-dialog-title">
          <span class='dialog-title-content' id="${titleId}"></span>
          <button type="button" title="${this._getCloseButtonMessage(true)}" class="dialog-close modal-dialog-close">
            <span class="vh">Close this dialog</span> <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M217.5 256l137.2-137.2c4.7-4.7 4.7-12.3 0-17l-8.5-8.5c-4.7-4.7-12.3-4.7-17 0L192 230.5 54.8 93.4c-4.7-4.7-12.3-4.7-17 0l-8.5 8.5c-4.7 4.7-4.7 12.3 0 17L166.5 256 29.4 393.2c-4.7 4.7-4.7 12.3 0 17l8.5 8.5c4.7 4.7 12.3 4.7 17 0L192 281.5l137.2 137.2c4.7 4.7 12.3 4.7 17 0l8.5-8.5c4.7-4.7 4.7-12.3 0-17L217.5 256z"></path></svg>
          </button>
        </h6>

        <div class="dialog-loader drawer-dialog-content" role="alert">
          <img src="https://assets.scryfall.com/assets/spinner-0e5953300e953759359ad94bcff35ac64ff73a403d3a0702e809d6c43e7e5ed5.gif" class="modal-dialog-spinner" aria-hidden="true">
        </div>
      <!---->
        <div class="dialog-content-container drawer-dialog-stage loading">
          <div role="alert" aria-label="${options.contentMessage || 'Dialog Loaded'}"></div>
          <div class="dialog-content drawer-dialog-stage-content"></div>
        </div>
      </div>
    </div>`).firstChild

    drawer.querySelector('.dialog-close').addEventListener('click', () => {
      this.close()
    })

    this._scrollableEl = drawer.querySelector('.drawer-dialog')

    if (options.onScroll) {
      this._scrollableEl.addEventListener('scroll', () => {
        this.triggerOnScroll()
      })
    }

    return drawer
  }
}
