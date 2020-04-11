import scryfall from "Js/scryfall-embed/scryfall-globals";
import modifyCleanUp from "Js/scryfall-embed/modify-clean-up";

import { Deck } from "Js/types/deck";
import { generateScryfallGlobal } from "../mocks/scryfall-global";

declare global {
  interface Window {
    Scryfall: any;
  }
}

describe("modifyCleanUp", function () {
  let originalCleanupFunction: Function;
  let fakeDeck: Deck;

  beforeEach(function () {
    fakeDeck = {
      id: "deck-id",
      sections: {
        primary: ["mainboard"],
        secondary: ["sideboard", "maybeboard"],
      },
      entries: {
        mainboard: [],
        sideboard: [],
        maybeboard: [],
      },
    };
    window.Scryfall = generateScryfallGlobal();
    originalCleanupFunction = window.Scryfall.deckbuilder.cleanUp;
    jest.spyOn(scryfall, "getDeck").mockResolvedValue(fakeDeck);
    jest.spyOn(scryfall, "updateEntry").mockResolvedValue(null);
  });

  it("replaces the cleanup function", function () {
    modifyCleanUp();

    const newCleanupFunction = window.Scryfall.deckbuilder.cleanUp;

    expect(newCleanupFunction).not.toEqual(originalCleanupFunction);
  });

  it("moves lands in nonlands section back to lands section when configured", async function () {
    modifyCleanUp({
      cleanUpLandsInSingleton: true,
    });

    fakeDeck.sections.primary.push("nonlands");
    fakeDeck.sections.secondary.push("lands");
    fakeDeck.entries.lands = [];
    fakeDeck.entries.nonlands = [
      {
        id: "card-without-a-digest",
        section: "nonlands",
      },
      {
        id: "card-with-land-type",
        section: "nonlands",
        card_digest: {
          type_line: "Land",
        },
      },
      {
        id: "card-with-non-land-type",
        section: "nonlands",
        card_digest: {
          type_line: "Creature",
        },
      },
      {
        id: "another-card-with-land-type",
        section: "nonlands",
        card_digest: {
          type_line: "Basic Land - Mountain",
        },
      },
    ];

    await window.Scryfall.deckbuilder.cleanUp();

    expect(scryfall.updateEntry).toBeCalledTimes(2);
    expect(scryfall.updateEntry).toBeCalledWith({
      id: "card-with-land-type",
      section: "lands",
      card_digest: {
        type_line: "Land",
      },
    });
    expect(scryfall.updateEntry).toBeCalledWith({
      id: "another-card-with-land-type",
      section: "lands",
      card_digest: {
        type_line: "Basic Land - Mountain",
      },
    });
  });

  it("moves nonlands in lands section back to nonlands section when configured", async function () {
    modifyCleanUp({
      cleanUpLandsInSingleton: true,
    });

    fakeDeck.sections.primary.push("nonlands");
    fakeDeck.sections.secondary.push("lands");
    fakeDeck.entries.nonlands = [];
    fakeDeck.entries.lands = [
      {
        id: "card-without-a-digest",
        section: "lands",
      },
      {
        id: "card-with-non-land-type",
        section: "lands",
        card_digest: {
          type_line: "Creature",
        },
      },
      {
        id: "card-with-land-type",
        section: "lands",
        card_digest: {
          type_line: "Basic Land - Mountain",
        },
      },
      {
        id: "another-card-with-non-land-type",
        section: "lands",
        card_digest: {
          type_line: "Enchantment",
        },
      },
    ];

    await window.Scryfall.deckbuilder.cleanUp();

    expect(scryfall.updateEntry).toBeCalledTimes(2);
    expect(scryfall.updateEntry).toBeCalledWith({
      id: "card-with-non-land-type",
      section: "nonlands",
      card_digest: {
        type_line: "Creature",
      },
    });
    expect(scryfall.updateEntry).toBeCalledWith({
      id: "another-card-with-non-land-type",
      section: "nonlands",
      card_digest: {
        type_line: "Enchantment",
      },
    });
  });

  it("moves creaturelands in lands section back to nonlands section when configured", async function () {
    modifyCleanUp({
      cleanUpLandsInSingleton: true,
    });

    fakeDeck.sections.primary.push("nonlands");
    fakeDeck.sections.secondary.push("lands");
    fakeDeck.entries.nonlands = [];
    fakeDeck.entries.lands = [
      {
        id: "card-without-a-digest",
        section: "lands",
      },
      {
        id: "creature-land",
        section: "lands",
        card_digest: {
          type_line: "Creature Land - Forest",
        },
      },
      {
        id: "card-with-land-type",
        section: "lands",
        card_digest: {
          type_line: "Basic Land - Mountain",
        },
      },
    ];

    await window.Scryfall.deckbuilder.cleanUp();

    expect(scryfall.updateEntry).toBeCalledTimes(1);
    expect(scryfall.updateEntry).toBeCalledWith({
      id: "creature-land",
      section: "nonlands",
      card_digest: {
        type_line: "Creature Land - Forest",
      },
    });
  });

  it("does not move creaturelands in nonlands section to lands section", async function () {
    modifyCleanUp({
      cleanUpLandsInSingleton: true,
    });

    fakeDeck.sections.primary.push("nonlands");
    fakeDeck.sections.secondary.push("lands");
    fakeDeck.entries.lands = [];
    fakeDeck.entries.nonlands = [
      {
        id: "card-without-a-digest",
        section: "nonlands",
      },
      {
        id: "creature-land",
        section: "nonlands",
        card_digest: {
          type_line: "Creature Land - Forest",
        },
      },
      {
        id: "card-with-nonland-type",
        section: "nonlands",
        card_digest: {
          type_line: "Enchantment",
        },
      },
    ];

    await window.Scryfall.deckbuilder.cleanUp();

    expect(scryfall.updateEntry).toBeCalledTimes(0);
  });

  it("does not move lands that transform into creatures to nonlands", async function () {
    modifyCleanUp({
      cleanUpLandsInSingleton: true,
    });

    fakeDeck.sections.primary.push("nonlands");
    fakeDeck.sections.secondary.push("lands");
    fakeDeck.entries.lands = [
      {
        id: "card-without-a-digest",
        section: "lands",
      },
      {
        id: "land-transform",
        section: "lands",
        card_digest: {
          type_line: "Land // Creature",
        },
      },
      {
        id: "card-with-lands-type",
        section: "lands",
        card_digest: {
          type_line: "Land",
        },
      },
    ];
    fakeDeck.entries.nonlands = [];

    await window.Scryfall.deckbuilder.cleanUp();

    expect(scryfall.updateEntry).toBeCalledTimes(0);
  });

  it("moves lands that transform into creatures to lands", async function () {
    modifyCleanUp({
      cleanUpLandsInSingleton: true,
    });

    fakeDeck.sections.primary.push("nonlands");
    fakeDeck.sections.secondary.push("lands");
    fakeDeck.entries.lands = [];
    fakeDeck.entries.nonlands = [
      {
        id: "card-without-a-digest",
        section: "nonlands",
      },
      {
        id: "land-transform",
        section: "nonlands",
        card_digest: {
          type_line: "Land // Creature",
        },
      },
      {
        id: "card-with-nonlands-type",
        section: "nonlands",
        card_digest: {
          type_line: "Creature",
        },
      },
    ];

    await window.Scryfall.deckbuilder.cleanUp();

    expect(scryfall.updateEntry).toBeCalledTimes(1);
    expect(scryfall.updateEntry).toBeCalledWith({
      id: "land-transform",
      section: "lands",
      card_digest: {
        type_line: "Land // Creature",
      },
    });
  });

  it("does not move lands that transform into non-creature permaments to nonlands", async function () {
    modifyCleanUp({
      cleanUpLandsInSingleton: true,
    });

    fakeDeck.sections.primary.push("nonlands");
    fakeDeck.sections.secondary.push("lands");
    fakeDeck.entries.lands = [
      {
        id: "card-without-a-digest",
        section: "lands",
      },
      {
        id: "land-transform",
        section: "lands",
        card_digest: {
          type_line: "Land // Enchantment",
        },
      },
      {
        id: "land-transform-2",
        section: "lands",
        card_digest: {
          type_line: "Land // Artifact",
        },
      },
      {
        id: "land-transform-3",
        section: "lands",
        card_digest: {
          type_line: "Land // Planeswalker",
        },
      },
      {
        id: "card-with-lands-type",
        section: "lands",
        card_digest: {
          type_line: "Land",
        },
      },
    ];
    fakeDeck.entries.nonlands = [];

    await window.Scryfall.deckbuilder.cleanUp();

    expect(scryfall.updateEntry).toBeCalledTimes(0);
  });

  it("moves lands that transform into non-creature permants to lands", async function () {
    modifyCleanUp({
      cleanUpLandsInSingleton: true,
    });

    fakeDeck.sections.primary.push("nonlands");
    fakeDeck.sections.secondary.push("lands");
    fakeDeck.entries.lands = [];
    fakeDeck.entries.nonlands = [
      {
        id: "card-without-a-digest",
        section: "nonlands",
      },
      {
        id: "land-transform",
        section: "nonlands",
        card_digest: {
          type_line: "Land // Enchantment",
        },
      },
      {
        id: "land-transform-2",
        section: "nonlands",
        card_digest: {
          type_line: "Land // Artifact",
        },
      },
      {
        id: "land-transform-3",
        section: "nonlands",
        card_digest: {
          type_line: "Land // Planeswalker",
        },
      },
      {
        id: "card-with-nonlands-type",
        section: "nonlands",
        card_digest: {
          type_line: "Creature",
        },
      },
    ];

    await window.Scryfall.deckbuilder.cleanUp();

    expect(scryfall.updateEntry).toBeCalledTimes(3);
    expect(scryfall.updateEntry).toBeCalledWith({
      id: "land-transform",
      section: "lands",
      card_digest: {
        type_line: "Land // Enchantment",
      },
    });
    expect(scryfall.updateEntry).toBeCalledWith({
      id: "land-transform-2",
      section: "lands",
      card_digest: {
        type_line: "Land // Artifact",
      },
    });
    expect(scryfall.updateEntry).toBeCalledWith({
      id: "land-transform-3",
      section: "lands",
      card_digest: {
        type_line: "Land // Planeswalker",
      },
    });
  });

  it("does not update if nothing is available to update", async function () {
    modifyCleanUp({
      cleanUpLandsInSingleton: true,
    });

    fakeDeck.sections.primary.push("nonlands");
    fakeDeck.sections.secondary.push("lands");
    fakeDeck.entries.nonlands = [
      {
        id: "card-without-a-digest",
        section: "lands",
      },
      {
        id: "card-with-non-land-type",
        section: "lands",
        card_digest: {
          type_line: "Creature",
        },
      },
    ];
    fakeDeck.entries.lands = [
      {
        id: "card-without-a-digest",
        section: "lands",
      },
      {
        id: "card-with-land-type",
        section: "lands",
        card_digest: {
          type_line: "Basic Land - Mountain",
        },
      },
    ];

    await window.Scryfall.deckbuilder.cleanUp();

    expect(scryfall.updateEntry).toBeCalledTimes(0);
  });
});
