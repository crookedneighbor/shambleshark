import 'bulma/css/bulma.min.css'
import 'bulma-switch/dist/css/bulma-switch.min.css'
import '../css/options.css'
import '../img/big-logo.png'

import globalFeatures from './features/global-features'
import deckbuilderFeatures from './features/deck-builder-features'
import deckViewFeatures from './features/deck-view-features'

const features = globalFeatures
  .concat(deckbuilderFeatures)
  .concat(deckViewFeatures)

function setupToggleListeners (element, fn) {
  element.addEventListener('change', fn)
  element.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      element.checked = !element.checked
      fn()
    }
  })
}

const page = document.createElement('div')
page.innerHTML = `
<section class="hero is-primary is-fullheight">
  <div class="hero-body">
    <div id="settings-container" class="container">
      <div class="columns is-5-tablet is-4-desktop is-3-widescreen">
        <div class="column has-text-centered">
          <img src="big-logo.png" />
        </div>
      </div>
      <div class="columns is-5-tablet is-4-desktop is-3-widescreen">
        <div class="column box">
          <form id="settings-form">
            <h3 class="subtitle has-text-dark has-text-centered">Unofficial Scryfall Browser Extension</h3>

            <div id="global">
              <h2 class="title has-text-dark">Global Settings</h2>
            </div>
            <div id="deck-builder">
              <h2 class="title has-text-dark">Deckbuilder Page</h2>
            </div>
            <hr>
            <div id="deck-view">
              <h2 class="title has-text-dark">Deck View Page</h2>
            </div>
            <hr>
          </form>
          <footer class="footer is-paddingless">
            <div class="has-text-centered">
              <p>
                This browser extension is not affiliated nor endorsed by Scryfall LLC.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </div>
</section>
`

Promise.all(features.map((Feature) => {
  const container = document.createElement('fieldset')
  const data = Feature.metadata
  const section = page.querySelector(`#${data.section}`)
  const enabledSwitchId = `${data.id}-enabled-switch`
  const isFutureFeature = data.futureFeature

  let title = data.title

  if (isFutureFeature) {
    title += ' (Coming Soon)'
  }

  container.className = 'field'

  container.innerHTML = `
    <div>
      <input id="${enabledSwitchId}" type="checkbox" class="switch" aria-label="${title} toggle - ${data.description}">
      <label class="has-text-weight-bold" for="${enabledSwitchId}">${title}</label>
    </div>
    <p class="content">${data.description}</p>
    <div class="disabled-overlay"></div>
  `

  if (isFutureFeature) {
    container.setAttribute('disabled', 'disabled')
  }

  section.appendChild(container)
  // construct HTML for additioanl settings

  return Feature.getSettings().then((settings) => {
    const enabledSwitch = container.querySelector('input')

    setupToggleListeners(enabledSwitch, () => {
      if (enabledSwitch.checked) {
        Feature.enable()
      } else {
        Feature.disable()
      }
    })

    if (!isFutureFeature && settings.enabled) {
      enabledSwitch.checked = true
    }
  })
})).then(() => {
  document.body.appendChild(page)
})
