import DeckSectionChooser from "Ui/deck-section-chooser";
import deckParser from "Lib/deck-parser";
import { makeFakeDeck } from "Helpers/fake";

describe("DeckSectionChooser", () => {
  beforeEach(() => {
    jest
      .spyOn(deckParser, "getSections")
      .mockReturnValue(["commanders", "lands", "nonlands"]);
  });

  it("creates a scryfall select with options for each section in a deck", () => {
    jest.spyOn(DeckSectionChooser.prototype, "addSections");
    const deck = makeFakeDeck();
    const chooser = new DeckSectionChooser({
      id: "id",
      deck,
    });

    expect(chooser.addSections).toBeCalledTimes(1);
    expect(chooser.addSections).toBeCalledWith(deck);
  });

  it("does not require a deck option", () => {
    jest.spyOn(DeckSectionChooser.prototype, "addSections");
    const chooser = new DeckSectionChooser({
      id: "id",
    });

    expect(chooser.addSections).toBeCalledTimes(0);
  });

  describe("addSections", () => {
    it("adds sections to deck chooser", () => {
      const chooser = new DeckSectionChooser({
        id: "id",
      });

      let options = chooser.element.querySelectorAll("option");
      expect(options.length).toBe(1);
      expect(options[0].innerHTML).toBe("Section (auto)");
      expect(options[0].value).toBe("");

      chooser.addSections(makeFakeDeck());

      options = chooser.element.querySelectorAll("option");
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

    it("only adds sections to deck chooser once", () => {
      const chooser = new DeckSectionChooser({
        id: "id",
      });

      chooser.addSections(makeFakeDeck());

      let options = chooser.element.querySelectorAll("option");
      expect(options.length).toBe(4);
      expect(options[0].innerHTML).toBe("Section (auto)");
      expect(options[0].value).toBe("");
      expect(options[1].innerText).toBe("Add to Commanders");
      expect(options[1].value).toBe("commanders");
      expect(options[2].innerText).toBe("Add to Lands");
      expect(options[2].value).toBe("lands");
      expect(options[3].innerText).toBe("Add to Nonlands");
      expect(options[3].value).toBe("nonlands");

      chooser.addSections(makeFakeDeck());
      options = chooser.element.querySelectorAll("option");
      expect(options.length).toBe(4);
    });
  });

  describe("getValue", () => {
    it("gets value of currently selected option", () => {
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
