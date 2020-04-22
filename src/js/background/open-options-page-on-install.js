import { browser } from "webextension-polyfill-ts";

export default function () {
  browser.runtime.onInstalled().addListener(function (details) {
    if (details.reason === "install") {
      browser.runtime.openOptionsPage();
    }
  });
}
