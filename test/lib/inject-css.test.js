import injectCSS from '../../src/js/lib/inject-css'

describe('injectCSS', function () {
  it('creates an element', function () {
    jest.spyOn(document.head, 'appendChild').mockImplementation()

    injectCSS(`
  body {
    background: red;
  }
`)

    expect(document.head.appendChild).toBeCalledTimes(1)
    expect(document.head.appendChild).toBeCalledWith(expect.any(window.DocumentFragment))
  })
})
