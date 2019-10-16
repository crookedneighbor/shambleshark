function noop () {
  // do nothing!
}

export default class DialogInterface {
  constructor (options = {}) {
    this._isOpen = false
    this._originalContent = options.content || ''
    this._resetContentOnClose = Boolean(options.resetContentOnClose)
    this._onClose = options.onClose || noop
    this._onOpen = options.onOpen || noop

    this._originalHeader = options.header

    if (options.headerSymbol) {
      this._originalHeader = `
        <span class="dialog-title-symbol">${options.headerSymbol || ''}</span>

        ${this._originalHeader}
      `
    }

    this.element = this._constructElement(options)
    this._contentNodeContainer = this.element.querySelector('.dialog-content-container')
    this._contentNode = this._contentNodeContainer.querySelector('.dialog-content')
    this._loaderNode = this.element.querySelector('.dialog-loader')
    this._headerNode = this.element.querySelector('.dialog-title-content')
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
    const closeBtn = this.element.querySelector('.dialog-close')

    if (state) {
      this._contentNodeContainer.style.display = 'none'
      this._loaderNode.removeAttribute('style')
      closeBtn.title = this._getCloseButtonMessage()
    } else {
      this._contentNodeContainer.removeAttribute('style')
      this._loaderNode.style.display = 'none'
      closeBtn.title = 'Close this dialog.'
      // Firefox often scrolls down content is
      // loading. This puts us back to the top
      this.scrollTo(0, 0)
    }
  }

  open () {
    this.element.style.display = ''
    this._isOpen = true

    this._onOpen(this)

    this.element.querySelector('.dialog-close').focus()
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

  _getCloseButtonMessage () {
    return 'The dialog is loading. You may cancel this dialog by using this button.'
  }

  _constructElement (options) {
    throw new Error('Not implemented')
  }

  scrollTo (x, y) {
    this.element.scrollTo(x, y)
  }
}
