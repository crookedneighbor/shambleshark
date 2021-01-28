jest.mock("framebus");

import CleanUpImprover from "Features/deck-builder-features/clean-up-improver";
import Framebus from "framebus";

describe("Clean Up Improver", () => {
  describe("run", () => {
    beforeEach(() => {
      jest.spyOn(Framebus.prototype, "emit").mockImplementation();
      jest.spyOn(CleanUpImprover, "getSettings").mockResolvedValue({
        enabled: true,
        foo: "bar",
      });
    });

    it("emits a MODIFY_CLEAN_UP", async () => {
      const cui = new CleanUpImprover();

      await cui.run();

      expect(Framebus.prototype.emit).toBeCalledTimes(1);
      expect(Framebus.prototype.emit).toBeCalledWith("MODIFY_CLEAN_UP", {
        enabled: true,
        foo: "bar",
      });
    });
  });
});
