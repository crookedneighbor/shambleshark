export const FEATURE_SECTIONS = {
  GLOBAL: "global",
  DECK_VIEW: "deck-view",
  DECK_BUILDER: "deck-builder",
  SEARCH_RESULTS: "search-results",
};

export const FEATURE_IDS = {
  // Globals
  FutureFeatureOptIn: "future-opt-in",

  // Deckbuilders
  CardInputModifier: "card-input-modifier",
  CleanUpImprover: "clean-up-improver",
  EDHRecSuggestions: "edhrec-suggestions-button",
  ScryfallSearch: "scryfall-search",

  // Deck Display
  DeckDisplay: "deck-display",
  TokenList: "token-list",

  // Search results
  TaggerLink: "tagger-link",
};

export const BUS_EVENTS: Record<string, string> = {
  ADD_CARD_TO_DECK: "ADD_CARD_TO_DECK",
  CALLED_DESTROYENTRY: "CALLED_DESTROYENTRY",
  CALLED_ADDCARD: "CALLED_ADDCARD",
  CALLED_CLEANUP: "CALLED_CLEANUP",
  CALLED_UPDATEENTRY: "CALLED_UPDATEENTRY",
  CALLED_REPLACEENTRY: "CALLED_REPLACEENTRY",
  CALLED_CREATEENTRY: "CALLED_CREATEENTRY",
  CLEAN_UP_DECK: "CLEAN_UP_DECK",
  MODIFY_CLEAN_UP: "MODIFY_CLEAN_UP",
  REMOVE_CARD_FROM_DECK: "REMOVE_CARD_FROM_DECK",
  REQUEST_DECK: "REQUEST_DECK",
  REQUEST_EDHREC_RECOMENDATIONS: "REQUEST_EDHREC_RECOMENDATIONS",
  SCRYFALL_LISTENERS_READY: "SCRYFALL_LISTENERS_READY",
  SCRYFALL_PUSH_NOTIFICATION: "SCRYFALL_PUSH_NOTIFICATION",
  TAGGER_READY: "TAGGER_READY",
  TAGGER_TAGS_REQUEST: "TAGGER_TAGS_REQUEST",
};

export const SPINNER_GIF =
  "https://assets.scryfall.com/assets/spinner-0e5953300e953759359ad94bcff35ac64ff73a403d3a0702e809d6c43e7e5ed5.gif";
