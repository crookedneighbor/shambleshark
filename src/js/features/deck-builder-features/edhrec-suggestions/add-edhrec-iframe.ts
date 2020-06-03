import { change as elementChange } from "Lib/mutation";
import { getDeck } from "Lib/scryfall";
import deckParser from "Lib/deck-parser";
import iframe from "Lib/iframe";

import { Card } from "Js/types/deck";

function filterOutInvalidCards(card: Card) {
  return card.card_digest;
}

function getCardName(card: Card): string {
  if (!card.card_digest) {
    return "";
  }

  return card.card_digest.name;
}

async function getInitialCommanderList(): Promise<string[]> {
  const initialDeck = await getDeck();
  const commanders = initialDeck.entries.commanders || [];

  return commanders.filter(filterOutInvalidCards).map(getCardName).sort();
}

async function setDisabledState(
  button: HTMLButtonElement,
  commanders: string[]
) {
  const allLegal = await deckParser.hasLegalCommanders(commanders);

  // TODO: should we mark it as enabled if at least one commander
  // is a legal commander, and then only send the legal ones to edhrec?
  if (allLegal) {
    button.removeAttribute("disabled");
  } else {
    button.setAttribute("disabled", "disabled");
  }
}

function updateButtonStateOnCommanderChange(
  button: HTMLButtonElement,
  commanders: string[]
) {
  elementChange(
    ".deckbuilder-editor-inner .deckbuilder-column .deckbuilder-section",
    async (el) => {
      const title = el.querySelector<HTMLElement>(".deckbuilder-section-title");

      if (title?.innerText.toLowerCase().indexOf("commander") === -1) {
        // only run mutation on commander column
        return;
      }

      const commanderList: string[] = [];
      Array.from(el.querySelectorAll("ul .deckbuilder-entry")).forEach(
        (entry) => {
          // if the select options have more than 2 disabled, this
          // indicates that the card lookup has not completed, so
          // we ignore this value
          const cardLookupNotComplete =
            entry.querySelectorAll(
              ".deckbuilder-entry-menu-select option[disabled]"
            ).length > 2;

          if (cardLookupNotComplete) {
            return;
          }

          const input = entry.querySelector<HTMLInputElement>(
            ".deckbuilder-entry-input"
          );
          const parts = input?.value.trim().match(/^(\d+ )(.*)/);
          if (!parts) {
            return;
          }
          const name = parts[2];

          commanderList.push(name);
        }
      );

      commanderList.sort();

      // hack to determine if the arrays are equal
      if (commanderList.join("|") !== commanders.join("|")) {
        commanders = commanderList;
        await setDisabledState(button, commanders);
      }
    }
  );
}

export default async function addEDHRecIframe(
  button: HTMLButtonElement
): Promise<void> {
  await iframe.create({
    // does not matter where on edhrec we open the page
    // just need to be on the edhrec domain to access
    // the recs JSON endpoint
    src: "https://edhrec.com/404",
    id: "edhrec-suggestions-iframe",
  });

  const initialCommanders = await getInitialCommanderList();
  await setDisabledState(button, initialCommanders);

  updateButtonStateOnCommanderChange(button, initialCommanders);
}
