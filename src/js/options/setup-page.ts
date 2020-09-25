import "bulma/css/bulma.min.css";
import "bulma-switch/dist/css/bulma-switch.min.css";
import "./options.css";

import createElement from "Lib/create-element";

import Feature, {
  SettingsDefinition,
  CheckboxSettingsDefinition,
  ListSettingsDefinition,
} from "Feature";
import globalFeatures from "Features/global-features";
import cardPageFeatures from "Features/card-page-features";
import deckbuilderFeatures from "Features/deck-builder-features";
import deckViewFeatures from "Features/deck-view-features";
import searchResultsFeatures from "Features/search-results-features";

const features = globalFeatures
  .concat(cardPageFeatures)
  .concat(deckbuilderFeatures)
  .concat(deckViewFeatures)
  .concat(searchResultsFeatures);

function setupToggleListeners(element: HTMLInputElement, fn: () => void) {
  element.addEventListener("change", () => {
    fn();
  });
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      element.checked = !element.checked;
      fn();
    }
  });
}

function createCheckbox(
  def: CheckboxSettingsDefinition,
  inputValue: boolean,
  ChildFeature: typeof Feature
): HTMLLabelElement {
  const id = makeInputId(def);
  const checkboxContainer = createElement<HTMLLabelElement>(`<label
    class="checkbox"
    for="${id}"
  >
    <input type="checkbox" id="${id}" />
    ${def.label}
  </label>`);
  const checkbox = checkboxContainer.querySelector("input") as HTMLInputElement;
  checkbox.checked = inputValue;
  checkbox.addEventListener("change", () => {
    ChildFeature.saveSetting(def.id, checkbox.checked);

    if (def.onChange) {
      def.onChange(checkbox.checked);
    }
  });

  return checkboxContainer;
}

function createList(
  def: ListSettingsDefinition,
  inputValue: string,
  ChildFeature: typeof Feature
): HTMLDivElement {
  const id = makeInputId(def);
  const options = def.options
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join("\n");
  const container = createElement<HTMLDivElement>(`<div class="field">
    <label for="${id}"><p>${def.label}</p></label>

    <div class="select">
      <select id="${id}">
        ${options}
      </select>
    </div>
  </div>`);
  const select = container.querySelector("select") as HTMLSelectElement;

  select.value = inputValue;
  select.addEventListener("change", () => {
    ChildFeature.saveSetting(def.id, select.value);

    if (def.onChange) {
      def.onChange(select.value);
    }
  });

  return container;
}

function makeInputId(def: SettingsDefinition): string {
  return `${def.id}-input`;
}

function createInputForType(
  def: SettingsDefinition,
  inputValue: string | boolean,
  ChildFeature: typeof Feature
): HTMLElement {
  switch (def.input) {
    case "checkbox":
      return createCheckbox(def, inputValue as boolean, ChildFeature);
    case "list":
      return createList(
        def as ListSettingsDefinition,
        inputValue as string,
        ChildFeature
      );
  }

  const input = document.createElement("input");
  input.id = makeInputId(def);

  return input;
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
              <div id="card-page">
                <h2 class="title has-text-dark">Card Detail Page</h2>
              </div>
              <hr>
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
        const input = createInputForType(
          def,
          settings[def.id] as string,
          Feature
        );
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
