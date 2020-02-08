import TaggerLink from '../../../src/js/features/search-results-features/tagger-link'
import mutation from '../../../src/js/lib/mutation'

describe('Tagger Link', function () {
  describe('run', function () {
    beforeEach(function () {
      jest.spyOn(mutation, 'ready').mockImplementation()
    })

    it('listens for new card grid items', async function () {
      const tl = new TaggerLink()

      await tl.run()

      expect(mutation.ready).toBeCalledTimes(1)
      expect(mutation.ready).toBeCalledWith('.card-grid-item a.card-grid-item-card', expect.any(Function))
    })

    it('adds a button to .card-grid-item', async function () {
      const tl = new TaggerLink()
      const el = document.createElement('div')
      el.classList.add('card-grid-item')
      el.innerHTML = '<a class="card-grid-item-card" href="https://scryfall.com/card/set/number"></a>'

      mutation.ready.mockImplementation((cssSelector, cb) => {
        cb(el.querySelector('a'))
      })

      await tl.run()

      const btn = el.querySelector('.tagger-link-button')
      expect(btn.href).toBe('https://tagger.scryfall.com/card/set/number')
    })
  })
})
