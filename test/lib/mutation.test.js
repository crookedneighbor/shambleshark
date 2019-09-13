import {
  reset,
  ready
} from '../../src/js/lib/mutation'

describe('domNodeReady', function () {
  afterEach(function () {
    reset()
  })

  it('applies transformation to specified dom nodes right away', function () {
    const spy = jest.fn()

    const div = document.createElement('div')
    const div2 = document.createElement('div')

    div.classList.add('class-name')
    div2.classList.add('class-name')

    document.body.appendChild(div)
    document.body.appendChild(div2)

    ready('.class-name', spy)

    expect(spy).toBeCalledTimes(2)
    expect(spy).toBeCalledWith(div)
    expect(spy).toBeCalledWith(div2)
  })

  it('only creates observer once', function () {
    const spy = jest.fn()

    jest.spyOn(global.MutationObserver.prototype, 'observe')
    ready('.class-name', spy)

    expect(global.MutationObserver.prototype.observe).toBeCalledTimes(1)
    expect(global.MutationObserver.prototype.observe).toBeCalledWith(document.documentElement, {
      childList: true,
      subtree: true
    })

    ready('.another-class-name', spy)

    expect(global.MutationObserver.prototype.observe).toBeCalledTimes(1)
  })

  it('applies transformation to specified dom nodes only once', function () {
    const spy = jest.fn()

    const div = document.createElement('div')
    const div2 = document.createElement('div')

    div.classList.add('class-name')
    div2.classList.add('class-name')

    document.body.appendChild(div)
    document.body.appendChild(div2)

    ready('.class-name', spy)

    expect(spy).toBeCalledTimes(2)
    expect(spy).toBeCalledWith(div)
    expect(spy).toBeCalledWith(div2)

    ready('.class-name', spy)

    expect(spy).toBeCalledTimes(2)
  })

  it('applies transformation only to new dom nodes', function () {
    const spy = jest.fn()

    const div = document.createElement('div')
    const div2 = document.createElement('div')

    div.classList.add('class-name')
    div2.classList.add('class-name')

    document.body.appendChild(div)
    document.body.appendChild(div2)

    ready('.class-name', spy)

    expect(spy).toBeCalledTimes(2)
    expect(spy).toBeCalledWith(div)
    expect(spy).toBeCalledWith(div2)

    const div3 = document.createElement('div')
    div3.classList.add('class-name')
    document.body.appendChild(div3)

    spy.mockReset()

    ready('.class-name', spy)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith(div3)
  })
})
