import Feature from "Feature";
import mutation from "Lib/mutation";
import { Identifier, getCollection } from "Lib/scryfall";
import { sortByAttribute } from "Lib/sort";
import createElement from "Lib/create-element";
import Modal from "Ui/modal";
import { FEATURE_IDS as ids, FEATURE_SECTIONS as sections } from "Constants";

import "./index.css";
import { Card } from "Js/types/deck";

const MAX_ENTRIES_TO_AUTO_LOOKUP = 75 * 2; // 2 collection API calls

export interface Token {
  name: string;
  id?: string;
  oracle_id?: string;
  scryfall_uri?: string;
  getImage: () => string;
}

class TokenList extends Feature {
  elements?: HTMLLinkElement[];
  modal?: Modal;
  private _addedToUI?: boolean;
  private _generateTokenCollectionPromise?: Promise<Token[]>;

  async run(): Promise<void> {
    // TODO this doesn't work with current implementation of mutation.ready
    // in that subsequent calls to ready will not work
    mutation.ready(
      "#shambleshark-deck-display-sidebar-toolbox",
      async (container: HTMLDivElement) => {
        this.createUI(container);
        this.getCardElements();

        if ((this.elements?.length || 0) <= MAX_ENTRIES_TO_AUTO_LOOKUP) {
          await this.generateTokenCollection();
        }
      }
    );
  }

  createUI(container: HTMLDivElement): void {
    const section = createElement(`<div>
      <button name="button" type="button" class="button-n">
        <b>Show Tokens</b>
      </button>
    </div>`).firstChild as HTMLButtonElement;
    const button = section.querySelector("button") as HTMLButtonElement;
    this.modal = new Modal({
      id: "token-list-modal",
      header: "Tokens",
      loadingMessage: "Loading tokens from deck",
      onOpen: async (modalInstance: Modal): Promise<void> => {
        // TODO add loading message if it takes too long
        const tokens = await this.generateTokenCollection();

        this.addToUI(tokens);

        modalInstance.setLoading(false);
      },
      onClose(): void {
        button.focus();
      },
    });
    document.body.appendChild(this.modal.element);

    button.addEventListener("click", () => {
      this.modal?.open();
    });

    container.appendChild(section);
  }

  addToUI(tokens: Token[]): void {
    if (this._addedToUI) {
      return;
    }

    this._addedToUI = true;

    if (tokens.length === 0) {
      this.modal?.setContent(
        createElement("<p>No tokens detected.</p>")
          .firstElementChild as HTMLParagraphElement
      );

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
      `).firstElementChild as HTMLLinkElement;

      container.appendChild(el);
    });

    this.modal?.setContent(container);
  }

  getCardElements(): void {
    this.elements = Array.from(
      document.querySelectorAll(".deck-list-entry .deck-list-entry-name a")
    );
    if (this.elements.length === 0) {
      this.elements = Array.from(
        document.querySelectorAll("a.card-grid-item-card")
      );
    }
  }

  async generateTokenCollection(): Promise<Token[]> {
    // TODO add meta data about what cards create the tokens
    if (this._generateTokenCollectionPromise) {
      return this._generateTokenCollectionPromise;
    }

    if (this.elements?.length === 0) {
      return Promise.resolve([]);
    }

    const entries = (this.elements || []).map((el) =>
      this.parseSetAndCollectorNumber(el.href)
    );

    this._generateTokenCollectionPromise = this.lookupTokens(entries).then(
      (tokenCollection: Token[][]) =>
        this.flattenTokenCollection(tokenCollection) || []
    );

    return this._generateTokenCollectionPromise;
  }

  parseSetAndCollectorNumber(url: string): Identifier {
    const parts = url.split("https://scryfall.com/card/")[1].split("/");
    const [set, collector_number] = parts;

    return {
      set,
      collector_number,
    };
  }

  async lookupTokens(entries: Identifier[]) {
    const cards = await getCollection(entries);
    const tokens = cards.map((c) => c.getTokens());

    return Promise.all(tokens);
  }

  flattenTokenCollection(tokenCollection: Token[][]): Token[] {
    return [...new Set(tokenCollection.flat())].sort(sortByAttribute(["name"]));
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
