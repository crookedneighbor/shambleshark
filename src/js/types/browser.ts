type AddListener = (info: chrome.webRequest.WebResponseHeadersDetails) => void;
type Config = {
  urls: string[];
  types: chrome.webRequest.ResourceType[];
};
type Permissions = string[];

// There is no easy @types/firefox module like there is for chrome
export interface FirefoxBrowserExtension {
  runtime: {
    openOptionsPage: () => void;
    getManifest: () => void;
    onInstalled: () => void;
    getURL: (path: string) => string;
  };
  storage: {
    sync: {
      get: (args: string[]) => Promise<Record<string, unknown>>;
      set: (obj: Record<string, unknown>) => Promise<void>;
    };
  };
  webRequest: {
    onHeadersReceived: {
      addListener: (
        fn: AddListener,
        config: Config,
        permissions: Permissions
      ) => void;
    };
  };
}

export interface OnHeadersReceivedOptions {
  addListener: AddListener;
  config: Config;
  permissions: Permissions;
}
