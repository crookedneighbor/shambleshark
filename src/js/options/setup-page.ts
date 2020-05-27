import "bulma/css/bulma.min.css";
import "bulma-switch/dist/css/bulma-switch.min.css";
import "./options.css";

import createElement from "Lib/create-element";

import Feature, { SettingsDefinition } from "Feature";
import globalFeatures from "Features/global-features";
import deckbuilderFeatures from "Features/deck-builder-features";
import deckViewFeatures from "Features/deck-view-features";
import searchResultsFeatures from "Features/search-results-features";

const features = globalFeatures
  .concat(deckbuilderFeatures)
  .concat(deckViewFeatures)
  .concat(searchResultsFeatures);

function setupToggleListeners(element: HTMLInputElement, fn: () => void) {
  element.addEventListener("change", function () {
    fn();
  });
  element.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      element.checked = !element.checked;
      fn();
    }
  });
}

function createCheckbox(
  def: SettingsDefinition,
  inputValue: boolean,
  ChildFeature: typeof Feature
): HTMLLabelElement {
  const checkboxContainer = createElement<HTMLLabelElement>(`<label
    class="checkbox"
  >
    <input type="checkbox" id="${def.id}-checkbox" />
    ${def.label}
  </label>`);
  const checkbox = checkboxContainer.querySelector("input") as HTMLInputElement;
  checkbox.checked = inputValue;
  checkbox.addEventListener("change", () => {
    ChildFeature.saveSetting(def.id, checkbox.checked);
  });

  return checkboxContainer;
}

function createInputForType(
  def: SettingsDefinition,
  inputValue: boolean,
  ChildFeature: typeof Feature
): HTMLElement {
  switch (def.input) {
    case "checkbox":
      return createCheckbox(def, inputValue, ChildFeature);
  }

  return document.createElement("input");
}

const page = createElement(`<div>
  <section class="hero is-primary is-fullheight">
    <div class="hero-body">
      <div id="settings-container" class="container">
        <div class="columns is-5-tablet is-4-desktop is-3-widescreen">
          <div class="column has-text-centered">
            <h1 class="title has-text-centered">Shambleshark</h1>
            <h3 class="subtitle has-text-centered">Unofficial Scryfall Browser Extension</h3>
          </div>
        </div>
        <div class="columns is-5-tablet is-4-desktop is-3-widescreen">
          <div class="column box">
            <p>An unofficial browser extension to add additional functionality to the <a href="https://scryfall.com">Scryfall website</a>. This extension is not developed by the Scryfall team. For support with the extension, please <a href="https://github.com/crookedneighbor/shambleshark/issues">open an issue on Github</a>.</p>
            <br />

            <form id="settings-form">
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
              <div id="search-results">
                <h2 class="title has-text-dark">Search Results</h2>
              </div>
              <hr>
            </form>
            <footer class="footer is-paddingless">
              <div class="has-text-centered">
                <p>
                  This browser extension is not affiliated with nor endorsed by Scryfall LLC.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>`);

Promise.all(
  features.map((Feature) => {
    const data = Feature.metadata;
    const section = page.querySelector(`#${data.section}`) as HTMLElement;
    const enabledSwitchId = `${data.id}-enabled-switch`;
    const isFutureFeature = data.futureFeature === true;

    let title = data.title;

    if (isFutureFeature) {
      title += " (Coming Soon)";
    }

    const container = createElement(`<fieldset
    class="field"
  >
    <div>
      <input id="${enabledSwitchId}" type="checkbox" class="switch" aria-label="${title} toggle - ${data.description}">
      <label class="has-text-weight-bold" for="${enabledSwitchId}">${title}</label>
    </div>
    <p class="content feature-description">${data.description}</p>
  </fieldset>`);

    if (isFutureFeature) {
      container.setAttribute("disabled", "disabled");
    }

    section.appendChild(container);
    // construct HTML for additioanl settings

    return Feature.getSettings().then((settings) => {
      const enabledSwitch = container.querySelector(
        "input"
      ) as HTMLInputElement;

      setupToggleListeners(enabledSwitch, () => {
        if (enabledSwitch.checked) {
          Feature.enable();
        } else {
          Feature.disable();
        }
      });

      if (!isFutureFeature && settings.enabled) {
        enabledSwitch.checked = true;
      }

      if (Feature.settingDefinitions.length) {
        container
          .querySelector(".feature-description")
          ?.classList.add("has-options");
      }

      Feature.settingDefinitions.forEach((def: SettingsDefinition) => {
        const input = createInputForType(def, settings[def.id], Feature);
        input.classList.add("feature-option");

        if (input) {
          container.appendChild(input);
        }
      });

      const disabledOverlay = document.createElement("div");
      disabledOverlay.classList.add("disabled-overlay");
      container.appendChild(disabledOverlay);
    });
  })
).then(() => {
  document.body.appendChild(page);
});
