import scrollLock from '../scroll-lock'

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
    this._onScroll = options.onScroll || noop

    this._originalHeader = options.header

    if (options.headerSymbol) {
      this._originalHeader = `
        <span class="dialog-title-symbol">${options.headerSymbol || ''}</span>

        ${this._originalHeader}
      `
    }

    this.element = this._constructElement(options)
    this.element.addEventListener('click', (evt) => {
      if (evt.target !== this.element) {
        return
      }

      this.close()
    })
    this.element.id = options.id
    document.addEventListener('keyup', this._onEscKey.bind(this))

    this._contentNodeContainer = this.element.querySelector('.dialog-content-container')
    this._contentNode = this._contentNodeContainer.querySelector('.dialog-content')
    this._contentNode.innerHTML = this._originalContent
    this._loaderNode = this.element.querySelector('.dialog-loader')
    this._loaderNode.setAttribute('aria-label', options.loadingMessage || 'Loading')
    this._headerNode = this.element.querySelector('.dialog-title-content')
    this._headerNode.innerHTML = this._originalHeader

    if (!options.open) {
      this.element.style.display = 'none'
    }
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
      this._contentNodeContainer.classList.add('loading')
      this._loaderNode.removeAttribute('style')
    } else {
      this._contentNodeContainer.classList.remove('loading')
      this._loaderNode.style.display = 'none'
      // Firefox often scrolls down content is
      // loading. This puts us back to the top
      this.scrollTo(0, 0)
    }
    closeBtn.title = this._getCloseButtonMessage(state)
  }

  open () {
    scrollLock(true)

    this.element.style.display = ''
    this._isOpen = true

    this.triggerOnOpen()

    this.element.querySelector('.dialog-close').focus()
  }

  close () {
    scrollLock(false)

    this.element.style.display = 'none'
    this._isOpen = false

    if (this._resetContentOnClose) {
      this.setContent(this._originalContent)
    }
    this.triggerOnClose()
  }

  triggerOnClose () {
    return this._onClose(this)
  }

  triggerOnOpen () {
    return this._onOpen(this)
  }

  triggerOnScroll () {
    return this._onScroll(this)
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

  _getCloseButtonMessage (isLoading) {
    if (isLoading) {
      return 'The dialog is loading. You may cancel this dialog by using this button.'
    } else {
      return 'Close this dialog.'
    }
  }

  _constructElement (options) {
    throw new Error('Not implemented')
  }

  scrollTo (x, y) {
    this.element.scrollTo(x, y)
  }
}
