import addEDHRecIframe from "Features/deck-builder-features/edhrec-suggestions/add-edhrec-iframe";
import deckParser from "../../../src/js/lib/deck-parser";
import { change } from "Lib/mutation";
import { getDeck } from "Lib/scryfall";
import iframe from "Lib/iframe";
import { Card, Deck } from "../../../src/js/types/deck";
import SpyInstance = jest.SpyInstance;

import { makeFakeDeck, makeFakeCard } from "Helpers/fake";
import { mocked } from "ts-jest/utils";

jest.mock("Lib/scryfall");
jest.mock("Lib/mutation");

describe("addEDHRecIframe", function () {
  let btn: HTMLButtonElement;

  let getDeckSpy: SpyInstance;
  let hasLegalCommandersSpy: SpyInstance;
  let mutationChangeSpy: SpyInstance;

  beforeEach(function () {
    btn = document.createElement("button");

    getDeckSpy = mocked(getDeck).mockResolvedValue(
      makeFakeDeck({
        primarySections: ["commanders", "nonlands"],
        secondarySections: ["lands", "maybeboard"],
        entries: {
          commanders: [],
        },
      })
    );
    hasLegalCommandersSpy = jest
      .spyOn(deckParser, "hasLegalCommanders")
      .mockResolvedValue(true);
    jest
      .spyOn(deckParser, "getSections")
      .mockReturnValue(["commanders", "lands", "nonlands", "maybeboard"]);
    mutationChangeSpy = mocked(change);

    const deckbuilderElement = document.createElement("div");
    deckbuilderElement.id = "deckbuilder";
    document.body.appendChild(deckbuilderElement);

    jest.spyOn(iframe, "create").mockImplementation();
  });

  it("sets button to disabled when requested deck does not have legal commanders", async function () {
    hasLegalCommandersSpy.mockResolvedValue(false);

    await addEDHRecIframe(btn);

    expect(btn.getAttribute("disabled")).toBe("disabled");
  });

  it("sets button to not disabled when requested has legal commanders", async function () {
    hasLegalCommandersSpy.mockResolvedValue(true);

    await addEDHRecIframe(btn);

    expect(btn.getAttribute("disabled")).toBeFalsy();
  });

  it("adds an edhrec iframe to page", async function () {
    await addEDHRecIframe(btn);

    expect(iframe.create).toBeCalledTimes(1);
    expect(iframe.create).toBeCalledWith({
      src: "https://edhrec.com/404",
      id: "edhrec-suggestions-iframe",
    });
  });

  describe("when commander list changes", function () {
    let fakeDeck: Deck, commanderSection: HTMLDivElement;

    const addEntry = (options: Partial<HTMLOptionElement> = {}) => {
      const li = document.createElement("li");
      li.classList.add("deckbuilder-entry");
      li.innerHTML = `
        <select class="deckbuilder-entry-menu-select">
          <option id="option-1">1</option>
          <option id="option-2">2</option>
          <option id="option-3">3</option>
          <option id="option-4">4</option>
          <option id="option-5">5</option>
        </select>
        <textarea class="deckbuilder-entry-input"></textarea>
      `;
      if (options.value) {
        li.querySelector("textarea")!.value = options.value;
      }
      if (options.disabled) {
        Array.from(li.querySelectorAll("select option")).forEach((el) =>
          el.setAttribute("disabled", "disabled")
        );
      }
      commanderSection.querySelector("ul")!.appendChild(li);
    };

    beforeEach(async () => {
      fakeDeck = makeFakeDeck({
        entries: {
          commanders: [
            makeFakeCard({
              cardDigest: {
                name: "Arjun, the Shifting Flame",
              },
            }),
          ],
          lands: [],
          nonlands: [],
        },
      });
      commanderSection = document.createElement("div");
      commanderSection.innerHTML = `
        <div class="deckbuilder-section-title"></div>
        <ul></ul>
      `;
      commanderSection.querySelector<HTMLDivElement>(
        ".deckbuilder-section-title"
      )!.innerText = "Commander(s)";

      getDeckSpy.mockResolvedValue(fakeDeck);
      document.body.appendChild(commanderSection);
    });

    it("enables the button when all entries are commanders", async function () {
      fakeDeck.entries.commanders = [];
      addEntry();
      hasLegalCommandersSpy.mockResolvedValue(false);

      await addEDHRecIframe(btn);
      expect(btn.getAttribute("disabled")).toBeTruthy();

      const changeHandler = mutationChangeSpy.mock.calls[0][1];

      hasLegalCommandersSpy.mockResolvedValue(true);
      commanderSection.querySelector("textarea")!.value =
        "1 Arjun, the Shifting Flame";

      await changeHandler(commanderSection);

      expect(btn.getAttribute("disabled")).toBeFalsy();
    });

    it("enables the button entry has gone from illegal state to legal state", async function () {
      fakeDeck.entries.commanders = [
        makeFakeCard({
          card_digest: {
            name: "Food Chain",
          },
        }),
      ];
      addEntry({
        value: "1 Food Chain",
      });
      hasLegalCommandersSpy.mockResolvedValue(false);

      await addEDHRecIframe(btn);
      expect(btn.getAttribute("disabled")).toBeTruthy();

      const changeHandler = mutationChangeSpy.mock.calls[0][1];

      hasLegalCommandersSpy.mockResolvedValue(true);
      commanderSection.querySelector("textarea")!.value =
        "1 Arjun, the Shifting Flame";

      await changeHandler(commanderSection);

      expect(btn.getAttribute("disabled")).toBeFalsy();
    });

    it("disables the button when the values have changed at least one entry is not a commander", async function () {
      addEntry({
        value: "1 Arjun, the Shifting Flame",
      });

      await addEDHRecIframe(btn);
      const changeHandler = mutationChangeSpy.mock.calls[0][1];
      addEntry({
        value: "1 Rhystic Study",
      });

      hasLegalCommandersSpy.mockResolvedValue(false);

      expect(btn.getAttribute("disabled")).toBeFalsy();

      await changeHandler(commanderSection);

      expect(btn.getAttribute("disabled")).toBeTruthy();
    });

    it("ignores blank entries", async function () {
      await addEDHRecIframe(btn);
      const changeHandler = mutationChangeSpy.mock.calls[0][1];

      addEntry();
      addEntry();
      addEntry({
        value: "1 Arjun, the Shifting Flame",
      });
      addEntry();
      addEntry();

      await changeHandler(commanderSection);

      expect(hasLegalCommandersSpy).toBeCalledTimes(1);
      expect(hasLegalCommandersSpy).toBeCalledWith([
        "Arjun, the Shifting Flame",
      ]);
    });

    it("ignores entries that have not finished lookup", async function () {
      await addEDHRecIframe(btn);
      const changeHandler = mutationChangeSpy.mock.calls[0][1];

      addEntry({
        value: "1 Sidar Kondo of Jamuraa",
      });
      addEntry({
        value: "1 Tana the",
        disabled: true,
      });

      hasLegalCommandersSpy.mockClear();
      await changeHandler(commanderSection);

      expect(hasLegalCommandersSpy).toBeCalledTimes(1);
      expect(hasLegalCommandersSpy).toBeCalledWith(["Sidar Kondo of Jamuraa"]);
    });

    it("ignores entries that do not match deck pattern", async function () {
      await addEDHRecIframe(btn);
      const changeHandler = mutationChangeSpy.mock.calls[0][1];

      addEntry({
        value: "1 Sidar Kondo of Jamuraa",
      });
      addEntry({
        value: "Tana the",
      });

      hasLegalCommandersSpy.mockClear();
      await changeHandler(commanderSection);

      expect(hasLegalCommandersSpy).toBeCalledTimes(1);
      expect(hasLegalCommandersSpy).toBeCalledWith(["Sidar Kondo of Jamuraa"]);
    });

    it("does not check legality of commanders whe commander list is unchanged", async function () {
      addEntry({
        value: "1 Arjun, the Shifting Flame",
      });

      await addEDHRecIframe(btn);
      const changeHandler = mutationChangeSpy.mock.calls[0][1];

      hasLegalCommandersSpy.mockClear();
      await changeHandler(commanderSection);

      expect(hasLegalCommandersSpy).not.toBeCalled();
    });

    it("does not check legality of commanders whe commander list is unchanged but in a different order", async function () {
      fakeDeck.entries.commanders = [
        makeFakeCard({
          cardDigest: {
            name: "Sidar Kondo of Jamuraa",
          },
        }),
        makeFakeCard({
          cardDigest: {
            name: "Tana the Bloodsower",
          },
        }),
      ];
      await addEDHRecIframe(btn);
      const changeHandler = mutationChangeSpy.mock.calls[0][1];

      hasLegalCommandersSpy.mockClear();
      addEntry({
        value: "1 Tana the Bloodsower",
      });
      addEntry({
        value: "1 Sidar Kondo of Jamuraa",
      });

      await changeHandler(commanderSection);

      expect(hasLegalCommandersSpy).not.toBeCalled();
    });

    it("does not check commanders when section is not the commander section", async function () {
      const title = document.createElement("div");
      title.innerText = "Lands";
      const fakeEl = {
        querySelector: jest.fn().mockReturnValue(title),
        querySelectorAll: jest.fn(),
      };

      await addEDHRecIframe(btn);
      const changeHandler = mutationChangeSpy.mock.calls[0][1];

      await changeHandler(fakeEl);

      expect(fakeEl.querySelectorAll).not.toBeCalled();
    });
  });
});
