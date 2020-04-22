import { browser } from "webextension-polyfill-ts";

export default function () {
  // https://stackoverflow.com/a/15534822/2601552
  // removes the headers that prevent loading Tagger in an iframe
  browser.webRequest.onHeadersReceived({
    addListener(info) {
      const headers = info.responseHeaders.filter((rawHeader) => {
        const header = rawHeader.name.toLowerCase();

        return header !== "x-frame-options" && header !== "frame-options";
      });

      return { responseHeaders: headers };
    },
    config: {
      urls: ["*://tagger.scryfall.com/*"],
      types: ["sub_frame"],
    },
    permissions: ["blocking", "responseHeaders"],
  });
}
