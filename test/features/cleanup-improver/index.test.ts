import CleanUpImprover from "Features/deck-builder-features/clean-up-improver";
import bus from "framebus";

describe("Clean Up Improver", () => {
  describe("run", () => {
    beforeEach(() => {
      jest.spyOn(bus, "emit").mockImplementation();
      jest.spyOn(CleanUpImprover, "getSettings").mockResolvedValue({
        enabled: true,
        foo: "bar",
      });
    });

    it("emits a MODIFY_CLEAN_UP", async () => {
      const cui = new CleanUpImprover();

      await cui.run();

      expect(bus.emit).toBeCalledTimes(1);
      expect(bus.emit).toBeCalledWith("MODIFY_CLEAN_UP", {
        enabled: true,
        foo: "bar",
      });
    });
  });
});
