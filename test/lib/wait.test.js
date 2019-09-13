import wait from '../../src/js/lib/wait'

describe('wait', function () {
  it('wraps setTimeout in a promise', function () {
    jest.spyOn(global, 'setTimeout')

    return wait(10).then(() => {
      expect(global.setTimeout).toBeCalledWith(expect.any(Function), 10)
    })
  })

  it('defautls wait time to 1', function () {
    jest.spyOn(global, 'setTimeout')

    return wait().then(() => {
      expect(global.setTimeout).toBeCalledWith(expect.any(Function), 1)
    })
  })
})
