import TaggerIcon from "Ui/tagger-icon";
import {
  ILLUSTRATION_SYMBOL,
  CARD_SYMBOL,
  PRINTING_SYMBOL,
  CREATURE_BODY_SYMBOL,
  DEPICTS_SYMBOL,
  SEEN_BEFORE_SYMBOL,
  BETTER_THAN_SYMBOL,
  COLORSHIFTED_SYMBOL,
  MIRRORS_SYMBOL,
  RELATED_TO_SYMBOL,
  SIMILAR_TO_SYMBOL,
} from "Ui/tagger-icon/svg";

describe("TaggerIcon", () => {
  it.each([
    ["ILLUSTRATION_TAG", ILLUSTRATION_SYMBOL],
    ["ORACLE_CARD_TAG", CARD_SYMBOL],
    ["PRINTING_TAG", PRINTING_SYMBOL],
    ["BETTER_THAN", BETTER_THAN_SYMBOL],
    ["COLORSHIFTED", COLORSHIFTED_SYMBOL],
    ["COMES_AFTER", SEEN_BEFORE_SYMBOL],
    ["COMES_BEFORE", SEEN_BEFORE_SYMBOL],
    ["DEPICTED_IN", DEPICTS_SYMBOL],
    ["DEPICTS", DEPICTS_SYMBOL],
    ["MIRRORS", MIRRORS_SYMBOL],
    ["REFERENCED_BY", DEPICTS_SYMBOL],
    ["REFERENCES_TO", DEPICTS_SYMBOL],
    ["RELATED_TO", RELATED_TO_SYMBOL],
    ["SIMILAR_TO", SIMILAR_TO_SYMBOL],
    ["WITHOUT_BODY", CREATURE_BODY_SYMBOL],
    ["WITH_BODY", CREATURE_BODY_SYMBOL],
    ["WORSE_THAN", BETTER_THAN_SYMBOL],
  ])("creates an icon for %s type", (tagType, tagSymbol) => {
    const icon = new TaggerIcon(tagType);

    expect(icon.element.innerHTML).toContain(tagSymbol);
  });

  it("rotates the WITHOUT_BODY tag upside down", () => {
    const icon = new TaggerIcon("WITHOUT_BODY");

    expect(icon.element.classList.contains("icon-upside-down")).toBe(true);
  });

  it.each(["COMES_BEFORE", "DEPICTS", "REFERENCES_TO", "BETTER_THAN"])(
    "reverses the %s tag",
    (tagType) => {
      const icon = new TaggerIcon(tagType);

      expect(icon.element.classList.contains("icon-flipped")).toBe(true);
    }
  );
});
