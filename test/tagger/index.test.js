import start from '../../src/js/scryfall/tagger'
import iframe from '../../src/js/lib/iframe'
import wait from '../../src/js/lib/wait'
import bus from 'framebus'

describe('Tagger', () => {
  let fetchSpy

  beforeEach(() => {
    jest.spyOn(iframe, 'isInsideIframe').mockReturnValue(true)

    jest.spyOn(bus, 'on').mockImplementation()
    jest.spyOn(bus, 'emit').mockImplementation()
    fetchSpy = jest.fn().mockResolvedValue({
      data: {
        card: 'fake-card'
      }
    })
    // jest doesn't have fetch on the window
    global.fetch = jest.fn().mockResolvedValue({
      json: fetchSpy
    })

    const meta = document.createElement('meta')
    meta.setAttribute('name', 'csrf-token')
    meta.setAttribute('content', 'token')

    document.head.appendChild(meta)
  })

  it('does not listen for recomendations if not in an iframe', () => {
    iframe.isInsideIframe.mockReturnValue(false)

    start()

    expect(bus.on).not.toBeCalled()
  })

  it('emits a ready event', () => {
    start()

    expect(bus.emit).toBeCalledTimes(1)
    expect(bus.emit).toBeCalledWith('TAGGER_READY')
  })

  it('listens for tag requests', () => {
    start()

    expect(bus.on).toBeCalledTimes(1)
    expect(bus.on).toBeCalledWith('TAGGER_TAGS_REQUEST', expect.any(Function))
  })

  it('requests tags', async () => {
    const replySpy = jest.fn()
    bus.on.mockImplementation((eventName, cb) => {
      cb({ // eslint-disable-line standard/no-callback-literal
        set: 'set',
        number: 'number'
      }, replySpy)
    })

    start()

    expect(global.fetch).toBeCalledTimes(1)
    expect(global.fetch).toBeCalledWith('https://tagger.scryfall.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'token'
      },
      body: expect.stringContaining('FetchCard')
    })

    const body = JSON.parse(global.fetch.mock.calls[0][1].body)

    expect(body.variables.set).toBe('set')
    expect(body.variables.number).toBe('number')

    await wait()

    expect(replySpy).toBeCalledTimes(1)
    expect(replySpy).toBeCalledWith('fake-card')
  })
})
