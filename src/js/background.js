import '../img/icon-128.png'
import '../img/icon-34.png'

import {
  onInstalled,
  openOptionsPage,
  getManifest
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
