import bus from "framebus";
import makeEDHRecButton from "Features/deck-builder-features/edhrec-suggestions/make-edhrec-button";
import deckParser from "Lib/deck-parser";
import wait from "Lib/wait";
import Drawer from "Ui/drawer";
import mutation from "Lib/mutation";
import scryfall from "Lib/scryfall";

import { makeFakeDeck } from "Helpers/fake";

describe("makeEDHRecButton", function () {
  beforeEach(function () {
    jest.spyOn(bus, "on");
    jest.spyOn(bus, "emit");
    jest.spyOn(scryfall.api, "get");
    jest.spyOn(scryfall, "getDeck").mockResolvedValue(
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
    jest.spyOn(mutation, "change").mockImplementation();

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

    const drawer = document.querySelector("#edhrec-drawer");
    const closeButton = drawer.querySelector(".modal-dialog-close");

    closeButton.click();

    expect(bus.emit).toBeCalledWith("CLEAN_UP_DECK");
  });

  it("focuses back on the button when closed", async function () {
    const button = await makeEDHRecButton();

    jest.spyOn(button, "focus");
    button.click();

    const drawer = document.querySelector("#edhrec-drawer");
    const closeButton = drawer.querySelector(".modal-dialog-close");

    closeButton.click();

    expect(button.focus).toBeCalledTimes(1);
  });

  describe("when clicked", function () {
    let fakeDeck, fakeEDHRecResponse, click;

    beforeEach(async function () {
      click = (btn) => {
        // https://stackoverflow.com/a/2706236/2601552
        const evObj = document.createEvent("Events");

        evObj.initEvent("click", true, false);
        btn.dispatchEvent(evObj);
      };

      fakeDeck = {
        entries: {
          commanders: [
            {
              card_digest: {
                id: "arjun-id",
                name: "Arjun, the Shifting Flame",
              },
            },
          ],
          lands: [
            {
              count: 1,
              card_digest: {
                id: "reliquary-tower",
                name: "Reliquary Tower",
              },
            },
          ],
          nonlands: [
            {
              count: 1,
              card_digest: {
                id: "obstinate-familiar",
                name: "Obstinate Familiar",
              },
            },
          ],
        },
      };
      fakeEDHRecResponse = {
        commanders: [
          // irrelevant
        ],
        outRecs: [
          // TODO future improvement
        ],
        inRecs: [
          {
            sanitized: "arcane-signet",
            scryfall_uri:
              "https://scryfall.com/card/eld/331/arcane-signet?utm_source=api",
            type: "artifact",
            cmc: 2,
            names: ["Arcane Signet"],
            primary_types: ["Artifact"],
            price: 19.99,
            color_identity: [],
            salt: 0,
            tcgplayer: {
              url:
                "https://store.tcgplayer.com/magic/throne-of-eldraine/arcane-signet?partner=EDHREC&utm_campaign=affiliate&utm_medium=EDHREC&utm_source=EDHREC",
              name: "arcane signet",
              price: 11.4,
            },
            images: [
              "https://img.scryfall.com/cards/normal/front/8/4/84128e98-87d6-4c2f-909b-9435a7833e63.jpg?1567631723",
            ],
            name: "Arcane Signet",
            cmcs: [2],
            color_id: [],
            score: 73,
          },
          {
            sanitized: "shivan-reef",
            scryfall_uri:
              "https://scryfall.com/card/ori/251/shivan-reef?utm_source=api",
            type: "land",
            cmc: 0,
            names: ["Shivan Reef"],
            primary_types: ["Land"],
            price: 1.99,
            color_identity: ["R", "U"],
            salt: 0.13793103448275862,
            images: [
              "https://img.scryfall.com/cards/normal/front/f/1/f1d33afd-6f2a-43c8-ae5d-17a0674fcdd3.jpg?1562049659",
            ],
            name: "Shivan Reef",
            cmcs: [0],
            color_id: ["R", "U"],
            score: 59,
            image:
              "https://img.scryfall.com/cards/normal/front/f/1/f1d33afd-6f2a-43c8-ae5d-17a0674fcdd3.jpg?1562049659",
          },
          {
            sanitized: "arcane-denial",
            scryfall_uri:
              "https://scryfall.com/card/a25/41/arcane-denial?utm_source=api",
            type: "instant",
            cmc: 2,
            names: ["Arcane Denial"],
            primary_types: ["Instant"],
            price: 0.79,
            color_identity: ["U"],
            salt: 0.7719298245614035,
            images: [
              "https://img.scryfall.com/cards/normal/front/9/d/9d1ffeb1-6c31-45f7-8140-913c397022a3.jpg?1562439019",
            ],
            url: "/cards/arcane-denial",
            name: "Arcane Denial",
            cmcs: [2],
            color_id: ["U"],
            score: 52,
            image:
              "https://img.scryfall.com/cards/normal/front/9/d/9d1ffeb1-6c31-45f7-8140-913c397022a3.jpg?1562439019",
          },
        ],
      };
      bus.emit.mockImplementation(function (eventName, payload, reply) {
        if (eventName === "REQUEST_EDHREC_RECOMENDATIONS") {
          reply([null, fakeEDHRecResponse]);
        }
      });

      scryfall.getDeck.mockResolvedValue(fakeDeck);
    });

    afterEach(async function () {
      // allow mocked promises to resolve
      await wait();
    });

    it("opens the drawer", function () {
      bus.emit.mockImplementation();
      const btn = makeEDHRecButton();

      jest.spyOn(Drawer.prototype, "open");

      click(btn);

      expect(Drawer.prototype.open).toBeCalledTimes(1);
    });

    it("emits a request for EDHRec recomendations with deck data", async function () {
      bus.emit.mockImplementation();
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
      bus.emit.mockImplementation();
      fakeDeck.entries.commanders = [
        {
          card_digest: {
            id: "sidar-id",
            name: "Sidar Kondo of Jamuraa",
          },
        },
        {
          card_digest: {
            id: "tana-id",
            name: "Tana, the Bloodsower",
          },
        },
        {
          card_digest: {
            id: "reyhan-id",
            name: "Reyhan, Last of the Abzan",
          },
        },
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
      bus.emit.mockImplementation();
      fakeDeck.entries.lands.push(
        {
          foo: "bar",
        },
        {
          count: 5,
          card_digest: {
            name: "Island",
          },
        }
      );
      fakeDeck.entries.nonlands.push({
        count: 1,
        card_digest: {
          name: "Rhystic Study",
        },
      });

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

    it("displays generic error when edhrec request errors", async function () {
      bus.emit.mockImplementation(function (eventName, payload, reply) {
        const err = new Error("network error");

        reply([err]);
      });
      jest.spyOn(Drawer.prototype, "setContent");

      const btn = await makeEDHRecButton();

      click(btn);

      await wait();

      const body = document.querySelector("#edhrec-drawer").innerHTML;
      expect(body).toContain("An unknown error occurred:");
      expect(body).toContain("network error");
    });

    it("displays specific error when edhrec request errors with specific errors", async function () {
      bus.emit.mockImplementation(function (eventName, payload, reply) {
        const err = {
          errors: ["1 error", "2 error"],
        };

        reply([err]);
      });
      jest.spyOn(Drawer.prototype, "setContent");

      const btn = await makeEDHRecButton();

      click(btn);

      await wait();

      const errors = document.querySelectorAll("#edhrec-drawer li");
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
      expect(sections[0].querySelector("h3").innerHTML).toBe("Instants");
      expect(sections[0].querySelector(".edhrec-suggestions img").src).toBe(
        "https://img.scryfall.com/cards/normal/front/9/d/9d1ffeb1-6c31-45f7-8140-913c397022a3.jpg?1562439019"
      );
      expect(sections[1].querySelector("h3").innerHTML).toBe("Artifacts");
      expect(sections[1].querySelector(".edhrec-suggestions img").src).toBe(
        "https://img.scryfall.com/cards/normal/front/8/4/84128e98-87d6-4c2f-909b-9435a7833e63.jpg?1567631723"
      );
      expect(sections[2].querySelector("h3").innerHTML).toBe("Lands");
      expect(sections[2].querySelector(".edhrec-suggestions img").src).toBe(
        "https://img.scryfall.com/cards/normal/front/f/1/f1d33afd-6f2a-43c8-ae5d-17a0674fcdd3.jpg?1562049659"
      );
    });

    it("looks up card in scryfall and adds it to deck when chosen", async function () {
      const btn = await makeEDHRecButton();
      jest.spyOn(scryfall.api, "get").mockResolvedValue({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        type_line: "Instant",
      });

      click(btn);

      await wait();

      const cardElement = document.querySelectorAll(
        "#edhrec-drawer .add-card-element-container .add-card-element__panel.plus-symbol"
      )[0];

      cardElement.click();

      expect(scryfall.api.get).toBeCalledTimes(1);
      expect(scryfall.api.get).toBeCalledWith("/cards/a25/41");

      await wait();

      expect(bus.emit).toBeCalledWith("ADD_CARD_TO_DECK", {
        cardName: "Arcane Denial",
        cardId: "arcane-denial-id",
      });
    });

    it("looks up card in scryfall and adds it to particualr section in deck when chosen", async function () {
      const btn = await makeEDHRecButton();
      jest.spyOn(scryfall.api, "get").mockResolvedValue({
        name: "Arcane Denial",
        id: "arcane-denial-id",
        type_line: "Instant",
      });

      click(btn);

      await wait();

      const cardElement = document.querySelectorAll(
        "#edhrec-drawer .add-card-element-container .add-card-element__panel.plus-symbol"
      )[0];

      document.querySelector(
        "#edhrec-suggestions-section-chooser select"
      ).value = "maybeboard";

      cardElement.click();

      expect(scryfall.api.get).toBeCalledTimes(1);
      expect(scryfall.api.get).toBeCalledWith("/cards/a25/41");

      await wait();

      expect(bus.emit).toBeCalledWith("ADD_CARD_TO_DECK", {
        cardName: "Arcane Denial",
        cardId: "arcane-denial-id",
        section: "maybeboard",
      });
    });

    it("organizes sections in particular order", async function () {
      fakeEDHRecResponse.inRecs.push(
        {
          sanitized: "fake-creature",
          scryfall_uri: "https://scyrfall.com/card/set/id/fake-creature",
          cmc: 2,
          names: ["Fake Creature"],
          primary_types: ["Creature"],
          price: 19.99,
          color_identity: [],
          salt: 0,
          images: ["fake-creature.png"],
          name: "Fake Creature",
          cmcs: [2],
          color_id: [],
          score: 73,
        },
        {
          sanitized: "fake-sorcery",
          scryfall_uri: "https://scryfall.com/card/set/id/fake-sorcery",
          cmc: 2,
          names: ["Fake Sorcery"],
          primary_types: ["Sorcery"],
          price: 19.99,
          color_identity: [],
          salt: 0,
          images: ["fake-sorcery.png"],
          name: "Fake Sorcery",
          cmcs: [2],
          color_id: [],
          score: 73,
        },
        {
          sanitized: "fake-enchantment",
          scryfall_uri: "https://scryfall.com/card/set/id/fake-enchantment",
          cmc: 2,
          names: ["Fake Enchantment"],
          primary_types: ["Enchantment"],
          price: 19.99,
          color_identity: [],
          salt: 0,
          images: ["fake-enchantment.png"],
          name: "Fake Enchantment",
          cmcs: [2],
          color_id: [],
          score: 73,
        },
        {
          sanitized: "fake-planeswalker",
          scryfall_uri: "https://scryfall.com/card/set/id/fake-planeswalker",
          cmc: 2,
          names: ["Fake Planeswalker"],
          primary_types: ["Planeswalker"],
          price: 19.99,
          color_identity: [],
          salt: 0,
          images: ["fake-planeswalker.png"],
          name: "Fake Planeswalker",
          cmcs: [2],
          color_id: [],
          score: 73,
        }
      );

      const btn = await makeEDHRecButton();

      click(btn);

      await wait();

      const sections = document.querySelectorAll(
        "#edhrec-drawer .edhrec-suggestions-container"
      );

      expect(sections.length).toBe(7);
      expect(sections[0].querySelector("h3").innerHTML).toBe("Creatures");
      expect(sections[1].querySelector("h3").innerHTML).toBe("Instants");
      expect(sections[2].querySelector("h3").innerHTML).toBe("Sorceries");
      expect(sections[3].querySelector("h3").innerHTML).toBe("Artifacts");
      expect(sections[4].querySelector("h3").innerHTML).toBe("Enchantments");
      expect(sections[5].querySelector("h3").innerHTML).toBe("Planeswalkers");
      expect(sections[6].querySelector("h3").innerHTML).toBe("Lands");
    });

    it("ignores unknown sections", async function () {
      fakeEDHRecResponse.inRecs.push({
        sanitized: "fake-unknown-type",
        scryfall_uri: "https://scryfall.com/card/set/id/fake-unknown-type",
        cmc: 2,
        names: ["Fake Unknown Type"],
        primary_types: ["Unknown Type"],
        price: 19.99,
        color_identity: [],
        salt: 0,
        images: ["fake-unknown-type.png"],
        name: "Fake Unknown Type",
        cmcs: [2],
        color_id: [],
        score: 73,
      });

      const btn = await makeEDHRecButton();

      click(btn);

      await wait();

      const sections = document.querySelectorAll(
        "#edhrec-drawer .edhrec-suggestions-container"
      );

      expect(sections.length).toBe(3);
      expect(sections[0].querySelector("h3").innerHTML).toBe("Instants");
      expect(sections[1].querySelector("h3").innerHTML).toBe("Artifacts");
      expect(sections[2].querySelector("h3").innerHTML).toBe("Lands");
    });
  });
});
