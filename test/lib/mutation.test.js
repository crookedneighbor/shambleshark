import {
  reset,
  ready
} from '../../src/js/lib/mutation'

describe('domNodeReady', function () {
  beforeEach(function () {
    sandbox.spy(global, 'MutationObserver')
  })

  afterEach(function () {
    reset()
  })

  it('applies transformation to specified dom nodes right away', function () {
    const div = this.makeDiv()
    const div2 = this.makeDiv()
    const spy = sandbox.stub()

    document.querySelectorAll.withArgs('.class-name').returns([
      div,
      div2
    ])

    ready('.class-name', spy)

    expect(spy.callCount).to.equal(2)
    expect(spy).to.be.calledWith(div)
    expect(spy).to.be.calledWith(div2)
  })

  it('adds check to mutation observer', function () {
    const spy = sandbox.stub()

    ready('.class-name', spy)

    expect(global.MutationObserver.calledWithNew()).to.equal(true)
    expect(global.MutationObserver).to.be.calledWith(sandbox.match.func)
  })

  it('only creates observer once', function () {
    const spy = sandbox.stub()

    ready('.class-name', spy)

    expect(global.MutationObserver.callCount).to.equal(1)
    expect(global.MutationObserver.calledWithNew()).to.equal(true)
    expect(global.MutationObserver).to.be.calledWith(sandbox.match.func)

    ready('.another-class-name', spy)

    expect(global.MutationObserver.callCount).to.equal(1)
  })

  it('applies transformation to specified dom nodes only once', function () {
    const div = this.makeDiv()
    const div2 = this.makeDiv()
    const spy = sandbox.stub()

    document.querySelectorAll.withArgs('.class-name').returns([
      div,
      div2
    ])

    ready('.class-name', spy)

    expect(spy.callCount).to.equal(2)
    expect(spy).to.be.calledWith(div)
    expect(spy).to.be.calledWith(div2)

    ready('.class-name', spy)

    expect(spy.callCount).to.equal(2)
  })

  it('applies transformation only to new dom nodes', function () {
    const div = this.makeDiv()
    const div2 = this.makeDiv()
    const spy = sandbox.stub()

    document.querySelectorAll.withArgs('.class-name').returns([
      div,
      div2
    ])

    ready('.class-name', spy)

    const handler = global.MutationObserver.args[0][0]

    expect(spy.callCount).to.equal(2)
    expect(spy).to.be.calledWith(div)
    expect(spy).to.be.calledWith(div2)

    spy.resetHistory()

    const div3 = this.makeDiv()

    document.querySelectorAll.withArgs('.class-name').returns([
      div,
      div3,
      div2
    ])

    handler()

    expect(spy.callCount).to.equal(1)
    expect(spy).to.be.calledWith(div3)
  })
})
