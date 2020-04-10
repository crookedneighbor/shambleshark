import mutation from "Lib/mutation";
import scryfall from "Lib/scryfall";
import deckParser from "Lib/deck-parser";
import iframe from "Lib/iframe";

export default async function addEDHRecIframe(button) {
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

async function setDisabledState(button, commanders) {
  const allLegal = await deckParser.hasLegalCommanders(commanders);

  // TODO: should we mark it as enabled if at least one commander
  // is a legal commander, and then only send the legal ones to edhrec?
  if (allLegal) {
    button.removeAttribute("disabled");
  } else {
    button.setAttribute("disabled", "disabled");
  }
}

async function getInitialCommanderList() {
  const initialDeck = await scryfall.getDeck();

  return initialDeck.entries.commanders
    .filter(filterOutInvalidCards)
    .map(getCardName)
    .sort();
}

function updateButtonStateOnCommanderChange(button, commanders) {
  mutation.change(
    ".deckbuilder-editor-inner .deckbuilder-column .deckbuilder-section",
    async (el) => {
      const title = el.querySelector(".deckbuilder-section-title");

      if (title.innerText.toLowerCase().indexOf("commander") === -1) {
        // only run mutation on commander column
        return;
      }

      const commanderList = Array.from(
        el.querySelectorAll("ul .deckbuilder-entry")
      ).reduce((all, entry) => {
        // if the select options have more than 2 disabled, this
        // indicates that the card lookup has not completed, so
        // we ignore this value
        const cardLookupNotComplete =
          entry.querySelectorAll(
            ".deckbuilder-entry-menu-select option[disabled]"
          ).length > 2;

        if (cardLookupNotComplete) {
          return all;
        }

        const input = entry.querySelector(".deckbuilder-entry-input");
        const parts = input.value.trim().match(/^(\d+ )(.*)/);
        if (!parts) {
          return all;
        }
        const name = parts[2];

        all.push(name);

        return all;
      }, []);

      commanderList.sort();

      // hack to determine if the arrays are equal
      if (commanderList.join("|") !== commanders.join("|")) {
        commanders = commanderList;
        await setDisabledState(button, commanders);
      }
    }
  );
}

function filterOutInvalidCards(card) {
  return card.card_digest;
}

function getCardName(card) {
  return card.card_digest.name;
}
