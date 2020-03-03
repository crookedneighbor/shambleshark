import url from 'Lib/url'

describe('url', function () {
  const { location } = window

  beforeEach(function () {
    delete window.location
    window.location = {
      pathname: '/string',
      reload: jest.fn()
    }
  })

  afterEach(() => {
    window.location = location
  })

  describe('getDeckId', function () {
    it('pulls deck id from window', function () {
      window.location.pathname = '/@user/decks/deck-id'

      expect(url.getDeckId()).toBe('deck-id')
    })

    it('returns undefined when there is no deck id', function () {
      window.location.pathname = '/@user/decks'

      expect(url.getDeckId()).toBeFalsy()
    })

    it('returns undefined when not in decks section', function () {
      window.location.pathname = '/@user/not-decks/id'

      expect(url.getDeckId()).toBeFalsy()
    })
  })
})