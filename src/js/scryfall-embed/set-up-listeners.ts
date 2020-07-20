import bus from "framebus";
import { BUS_EVENTS as events } from "Constants";
import Scryfall from "./scryfall-globals";
import modifyCleanUp from "./modify-clean-up";
import {
  hasDedicatedLandSection,
  isLandCard,
  flattenEntries,
} from "Lib/deck-parser";

import type { Card, Deck, DeckSections } from "Js/types/deck";

export default function setUpListeners(): void {
  Scryfall.addHooksToCardManagementEvents();

  bus.on(events.REQUEST_DECK, function (reply: (deck: Deck) => void) {
    // TODO need to update bus to be a generic so
    // you can specify what the shape of the payload is
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Scryfall.getDeck().then(reply);
  });

  bus.on(events.SCRYFALL_PUSH_NOTIFICATION, function ({
    header,
    message,
    color = "purple",
    type = "deck",
  }: {
    header: string;
    message: string;
    color: string;
    type: string;
  }) {
    // TODO need to update bus to be a generic so
    // you can specify what the shape of the payload is
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Scryfall.pushNotification(header, message, color, type);
  });

  bus.on(events.ADD_CARD_TO_DECK, function ({
    cardName,
    cardId,
    section,
  }: {
    cardName: string;
    cardId: string;
    section: string;
  }) {
    // adds card if it does not exist and increments
    // the card if it already exists
    Scryfall.addCard(cardId as string).then(function (addedCardInfo) {
      if (section) {
        addedCardInfo.section = section as DeckSections;
        Scryfall.updateEntry(addedCardInfo);
      } else if (isLandCard(addedCardInfo)) {
        // TODO consier getting rid of getDeckMetatdata helper
        Scryfall.getDeckMetadata().then((meta) => {
          if (hasDedicatedLandSection(meta as Deck)) {
            addedCardInfo.section = "lands";
            Scryfall.updateEntry(addedCardInfo);
          }
        });
      }
      Scryfall.pushNotification(
        "Card Added",
        `Added ${cardName}.`,
        "purple",
        "deck"
      );
    });
  });

  bus.on(events.REMOVE_CARD_FROM_DECK, function ({
    cardName,
  }: {
    cardName: string;
  }) {
    Scryfall.getDeck()
      .then((deck) => {
        const entries = flattenEntries(deck);
        const cardToRemove = entries.find((card) => {
          if (!card.card_digest) {
            return false;
          }

          return card.card_digest.name === cardName;
        }) as Card;

        if (cardToRemove.count <= 1) {
          return Scryfall.removeEntry(cardToRemove.id);
        } else {
          cardToRemove.count--;
          return Scryfall.updateEntry(cardToRemove).then(() => {
            // to make this match the same return signature as removeEntry
            return Promise.resolve();
          });
        }
      })
      .then(() => {
        Scryfall.pushNotification(
          "Card Removed",
          `Removed ${cardName}.`,
          "purple",
          "deck"
        );
      });
  });

  bus.on(events.MODIFY_CLEAN_UP, modifyCleanUp);

  bus.on(events.CLEAN_UP_DECK, function () {
    Scryfall.cleanUp();
  });

  bus.emit(events.SCRYFALL_LISTENERS_READY);
}
