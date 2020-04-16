import { api as scryfall } from "./scryfall";

function getCommanders(deck) {
  const ids = deck.entries.commanders
    .filter((card) => card.card_digest)
    .map((card) => `oracle_id:"${card.card_digest.oracle_id}"`)
    .join(" or ");

  return scryfall.get("/cards/search", {
    q: ids,
  });
}

function getIdFromEntry(entry, idType) {
  if (idType === "id") {
    return entry.raw_text && entry.id;
  } else if (idType === "oracleId") {
    return entry.card_digest && entry.card_digest.oracle_id;
  }
}

export function isLandCard(card) {
  const frontType = card.card_digest.type_line.split("//")[0].trim();

  return Boolean(frontType.includes("Land") && !frontType.includes("Creature"));
}

export function getSections(deck) {
  return Object.keys(deck.sections).reduce((sections, type) => {
    deck.sections[type].forEach((section) => sections.push(section));
    return sections;
  }, []);
}

export function hasDedicatedLandSection(deck) {
  return getSections(deck).includes("lands");
}

export function getCommanderColorIdentity(deck) {
  return getCommanders(deck)
    .then((cards) => {
      return cards.map((c) => c.color_identity);
    })
    .catch(() => [])
    .then((colorIdentities) => {
      const colors = new Set(
        colorIdentities.reduce((id, ci) => {
          id.push(...ci);

          return id;
        }, [])
      );

      if (colors.size === 0) {
        colors.add("C");
      }

      return Array.from(colors);
    });
}

export function flattenEntries(deck, options = {}) {
  const sections = getSections(deck);
  const entries = [];
  const ids = {};
  const idToGroupBy = options.idToGroupBy || "oracleId";
  const ignoredSections = options.ignoredSections || {};

  sections.forEach((section) => {
    if (section in ignoredSections) {
      return;
    }
    deck.entries[section].forEach((entry) => {
      const id = getIdFromEntry(entry, idToGroupBy);

      if (id) {
        if (id in ids) {
          const original = ids[id];
          original.count = Number(original.count) + Number(entry.count);
        } else {
          ids[id] = entry;
          entries.push(entry);
        }
      }
    });
  });

  return entries;
}

export function hasLegalCommanders(commanders) {
  if (commanders.length === 0) {
    // no commanders in commander section
    return Promise.resolve(false);
  }

  return Promise.all(
    commanders.map((cardName) => {
      return scryfall.get("/cards/search", {
        q: `!"${cardName}" is:commander`,
      });
    })
  )
    .then(() => {
      // if all promises resolve, all were commanders
      return true;
    })
    .catch(() => {
      // if even one promise 404s, then not all were commanders
      return false;
    });
}

export function isCommanderLike(deck) {
  return getSections(deck).includes("commanders");
}

export function isSingletonTypeDeck(deck) {
  return getSections(deck).includes("nonlands") || isCommanderLike(deck);
}

export default {
  getCommanderColorIdentity,
  isLandCard,
  getSections,
  flattenEntries,
  hasDedicatedLandSection,
  hasLegalCommanders,
  isCommanderLike,
  isSingletonTypeDeck,
};
