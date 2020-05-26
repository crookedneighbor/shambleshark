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
  };
  storage: {
    sync: {
      get: (args: string[]) => Promise<Record<string, any>>;
      set: (obj: Record<string, any>) => Promise<void>;
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
