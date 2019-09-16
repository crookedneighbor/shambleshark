import bus from 'framebus'
import ScryfallClient from 'scryfall-client'

const CACHE_TIMEOUT_FOR_DECK_REQUESTS = 2000 // 2 seconds

let getDeckPromise

export const api = new ScryfallClient()

export function getDeck () {
  if (getDeckPromise) {
    return getDeckPromise
  }

  getDeckPromise = new Promise((resolve) => {
    bus.emit('REQUEST_DECK', resolve)
  })

  setTimeout(() => {
    getDeckPromise = null
  }, CACHE_TIMEOUT_FOR_DECK_REQUESTS)

  return getDeckPromise
}

export default {
  api,
  getDeck
}
