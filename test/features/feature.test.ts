import Feature from "Features/feature";
import storage from "Lib/storage";

import { mocked } from "ts-jest/utils";

jest.mock("Lib/storage");

const getSpy = mocked(storage.get);
const setSpy = mocked(storage.set);

describe("Base Feature", function () {
  describe("enable", function () {
    class FeatureThatEnables extends Feature {
      run(): Promise<void> {
        return Promise.resolve();
      }
    }
    FeatureThatEnables.metadata = {
      id: "feature-that-enables",
      title: "Sub Title",
      section: "deck-view",
      description: "Sub description.",
    };

    it("sets enabled property for feature on storage", async function () {
      jest
        .spyOn(FeatureThatEnables, "saveSetting")
        .mockResolvedValue(undefined);
      await FeatureThatEnables.enable();

      expect(FeatureThatEnables.saveSetting).toBeCalledTimes(1);
      expect(FeatureThatEnables.saveSetting).toBeCalledWith("enabled", true);
    });
  });

  describe("disable", function () {
    class FeatureThatDisables extends Feature {
      run(): Promise<void> {
        return Promise.resolve();
      }
    }
    FeatureThatDisables.metadata = {
      id: "feature-that-disables",
      title: "Sub Title",
      section: "deck-view",
      description: "Sub description.",
    };

    it("saves feature on storage", async function () {
      jest
        .spyOn(FeatureThatDisables, "saveSetting")
        .mockResolvedValue(undefined);
      await FeatureThatDisables.disable();

      expect(FeatureThatDisables.saveSetting).toBeCalledTimes(1);
      expect(FeatureThatDisables.saveSetting).toBeCalledWith("enabled", false);
    });
  });

  describe("isEnabled", function () {
    class FeatureThatReportsIfItsEnabled extends Feature {
      run(): Promise<void> {
        return Promise.resolve();
      }
    }
    FeatureThatReportsIfItsEnabled.metadata = {
      id: "feature-that-reports",
      title: "Sub Title",
      section: "deck-view",
      description: "Sub description.",
    };

    it("resolves to true if feature is enabled", async function () {
      jest
        .spyOn(FeatureThatReportsIfItsEnabled, "getSettings")
        .mockResolvedValue({
          enabled: true,
        });

      await expect(FeatureThatReportsIfItsEnabled.isEnabled()).resolves.toBe(
        true
      );

      expect(FeatureThatReportsIfItsEnabled.getSettings).toBeCalledTimes(1);
    });

    it("resolves to false if feature is disabled", async function () {
      jest
        .spyOn(FeatureThatReportsIfItsEnabled, "getSettings")
        .mockResolvedValue({
          enabled: false,
        });

      await expect(FeatureThatReportsIfItsEnabled.isEnabled()).resolves.toBe(
        false
      );

      expect(FeatureThatReportsIfItsEnabled.getSettings).toBeCalledTimes(1);
    });
  });

  describe("getSettings", function () {
    class FeatureWithSavedSettings extends Feature {
      run(): Promise<void> {
        return Promise.resolve();
      }
    }
    FeatureWithSavedSettings.metadata = {
      id: "feature-with-saved",
      title: "Sub Title",
      section: "deck-view",
      description: "Sub description.",
    };
    FeatureWithSavedSettings.settingsDefaults = {
      enabled: true,
      foo: "bar",
      baz: "buz",
    };
    class FutureFeatureWithSavedSettings extends Feature {
      run(): Promise<void> {
        return Promise.resolve();
      }
    }
    FutureFeatureWithSavedSettings.metadata = {
      id: "future-feature",
      title: "Sub Title",
      section: "deck-view",
      description: "Sub description.",
      futureFeature: true,
    };

    it("calls out to storage for settings", async function () {
      getSpy.mockResolvedValue({
        foo: "value1",
        baz: "value2",
      });
      const settings = await FeatureWithSavedSettings.getSettings();

      expect(getSpy).toBeCalledTimes(1);
      expect(getSpy).toBeCalledWith("feature-with-saved");
      expect(settings.enabled).toBe(true);
      expect(settings.foo).toBe("value1");
      expect(settings.baz).toBe("value2");
    });

    it("applies defaults when param is not available", async function () {
      getSpy.mockResolvedValue({
        foo: "value1",
      });
      const settings = await FeatureWithSavedSettings.getSettings();

      expect(getSpy).toBeCalledTimes(1);
      expect(getSpy).toBeCalledWith("feature-with-saved");
      expect(settings.enabled).toBe(true);
      expect(settings.foo).toBe("value1");
      expect(settings.baz).toBe("buz");
    });

    it("applies defaults when existing settingsa re not available and future opt in setting is not available", async function () {
      getSpy.mockResolvedValueOnce(null);
      getSpy.mockResolvedValueOnce(null);

      const settings = await FeatureWithSavedSettings.getSettings();

      expect(getSpy).toBeCalledTimes(2);
      expect(getSpy).toBeCalledWith("feature-with-saved");
      expect(getSpy).toBeCalledWith("future-opt-in");
      expect(settings.enabled).toBe(true);
      expect(settings.foo).toBe("bar");
      expect(settings.baz).toBe("buz");
    });

    it("applies defaults when existing settings are not available and future opt in setting is enabled", async function () {
      getSpy.mockResolvedValueOnce(null);
      getSpy.mockResolvedValueOnce({
        enabled: true,
      });

      const settings = await FeatureWithSavedSettings.getSettings();

      expect(getSpy).toBeCalledTimes(2);
      expect(getSpy).toBeCalledWith("feature-with-saved");
      expect(getSpy).toBeCalledWith("future-opt-in");
      expect(settings.enabled).toBe(true);
      expect(settings.foo).toBe("bar");
      expect(settings.baz).toBe("buz");
    });

    it('saves it as enabled "false" when no previous settings are present and future opt in is disabled', async function () {
      getSpy.mockResolvedValueOnce(null);
      getSpy.mockResolvedValueOnce({
        enabled: false,
      });
      const settings = await FeatureWithSavedSettings.getSettings();

      expect(getSpy).toBeCalledTimes(2);
      expect(getSpy).toBeCalledWith("feature-with-saved");
      expect(getSpy).toBeCalledWith("future-opt-in");
      expect(setSpy).toBeCalledTimes(1);
      expect(setSpy).toBeCalledWith("feature-with-saved", {
        enabled: false,
      });

      expect(settings.enabled).toBe(false);
    });

    it('saves it as enabled "true" when no previous settings are present and future opt in is enabled', async function () {
      getSpy.mockResolvedValueOnce(null);
      getSpy.mockResolvedValueOnce({
        enabled: true,
      });
      const settings = await FeatureWithSavedSettings.getSettings();

      expect(getSpy).toBeCalledTimes(2);
      expect(getSpy).toBeCalledWith("feature-with-saved");
      expect(getSpy).toBeCalledWith("future-opt-in");
      expect(setSpy).toBeCalledTimes(1);
      expect(setSpy).toBeCalledWith("feature-with-saved", {
        enabled: true,
      });

      expect(settings.enabled).toBe(true);
    });

    it('does not save it as enabled "false" if feature is a future feature', async function () {
      getSpy.mockResolvedValueOnce(null);
      getSpy.mockResolvedValueOnce({
        enabled: false,
      });
      const settings = await FutureFeatureWithSavedSettings.getSettings();

      expect(getSpy).toBeCalledTimes(2);
      expect(getSpy).toBeCalledWith("future-feature");
      expect(getSpy).toBeCalledWith("future-opt-in");
      expect(setSpy).toBeCalledTimes(0);

      expect(settings.enabled).toBe(false);
    });

    it("resolves with enabled false if feature is a future feature", async function () {
      getSpy.mockResolvedValueOnce(null);
      getSpy.mockResolvedValueOnce({
        enabled: true,
      });
      const settings = await FutureFeatureWithSavedSettings.getSettings();

      expect(getSpy).toBeCalledTimes(2);
      expect(getSpy).toBeCalledWith("future-feature");
      expect(getSpy).toBeCalledWith("future-opt-in");
      expect(setSpy).toBeCalledTimes(0);

      expect(settings.enabled).toBe(false);
    });
  });

  describe("saveSetting", function () {
    class FeatureThatSavesSettings extends Feature {
      run(): Promise<void> {
        return Promise.resolve();
      }
    }
    FeatureThatSavesSettings.metadata = {
      id: "feature-that-saves",
      title: "Sub Title",
      section: "deck-view",
      description: "Sub description.",
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
      expect(setSpy).toBeCalledTimes(1);
      expect(setSpy).toBeCalledWith("feature-that-saves", {
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

      expect(setSpy).toBeCalledTimes(0);
    });
  });

  describe("saveData", function () {
    class SubFeature extends Feature {
      run(): Promise<void> {
        return Promise.resolve();
      }
    }
    SubFeature.metadata = {
      id: "sub-id",
      title: "Sub Title",
      section: "deck-view",
      description: "Sub description.",
    };

    it("sets storage with metadata id", async function () {
      const data = {};

      await SubFeature.saveData("some-id", data);

      expect(setSpy).toBeCalledTimes(1);
      expect(setSpy).toBeCalledWith("sub-id:some-id", data);
    });
  });

  describe("getData", function () {
    class SubFeature extends Feature {
      run(): Promise<void> {
        return Promise.resolve();
      }
    }
    SubFeature.metadata = {
      id: "sub-id",
      title: "Sub Title",
      section: "deck-view",
      description: "Sub description.",
    };

    it("gets storage with metadata id", async function () {
      await SubFeature.getData("some-id");

      expect(getSpy).toBeCalledTimes(1);
      expect(getSpy).toBeCalledWith("sub-id:some-id");
    });
  });
});
