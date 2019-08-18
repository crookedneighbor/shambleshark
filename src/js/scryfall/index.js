import modifyEditPage from './edit-page'

export default function start () {
  const urlPieces = window.location.href.split('/')
  const page = urlPieces[urlPieces.length - 1]

  // TODO separate scripts for each page or jsut do it this way?
  if (page === 'build') {
    modifyEditPage()
  }
}

start()
