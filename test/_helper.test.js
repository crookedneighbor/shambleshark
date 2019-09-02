import chrome from 'sinon-chrome/extensions'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chai from 'chai'
import bus from 'framebus'

chai.use(sinonChai)

global.chrome = chrome
global.sandbox = sinon.createSandbox()
global.expect = chai.expect

beforeEach(function () {
  this.makeDiv = function (attributes = {}) {
    const defaultConfig = {
      innerHTML: '',
      parentNode: {
        appendChild: sandbox.stub(),
        removeChild: sandbox.stub()
      },
      addEventListener: sandbox.stub(),
      getAttribute: sandbox.stub().returns(''),
      hasAttribute: sandbox.stub(),
      setAttribute: sandbox.stub(),
      classList: {
        add: sandbox.stub(),
        remove: sandbox.stub()
      },
      style: {},
      querySelector: sandbox.stub()
    }

    return Object.assign({}, attributes, defaultConfig)
  }

  const createElement = sandbox.stub()

  createElement.withArgs('div').returns(this.makeDiv())

  global.MutationObserver = function () {
  }
  global.MutationObserver.prototype.observe = sandbox.stub()
  global.document = {
    querySelectorAll: sandbox.stub().returns([]),
    createElement: createElement,
    getElementById: sandbox.stub()
  }
  sandbox.stub(bus, 'on')
  sandbox.stub(bus, 'emit')
})

afterEach(function () {
  sandbox.restore()
})
