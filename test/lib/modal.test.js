import Modal from '../../src/js/lib/modal'

describe('makeModal', function () {
  describe('element', function () {
    it('creates a scryfall style modal', function () {
      const modal = new Modal()

      expect(modal.element.querySelector('.modal-dialog')).not.toBeFalsy()
      expect(modal.element.querySelector('.modal-dialog-content')).not.toBeFalsy()
      expect(modal.element.querySelector('.modal-dialog-close')).not.toBeFalsy()
    })

    it('hides the modal by default', function () {
      const modal = new Modal()

      expect(modal.element.style.display).toBe('none')
    })

    it('can opt into showing the modal', function () {
      const modal = new Modal({
        open: true
      })

      expect(modal.element.style.display).toBeFalsy()
    })

    it('can provide an id', function () {
      const modal = new Modal({
        id: 'my-id'
      })

      expect(modal.element.id).toBe('my-id')
    })

    it('can provide a header', function () {
      const modal = new Modal({
        header: 'Title'
      })

      expect(modal.element.querySelector('.modal-dialog-title-content').innerHTML).toBe('Title')
    })

    it('can provide content', function () {
      const modal = new Modal({
        content: 'Some content'
      })

      expect(modal.element.querySelector('.modal-dialog-stage').innerHTML).toBe('Some content')
    })

    it('does not require content', function () {
      const modal = new Modal()

      expect(modal.element.querySelector('.modal-dialog-stage').innerHTML).toBe('')
    })

    it('closes when the close button is clicked', function () {
      const modal = new Modal()
      const close = modal.element.querySelector('.modal-dialog-close')

      jest.spyOn(modal, 'close').mockImplementation()

      close.click()

      expect(modal.close).toBeCalledTimes(1)
    })

    it('closes when the close button is clicked', function () {
      const modal = new Modal()
      const close = modal.element.querySelector('.modal-dialog-close')

      jest.spyOn(modal, 'close').mockImplementation()

      close.click()

      expect(modal.close).toBeCalledTimes(1)
    })
  })

  describe('setContent', function () {
    it('can write over content', function () {
      const modal = new Modal({
        content: 'Some content'
      })

      modal.setContent('new content')

      expect(modal.element.querySelector('.modal-dialog-stage').innerHTML).toBe('new content')
    })

    it('replaces content with DOM node when DOM node is provided', function () {
      const modal = new Modal({
        content: 'Some content'
      })
      const node = document.createElement('div')
      node.id = 'some-id'
      node.innerHTML = 'foo'

      modal.setContent(node)

      expect(modal.element.querySelector('.modal-dialog-stage #some-id').innerHTML).toBe('foo')
    })

    it('hides the spinner when content is given', function () {
      const modal = new Modal({
        content: 'Some content'
      })

      modal.setContent('new content')

      expect(modal.element.querySelector('.modal-dialog-stage').style.display).toBeFalsy()
      expect(modal.element.querySelector('.modal-dialog-content').style.display).toBe('none')
    })

    it('shows the spinner when empty content is given', function () {
      const modal = new Modal({
        content: 'Some content'
      })

      modal.setContent('')

      expect(modal.element.querySelector('.modal-dialog-stage').style.display).toBe('none')
      expect(modal.element.querySelector('.modal-dialog-content').style.display).toBeFalsy()
    })
  })

  describe('open', function () {
    it('shows the modal', function () {
      const modal = new Modal()

      expect(modal.element.style.display).toBe('none')

      modal.open()

      expect(modal.element.style.display).toBeFalsy()
    })

    it('can call an onOpen hook if specified', function () {
      const spy = jest.fn()
      const modal = new Modal({
        onOpen: spy
      })

      modal.open()

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(modal)
    })
  })

  describe('close', function () {
    it('hides the modal', function () {
      const modal = new Modal({
        open: true
      })

      expect(modal.element.style.display).toBeFalsy()

      modal.close()

      expect(modal.element.style.display).toBe('none')
    })

    it('can reset content on close if specified', function () {
      const modal = new Modal({
        open: true,
        content: 'original content',
        resetContentOnClose: true
      })

      modal.setContent('some content')

      jest.spyOn(modal, 'setContent')

      modal.close()

      expect(modal.setContent).toBeCalledWith('original content')
    })

    it('can call an onClose hook if specified', function () {
      const spy = jest.fn()
      const modal = new Modal({
        open: true,
        onClose: spy
      })

      modal.close()

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(modal)
    })
  })
})
