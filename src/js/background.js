import '../img/icon-128.png'
import '../img/icon-34.png'

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    // TODO welcome screen?
  } else if (details.reason === 'update') {
    const version = chrome.runtime.getManifest().version

    // TODO apply defaults for any new features
    console.log('Updated from ' + details.previousVersion + ' to ' + version + '!')
  }
})
