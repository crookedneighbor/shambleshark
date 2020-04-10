import { onHeadersReceived } from "Browser/runtime";

export default function () {
  // removes the headers that prevent loading Tagger in an iframe
  onHeadersReceived({
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
