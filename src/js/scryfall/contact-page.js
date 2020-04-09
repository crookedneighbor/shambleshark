import mutation from 'Lib/mutation'
import createElement from 'Lib/create-element'
import link from 'Browser/extensions-link'

import './contact-page.css'

export default function () {
  mutation.ready('.control-panel-content', (panel) => {
    const warning = createElement(`<div class="form-n">
      <h1 class="form-n-title">IMPORTANT! Read this first!</h1>

      <p class="shambleshark__contact-p">You currently have Shambleshark (unofficial Scryfall browser extension) enabled. This extension is not developed by the Scryfall team.</p>

      <p class="shambleshark__contact-p">If you are reporting an issue with Scryfall, it's possible that the problem is being caused by Shambleshark. So first <strong>disable</strong> the extension (go to <code>${link}</code> in your browser's address bar) and then see if your issue persists. If it does, go ahead and contact the Scryfall team. (and don't forget to turn Shambleshark back on!)</p>

      <p class="shambleshark__contact-p">If your issue is resolved (or the feature you were contacting about disappears entirely), you should log an issue on Shambleshark's Github page.</p>

      <div class="form-n-stage">
        <a type="button" class="button-n primary" href="https://github.com/crookedneighbor/shambleshark/issues">
          <b>Report an Issue with Shambleshark</b>
        </a>
      </div>
    </div>`).firstChild

    panel.insertBefore(warning, panel.firstChild)
  })
}
