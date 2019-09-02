import wait from '../../src/js/lib/wait'

describe('wait', function () {
  it('wraps setTimeout in a promise', function () {
    sandbox.spy(global, 'setTimeout')

    return wait(10).then(() => {
      expect(global.setTimeout).to.be.calledWith(sandbox.match.func, 10)
    })
  })

  it('defautls wait time to 1', function () {
    sandbox.spy(global, 'setTimeout')

    return wait().then(() => {
      expect(global.setTimeout).to.be.calledWith(sandbox.match.func, 1)
    })
  })
})
