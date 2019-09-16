import bus from 'framebus'
import ScryfallClient from 'scryfall-client'

export const api = new ScryfallClient()

export function getDeck () {
  return new Promise((resolve) => {
    bus.emit('REQUEST_DECK', resolve)
  })
}

export default {
  api,
  getDeck
}
