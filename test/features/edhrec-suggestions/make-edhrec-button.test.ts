import bus from "framebus";
import makeEDHRecButton from "Features/deck-builder-features/edhrec-suggestions/make-edhrec-button";
import { EDHRecResponse } from "Js/types/edhrec";
import deckParser from "Lib/deck-parser";
import wait from "Lib/wait";
import Drawer from "Lib/ui-elements/drawer";
import { getCardBySetCodeAndCollectorNumber, getDeck } from "Lib/scryfall";

import {
  makeFakeCard,
  makeFakeDeck,
  makeFakeEDHRecSuggestion,
} from "Helpers/fake";
import { mocked } from "ts-jest/utils";
import { Deck } from "../../../src/js/types/deck";

jest.mock("Lib/scryfall");
jest.mock("Lib/mutation");
jest.mock("framebus");

type EDHRecReplyHandler = (res: EDHRecResponse) => void;

describe("makeEDHRecButton", function () {
  let getCardSpy: jest.SpyInstance;
  let getDeckSpy: jest.SpyInstance;

  beforeEach(function () {
    getCardSpy = mocked(getCardBySetCodeAndCollectorNumber);
    getDeckSpy = mocked(getDeck).mockResolvedValue(
      makeFakeDeck({
        primarySections: ["commanders", "nonlands"],
        secondarySections: ["lands", "maybeboard"],
        entries: {
          commanders: [],
        },
      })
    );
    jest
      .spyOn(deckParser, "getSections")
      .mockReturnValue(["commanders", "lands", "nonlands", "maybeboard"]);

    const deckbuilderElement = document.createElement("div");
    deckbuilderElement.id = "deckbuilder";
    document.body.appendChild(deckbuilderElement);

    // jest doesn't know about the scrollTo method on elements
    jest.spyOn(Drawer.prototype, "scrollTo").mockImplementation();
  });

  it("makes a button", function () {
    const btn = makeEDHRecButton();

    expect(btn.tagName).toBe("BUTTON");
  });

  it("adds an edhrec drawer to page", async function () {
    await makeEDHRecButton();

    expect(document.querySelector("#edhrec-drawer")).not.toBeFalsy();
  });

  it("cleans up deck after drawer is closed", async function () {
    const button = await makeEDHRecButton();

    button.click();

    const drawer = document.querySelector(
      "#edhrec-drawer"
    ) as HTMLDialogElement;
    const closeButton = drawer.querySelector(
      ".modal-dialog-close"
    ) as HTMLButtonElement;

    closeButton.click();

    expect(bus.emit).toBeCalledWith("CLEAN_UP_DECK");
  });

  it("focuses back on the button when closed", async function () {
    const button = await makeEDHRecButton();

    jest.spyOn(button, "focus");
    button.click();

    const drawer = document.querySelector(
      "#edhrec-drawer"
    ) as HTMLDialogElement;
    const closeButton = drawer.querySelector(
      ".modal-dialog-close"
    ) as HTMLButtonElement;

    closeButton.click();

    expect(button.focus).toBeCalledTimes(1);
  });

  describe("when clicked", function () {
    let fakeDeck: Partial<Deck>,
      fakeEDHRecResponse: EDHRecResponse,
      click: (btn: HTMLButtonElement) => void;

    beforeEach(async function () {
      click = (btn: HTMLButtonElement) => {
        // https://stackoverflow.com/a/2706236/2601552
        const evObj = document.createEvent("Events");

        evObj.initEvent("click", true, false);
        btn.dispatchEvent(evObj);
      };

      fakeDeck = makeFakeDeck({
        primarySections: ["commanders", "nonlands"],
        secondarySections: ["lands"],
        entries: {
          commanders: [
            makeFakeCard({
              id: "arjun-id",
              cardDigest: {
                name: "Arjun, the Shifting Flame",
              },
            }),
          ],
          lands: [
            makeFakeCard({
              id: "reliquary-tower",
              count: 1,
              cardDigest: {
                name: "Reliquary Tower",
              },
            }),
          ],
          nonlands: [
            makeFakeCard({
              id: "obstinate-familiar",
              count: 1,
              cardDigest: {
                name: "Obstinate Familiar",
              },
            }),
          ],
        },
      });
      fakeEDHRecResponse = {
        commanders: [
          // irrelevant
        ],
        outRecs: [
          // TODO future improvement
        ],
        inRecs: [
          makeFakeEDHRecSuggestion({
            scryfall_uri:
              "https://scryfall.com/card/eld/331/arcane-signet?utm_source=api",
            names: ["Arcane Signet"],
            primary_types: ["Artifact"],
            images: [
              "https://img.scryfall.com/cards/normal/front/8/4/84128e98-87d6-4c2f-909b-9435a7833e63.jpg?1567631723",
            ],
          }),
          makeFakeEDHRecSuggestion({
            scryfall_uri:
              "https://scryfall.com/card/ori/251/shivan-reef?utm_source=api",
            names: ["Shivan Reef"],
            primary_types: ["Land"],
            images: [
              "https://img.scryfall.com/cards/normal/front/f/1/f1d33afd-6f2a-43c8-ae5d-17a0674fcdd3.jpg?1562049659",
            ],
          }),
          makeFakeEDHRecSuggestion({
            scryfall_uri:
              "https://scryfall.com/card/a25/41/arcane-denial?utm_source=api",
            names: ["Arcane Denial"],
            primary_types: ["Instant"],
            images: [
              "https://img.scryfall.com/cards/normal/front/9/d/9d1ffeb1-6c31-45f7-8140-913c397022a3.jpg?1562439019",
            ],
          }),
        ],
      };
      mocked(bus.emit).mockImplementation(
        (
          eventName: string,
          payload: Record<string, string>,
          reply: EDHRecReplyHandler
        ) => {
          if (eventName === "REQUEST_EDHREC_RECOMENDATIONS") {
            reply(fakeEDHRecResponse);
          }

          return true;
        }
      );

      getDeckSpy.mockResolvedValue(fakeDeck);
    });

    afterEach(async function () {
      // allow mocked promises to resolve
      await wait();
    });

    it("opens the drawer", function () {
      const btn = makeEDHRecButton();

      jest.spyOn(Drawer.prototype, "open");

      click(btn);

      expect(Drawer.prototype.open).toBeCalledTimes(1);
    });

    it("emits a request for EDHRec recomendations with deck data", async function () {
      const btn = await makeEDHRecButton();

      click(btn);

      await wait();

      expect(bus.emit).toBeCalledTimes(1);
      expect(bus.emit).toBeCalledWith(
        "REQUEST_EDHREC_RECOMENDATIONS",
        {
          commanders: ["Arjun, the Shifting Flame"],
          cards: ["1 Reliquary Tower", "1 Obstinate Familiar"],
        },
        expect.any(Function)
      );
    });

    it("attempts any number of cards in command zone", async function () {
      fakeDeck.entries!.commanders = [
        makeFakeCard({
          id: "sidar-id",
          cardDigest: {
            name: "Sidar Kondo of Jamuraa",
          },
        }),
        makeFakeCard({
          cardDigest: {
            name: "Tana, the Bloodsower",
          },
        }),
        makeFakeCard({
          cardDigest: {
            name: "Reyhan, Last of the Abzan",
          },
        }),
      ];

      const btn = await makeEDHRecButton();

      click(btn);

      await wait();

      expect(bus.emit).toBeCalledTimes(1);
      expect(bus.emit).toBeCalledWith(
        "REQUEST_EDHREC_RECOMENDATIONS",
        {
          commanders: [
            "Sidar Kondo of Jamuraa",
            "Tana, the Bloodsower",
            "Reyhan, Last of the Abzan",
          ],
          cards: ["1 Reliquary Tower", "1 Obstinate Familiar"],
        },
        expect.any(Function)
      );
    });

    it("does not error when cards in deck are missing the card_digest", async function () {
      fakeDeck.entries?.lands?.push(
        makeFakeCard({
          cardDigest: false,
        }),
        makeFakeCard({
          count: 5,
          cardDigest: {
            name: "Island",
          },
        })
      );
      fakeDeck.entries?.nonlands?.push(
        makeFakeCard({
          count: 1,
          cardDigest: {
            name: "Rhystic Study",
          },
        })
      );

      const btn = await makeEDHRecButton();

      click(btn);

      await wait();

      expect(bus.emit).toBeCalledTimes(1);
      expect(bus.emit).toBeCalledWith(
        "REQUEST_EDHREC_RECOMENDATIONS",
        {
          commanders: ["Arjun, the Shifting Flame"],
          cards: [
            "1 Reliquary Tower",
            "5 Island",
            "1 Obstinate Familiar",
            "1 Rhystic Study",
          ],
        },
        expect.any(Function)
      );
    });

    it("displays specific error when edhrec request errors with specific errors", async function () {
      mocked(bus.emit).mockImplementation(
        (
          eventName: string,
          payload: Record<string, string>,
          reply: EDHRecReplyHandler
        ) => {
          const res = {
            commanders: [],
            outRecs: [],
            inRecs: [],
            errors: ["1 error", "2 error"],
          } as EDHRecResponse;

          reply(res);

          return true;
        }
      );
      jest.spyOn(Drawer.prototype, "setContent");

      const btn = await makeEDHRecButton();

      click(btn);

      await wait();

      const errors = document.querySelectorAll<HTMLLIElement>(
        "#edhrec-drawer li"
      );
      expect(errors[0].innerText).toContain("1 error");
      expect(errors[1].innerText).toContain("2 error");
    });

    it("populates drawer with list of recomendations organized by type", async function () {
      jest.spyOn(Drawer.prototype, "setLoading");

      const btn = await makeEDHRecButton();

      jest.spyOn(Drawer.prototype, "setContent");

      click(btn);

      await wait();

      expect(Drawer.prototype.setContent).toBeCalledTimes(1);
      expect(Drawer.prototype.setLoading).toBeCalledWith(false);

      const sections = document.querySelectorAll(
        "#edhrec-drawer .edhrec-suggestions-container"
      );

      expect(sections.length).toBe(3);
      expect(sections[0].querySelector("h3")?.innerHTML).toBe("Instants");
      expect(
        sections[0].querySelector<HTMLImageElement>(".edhrec-suggestions img")
          ?.src
      ).toBe(
        "https://img.scryfall.com/cards/normal/front/9/d/9d1ffeb1-6c31-45f7-8140-913c397022a3.jpg?1562439019"
      );
      expect(sections[1].querySelector("h3")?.innerHTML).toBe("Artifacts");
      expect(
        sections[1].querySelector<HTMLImageElement>(".edhrec-suggestions img")
          ?.src
      ).toBe(
        "https://img.scryfall.com/cards/normal/front/8/4/84128e98-87d6-4c2f-909b-9435a7833e63.jpg?1567631723"
      );
      expect(sections[2].querySelector("h3")?.innerHTML).toBe("Lands");
      expect(
        sections[2].querySelector<HTMLImageElement>(".edhrec-suggestions img")
          ?.src
      ).toBe(
        "https://img.scryfall.com/cards/normal/front/f/1/f1d33afd-6f2a-43c8-ae5d-17a0674fcdd3.jpg?1562049659"
      );
    });

    it("looks up card in scryfall and adds it to deck when chosen", async function () {
      const btn = await makeEDHRecButton();
      getCardSpy.mockResolvedValue({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        type_line: "Instant",
      });

      click(btn);

      await wait();

      const cardElement = document.querySelectorAll<HTMLButtonElement>(
        "#edhrec-drawer .add-card-element-container .add-card-element__panel.plus-symbol"
      )[0];

      cardElement.click();

      expect(getCardSpy).toBeCalledTimes(1);
      expect(getCardSpy).toBeCalledWith("a25", "41");

      await wait();

      expect(bus.emit).toBeCalledWith("ADD_CARD_TO_DECK", {
        cardName: "Arcane Denial",
        cardId: "arcane-denial-id",
      });
    });

    it("looks up card in scryfall and adds it to particualr section in deck when chosen", async function () {
      const btn = await makeEDHRecButton();
      getCardSpy.mockResolvedValue({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        type_line: "Instant",
      });

      click(btn);

      await wait();

      const cardElement = document.querySelectorAll<HTMLButtonElement>(
        "#edhrec-drawer .add-card-element-container .add-card-element__panel.plus-symbol"
      )[0];

      document.querySelector<HTMLSelectElement>(
        "#edhrec-suggestions-section-chooser select"
      )!.value = "maybeboard";

      cardElement.click();

      expect(getCardSpy).toBeCalledTimes(1);
      expect(getCardSpy).toBeCalledWith("a25", "41");

      await wait();

      expect(bus.emit).toBeCalledWith("ADD_CARD_TO_DECK", {
        cardName: "Arcane Denial",
        cardId: "arcane-denial-id",
        section: "maybeboard",
      });
    });

    it("organizes sections in particular order", async function () {
      fakeEDHRecResponse.inRecs.push(
        makeFakeEDHRecSuggestion({
          names: ["Fake Creature"],
          primary_types: ["Creature"],
        }),
        makeFakeEDHRecSuggestion({
          names: ["Fake Sorcery"],
          primary_types: ["Sorcery"],
        }),
        makeFakeEDHRecSuggestion({
          names: ["Fake Enchantment"],
          primary_types: ["Enchantment"],
        }),
        makeFakeEDHRecSuggestion({
          names: ["Fake Planeswalker"],
          primary_types: ["Planeswalker"],
        })
      );

      const btn = await makeEDHRecButton();

      click(btn);

      await wait();

      const sections = document.querySelectorAll(
        "#edhrec-drawer .edhrec-suggestions-container"
      );

      expect(sections.length).toBe(7);
      expect(sections[0].querySelector("h3")?.innerHTML).toBe("Creatures");
      expect(sections[1].querySelector("h3")?.innerHTML).toBe("Instants");
      expect(sections[2].querySelector("h3")?.innerHTML).toBe("Sorceries");
      expect(sections[3].querySelector("h3")?.innerHTML).toBe("Artifacts");
      expect(sections[4].querySelector("h3")?.innerHTML).toBe("Enchantments");
      expect(sections[5].querySelector("h3")?.innerHTML).toBe("Planeswalkers");
      expect(sections[6].querySelector("h3")?.innerHTML).toBe("Lands");
    });

    it("ignores unknown sections", async function () {
      fakeEDHRecResponse.inRecs.push(
        makeFakeEDHRecSuggestion({
          names: ["Fake Unknown Type"],
          primary_types: ["Unknown Type"],
        })
      );

      const btn = await makeEDHRecButton();

      click(btn);

      await wait();

      const sections = document.querySelectorAll(
        "#edhrec-drawer .edhrec-suggestions-container"
      );

      expect(sections.length).toBe(3);
      expect(sections[0].querySelector("h3")?.innerHTML).toBe("Instants");
      expect(sections[1].querySelector("h3")?.innerHTML).toBe("Artifacts");
      expect(sections[2].querySelector("h3")?.innerHTML).toBe("Lands");
    });
  });
});
