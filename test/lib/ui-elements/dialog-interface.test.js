import DialogInterface from '../../../src/js/lib/ui-elements/dialog-interface'

class ChildDialog extends DialogInterface {
  _constructElement (options) {
    const el = document.createElement('div')
    el.innerHTML = `
      <div class="dialog-close"></div>
      <div class="dialog-title-symbol">${options.headerSymbol}</div>
      <div class="dialog-title-content"></div>
      <div class="dialog-content-container">
        <div class="dialog-loader"></div>
        <div class="dialog-content"></div>
        <div class="dialog-stage"></div>
      </div>
    `

    return el
  }
}

describe('DialogInterface', function () {
  it('requires a subclass with _constructElement', function () {
    let err

    try {
      new DialogInterface() // eslint-disable-line no-new
    } catch (e) {
      err = e
    }

    expect(err).toBeTruthy()
    expect(err.message).toEqual('Not implemented')
  })

  describe('element', function () {
    it('hides the dialog by default', function () {
      const dialog = new ChildDialog()

      expect(dialog.element.style.display).toBe('none')
    })

    it('can opt into showing the dialog', function () {
      const dialog = new ChildDialog({
        open: true
      })

      expect(dialog.element.style.display).toBeFalsy()
    })

    it('can provide an id', function () {
      const dialog = new ChildDialog({
        id: 'my-id'
      })

      expect(dialog.element.id).toBe('my-id')
    })

    it('can provide content', function () {
      const dialog = new ChildDialog({
        content: 'Some content'
      })

      expect(dialog.element.querySelector('.dialog-content').innerHTML).toBe('Some content')
    })

    it('does not require content', function () {
      const dialog = new ChildDialog()

      expect(dialog.element.querySelector('.dialog-content').innerHTML).toBe('')
    })

    it('can provide a header', function () {
      const dialog = new ChildDialog({
        header: 'Title'
      })

      expect(dialog.element.querySelector('.dialog-title-content').innerText).toContain('Title')
    })

    it('can provide a symbol to header', function () {
      const dialog = new ChildDialog({
        headerSymbol: '<div class="symbol"></div>',
        header: 'Title'
      })

      expect(dialog.element.querySelector('.symbol')).toBeTruthy()
      expect(dialog.element.querySelector('.dialog-title-content').innerText).toContain('Title')
    })

    it('closes when the backdrop is clicked', function () {
      const dialog = new ChildDialog()

      jest.spyOn(dialog, 'close').mockImplementation()

      dialog.open()

      dialog.element.click()

      expect(dialog.close).toBeCalledTimes(1)
    })

    it('does not close when modal element is clicked', function () {
      const dialog = new ChildDialog()

      jest.spyOn(dialog, 'close').mockImplementation()

      dialog.open()

      dialog.element.querySelector('.dialog-content-container').click()

      expect(dialog.close).toBeCalledTimes(0)
    })

    it('closes when the esc key is typed', function () {
      const dialog = new ChildDialog()

      jest.spyOn(dialog, 'close').mockImplementation()

      dialog.open()

      const evt = new global.KeyboardEvent('keyup', {
        key: 'Escape',
        keyCode: 27,
        which: 27
      })
      document.dispatchEvent(evt)

      expect(dialog.close).toBeCalledTimes(1)
    })

    it('does not close when the esc key is typed if dialog is not opened', function () {
      const dialog = new ChildDialog()

      jest.spyOn(dialog, 'close').mockImplementation()

      const evt = new global.KeyboardEvent('keyup', {
        key: 'Escape',
        keyCode: 27,
        which: 27
      })
      document.dispatchEvent(evt)

      expect(dialog.close).not.toBeCalled()
    })
  })

  describe('resetHeader', function () {
    it('resets header after it has been changed', function () {
      const dialog = new ChildDialog({
        header: 'Some title'
      })

      dialog.setHeader('new title')
      dialog.resetHeader()

      expect(dialog.element.querySelector('.dialog-title-content').innerText).toBe('Some title')
    })
  })

  describe('setHeader', function () {
    it('can write over content', function () {
      const dialog = new ChildDialog({
        header: 'Some title'
      })

      dialog.setHeader('new title')

      expect(dialog.element.querySelector('.dialog-title-content').innerText).toBe('new title')
    })
  })

  describe('setContent', function () {
    it('can write over content', function () {
      const dialog = new ChildDialog({
        content: 'Some content'
      })

      dialog.setContent('new content')

      expect(dialog.element.querySelector('.dialog-content').innerHTML).toBe('new content')
    })

    it('replaces content with DOM node when DOM node is provided', function () {
      const dialog = new ChildDialog({
        content: 'Some content'
      })
      const node = document.createElement('div')
      node.id = 'some-id'
      node.innerHTML = 'foo'

      dialog.setContent(node)

      expect(dialog.element.querySelector('.dialog-content').innerHTML).toBe('<div id="some-id">foo</div>')
    })
  })

  describe('setLoading', function () {
    beforeEach(function () {
      // jest doesn't know about the scrollTo method on elements
      jest.spyOn(DialogInterface.prototype, 'scrollTo').mockImplementation()
    })

    it('hides the spinner when setting loading to false', function () {
      const dialog = new ChildDialog({
        content: 'Some content'
      })

      dialog.setLoading(false)

      expect(dialog.element.querySelector('.dialog-stage').style.display).toBeFalsy()
      expect(dialog.element.querySelector('.dialog-loader').style.display).toBe('none')
    })

    it('scrolls up to the top when setting loading to false', function () {
      const dialog = new ChildDialog({
        content: 'Some content'
      })

      dialog.setLoading(false)

      expect(dialog.scrollTo).toBeCalledTimes(1)
      expect(dialog.scrollTo).toBeCalledWith(0, 0)
    })

    it('shows the spinner when empty content is given', function () {
      const dialog = new ChildDialog({
        content: 'Some content'
      })

      dialog.setLoading(true)

      expect(dialog.element.querySelector('.dialog-content-container').classList.contains('loading')).toBe(true)
      expect(dialog.element.querySelector('.dialog-loader').style.display).toBeFalsy()
    })
  })

  describe('open', function () {
    it('shows the dialog', function () {
      const dialog = new ChildDialog()

      expect(dialog.element.style.display).toBe('none')

      dialog.open()

      expect(dialog.element.style.display).toBeFalsy()
    })

    it('can call an onOpen hook if specified', function () {
      const spy = jest.fn()
      const dialog = new ChildDialog({
        onOpen: spy
      })

      dialog.open()

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(dialog)
    })
  })

  describe('close', function () {
    it('hides the dialog', function () {
      const dialog = new ChildDialog({
        open: true
      })

      expect(dialog.element.style.display).toBeFalsy()

      dialog.close()

      expect(dialog.element.style.display).toBe('none')
    })

    it('can reset content on close if specified', function () {
      const dialog = new ChildDialog({
        open: true,
        content: 'original content',
        resetContentOnClose: true
      })

      dialog.setContent('some content')

      jest.spyOn(dialog, 'setContent')

      dialog.close()

      expect(dialog.setContent).toBeCalledWith('original content')
    })

    it('can call an onClose hook if specified', function () {
      const spy = jest.fn()
      const dialog = new ChildDialog({
        open: true,
        onClose: spy
      })

      dialog.close()

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(dialog)
    })
  })

  describe('scollTo', function () {
    it('calls scrollTo on the element', function () {
      const dialog = new ChildDialog()

      // jest doesn't know about scrollTo method on elements
      dialog.element.scrollTo = jest.fn()

      dialog.scrollTo(4, 10)

      expect(dialog.element.scrollTo).toBeCalledTimes(1)
      expect(dialog.element.scrollTo).toBeCalledWith(4, 10)
    })
  })

  describe('triggerOnClose', function () {
    it('triggers onClose', function () {
      const onClose = jest.fn()
      const dialog = new ChildDialog({
        onClose
      })

      expect(onClose).toBeCalledTimes(0)

      dialog.triggerOnClose()

      expect(onClose).toBeCalledTimes(1)
      expect(onClose).toBeCalledWith(dialog)
    })
  })

  describe('triggerOnOpen', function () {
    it('triggers onOpen', function () {
      const onOpen = jest.fn()
      const dialog = new ChildDialog({
        onOpen
      })

      expect(onOpen).toBeCalledTimes(0)

      dialog.triggerOnOpen()

      expect(onOpen).toBeCalledTimes(1)
      expect(onOpen).toBeCalledWith(dialog)
    })
  })

  describe('triggerOnScroll', function () {
    it('triggers onScroll', function () {
      const onScroll = jest.fn()
      const dialog = new ChildDialog({
        onScroll
      })

      expect(onScroll).toBeCalledTimes(0)

      dialog.triggerOnScroll()

      expect(onScroll).toBeCalledTimes(1)
      expect(onScroll).toBeCalledWith(dialog)
    })
  })
})
