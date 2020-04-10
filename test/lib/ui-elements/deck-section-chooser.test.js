import DeckSectionChooser from "Ui/deck-section-chooser";
import deckParser from "Lib/deck-parser";

describe("DeckSectionChooser", function () {
  beforeEach(function () {
    jest
      .spyOn(deckParser, "getSections")
      .mockReturnValue(["foo", "bar", "baz"]);
  });

  it("creates a scryfall select with options for each section in a deck", async function () {
    const chooser = new DeckSectionChooser({
      deck: {},
    });

    const options = chooser.element.querySelectorAll("option");
    expect(options.length).toBe(4);
    expect(options[0].innerHTML).toBe("Section (auto)");
    expect(options[0].value).toBe("");
    expect(options[1].innerText).toBe("Add to Bar");
    expect(options[1].value).toBe("bar");
    expect(options[2].innerText).toBe("Add to Baz");
    expect(options[2].value).toBe("baz");
    expect(options[3].innerText).toBe("Add to Foo");
    expect(options[3].value).toBe("foo");
  });

  describe("getValue", function () {
    it("gets value of currently selected option", function () {
      const chooser = new DeckSectionChooser({
        deck: {},
      });

      expect(chooser.getValue()).toBe("");

      chooser.element.querySelector("select").value = "baz";

      expect(chooser.getValue()).toBe("baz");
    });
  });
});
