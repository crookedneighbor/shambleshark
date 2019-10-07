import start from '../../src/js/edhrec/ready'
import locationCheck from '../../src/js/lib/location'
import wait from '../../src/js/lib/wait'
import bus from 'framebus'

describe('EDHRec Ready', function () {
  let replySpy

  beforeEach(function () {
    jest.spyOn(locationCheck, 'isIframe').mockReturnValue(true)

    jest.spyOn(bus, 'on').mockImplementation((event, reply) => {
      const response = {
        commanders: ['Arjun, the Shifting Flame'],
        cards: ['1 foo', '1 bar']
      }
      replySpy = jest.fn()

      if (event === 'REQUEST_EDHREC_RECOMENDATIONS') {
        reply(response, replySpy)
      }
    })
    // jest doesn't have fetch on the window
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue('result')
    })
  })

  afterEach(async function () {
    // allow pending promises to resolve
    await wait()
  })

  it('does not listen for recomendations if not in an iframe', function () {
    locationCheck.isIframe.mockReturnValue(false)

    start()

    expect(bus.on).not.toBeCalled()
  })

  it('listens for recomendations', function () {
    start()

    expect(bus.on).toBeCalledTimes(1)
    expect(bus.on).toBeCalledWith('REQUEST_EDHREC_RECOMENDATIONS', expect.any(Function))
  })

  it('requests recomendations from edhrec', function () {
    start()

    expect(global.fetch).toBeCalledTimes(1)
    expect(global.fetch).toBeCalledWith('https://edhrec.com/api/recs/', {
      method: 'POST',
      body: JSON.stringify({
        commanders: ['Arjun, the Shifting Flame'],
        cards: ['1 foo', '1 bar'],
        name: ''
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })

  it('replies with response from edhrec', async function () {
    start()

    // let request promise resolve
    await wait()

    expect(replySpy).toBeCalledTimes(1)
    expect(replySpy).toBeCalledWith([
      null,
      'result'
    ])
  })

  it('sends back error if request to edhrec errors', async function () {
    const err = new Error('fetch error')

    global.fetch.mockRejectedValue(err)

    start()

    // let request promise resolve
    await wait()

    expect(replySpy).toBeCalledTimes(1)
    expect(replySpy).toBeCalledWith([err])
  })
})
