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
import bus from "framebus";

jest.mock("Js/scryfall-embed/scryfall-globals");
jest.mock("framebus");

import { Card } from "Js/types/deck";
import {
  generateScryfallGlobal,
  generateScryfallAPIGlobal,
} from "../mocks/scryfall-global";
import { makeFakeDeck, makeFakeCard } from "Helpers/fake";

type FramebusMockCallback<T = Record<string, string>> = (arg: T) => void;

describe("set up listeners on Scryfall page", () => {
  beforeEach(() => {
    window.ScryfallAPI = generateScryfallAPIGlobal();
    window.Scryfall = generateScryfallGlobal();

    mocked(getDeckMetadata).mockResolvedValue({
      id: "deck-id",
      sections: {
        primary: ["mainboard"],
        secondary: ["sideboard"],
      },
    });
    mocked(updateEntry).mockResolvedValue(makeFakeCard());
    mocked(removeEntry).mockResolvedValue();
  });

  it("listens for events", () => {
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

  it("reports that listeners are ready", () => {
    setUpListeners();

    expect(bus.emit).toBeCalledWith("SCRYFALL_LISTENERS_READY");
  });

  it("adds hooks to card management events", () => {
    setUpListeners();

    expect(addHooksToCardManagementEvents).toBeCalledTimes(1);
  });

  describe("REQUEST_DECK", () => {
    it("replies with the active deck passed into the setup script", () => {
      const fakeDeck = makeFakeDeck();
      const spy = jest.fn();

      mocked(getDeck).mockResolvedValue(fakeDeck);
      (bus.on as jest.Mock).mockImplementation(
        (event: string, cb: FramebusMockCallback<jest.Mock>) => {
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

  describe("SCRYFALL_PUSH_NOTIFICATION", () => {
    let pushData: Record<string, string>;

    beforeEach(() => {
      (bus.on as jest.Mock).mockImplementation(
        (event: string, cb: FramebusMockCallback) => {
          if (event === "SCRYFALL_PUSH_NOTIFICATION") {
            cb(pushData);
          }
        }
      );
    });

    it("sends a push notification", () => {
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

    it("defaults push notification color to purple", () => {
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

    it("defaults push notification type to deck", () => {
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

  describe("ADD_CARD_TO_DECK", () => {
    let cardData: Record<string, string>, scryfallCard: Card;

    beforeEach(() => {
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
        (event: string, cb: FramebusMockCallback) => {
          if (event === "ADD_CARD_TO_DECK") {
            cb(cardData);
          }
        }
      );
      mocked(addCard).mockResolvedValue(scryfallCard);
    });

    it("adds card to active deck", () => {
      setUpListeners();

      expect(mocked(addCard).mock.calls.length).toBe(1);
      expect(mocked(addCard).mock.calls[0][0]).toBe("id-1");
    });

    it("updates card for specific section if section is specified", () => {
      cardData.section = "sideboard";

      setUpListeners();

      return wait().then(() => {
        expect(mocked(updateEntry).mock.calls.length).toBe(1);
        expect(scryfallCard.section).toBe("sideboard");
        expect(mocked(updateEntry).mock.calls[0][0]).toBe(scryfallCard);
      });
    });

    it("updates card for specific section if section is specified even when card is a land card and there is a dedicated land section", () => {
      cardData.section = "sideboard";
      scryfallCard.card_digest!.type_line = "Land";
      mocked(getDeckMetadata).mockResolvedValue({
        id: "deck-id",
        sections: {
          primary: ["nonlands"],
          secondary: ["lands"],
        },
      });

      setUpListeners();

      return wait().then(() => {
        expect(mocked(updateEntry).mock.calls.length).toBe(1);
        expect(scryfallCard.section).toBe("sideboard");
        expect(mocked(updateEntry).mock.calls[0][0]).toBe(scryfallCard);
      });
    });

    it("updates lands to be put in lands section if deck has dedicated lands section and no section is specified", () => {
      scryfallCard.card_digest!.type_line = "Land";
      mocked(getDeckMetadata).mockResolvedValue({
        id: "deck-id",
        sections: {
          primary: ["nonlands"],
          secondary: ["lands"],
        },
      });

      setUpListeners();

      return wait().then(() => {
        expect(mocked(updateEntry).mock.calls.length).toBe(1);
        expect(scryfallCard.section).toBe("lands");
        expect(mocked(updateEntry).mock.calls[0][0]).toBe(scryfallCard);
      });
    });

    it("does not update lands to be put in lands section if deck does not have dedicated lands section", () => {
      scryfallCard.card_digest!.type_line = "Land";

      setUpListeners();

      return wait().then(() => {
        expect(mocked(updateEntry).mock.calls.length).toBe(0);
      });
    });

    it("does not update non-lands to be put in lands section", () => {
      setUpListeners();

      return wait().then(() => {
        expect(mocked(updateEntry).mock.calls.length).toBe(0);
      });
    });

    it("sends a push notification", () => {
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

  describe("REMOVE_CARD_FROM_DECK", () => {
    let cardData: Record<string, string>;

    beforeEach(() => {
      cardData = {
        cardName: "Rashmi, Etrnities Crafter",
      };
      (bus.on as jest.Mock).mockImplementation(
        (event: string, cb: FramebusMockCallback) => {
          if (event === "REMOVE_CARD_FROM_DECK") {
            cb(cardData);
          }
        }
      );
      mocked(getDeck).mockResolvedValue(
        makeFakeDeck({
          primarySections: ["commanders"],
          secondarySections: ["nonlands"],
          entries: {
            commanders: [
              makeFakeCard({
                id: "rashmi-id",
                count: 1,
                cardDigest: {
                  name: "Rashmi, Etrnities Crafter",
                },
              }),
              makeFakeCard({
                cardDigest: false,
              }),
            ],
            nonlands: [
              makeFakeCard({
                id: "birds-id",
                count: 2,
                cardDigest: {
                  name: "Birds of Paradise",
                },
              }),
            ],
          },
        })
      );
    });

    it("removes card from deck if there was only 1 left", async () => {
      setUpListeners();

      await wait(5);

      expect(removeEntry).toBeCalledTimes(1);
      expect(removeEntry).toBeCalledWith("rashmi-id");
    });

    it("decrements count if card has more than 1 entry", async () => {
      cardData.cardName = "Birds of Paradise";

      setUpListeners();

      await wait(5);

      expect(removeEntry).toBeCalledTimes(0);
      expect(updateEntry).toBeCalledTimes(1);
      expect(updateEntry).toBeCalledWith(
        expect.objectContaining({
          id: "birds-id",
          count: 1,
          card_digest: expect.objectContaining({
            name: "Birds of Paradise",
          }),
        })
      );
    });

    it("sends a push notification", async () => {
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

  describe("CLEAN_UP_DECK", () => {
    beforeEach(() => {
      (bus.on as jest.Mock).mockImplementation(
        (event: string, cb: FramebusMockCallback<void>) => {
          if (event === "CLEAN_UP_DECK") {
            cb();
          }
        }
      );
    });

    it("calls cleanup", () => {
      setUpListeners();

      expect(cleanUp).toBeCalledTimes(1);
    });
  });
});
