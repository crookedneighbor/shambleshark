import createElement from '../../src/js/lib/create-element'

describe('createElement', function () {
  it('creates an element', function () {
    const div = createElement('<div id="foo"></div>')

    document.body.appendChild(div)

    expect(document.getElementById('foo')).toBeTruthy()
  })

  it('pulls tags from body by default', function () {
    const div = createElement('<style id="style"></style><div id="foo"></div>')

    document.body.appendChild(div)

    expect(document.body.querySelector('#foo')).toBeTruthy()
    expect(document.body.querySelector('#style')).toBeFalsy()
  })

  it('can pull tags from head', function () {
    const div = createElement('<style id="style"></style><div id="foo"></div>', {
      container: 'head'
    })

    document.body.appendChild(div)

    expect(document.body.querySelector('#style')).toBeTruthy()
    expect(document.body.querySelector('#foo')).toBeFalsy()
  })
})
