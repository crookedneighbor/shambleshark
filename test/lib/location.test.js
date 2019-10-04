import {
  isIframe
} from '../../src/js/lib/location'

describe('location', function () {
  describe('isIframe', function () {
    it('returns false when parent location is identitical to window location', function () {
      const fakeWindow = {
        location: 'foo',
        parent: {
          location: 'foo'
        }
      }

      expect(isIframe(fakeWindow)).toBe(false)
    })

    it('returns true when parent location is not identitical to window location', function () {
      const fakeWindow = {
        location: 'foo',
        parent: {
          location: 'bar'
        }
      }

      expect(isIframe(fakeWindow)).toBe(true)
    })
  })
})
