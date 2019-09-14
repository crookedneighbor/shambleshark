import makePromisePlus from '../../src/js/lib/promise-plus'

describe('makePromisePlus', function () {
  it('it returns a promise', function () {
    const promise = makePromisePlus()

    expect(promise).toBeInstanceOf(Promise)
  })

  it('defaults status properties to false', function () {
    const promisePlus = makePromisePlus()

    expect(promisePlus.isFulfilled).toBe(false)
    expect(promisePlus.isResolved).toBe(false)
    expect(promisePlus.isRejected).toBe(false)
  })

  it('updates status properties when it resolves', function () {
    const promisePlus = makePromisePlus()

    promisePlus.resolve()

    expect(promisePlus.isFulfilled).toBe(true)
    expect(promisePlus.isResolved).toBe(true)
    expect(promisePlus.isRejected).toBe(false)
  })

  it('updates status properties when it rejects', function () {
    const promisePlus = makePromisePlus()
    const error = new Error('error')

    promisePlus.reject(error)

    expect(promisePlus.isFulfilled).toBe(true)
    expect(promisePlus.isResolved).toBe(false)
    expect(promisePlus.isRejected).toBe(true)

    expect(promisePlus).rejects.toThrow(error)
  })

  it('can resolve with resolve function', function () {
    const promisePlus = makePromisePlus()
    const result = { foo: 'bar' }

    promisePlus.resolve(result)

    return promisePlus.then(function (payload) {
      expect(payload).toBe(result)
    })
  })

  it('can reject with reject function', function () {
    const promisePlus = makePromisePlus()
    const error = new Error('foo')

    promisePlus.reject(error)

    expect(promisePlus).rejects.toThrow(error)
  })

  it('will not update status properties when it has already resolved', function () {
    const promisePlus = makePromisePlus()

    promisePlus.resolve()

    expect(promisePlus.isFulfilled).toBe(true)
    expect(promisePlus.isResolved).toBe(true)
    expect(promisePlus.isRejected).toBe(false)

    promisePlus.reject()

    expect(promisePlus.isFulfilled).toBe(true)
    expect(promisePlus.isResolved).toBe(true)
    expect(promisePlus.isRejected).toBe(false)
  })

  it('will not update the resolved value after it has already been resolved', function () {
    const promisePlus = makePromisePlus()

    promisePlus.resolve('1')

    expect(promisePlus).resolves.toBe('1')

    promisePlus.resolve('2')

    expect(promisePlus).resolves.toBe('1')

    promisePlus.reject(new Error('foo'))

    expect(promisePlus).resolves.toBe('1')
  })

  it('will not update status properties when it has already rejected', function () {
    const promisePlus = makePromisePlus()
    const error = new Error('error')

    promisePlus.reject(error)

    expect(promisePlus.isFulfilled).toBe(true)
    expect(promisePlus.isResolved).toBe(false)
    expect(promisePlus.isRejected).toBe(true)

    promisePlus.resolve()

    expect(promisePlus.isFulfilled).toBe(true)
    expect(promisePlus.isResolved).toBe(false)
    expect(promisePlus.isRejected).toBe(true)

    expect(promisePlus).rejects.toThrow(error)
  })

  it('will not update the rejected value after it has already been rejected', function () {
    const promisePlus = makePromisePlus()
    const error = new Error('1')

    promisePlus.reject(error)

    expect(promisePlus).rejects.toThrow(error)

    promisePlus.reject(new Error('2'))

    expect(promisePlus).rejects.toThrow(error)

    promisePlus.resolve('3')

    expect(promisePlus).rejects.toThrow(error)
  })
})
