import mutation from 'Lib/mutation'
import CardTooltip from 'Ui/card-tooltip'

describe('CardTooltip', function () {
  beforeEach(function () {
    jest.spyOn(CardTooltip.prototype, 'findTooltip').mockImplementation()
  })

  it('looks for tooltip', function () {
    const tooltip = new CardTooltip()

    expect(tooltip.findTooltip).toBeCalledTimes(1)
  })

  describe('findTooltip', function () {
    let tooltip, fakeElement

    beforeEach(function () {
      fakeElement = document.createElement('div')
      jest.spyOn(mutation, 'ready').mockImplementation((selector, cb) => {
        cb(fakeElement)
      })
      tooltip = new CardTooltip()
      tooltip.findTooltip.mockRestore()
    })

    afterEach(function () {
      CardTooltip.resetTooltipElement()
    })

    it('waits for tooltip element to be available', function () {
      tooltip.findTooltip()

      expect(mutation.ready).toBeCalledTimes(1)
      expect(mutation.ready).toBeCalledWith('#card-tooltip', expect.any(Function))
    })

    it('skips waiting for tooltip element if it is already available', function () {
      tooltip.findTooltip()

      expect(mutation.ready).toBeCalledTimes(1)
      mutation.ready.mockClear()

      tooltip.findTooltip()

      expect(mutation.ready).not.toBeCalled()
    })
  })

  describe('addElement', function () {
    let tooltip

    beforeEach(function () {
      tooltip = new CardTooltip()
      jest.spyOn(tooltip, 'createMousemoveHandler').mockReturnValue(() => {})
      jest.spyOn(tooltip, 'createMouseoutHandler').mockReturnValue(() => {})
    })

    it('adds an element to list of elements with handlers', function () {
      const el = document.createElement('div')

      expect(tooltip.elements.length).toBe(0)

      tooltip.addElement(el)

      expect(tooltip.elements.length).toBe(1)
      expect(tooltip.elements[0].element).toBe(el)
      expect(tooltip.elements[0].mousemoveHandler).toBeInstanceOf(Function)
      expect(tooltip.elements[0].mouseoutHandler).toBeInstanceOf(Function)
    })

    it('adds event listeners to element', function () {
      const el = document.createElement('div')

      jest.spyOn(el, 'addEventListener')

      tooltip.addElement(el)

      expect(el.addEventListener).toBeCalledTimes(2)
      expect(el.addEventListener).toBeCalledWith('mousemove', expect.any(Function))
      expect(el.addEventListener).toBeCalledWith('mouseout', expect.any(Function))

      expect(tooltip.createMousemoveHandler).toBeCalledTimes(1)
      expect(tooltip.createMousemoveHandler).toBeCalledWith(el)
      expect(tooltip.createMouseoutHandler).toBeCalledTimes(1)
      expect(tooltip.createMouseoutHandler).toBeCalledWith(el)
    })
  })

  describe('removeElement', function () {
    let tooltip

    beforeEach(function () {
      tooltip = new CardTooltip()
      jest.spyOn(tooltip, 'createMousemoveHandler').mockReturnValue(() => {})
      jest.spyOn(tooltip, 'createMouseoutHandler').mockReturnValue(() => {})
    })

    it('ignores elements that do not exist in list', function () {
      const el = document.createElement('div')

      expect(() => {
        tooltip.removeElement(el)
      }).not.toThrow()

      expect(tooltip.elements.length).toBe(0)
    })

    it('removes element from list of elements with handlers', function () {
      const el = document.createElement('div')

      tooltip.addElement(el)

      expect(tooltip.elements.length).toBe(1)

      tooltip.removeElement(el)

      expect(tooltip.elements.length).toBe(0)
    })

    it('removes event listeners from element', function () {
      const el = document.createElement('div')

      jest.spyOn(el, 'removeEventListener')

      tooltip.addElement(el)

      const mousemoveHandler = tooltip.elements[0].mousemoveHandler
      const mouseoutHandler = tooltip.elements[0].mouseoutHandler

      tooltip.removeElement(el)

      expect(el.removeEventListener).toBeCalledTimes(2)
      expect(el.removeEventListener).toBeCalledWith('mousemove', mousemoveHandler)
      expect(el.removeEventListener).toBeCalledWith('mouseout', mouseoutHandler)
    })
  })

  describe('setImage', function () {
    it('sets image', function () {
      const tooltip = new CardTooltip()

      tooltip.setImage('https://example.com/foo.png')
      expect(tooltip.img).toBe('https://example.com/foo.png')
    })
  })

  describe('createMousemoveHandler', function () {
    let tooltip, el, fakeEvent, mousemoveSpy

    beforeEach(function () {
      mousemoveSpy = jest.fn()

      tooltip = new CardTooltip({
        onMouseover: mousemoveSpy
      })

      tooltip.tooltipElement = document.createElement('div')
      tooltip.tooltipElement.innerHTML = '<img id="card-tooltip-img" />'
      document.body.appendChild(tooltip.tooltipElement)

      tooltip.img = 'https://example.com/image.png'
      el = document.createElement('div')
      fakeEvent = {
        pageX: 100,
        pageY: 100
      }
    })

    it('returns a function', function () {
      expect(tooltip.createMousemoveHandler(el)).toBeInstanceOf(Function)
    })

    it('does nothing if no tooltip element is available', function () {
      delete tooltip.tooltipElement

      const handler = tooltip.createMousemoveHandler(el)

      expect(() => {
        handler()
      }).not.toThrow()
    })

    it('noops when window width is small', function () {
      const originalWidth = window.innerWidth
      const handler = tooltip.createMousemoveHandler(el)

      window.innerWidth = 600

      handler(fakeEvent)

      expect(tooltip.tooltipElement.style.display).not.toBe('block')

      window.innerWidth = originalWidth
    })

    it('noops when there is no img', function () {
      delete tooltip.img

      const handler = tooltip.createMousemoveHandler(el)

      handler(fakeEvent)

      expect(tooltip.tooltipElement.style.display).not.toBe('block')
    })

    it('opens tooltip', function () {
      const handler = tooltip.createMousemoveHandler(el)

      handler(fakeEvent)

      expect(tooltip.tooltipElement.style.display).toBe('block')
      expect(tooltip.tooltipElement.style.left).toBe('150px')
      expect(tooltip.tooltipElement.style.top).toBe('70px')

      expect(document.getElementById('card-tooltip-img').src).toBe('https://example.com/image.png')
    })

    it('calls onMousemove callback with element if provided', function () {
      const handler = tooltip.createMousemoveHandler(el)

      handler(fakeEvent)

      expect(mousemoveSpy).toBeCalledTimes(1)
      expect(mousemoveSpy).toBeCalledWith(el)
    })
  })

  describe('createMouseoutHandler', function () {
    let tooltip, el

    beforeEach(function () {
      tooltip = new CardTooltip()
      tooltip.tooltipElement = document.createElement('div')
      el = document.createElement('div')
    })

    it('returns a function', function () {
      expect(tooltip.createMouseoutHandler(el)).toBeInstanceOf(Function)
    })

    it('does nothing if no tooltip element is available', function () {
      delete tooltip.tooltipElement

      const handler = tooltip.createMouseoutHandler(el)

      expect(() => {
        handler()
      }).not.toThrow()
    })

    it('sets tooltip element style to `none`', function () {
      const handler = tooltip.createMouseoutHandler(el)

      handler()

      expect(tooltip.tooltipElement.style.display).toBe('none')
    })

    it('calls onMouseout callback with element if provided', function () {
      const spy = jest.fn()

      tooltip = new CardTooltip({
        onMouseout: spy
      })
      tooltip.tooltipElement = document.createElement('div')
      const handler = tooltip.createMouseoutHandler(el)

      handler()

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(el)
    })
  })

  describe('triggerOnMouseover', function () {
    it('calls onMouseover handler', function () {
      const spy = jest.fn()
      const el = document.createElement('div')
      const tooltip = new CardTooltip({
        onMouseover: spy
      })

      tooltip.triggerOnMouseover(el)

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(el)
    })

    it('does not error if no onMouseover option is passed', function () {
      const el = document.createElement('div')
      const tooltip = new CardTooltip()

      expect(() => {
        tooltip.triggerOnMouseover(el)
      }).not.toThrow()
    })
  })

  describe('triggerOnMouseout', function () {
    it('calls onMouseout handler', function () {
      const spy = jest.fn()
      const el = document.createElement('div')
      const tooltip = new CardTooltip({
        onMouseout: spy
      })

      tooltip.triggerOnMouseout(el)

      expect(spy).toBeCalledTimes(1)
      expect(spy).toBeCalledWith(el)
    })

    it('does not error if no onMouseout option is passed', function () {
      const el = document.createElement('div')
      const tooltip = new CardTooltip()

      expect(() => {
        tooltip.triggerOnMouseout(el)
      }).not.toThrow()
    })
  })
})
