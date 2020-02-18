import '../img/icon-128.png'
import '../img/icon-34.png'

import {
  onInstalled,
  openOptionsPage,
  getManifest,
  onHeadersReceived
} from 'Browser/runtime'

onInstalled().addListener(function (details) {
  if (details.reason === 'install') {
    openOptionsPage()
  } else if (details.reason === 'update') {
    const version = getManifest().version

    // TODO apply defaults for any new features
    console.log('Updated from ' + details.previousVersion + ' to ' + version + '!')
  }
})

// removes the headers that prevent loading Tagger in an iframe
onHeadersReceived({
  addListener (info) {
    const headers = info.responseHeaders.filter(rawHeader => {
      const header = rawHeader.name.toLowerCase();

      return header !== 'x-frame-options' && header !== 'frame-options'
    })

    return {responseHeaders: headers};
  },
  config: {
    urls: [ '*://tagger.scryfall.com/*' ],
    types: [ 'sub_frame' ]
  },
  permissions: [
    'blocking',
    'responseHeaders'
  ]
})
