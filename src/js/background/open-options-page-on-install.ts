import { onInstalled, openOptionsPage } from "Browser/runtime";

export default function (): void {
  onInstalled().addListener(function (details) {
    if (details.reason === "install") {
      openOptionsPage();
    }
  });
}
