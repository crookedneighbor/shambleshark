import modifyEditPage from './edit-page'
import embed from './embed-scryfall-script'

export default function start () {
  embed()

  const urlPieces = window.location.href.split('/')
  const page = urlPieces[urlPieces.length - 1].split('#')[0].split('?')[0]

  // TODO separate scripts for each page or jsut do it this way?
  if (page === 'build') {
    modifyEditPage()
  }
}

start()
