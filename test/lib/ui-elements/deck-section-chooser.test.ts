import DeckSectionChooser from "Ui/deck-section-chooser";
import deckParser from "Lib/deck-parser";
import { makeFakeDeck } from "Helpers/fake";

describe("DeckSectionChooser", function () {
  beforeEach(function () {
    jest
      .spyOn(deckParser, "getSections")
      .mockReturnValue(["commanders", "lands", "nonlands"]);
  });

  it("creates a scryfall select with options for each section in a deck", async function () {
    const chooser = new DeckSectionChooser({
      id: "id",
      deck: makeFakeDeck(),
    });

    const options = (chooser.element as HTMLElement).querySelectorAll("option");
    expect(options.length).toBe(4);
    expect(options[0].innerHTML).toBe("Section (auto)");
    expect(options[0].value).toBe("");
    expect(options[1].innerText).toBe("Add to Commanders");
    expect(options[1].value).toBe("commanders");
    expect(options[2].innerText).toBe("Add to Lands");
    expect(options[2].value).toBe("lands");
    expect(options[3].innerText).toBe("Add to Nonlands");
    expect(options[3].value).toBe("nonlands");
  });

  describe("getValue", function () {
    it("gets value of currently selected option", function () {
      const chooser = new DeckSectionChooser({
        id: "id",
        deck: makeFakeDeck(),
      });

      expect(chooser.getValue()).toBe("");

      const select = chooser.element.querySelector(
        "select"
      ) as HTMLSelectElement;
      select.value = "lands";

      expect(chooser.getValue()).toBe("lands");
    });
  });
});
