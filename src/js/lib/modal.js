function noop () {
  // do nothing!
}

export default class Modal {
  constructor (options = {}) {
    this._originalContent = options.content || ''
    this._resetContentOnClose = Boolean(options.resetContentOnClose)
    this._onClose = options.onClose || noop
    this._onOpen = options.onOpen || noop

    this.element = this._constructModalElement(options)
    this._contentNode = this.element.querySelector('.modal-dialog-stage')
    this._loaderNode = this.element.querySelector('.modal-dialog-content')
    this._titleNode = this.element.querySelector('.modal-dialog-title-content')
  }

  setContent (content) {
    if (typeof content === 'string') {
      this._contentNode.innerHTML = content
    } else {
      this._contentNode.innerHTML = ''
      this._contentNode.appendChild(content)
    }
  }

  setTitle (value) {
    this._titleNode.innerHTML = value
  }

  setLoading (state) {
    if (state) {
      this._contentNode.style.display = 'none'
      this._loaderNode.removeAttribute('style')
    } else {
      this._contentNode.removeAttribute('style')
      this._loaderNode.style.display = 'none'
    }
  }

  open () {
    this.element.style.display = ''

    this._onOpen(this)
  }

  close () {
    this.element.style.display = 'none'

    if (this._resetContentOnClose) {
      this.setContent(this._originalContent)
    }
    this._onClose(this)
  }

  _constructModalElement (options) {
    const modal = document.createElement('div')

    modal.id = options.id
    modal.classList.add('modal-dialog-overlay')

    if (!options.open) {
      modal.style.display = 'none'
    }

    modal.innerHTML = `
      <div class="modal-dialog">
      <h6 class="modal-dialog-title">
      <span class='modal-dialog-title-content'>${options.header}</span>
      <button type="button" title="Close this dialog" class="modal-dialog-close">
      <span class="vh">Close this dialog</span> <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M217.5 256l137.2-137.2c4.7-4.7 4.7-12.3 0-17l-8.5-8.5c-4.7-4.7-12.3-4.7-17 0L192 230.5 54.8 93.4c-4.7-4.7-12.3-4.7-17 0l-8.5 8.5c-4.7 4.7-4.7 12.3 0 17L166.5 256 29.4 393.2c-4.7 4.7-4.7 12.3 0 17l8.5 8.5c4.7 4.7 12.3 4.7 17 0L192 281.5l137.2 137.2c4.7 4.7 12.3 4.7 17 0l8.5-8.5c4.7-4.7 4.7-12.3 0-17L217.5 256z"></path></svg>
      </button>
      </h6>

      <div class="modal-dialog-content">
      <img src="https://assets.scryfall.com/assets/spinner-0e5953300e953759359ad94bcff35ac64ff73a403d3a0702e809d6c43e7e5ed5.gif" class="modal-dialog-spinner">
      </div>
      <!---->
      <div class="modal-dialog-stage" style="position:fixed;left:-100%;visibility:hidden">${this._originalContent}</div>
      </div>
      `
    modal.querySelector('.modal-dialog-close').addEventListener('click', () => {
      this.close()
    })

    return modal
  }
}
