import modifyTagger from './tagger'
import modifyDeckDisplayPage from './deck-display-page'
import modifyEditPage from './edit-page'
import modifySearchPaage from './search-page'
import embed from './embed-scryfall-script'

export default function start () {
  const hostname = window.location.hostname
  if (hostname === 'tagger.scryfall.com') {
    modifyTagger()
    return
  } else if (hostname !== 'scryfall.com') {
    // if we're on a subdomain, we don't want
    // to run the main scryfall code
    return
  }
  embed()

  const path = window.location.pathname
  const urlPieces = path.substring(1, path.length).split('/')
  const page = urlPieces[0]

  // TODO separate scripts for each page or jsut do it this way?
  if (page === 'search' || page === 'sets') {
    modifySearchPaage()
  } else if (urlPieces[1] === 'decks' && urlPieces[2] && !urlPieces[3]) {
    modifyDeckDisplayPage()
  } else if (urlPieces[1] === 'decks' && urlPieces[3] === 'build') {
    modifyEditPage()
  }
}

start()
