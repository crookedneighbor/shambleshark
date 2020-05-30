// adapted from https://stackoverflow.com/a/33145009/2601552
export default function embed() {
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL("scryfallEmbed.bundle.js");
  s.onload = function () {
    // Not sure why this isn't on the type, but it works so :shrug:
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.remove();
  };

  (document.head || document.documentElement).appendChild(s);
}
