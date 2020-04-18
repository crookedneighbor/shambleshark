export type settingValue = string | number | boolean | Record<string, string>;

export interface metadata {
  id: string;
  title: string;
  section: string; // TODO: Do it so it can only be a FEATURE_SECTIONS from Constants
  description: string;
  futureFeature?: boolean;
}

export interface settingsDefaults {
  enabled: boolean;
  [key: string]: settingValue;
}

export interface settingsDefinition {
  id: string;
  label: string;
  input: "checkbox";
}
