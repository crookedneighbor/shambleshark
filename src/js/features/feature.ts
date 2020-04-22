import storage from "Lib/storage";
import { FEATURE_IDS as ids } from "Constants";
import {
  metadata,
  settingsDefaults,
  settingsDefinition,
  settingValue,
} from "Js/types/feature";

export default abstract class Feature {
  static metadata: metadata;
  static settingsDefaults: settingsDefaults;
  static settingDefinitions: settingsDefinition[] = [];
  static usesSidebar: boolean;

  abstract run(): Promise<void>;

  static isEnabled() {
    return this.getSettings().then((settings) => settings.enabled);
  }

  static enable() {
    return this.saveSetting("enabled", true);
  }

  static disable() {
    return this.saveSetting("enabled", false);
  }

  static async saveSetting(property: string, value: settingValue) {
    // TODO put these in a queue to avoid race conditions
    // of too many settings being saved at once
    const settings = await this.getSettings();

    // TODO this will be taken care of by the type system once features are
    // ported over to typescript
    if (!(property in this.settingsDefaults)) {
      return Promise.reject(
        new Error(
          `Internal Error: Could not find property "${property}" on feature`
        )
      );
    }

    settings[property] = value;

    return storage.set(this.metadata.id, settings);
  }

  static async getSettings() {
    let settings = await storage.get(this.metadata.id);

    if (!settings) {
      const futureFeatureSettings = await storage.get(ids.FutureFeatureOptIn);
      const disableFutureFeature = futureFeatureSettings?.enabled === false;

      settings = {
        enabled: !disableFutureFeature && !this.metadata.futureFeature,
      };

      if (!this.metadata.futureFeature) {
        // if not a future feature, we should save the settings
        // so that if the future feature setting gets toggled,
        // we still maintain the enabled state
        await storage.set(this.metadata.id, settings);
      }
    }

    return { ...this.settingsDefaults, ...settings };
  }

  static async saveData(key: string, value: settingValue) {
    return storage.set(`${this.metadata.id}:${key}`, value);
  }

  static async getData(key: string): Promise<settingValue> {
    return storage.get(`${this.metadata.id}:${key}`);
  }
}
