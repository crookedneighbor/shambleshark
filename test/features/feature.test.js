import Feature from "Features/feature";
import storage from "Lib/storage";

describe("Base Feature", function () {
  beforeEach(function () {
    jest.spyOn(storage, "get").mockResolvedValue();
    jest.spyOn(storage, "set").mockResolvedValue();
  });

  it("requires a run method", async function () {
    const spy = jest.fn();

    class FeatureWithoutRun extends Feature {}
    class FeatureWithRun extends Feature {
      async run() {
        spy();

        return "foo";
      }
    }
    const featureWithoutRun = new FeatureWithoutRun();
    const featureWithRun = new FeatureWithRun();

    await expect(featureWithoutRun.run()).rejects.toThrow(
      "Method not Implemented"
    );

    await expect(featureWithRun.run()).resolves.toBe("foo");
    expect(spy).toBeCalledTimes(1);
  });

  describe("enable", function () {
    class FeatureThatEnables extends Feature {}
    FeatureThatEnables.metadata = {
      id: "feature-that-enables",
    };

    it("sets enabled property for feature on storage", async function () {
      jest.spyOn(FeatureThatEnables, "saveSetting").mockResolvedValue();
      await FeatureThatEnables.enable();

      expect(FeatureThatEnables.saveSetting).toBeCalledTimes(1);
      expect(FeatureThatEnables.saveSetting).toBeCalledWith("enabled", true);
    });
  });

  describe("disable", function () {
    class FeatureThatDisables extends Feature {}
    FeatureThatDisables.metadata = {
      id: "feature-that-disables",
    };

    it("saves feature on storage", async function () {
      jest.spyOn(FeatureThatDisables, "saveSetting").mockResolvedValue();
      await FeatureThatDisables.disable();

      expect(FeatureThatDisables.saveSetting).toBeCalledTimes(1);
      expect(FeatureThatDisables.saveSetting).toBeCalledWith("enabled", false);
    });
  });

  describe("isEnabled", function () {
    class FeatureThatReportsIfItsEnabled extends Feature {}
    FeatureThatReportsIfItsEnabled.metadata = {
      id: "feature-that-reports",
    };

    it("resolves to true if feature is enabled", async function () {
      const feature = new FeatureThatReportsIfItsEnabled();

      jest
        .spyOn(FeatureThatReportsIfItsEnabled, "getSettings")
        .mockResolvedValue({
          enabled: true,
        });

      await expect(feature.isEnabled()).resolves.toBe(true);

      expect(FeatureThatReportsIfItsEnabled.getSettings).toBeCalledTimes(1);
    });

    it("resolves to false if feature is disabled", async function () {
      const feature = new FeatureThatReportsIfItsEnabled();

      jest
        .spyOn(FeatureThatReportsIfItsEnabled, "getSettings")
        .mockResolvedValue({
          enabled: false,
        });

      await expect(feature.isEnabled()).resolves.toBe(false);

      expect(FeatureThatReportsIfItsEnabled.getSettings).toBeCalledTimes(1);
    });
  });

  describe("getSettings", function () {
    class FeatureWithSavedSettings extends Feature {}
    FeatureWithSavedSettings.metadata = {
      id: "feature-with-saved",
    };
    FeatureWithSavedSettings.settingsDefaults = {
      enabled: true,
      foo: "bar",
      baz: "buz",
    };
    class FutureFeatureWithSavedSettings extends Feature {}
    FutureFeatureWithSavedSettings.metadata = {
      id: "future-feature",
      futureFeature: true,
    };

    it("calls out to storage for settings", async function () {
      storage.get.mockResolvedValue({
        foo: "value1",
        baz: "value2",
      });
      const settings = await FeatureWithSavedSettings.getSettings();

      expect(storage.get).toBeCalledTimes(1);
      expect(storage.get).toBeCalledWith("feature-with-saved");
      expect(settings.enabled).toBe(true);
      expect(settings.foo).toBe("value1");
      expect(settings.baz).toBe("value2");
    });

    it("applies defaults when param is not available", async function () {
      storage.get.mockResolvedValue({
        foo: "value1",
      });
      const settings = await FeatureWithSavedSettings.getSettings();

      expect(storage.get).toBeCalledTimes(1);
      expect(storage.get).toBeCalledWith("feature-with-saved");
      expect(settings.enabled).toBe(true);
      expect(settings.foo).toBe("value1");
      expect(settings.baz).toBe("buz");
    });

    it("applies defaults when existing settingsa re not available and future opt in setting is not available", async function () {
      storage.get.mockResolvedValueOnce();
      storage.get.mockResolvedValueOnce();

      const settings = await FeatureWithSavedSettings.getSettings();

      expect(storage.get).toBeCalledTimes(2);
      expect(storage.get).toBeCalledWith("feature-with-saved");
      expect(storage.get).toBeCalledWith("future-opt-in");
      expect(settings.enabled).toBe(true);
      expect(settings.foo).toBe("bar");
      expect(settings.baz).toBe("buz");
    });

    it("applies defaults when existing settings are not available and future opt in setting is enabled", async function () {
      storage.get.mockResolvedValueOnce();
      storage.get.mockResolvedValueOnce({
        enabled: true,
      });

      const settings = await FeatureWithSavedSettings.getSettings();

      expect(storage.get).toBeCalledTimes(2);
      expect(storage.get).toBeCalledWith("feature-with-saved");
      expect(storage.get).toBeCalledWith("future-opt-in");
      expect(settings.enabled).toBe(true);
      expect(settings.foo).toBe("bar");
      expect(settings.baz).toBe("buz");
    });

    it('saves it as enabled "false" when no previous settings are present and future opt in is disabled', async function () {
      storage.get.mockResolvedValueOnce();
      storage.get.mockResolvedValueOnce({
        enabled: false,
      });
      const settings = await FeatureWithSavedSettings.getSettings();

      expect(storage.get).toBeCalledTimes(2);
      expect(storage.get).toBeCalledWith("feature-with-saved");
      expect(storage.get).toBeCalledWith("future-opt-in");
      expect(storage.set).toBeCalledTimes(1);
      expect(storage.set).toBeCalledWith("feature-with-saved", {
        enabled: false,
      });

      expect(settings.enabled).toBe(false);
    });

    it('saves it as enabled "true" when no previous settings are present and future opt in is enabled', async function () {
      storage.get.mockResolvedValueOnce();
      storage.get.mockResolvedValueOnce({
        enabled: true,
      });
      const settings = await FeatureWithSavedSettings.getSettings();

      expect(storage.get).toBeCalledTimes(2);
      expect(storage.get).toBeCalledWith("feature-with-saved");
      expect(storage.get).toBeCalledWith("future-opt-in");
      expect(storage.set).toBeCalledTimes(1);
      expect(storage.set).toBeCalledWith("feature-with-saved", {
        enabled: true,
      });

      expect(settings.enabled).toBe(true);
    });

    it('does not save it as enabled "false" if feature is a future feature', async function () {
      storage.get.mockResolvedValueOnce();
      storage.get.mockResolvedValueOnce({
        enabled: false,
      });
      const settings = await FutureFeatureWithSavedSettings.getSettings();

      expect(storage.get).toBeCalledTimes(2);
      expect(storage.get).toBeCalledWith("future-feature");
      expect(storage.get).toBeCalledWith("future-opt-in");
      expect(storage.set).toBeCalledTimes(0);

      expect(settings.enabled).toBe(false);
    });

    it("resolves with enabled false if feature is a future feature", async function () {
      storage.get.mockResolvedValueOnce();
      storage.get.mockResolvedValueOnce({
        enabled: true,
      });
      const settings = await FutureFeatureWithSavedSettings.getSettings();

      expect(storage.get).toBeCalledTimes(2);
      expect(storage.get).toBeCalledWith("future-feature");
      expect(storage.get).toBeCalledWith("future-opt-in");
      expect(storage.set).toBeCalledTimes(0);

      expect(settings.enabled).toBe(false);
    });
  });

  describe("saveSetting", function () {
    class FeatureThatSavesSettings extends Feature {}
    FeatureThatSavesSettings.metadata = {
      id: "feature-that-saves",
    };
    FeatureThatSavesSettings.settingsDefaults = {
      enabled: true,
      foo: "bar",
    };

    it("grabs previously saved settings and overwrites the single property", async function () {
      jest.spyOn(FeatureThatSavesSettings, "getSettings").mockResolvedValue({
        foo: "bar",
        baz: "buz",
      });
      await FeatureThatSavesSettings.saveSetting("foo", "value");

      expect(FeatureThatSavesSettings.getSettings).toBeCalledTimes(1);
      expect(storage.set).toBeCalledTimes(1);
      expect(storage.set).toBeCalledWith("feature-that-saves", {
        baz: "buz",
        foo: "value",
      });
    });

    it("rejects if attempting to set a property that does not exist in defaults", async function () {
      let error;

      jest.spyOn(FeatureThatSavesSettings, "getSettings").mockResolvedValue({
        foo: "bar",
        baz: "buz",
      });

      try {
        await FeatureThatSavesSettings.saveSetting("does-not-exist", "value");
      } catch (e) {
        error = e;
      }

      expect(error).toBeTruthy();
      expect(error.message).toBe(
        'Internal Error: Could not find property "does-not-exist" on feature'
      );

      expect(storage.set).toBeCalledTimes(0);
    });
  });

  describe("saveData", function () {
    class SubFeature extends Feature {}
    SubFeature.metadata = {
      id: "sub-id",
    };

    it("sets storage with metadata id", async function () {
      const data = {};

      jest.spyOn(storage, "set").mockResolvedValue();

      await SubFeature.saveData("some-id", data);

      expect(storage.set).toBeCalledTimes(1);
      expect(storage.set).toBeCalledWith("sub-id:some-id", data);
    });
  });

  describe("getData", function () {
    class SubFeature extends Feature {}
    SubFeature.metadata = {
      id: "sub-id",
    };

    it("gets storage with metadata id", async function () {
      jest.spyOn(storage, "get").mockResolvedValue();

      await SubFeature.getData("some-id");

      expect(storage.get).toBeCalledTimes(1);
      expect(storage.get).toBeCalledWith("sub-id:some-id");
    });
  });
});
