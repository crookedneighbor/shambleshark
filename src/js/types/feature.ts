export type settingValue = string | number | boolean | Record<string, string>;

export interface Metadata {
  id: string;
  title: string;
  section: string; // TODO: Do it so it can only be a FEATURE_SECTIONS from Constants
  description: string;
  futureFeature?: boolean;
}

export interface SettingsDefaults {
  enabled: boolean;
  [key: string]: settingValue;
}

export interface SettingsDefinition {
  id: string;
  label: string;
  input: "checkbox";
}
