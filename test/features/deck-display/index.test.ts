import DeckDisplay from "Features/deck-view-features/deck-display";
import { ready } from "Lib/mutation";
import createElement from "Lib/create-element";

jest.mock("Lib/mutation");

describe("Price Options", () => {
  let dd: DeckDisplay;
  let el: HTMLDivElement;

  beforeEach(() => {
    dd = new DeckDisplay();
    el = createElement(`<div class="card-grid">
      <div class="card-grid-item" data-card-id="1"></div>
      <div class="card-grid-item" data-card-id="2"></div>
      <div class="card-grid-item" data-card-id="3"></div>
      <div class="card-grid-item" data-card-id="4"></div>
    </div>`);

    jest.mocked(ready).mockImplementation((selector, cb) => {
      cb(el);
    });

    jest.spyOn(DeckDisplay, "getSettings").mockResolvedValue({
      collapseCardView: true,
    });
  });

  describe("run", () => {
    it("noops if not configured to collapse the deck display", async () => {
      jest.mocked(DeckDisplay.getSettings).mockResolvedValue({
        collapseCardView: false,
      });

      await dd.run();

      expect(ready).not.toBeCalled();
    });

    it("applies deck-display class to containers", async () => {
      await dd.run();

      expect(
        el.classList.contains("deck-display__collapse-card-gride-enabled")
      ).toBe(true);
    });

    it("applies deck-display class to only the last card-grid-item", async () => {
      await dd.run();

      const cardItems = el.querySelectorAll(".card-grid-item");

      expect(cardItems.length).toBe(4);
      expect(
        cardItems[0].classList.contains("deck-display__last-card-grid-item")
      ).toBe(false);
      expect(
        cardItems[1].classList.contains("deck-display__last-card-grid-item")
      ).toBe(false);
      expect(
        cardItems[2].classList.contains("deck-display__last-card-grid-item")
      ).toBe(false);
      expect(
        cardItems[3].classList.contains("deck-display__last-card-grid-item")
      ).toBe(true);
    });
  });
});
