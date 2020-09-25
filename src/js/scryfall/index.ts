import modifyTagger from "./tagger";
import modifyCardPage from "./card-page";
import modifyContactPage from "./contact-page";
import modifyDeckDisplayPage from "./deck-display-page";
import modifyEditPage from "./edit-page";
import modifySearchPage from "./search-page";
import embed from "./embed-scryfall-script";

function isCardPage(page: string) {
  return (
    page === "card" ||
    (page === "search" && document.querySelector(".card-profile"))
  );
}

function isSearchResultPage(page: string) {
  return page === "search" || page === "sets";
}

function isDeckDisplayPage(urlPieces: string[]) {
  // on the decks page
  // has a deck id
  // does not include a third path (IE, build)
  return urlPieces[1] === "decks" && urlPieces[2] && !urlPieces[3];
}

function isDeckEditorPage(urlPieces: string[]) {
  return urlPieces[1] === "decks" && urlPieces[3] === "build";
}

export default function start(): void {
  const hostname = window.location.hostname;

  if (hostname === "tagger.scryfall.com") {
    modifyTagger();
    return;
  } else if (hostname !== "scryfall.com") {
    // if we're on a subdomain, we don't want
    // to run the main scryfall code
    return;
  }
  embed();

  const path = window.location.pathname;
  const urlPieces = path.substring(1, path.length).split("/");
  const page = urlPieces[0];

  // TODO separate scripts for each page or just do it this way?
  if (page === "contact") {
    modifyContactPage();
  } else if (isCardPage(page)) {
    modifyCardPage();
  } else if (isSearchResultPage(page)) {
    modifySearchPage();
  } else if (isDeckDisplayPage(urlPieces)) {
    modifyDeckDisplayPage();
  } else if (isDeckEditorPage(urlPieces)) {
    modifyEditPage();
  }
}

start();
