import Feature from "Feature";
import mutation from "Lib/mutation";
import scryfall from "Lib/scryfall";
import { sortByAttribute } from "Lib/sort";
import createElement from "Lib/create-element";
import Modal from "Ui/modal";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";

import "./index.css";

const MAX_ENTRIES_TO_AUTO_LOOKUP = 75 * 2; // 2 collection API calls

class TokenList extends Feature {
  async run() {
    // TODO this doesn't work with current implementation of mutation.ready
    // in that subsequent calls to ready will not work
    mutation.ready(
      "#shambleshark-deck-display-sidebar-toolbox",
      async (container) => {
        this.createUI(container);
        this.getCardElements();

        if (this.elements.length <= MAX_ENTRIES_TO_AUTO_LOOKUP) {
          this.generateTokenCollection();
        }
      }
    );
  }

  createUI(container) {
    const section = createElement(`<div>
      <button name="button" type="button" class="button-n">
        <b>Show Tokens</b>
      </button>
    </div>`).firstChild;
    const button = section.querySelector("button");
    this.modal = new Modal({
      id: "token-list-modal",
      header: "Tokens",
      loadingMessage: "Loading tokens from deck",
      onOpen: async (modalInstance) => {
        // TODO add loading message if it takes too long
        const tokens = await this.generateTokenCollection();

        this.addToUI(tokens);

        modalInstance.setLoading(false);
      },
      onClose() {
        button.focus();
      },
    });
    document.body.appendChild(this.modal.element);

    button.addEventListener("click", () => {
      this.modal.open();
    });

    container.appendChild(section);
  }

  addToUI(tokens) {
    if (this._addedToUI) {
      return;
    }

    this._addedToUI = true;

    if (tokens.length === 0) {
      this.modal.setContent(createElement("<p>No tokens detected.</p>"));

      return;
    }

    const container = document.createElement("div");
    container.classList.add("token-list-img-container");

    tokens.forEach((token) => {
      const el = createElement(`
        <a href="${token.scryfall_uri}">
          <img class="token-list-img" src="${token.getImage()}" alt="${
        token.name
      }">
        </a>
      `).firstChild;

      container.appendChild(el);
    });

    this.modal.setContent(container);
  }

  lookupCardCollection(cards) {
    return scryfall.api.post("/cards/collection", {
      identifiers: cards,
    });
  }

  getCardElements() {
    this.elements = Array.from(
      document.querySelectorAll(".deck-list-entry .deck-list-entry-name a")
    );
    if (this.elements.length === 0) {
      this.elements = Array.from(
        document.querySelectorAll("a.card-grid-item-card")
      );
    }
  }

  async generateTokenCollection() {
    // TODO add meta data about what cards create the tokens
    if (this._generateTokenCollectionPromise) {
      return this._generateTokenCollectionPromise;
    }

    if (this.elements.length === 0) {
      return Promise.resolve([]);
    }

    const entries = this.elements.map((el) =>
      this.parseSetAndCollectorNumber(el.href)
    );

    this._generateTokenCollectionPromise = this.lookupTokens(entries).then(
      (tokenCollection) => {
        return this.flattenTokenCollection(tokenCollection);
      }
    );

    return this._generateTokenCollectionPromise;
  }

  parseSetAndCollectorNumber(url) {
    const parts = url.split("https://scryfall.com/card/")[1].split("/");
    const set = parts[0];
    const number = parts[1];

    return {
      set,
      collector_number: number,
    };
  }

  async lookupTokens(entries) {
    const cards = await scryfall.getCollection(entries);
    const tokens = cards.map((c) => c.getTokens());

    return Promise.all(tokens);
  }

  flattenTokenCollection(tokenCollection) {
    const flattenedTokens = tokenCollection.flat().reduce((tokens, token) => {
      if (!tokens.find((t) => t.oracle_id === token.oracle_id)) {
        tokens.push(token);
      }

      return tokens;
    }, []);

    flattenedTokens.sort(sortByAttribute(["name"]));

    return flattenedTokens;
  }
}

TokenList.metadata = {
  id: ids.TokenList,
  title: "Token List",
  section: sections.DECK_VIEW,
  description: "List tokens created by cards in the deck.",
};
TokenList.settingsDefaults = {
  enabled: true,
};
TokenList.usesSidebar = true;

export default TokenList;
