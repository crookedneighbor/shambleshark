const CLOSE_BUTTON_LOADING_MESSAGE = 'Dialog is loading. You may cancel this dialog by using this button.'

function noop () {
  // do nothing!
}

export default class Modal {
  constructor (options = {}) {
    this._isOpen = false
    this._originalContent = options.content || ''
    this._resetContentOnClose = Boolean(options.resetContentOnClose)
    this._onClose = options.onClose || noop
    this._onOpen = options.onOpen || noop

    this._originalHeader = options.header

    if (options.headerSymbol) {
      this._originalHeader = `
        <span class="modal-dialog-title-symbol">${options.headerSymbol || ''}</span>

        ${this._originalHeader}
      `
    }

    this.element = this._constructModalElement(options)
    this._contentNodeContainer = this.element.querySelector('.modal-dialog-stage')
    this._contentNode = this._contentNodeContainer.querySelector('.modal-dialog-stage-content')
    this._loaderNode = this.element.querySelector('.modal-dialog-content')
    this._headerNode = this.element.querySelector('.modal-dialog-title-content')
  }

  setContent (content) {
    if (typeof content === 'string') {
      this._contentNode.innerHTML = content
    } else {
      this._contentNode.innerHTML = ''
      this._contentNode.appendChild(content)
    }
  }

  resetHeader () {
    this.setHeader(this._originalHeader)
  }

  setHeader (value) {
    this._headerNode.innerHTML = value
  }

  setLoading (state) {
    const closeBtn = this.element.querySelector('.modal-dialog-close')

    if (state) {
      this._contentNodeContainer.style.display = 'none'
      this._loaderNode.removeAttribute('style')
      closeBtn.title = CLOSE_BUTTON_LOADING_MESSAGE
    } else {
      this._contentNodeContainer.removeAttribute('style')
      this._loaderNode.style.display = 'none'
      closeBtn.title = 'Close this dialog.'
    }
  }

  open () {
    this.element.style.display = ''
    this._isOpen = true

    this._onOpen(this)

    this.element.querySelector('.modal-dialog-close').focus()
  }

  close () {
    this.element.style.display = 'none'
    this._isOpen = false

    if (this._resetContentOnClose) {
      this.setContent(this._originalContent)
    }
    this._onClose(this)
  }

  _onEscKey (event) {
    if (!this._isOpen) {
      return
    }

    if (event.key === 'Escape') {
      event.stopPropagation()

      this.close()
    }
  }

  _constructModalElement (options) {
    const modal = document.createElement('div')
    const titleId = `modal-title-${options.id}`
    const header = this._originalHeader

    document.addEventListener('keyup', this._onEscKey.bind(this))

    modal.id = options.id
    modal.classList.add('modal-dialog-overlay')
    modal.setAttribute('aria-modal', 'true')
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-labelledby', titleId)

    if (!options.open) {
      modal.style.display = 'none'
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <h6 class="modal-dialog-title">
          <span class='modal-dialog-title-content' id="${titleId}">${header}</span>
          <button type="button" title="${CLOSE_BUTTON_LOADING_MESSAGE}" class="modal-dialog-close">
            <span class="vh">Close this dialog</span> <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M217.5 256l137.2-137.2c4.7-4.7 4.7-12.3 0-17l-8.5-8.5c-4.7-4.7-12.3-4.7-17 0L192 230.5 54.8 93.4c-4.7-4.7-12.3-4.7-17 0l-8.5 8.5c-4.7 4.7-4.7 12.3 0 17L166.5 256 29.4 393.2c-4.7 4.7-4.7 12.3 0 17l8.5 8.5c4.7 4.7 12.3 4.7 17 0L192 281.5l137.2 137.2c4.7 4.7 12.3 4.7 17 0l8.5-8.5c4.7-4.7 4.7-12.3 0-17L217.5 256z"></path></svg>
          </button>
        </h6>

        <div class="modal-dialog-content" role="alert" aria-label="${options.loadingMessage || 'Loading'}">
          <img src="https://assets.scryfall.com/assets/spinner-0e5953300e953759359ad94bcff35ac64ff73a403d3a0702e809d6c43e7e5ed5.gif" class="modal-dialog-spinner" aria-hidden="true">
        </div>
      <!---->
        <div class="modal-dialog-stage" style="position:fixed;left:-100%;visibility:hidden">
          <div role="alert" aria-label="${options.contentMessage || 'Modal Loaded'}"></div>
          <div class="modal-dialog-stage-content">${this._originalContent}</div>
        </div>
      </div>
      `
    modal.querySelector('.modal-dialog-close').addEventListener('click', () => {
      this.close()
    })

    return modal
  }
}
