import { onInstalled, openOptionsPage } from "Browser/runtime";

export default function () {
  onInstalled().addListener(function (details) {
    if (details.reason === "install") {
      openOptionsPage();
    }
  });
}
