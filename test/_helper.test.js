import chrome from 'sinon-chrome/extensions'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chai from 'chai'

chai.use(sinonChai)

global.chrome = chrome
global.sandbox = sinon.createSandbox()
global.expect = chai.expect

afterEach(function () {
  sandbox.restore()
})
