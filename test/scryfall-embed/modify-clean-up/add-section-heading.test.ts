import bus from "framebus";
import {
  addDeckTotalUpdateListener,
  insertHeadings,
  Headings,
} from "Js/scryfall-embed/modify-clean-up/add-section-heading";
import {
  calculateTotalsByName,
  calculateTotalsByCardType,
} from "Js/scryfall-embed/modify-clean-up/calculate-totals";
import { makeFakeCard } from "Helpers/fake";
import { generateScryfallGlobal } from "../../mocks/scryfall-global";
import { mocked } from "ts-jest/utils";

jest.mock("framebus");
jest.mock("Js/scryfall-embed/modify-clean-up/calculate-totals");

describe("section heading", () => {
  beforeEach(() => {
    window.Scryfall = generateScryfallGlobal();
  });

  describe("addDeckTotalUpdateListener", () => {
    beforeEach(() => {
      bus.on.mockImplementation(
        (eventName: string, cb: (payload: Record<string, number>) => void) => {
          cb({ totalCount: 100 });
        }
      );
      window.Scryfall.deckbuilder.flatSections = [
        "mainboard",
        "commanders",
        "sideboard",
        "columna",
        "columnb",
        "nonlands",
      ];
    });

    it("adds a listenr for deck total count changes", () => {
      addDeckTotalUpdateListener("name");

      expect(bus.on).toBeCalledTimes(1);
      expect(bus.on).toBeCalledWith(
        "DECK_TOTAL_COUNT_UPDATED",
        expect.any(Function)
      );
    });

    it("adds the total to each element's total", () => {
      const first = document.createElement("div");
      const second = document.createElement("div");
      const third = document.createElement("div");

      [first, second, third].forEach((el) => {
        el.classList.add("cleanup-improver__deck-section-heading");
        el.innerHTML = `<span class="modify-cleanup-total-count">3</span>`;

        document.body.appendChild(el);
      });

      addDeckTotalUpdateListener("name");

      expect(
        first.querySelector<HTMLElement>(".modify-cleanup-total-count")!
          .innerText
      ).toBe("100");
      expect(
        second.querySelector<HTMLElement>(".modify-cleanup-total-count")!
          .innerText
      ).toBe("100");
      expect(
        third.querySelector<HTMLElement>(".modify-cleanup-total-count")!
          .innerText
      ).toBe("100");
    });

    it("looks up the subtotal to each element's subtotal for name for each applicable section", () => {
      window.Scryfall.deckbuilder.entries.mainboard = [makeFakeCard()];
      window.Scryfall.deckbuilder.entries.nonlands = [makeFakeCard()];
      window.Scryfall.deckbuilder.entries.columna = [makeFakeCard()];
      window.Scryfall.deckbuilder.entries.columnb = [makeFakeCard()];

      addDeckTotalUpdateListener("name");

      expect(calculateTotalsByCardType).not.toBeCalled();
      expect(calculateTotalsByName).toBeCalledTimes(4);
      expect(calculateTotalsByName).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.mainboard
      );
      expect(calculateTotalsByName).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.nonlands
      );
      expect(calculateTotalsByName).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.columna
      );
      expect(calculateTotalsByName).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.columnb
      );
    });

    it("looks up the subtotal to each element's subtotal for card-type for each applicable section", () => {
      window.Scryfall.deckbuilder.entries.mainboard = [makeFakeCard()];
      window.Scryfall.deckbuilder.entries.nonlands = [makeFakeCard()];
      window.Scryfall.deckbuilder.entries.columna = [makeFakeCard()];
      window.Scryfall.deckbuilder.entries.columnb = [makeFakeCard()];

      addDeckTotalUpdateListener("card-type");

      expect(calculateTotalsByName).not.toBeCalled();
      expect(calculateTotalsByCardType).toBeCalledTimes(4);
      expect(calculateTotalsByCardType).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.mainboard
      );
      expect(calculateTotalsByCardType).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.nonlands
      );
      expect(calculateTotalsByCardType).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.columna
      );
      expect(calculateTotalsByCardType).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.columnb
      );
    });

    it("adds subtotal to elements", () => {
      mocked(calculateTotalsByName).mockReturnValue({
        abcd: 3,
        efg: 5,
      });

      const abcdSection = document.createElement("div");
      const efgSection = document.createElement("div");

      abcdSection.setAttribute("data-heading-section-id", "abcd");
      abcdSection.innerHTML = `<span class="modify-cleanup-subtotal-count">1</span>`;
      document.body.append(abcdSection);
      efgSection.setAttribute("data-heading-section-id", "efg");
      efgSection.innerHTML = `<span class="modify-cleanup-subtotal-count">1</span>`;
      document.body.append(efgSection);

      addDeckTotalUpdateListener("name");

      expect(
        abcdSection.querySelector<HTMLElement>(
          ".modify-cleanup-subtotal-count"
        )!.innerText
      ).toBe("3");
      expect(
        efgSection.querySelector<HTMLElement>(".modify-cleanup-subtotal-count")!
          .innerText
      ).toBe("5");
    });
  });

  describe("insertHeadings", () => {
    let headings: Headings;
    let mainboardSection: HTMLElement;
    let nonlandsSection: HTMLElement;
    let columnaSection: HTMLElement;
    let columnbSection: HTMLElement;

    beforeEach(() => {
      headings = {};

      window.Scryfall.deckbuilder.flatSections = [
        "mainboard",
        "commanders",
        "sideboard",
        "columna",
        "columnb",
        "nonlands",
      ];
      window.Scryfall.deckbuilder.entries = {
        mainboard: [],
        commanders: [],
        sideboard: [],
        columna: [],
        columnb: [],
        nonlands: [],
      };
      mainboardSection = document.createElement("div");
      nonlandsSection = document.createElement("div");
      columnaSection = document.createElement("div");
      columnbSection = document.createElement("div");

      [
        mainboardSection,
        nonlandsSection,
        columnaSection,
        columnbSection,
      ].forEach((el) => {
        el.innerHTML = `
          <h6 class="deckbuilder-section-title-bar">Some title</h6>
          <ul>
            <li>entry</li>
          </ul>
        `;

        document.body.appendChild(el);
      });
    });

    it("removes any is-hidden classes from existing headings", () => {
      const first = document.createElement("h6");
      const second = document.createElement("h6");
      const third = document.createElement("h6");

      [first, second, third].forEach((el) => {
        el.classList.add("deckbuilder-section-title-bar");
        el.classList.add("is-hidden");

        document.body.appendChild(el);
      });

      insertHeadings("name", headings);

      expect(first.classList.contains("is-hidden")).toBeFalsy();
      expect(second.classList.contains("is-hidden")).toBeFalsy();
      expect(third.classList.contains("is-hidden")).toBeFalsy();
    });

    it("calculates the subtotals for name for each section", () => {
      insertHeadings("name", headings);

      expect(calculateTotalsByCardType).not.toBeCalled();
      expect(calculateTotalsByName).toBeCalledTimes(4);
      expect(calculateTotalsByName).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.mainboard
      );
      expect(calculateTotalsByName).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.nonlands
      );
      expect(calculateTotalsByName).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.columna
      );
      expect(calculateTotalsByName).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.columnb
      );
    });

    it("calculates the subtotals for card type for each section", () => {
      insertHeadings("card-type", headings);

      expect(calculateTotalsByName).not.toBeCalled();
      expect(calculateTotalsByCardType).toBeCalledTimes(4);
      expect(calculateTotalsByCardType).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.mainboard
      );
      expect(calculateTotalsByCardType).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.nonlands
      );
      expect(calculateTotalsByCardType).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.columna
      );
      expect(calculateTotalsByCardType).toBeCalledWith(
        window.Scryfall.deckbuilder.entries.columnb
      );
    });

    it("resets previous headings that were set up", () => {
      const foo = document.createElement("div");
      const bar = document.createElement("div");
      headings.columna = {
        foo,
      };
      headings.columnb = {
        bar,
      };
      document.body.appendChild(foo);
      document.body.appendChild(bar);

      jest.spyOn(document.body, "removeChild");

      insertHeadings("name", headings);

      expect(headings.columna.foo).toBeFalsy();
      expect(headings.columnb.bar).toBeFalsy();
      expect(document.body.removeChild).toBeCalledTimes(2);
      expect(document.body.removeChild).toBeCalledWith(foo);
      expect(document.body.removeChild).toBeCalledWith(bar);
    });

    it("adds no headings when there are no entries in applicable sections", () => {
      window.Scryfall.deckbuilder.entries.sideboard.push(makeFakeCard());

      insertHeadings("name", headings);

      expect(headings).toEqual({
        columna: {},
        columnb: {},
        mainboard: {},
        nonlands: {},
      });
    });

    it("adds a name heading to each applicable section with at least one entry", () => {
      const mainboardCard = makeFakeCard({
        cardDigest: {
          name: "A Name",
        },
      });
      const nonlandsCard = makeFakeCard({
        cardDigest: {
          name: "G Name",
        },
      });
      const columnaCard = makeFakeCard({
        cardDigest: {
          name: "R Name",
        },
      });
      const columnbCard = makeFakeCard({
        cardDigest: {
          name: "Z Name",
        },
      });

      window.Scryfall.deckbuilder.entries.mainboard.push(mainboardCard);
      window.Scryfall.deckbuilder.entries.nonlands.push(nonlandsCard);
      window.Scryfall.deckbuilder.entries.columna.push(columnaCard);
      window.Scryfall.deckbuilder.entries.columnb.push(columnbCard);

      mainboardSection
        .querySelector("li")
        ?.setAttribute("data-entry", mainboardCard.id);
      nonlandsSection
        .querySelector("li")
        ?.setAttribute("data-entry", nonlandsCard.id);
      columnaSection
        .querySelector("li")
        ?.setAttribute("data-entry", columnaCard.id);
      columnbSection
        .querySelector("li")
        ?.setAttribute("data-entry", columnbCard.id);

      insertHeadings("name", headings);

      expect(headings).toEqual({
        columna: {
          qrs: expect.any(HTMLElement),
        },
        columnb: {
          yz: expect.any(HTMLElement),
        },
        mainboard: {
          abcd: expect.any(HTMLElement),
        },
        nonlands: {
          efg: expect.any(HTMLElement),
        },
      });

      const headingNodes = document.querySelectorAll(
        ".cleanup-improver__deck-section-heading"
      );

      expect(headingNodes.length).toBe(4);
      expect(
        headingNodes[0]
          .querySelector(".deckbuilder-section-title")
          ?.innerHTML.trim()
      ).toBe("a-d");
      expect(
        headingNodes[1]
          .querySelector(".deckbuilder-section-title")
          ?.innerHTML.trim()
      ).toBe("e-g");
      expect(
        headingNodes[2]
          .querySelector(".deckbuilder-section-title")
          ?.innerHTML.trim()
      ).toBe("q-s");
      expect(
        headingNodes[3]
          .querySelector(".deckbuilder-section-title")
          ?.innerHTML.trim()
      ).toBe("y-z");

      expect(
        mainboardSection.querySelector("[data-heading-section-id='abcd']")
      ).toBeTruthy();
      expect(
        nonlandsSection.querySelector("[data-heading-section-id='efg']")
      ).toBeTruthy();
      expect(
        columnaSection.querySelector("[data-heading-section-id='qrs']")
      ).toBeTruthy();
      expect(
        columnbSection.querySelector("[data-heading-section-id='yz']")
      ).toBeTruthy();
    });

    it("adds a card type heading to each applicable section with at least one entry", () => {
      const mainboardCard = makeFakeCard({
        cardDigest: {
          type_line: "Creature",
        },
      });
      const nonlandsCard = makeFakeCard({
        cardDigest: {
          type_line: "Artifact",
        },
      });
      const columnaCard = makeFakeCard({
        cardDigest: {
          type_line: "Enchantment",
        },
      });
      const columnbCard = makeFakeCard({
        cardDigest: {
          type_line: "Planeswalker",
        },
      });

      window.Scryfall.deckbuilder.entries.mainboard.push(mainboardCard);
      window.Scryfall.deckbuilder.entries.nonlands.push(nonlandsCard);
      window.Scryfall.deckbuilder.entries.columna.push(columnaCard);
      window.Scryfall.deckbuilder.entries.columnb.push(columnbCard);

      mainboardSection
        .querySelector("li")
        ?.setAttribute("data-entry", mainboardCard.id);
      nonlandsSection
        .querySelector("li")
        ?.setAttribute("data-entry", nonlandsCard.id);
      columnaSection
        .querySelector("li")
        ?.setAttribute("data-entry", columnaCard.id);
      columnbSection
        .querySelector("li")
        ?.setAttribute("data-entry", columnbCard.id);

      insertHeadings("card-type", headings);

      expect(headings).toEqual({
        columna: {
          enchantment: expect.any(HTMLElement),
        },
        columnb: {
          planeswalker: expect.any(HTMLElement),
        },
        mainboard: {
          creature: expect.any(HTMLElement),
        },
        nonlands: {
          artifact: expect.any(HTMLElement),
        },
      });

      const headingNodes = document.querySelectorAll(
        ".cleanup-improver__deck-section-heading"
      );

      expect(headingNodes.length).toBe(4);
      expect(
        headingNodes[0]
          .querySelector(".deckbuilder-section-title")
          ?.innerHTML.trim()
      ).toBe("creatures");
      expect(
        headingNodes[1]
          .querySelector(".deckbuilder-section-title")
          ?.innerHTML.trim()
      ).toBe("artifacts");
      expect(
        headingNodes[2]
          .querySelector(".deckbuilder-section-title")
          ?.innerHTML.trim()
      ).toBe("enchantments");
      expect(
        headingNodes[3]
          .querySelector(".deckbuilder-section-title")
          ?.innerHTML.trim()
      ).toBe("planeswalkers");

      expect(
        mainboardSection.querySelector("[data-heading-section-id='creature']")
      ).toBeTruthy();
      expect(
        nonlandsSection.querySelector("[data-heading-section-id='artifact']")
      ).toBeTruthy();
      expect(
        columnaSection.querySelector("[data-heading-section-id='enchantment']")
      ).toBeTruthy();
      expect(
        columnbSection.querySelector("[data-heading-section-id='planeswalker']")
      ).toBeTruthy();
    });

    it("adds each heading for only the first entry that matches a section", () => {
      const firstCard = makeFakeCard({
        cardDigest: {
          name: "A Name",
        },
      });
      const secondCard = makeFakeCard({
        cardDigest: {
          name: "B Name",
        },
      });
      const thirdCard = makeFakeCard({
        cardDigest: {
          name: "Z Name",
        },
      });

      columnaSection
        .querySelector("li")
        ?.setAttribute("data-entry", firstCard.id);

      const secondEl = document.createElement("li");
      secondEl?.setAttribute("data-entry", secondCard.id);
      columnaSection.querySelector("ul")?.appendChild(secondEl);

      const thirdEl = document.createElement("li");
      thirdEl?.setAttribute("data-entry", thirdCard.id);
      columnaSection.querySelector("ul")?.appendChild(thirdEl);

      window.Scryfall.deckbuilder.entries.columna.push(firstCard);
      window.Scryfall.deckbuilder.entries.columna.push(secondCard);
      window.Scryfall.deckbuilder.entries.columna.push(thirdCard);

      insertHeadings("name", headings);

      expect(headings).toEqual({
        columna: {
          abcd: expect.any(HTMLElement),
          yz: expect.any(HTMLElement),
        },
        columnb: {},
        mainboard: {},
        nonlands: {},
      });

      expect(
        headings.columna.abcd
          .querySelector<HTMLElement>(".deckbuilder-section-title")
          ?.innerHTML.trim()
      ).toBe("a-d");
      expect(
        headings.columna.yz
          .querySelector<HTMLElement>(".deckbuilder-section-title")
          ?.innerHTML.trim()
      ).toBe("y-z");

      expect(
        document.querySelectorAll(".cleanup-improver__deck-section-heading")
          .length
      ).toBe(2);
    });

    it("calculates totals and subtotals for each section", () => {
      const firstCard = makeFakeCard({
        cardDigest: {
          name: "A Name",
        },
      });
      const secondCard = makeFakeCard({
        cardDigest: {
          name: "B Name",
        },
      });
      const thirdCard = makeFakeCard({
        cardDigest: {
          name: "Z Name",
        },
      });

      columnaSection
        .querySelector("li")
        ?.setAttribute("data-entry", firstCard.id);

      const secondEl = document.createElement("li");
      secondEl?.setAttribute("data-entry", secondCard.id);
      columnaSection.querySelector("ul")?.appendChild(secondEl);

      const thirdEl = document.createElement("li");
      thirdEl?.setAttribute("data-entry", thirdCard.id);
      columnaSection.querySelector("ul")?.appendChild(thirdEl);

      window.Scryfall.deckbuilder.entries.columna.push(firstCard);
      window.Scryfall.deckbuilder.entries.columna.push(secondCard);
      window.Scryfall.deckbuilder.entries.columna.push(thirdCard);
      mocked(window.Scryfall.deckbuilder.totalCount).mockReturnValue(3);

      mocked(calculateTotalsByName).mockReturnValue({
        abcd: 2,
        yz: 1,
      });

      insertHeadings("name", headings);

      // once for each section
      expect(calculateTotalsByName).toBeCalledTimes(4);

      expect(headings).toEqual({
        columna: {
          abcd: expect.any(HTMLElement),
          yz: expect.any(HTMLElement),
        },
        columnb: {},
        mainboard: {},
        nonlands: {},
      });

      expect(
        headings.columna.abcd
          .querySelector<HTMLElement>(".modify-cleanup-subtotal-count")
          ?.innerHTML.trim()
      ).toBe("2");
      expect(
        headings.columna.abcd
          .querySelector<HTMLElement>(".modify-cleanup-total-count")
          ?.innerHTML.trim()
      ).toBe("3");

      expect(
        headings.columna.yz
          .querySelector<HTMLElement>(".modify-cleanup-subtotal-count")
          ?.innerHTML.trim()
      ).toBe("1");
      expect(
        headings.columna.yz
          .querySelector<HTMLElement>(".modify-cleanup-total-count")
          ?.innerHTML.trim()
      ).toBe("3");
    });

    it("hides the default heading", () => {
      const card = makeFakeCard({
        cardDigest: {
          name: "A Name",
        },
      });

      columnaSection.querySelector("li")?.setAttribute("data-entry", card.id);

      window.Scryfall.deckbuilder.entries.columna.push(card);

      insertHeadings("name", headings);

      expect(
        columnaSection
          .querySelector(".deckbuilder-section-title-bar")
          ?.classList.contains("is-hidden")
      ).toBeTruthy();
    });
  });
});
