import wait from "Lib/wait";
import { mocked } from "ts-jest/utils";
import {
  getDeck,
  getDeckMetadata,
  addCard,
  updateEntry,
  removeEntry,
  pushNotification,
  cleanUp,
  addHooksToCardManagementEvents,
} from "Js/scryfall-embed/scryfall-globals";
import modifyCleanUp from "Js/scryfall-embed/modify-clean-up";
import setUpListeners from "Js/scryfall-embed/set-up-listeners";
import * as bus from "framebus";

jest.mock("Js/scryfall-embed/scryfall-globals");

import { Card } from "Js/types/deck";
import {
  generateScryfallGlobal,
  generateScryfallAPIGlobal,
} from "../mocks/scryfall-global";
import { makeFakeDeck, makeFakeCard } from "Helpers/fake";

declare global {
  interface Window {
    Scryfall: any;
    ScryfallAPI: any;
  }
}

describe("set up listeners on Scryfall page", function () {
  beforeEach(function () {
    window.ScryfallAPI = generateScryfallAPIGlobal();
    window.Scryfall = generateScryfallGlobal();

    jest.spyOn(bus, "on").mockImplementation();
    jest.spyOn(bus, "emit").mockImplementation();
    mocked(getDeckMetadata).mockResolvedValue({
      sections: {
        primary: ["mainboard"],
        secondary: ["sideboard"],
      },
    });
    mocked(updateEntry).mockResolvedValue(null);
    mocked(removeEntry).mockResolvedValue(null);
  });

  it("listens for events", function () {
    setUpListeners();

    expect(bus.on).toBeCalledWith("REQUEST_DECK", expect.any(Function));
    expect(bus.on).toBeCalledWith(
      "SCRYFALL_PUSH_NOTIFICATION",
      expect.any(Function)
    );
    expect(bus.on).toBeCalledWith("ADD_CARD_TO_DECK", expect.any(Function));
    expect(bus.on).toBeCalledWith(
      "REMOVE_CARD_FROM_DECK",
      expect.any(Function)
    );
    expect(bus.on).toBeCalledWith("CLEAN_UP_DECK", expect.any(Function));
    expect(bus.on).toBeCalledWith("MODIFY_CLEAN_UP", modifyCleanUp);
  });

  it("reports that listeners are ready", function () {
    setUpListeners();

    expect(bus.emit).toBeCalledWith("SCRYFALL_LISTENERS_READY");
  });

  it("adds hooks to card management events", function () {
    setUpListeners();

    expect(addHooksToCardManagementEvents).toBeCalledTimes(1);
  });

  describe("REQUEST_DECK", function () {
    it("replies with the active deck passed into the setup script", function () {
      const fakeDeck = makeFakeDeck();
      const spy = jest.fn();

      mocked(getDeck).mockResolvedValue(fakeDeck);
      (bus.on as jest.Mock).mockImplementation(
        (event: string, cb: Function) => {
          if (event === "REQUEST_DECK") {
            cb(spy);
          }
        }
      );

      setUpListeners();

      return wait().then(() => {
        expect(getDeck).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toBe(fakeDeck);
      });
    });
  });

  describe("SCRYFALL_PUSH_NOTIFICATION", function () {
    let pushData: Record<string, string>;

    beforeEach(function () {
      (bus.on as jest.Mock).mockImplementation(
        (event: string, cb: Function) => {
          if (event === "SCRYFALL_PUSH_NOTIFICATION") {
            cb(pushData);
          }
        }
      );
    });

    it("sends a push notification", function () {
      pushData = {
        header: "header",
        message: "message",
        color: "blue",
        type: "foo",
      };

      setUpListeners();

      return wait().then(() => {
        expect(mocked(pushNotification).mock.calls.length).toBe(1);
        expect(mocked(pushNotification).mock.calls[0]).toEqual([
          "header",
          "message",
          "blue",
          "foo",
        ]);
      });
    });

    it("defaults push notification color to purple", function () {
      pushData = {
        header: "header",
        message: "message",
        type: "foo",
      };

      setUpListeners();

      return wait().then(() => {
        expect(mocked(pushNotification).mock.calls.length).toBe(1);
        expect(mocked(pushNotification).mock.calls[0]).toEqual([
          "header",
          "message",
          "purple",
          "foo",
        ]);
      });
    });

    it("defaults push notification type to deck", function () {
      pushData = {
        header: "header",
        message: "message",
        color: "blue",
      };

      setUpListeners();

      return wait().then(() => {
        expect(mocked(pushNotification).mock.calls.length).toBe(1);
        expect(mocked(pushNotification).mock.calls[0]).toEqual([
          "header",
          "message",
          "blue",
          "deck",
        ]);
      });
    });
  });

  describe("ADD_CARD_TO_DECK", function () {
    let cardData: Record<string, string>, scryfallCard: Card;

    beforeEach(function () {
      cardData = {
        cardName: "Rashmi, Eternities Crafter",
        cardId: "id-1",
      };
      scryfallCard = makeFakeCard({
        id: "id",
        section: "mainboard",
        cardDigest: {
          oracle_id: "oracle-id",
          type_line: "Creature",
        },
      });
      (bus.on as jest.Mock).mockImplementation(
        (event: string, cb: Function) => {
          if (event === "ADD_CARD_TO_DECK") {
            cb(cardData);
          }
        }
      );
      mocked(addCard).mockResolvedValue(scryfallCard);
    });

    it("adds card to active deck", function () {
      setUpListeners();

      expect(mocked(addCard).mock.calls.length).toBe(1);
      expect(mocked(addCard).mock.calls[0][0]).toBe("id-1");
    });

    it("updates card for specific section if section is specified", function () {
      cardData.section = "sideboard";

      setUpListeners();

      return wait().then(() => {
        expect(mocked(updateEntry).mock.calls.length).toBe(1);
        expect(scryfallCard.section).toBe("sideboard");
        expect(mocked(updateEntry).mock.calls[0][0]).toBe(scryfallCard);
      });
    });

    it("updates card for specific section if section is specified even when card is a land card and there is a dedicated land section", function () {
      cardData.section = "sideboard";
      scryfallCard.card_digest!.type_line = "Land";
      mocked(getDeckMetadata).mockResolvedValue({
        sections: {
          mainboard: ["lands"],
        },
      });

      setUpListeners();

      return wait().then(() => {
        expect(mocked(updateEntry).mock.calls.length).toBe(1);
        expect(scryfallCard.section).toBe("sideboard");
        expect(mocked(updateEntry).mock.calls[0][0]).toBe(scryfallCard);
      });
    });

    it("updates lands to be put in lands section if deck has dedicated lands section and no section is specified", function () {
      scryfallCard.card_digest!.type_line = "Land";
      mocked(getDeckMetadata).mockResolvedValue({
        sections: {
          mainboard: ["lands"],
        },
      });

      setUpListeners();

      return wait().then(() => {
        expect(mocked(updateEntry).mock.calls.length).toBe(1);
        expect(scryfallCard.section).toBe("lands");
        expect(mocked(updateEntry).mock.calls[0][0]).toBe(scryfallCard);
      });
    });

    it("does not update lands to be put in lands section if deck does not have dedicated lands section", function () {
      scryfallCard.card_digest!.type_line = "Land";

      setUpListeners();

      return wait().then(() => {
        expect(mocked(updateEntry).mock.calls.length).toBe(0);
      });
    });

    it("does not update non-lands to be put in lands section", function () {
      setUpListeners();

      return wait().then(() => {
        expect(mocked(updateEntry).mock.calls.length).toBe(0);
      });
    });

    it("sends a push notification", function () {
      setUpListeners();

      return wait().then(() => {
        expect(mocked(pushNotification).mock.calls.length).toBe(1);
        expect(mocked(pushNotification).mock.calls[0]).toEqual([
          "Card Added",
          "Added Rashmi, Eternities Crafter.",
          "purple",
          "deck",
        ]);
      });
    });
  });

  describe("REMOVE_CARD_FROM_DECK", function () {
    let cardData: Record<string, string>;

    beforeEach(function () {
      cardData = {
        cardName: "Rashmi, Etrnities Crafter",
      };
      (bus.on as jest.Mock).mockImplementation(
        (event: string, cb: Function) => {
          if (event === "REMOVE_CARD_FROM_DECK") {
            cb(cardData);
          }
        }
      );
      mocked(getDeck).mockResolvedValue({
        entries: {
          commanders: [
            {
              id: "rashmi-id",
              count: 1,
              card_digest: {
                name: "Rashmi, Etrnities Crafter",
              },
            },
            {
              // empty object, no card info
            },
          ],
          nonlands: [
            {
              id: "birds-id",
              count: 2,
              card_digest: {
                name: "Birds of Paradise",
              },
            },
          ],
        },
      });
    });

    it("removes card from deck if there was only 1 left", async function () {
      setUpListeners();

      await wait(5);

      expect(removeEntry).toBeCalledTimes(1);
      expect(removeEntry).toBeCalledWith("rashmi-id");
    });

    it("decrements count if card has more than 1 entry", async function () {
      cardData.cardName = "Birds of Paradise";

      setUpListeners();

      await wait(5);

      expect(removeEntry).toBeCalledTimes(0);
      expect(updateEntry).toBeCalledTimes(1);
      expect(updateEntry).toBeCalledWith({
        id: "birds-id",
        count: 1,
        card_digest: {
          name: "Birds of Paradise",
        },
      });
    });

    it("sends a push notification", async function () {
      setUpListeners();

      await wait(5);

      expect(pushNotification).toBeCalledTimes(1);
      expect(pushNotification).toBeCalledWith(
        "Card Removed",
        "Removed Rashmi, Etrnities Crafter.",
        "purple",
        "deck"
      );
    });
  });

  describe("CLEAN_UP_DECK", function () {
    beforeEach(function () {
      (bus.on as jest.Mock).mockImplementation(
        (event: string, cb: Function) => {
          if (event === "CLEAN_UP_DECK") {
            cb();
          }
        }
      );
    });

    it("calls cleanup", function () {
      setUpListeners();

      expect(cleanUp).toBeCalledTimes(1);
    });
  });
});
