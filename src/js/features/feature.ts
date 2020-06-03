import storage from "Lib/storage";
import { FEATURE_IDS as ids } from "Constants";

export type SettingValue = string | number | boolean | Record<string, string>;

export interface Metadata {
  id: string;
  title: string;
  section: string; // TODO: Do it so it can only be a FEATURE_SECTIONS from Constants
  description: string;
  futureFeature?: boolean;
}

export interface SettingsDefaults {
  enabled: boolean;
}

export interface SettingsDefinition {
  id: string;
  label: string;
  input: string;
}

export default abstract class Feature {
  static metadata: Metadata;
  static settingsDefaults: SettingsDefaults;
  static settingDefinitions: SettingsDefinition[] = [];
  static usesSidebar: boolean;

  abstract run(): Promise<void>;

  static isEnabled(): Promise<boolean> {
    return this.getSettings().then((settings) => Boolean(settings.enabled));
  }

  static enable(): Promise<void> {
    return this.saveSetting("enabled", true);
  }

  static disable(): Promise<void> {
    return this.saveSetting("enabled", false);
  }

  static async saveSetting(
    property: string,
    value: SettingValue
  ): Promise<void> {
    // TODO put these in a queue to avoid race conditions
    // of too many settings being saved at once
    const settings = await this.getSettings();

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

  static async getSettings<T = Record<string, SettingValue>>(): Promise<T> {
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

  static async saveData(key: string, value: SettingValue): Promise<void> {
    return storage.set(`${this.metadata.id}:${key}`, value);
  }

  static async getData(key: string): Promise<SettingValue> {
    return storage.get(`${this.metadata.id}:${key}`);
  }
}
