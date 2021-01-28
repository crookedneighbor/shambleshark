import iframe from "Lib/iframe";
import Framebus from "framebus";
import { BUS_EVENTS as events } from "Constants";

import type { TaggerPayload } from "Js/types/tagger";

export type TagEntries = {
  art: TagInfo[];
  oracle: TagInfo[];
  taggerLink: string;
};
export interface TagInfo {
  name: string;
  link: string;
  tagType: string;
  isTag?: boolean;
}
type RelationshipCollection = Record<string, TagInfo[]>;
export type TaggerLookupData = {
  set: string;
  number: string;
};

let setupPromise: Promise<void>;
let bridgeSetupInProgress = false;

const bus = new Framebus();

export async function setupBridgeToTagger(): Promise<void> {
  if (bridgeSetupInProgress) {
    return setupPromise;
  }

  setupPromise = new Promise((resolve) => {
    bus.on(events.TAGGER_READY, () => {
      resolve();
    });
  });
  bridgeSetupInProgress = true;

  await iframe.create({
    id: "tagger-iframe",
    src: "https://tagger.scryfall.com",
  });

  await setupPromise;
}

export function resetSetupBridgeToTaggerPromise(): void {
  bridgeSetupInProgress = false;
}

function collectTags(payload: TaggerPayload): RelationshipCollection {
  const tags: RelationshipCollection = {
    art: [],
    oracle: [],
    print: [],
  };
  const tagToCollectionMap: Record<string, string> = {
    ILLUSTRATION_TAG: "art",
    ORACLE_CARD_TAG: "oracle",
    PRINTING_TAG: "print",
  };

  payload.taggings?.forEach(({ tag }) => {
    const tagType = tag.type;
    const key = tagToCollectionMap[tagType];
    const tagsByType = tags[key];

    if (tagsByType) {
      tagsByType.push({
        link: `https://tagger.scryfall.com/tags/${tag.typeSlug}/${tag.slug}`,
        isTag: true,
        tagType,
        name: tag.name,
      });
    }
  });

  return tags;
}

function collectRelationships(payload: TaggerPayload): RelationshipCollection {
  const relationships: RelationshipCollection = {
    art: [],
    oracle: [],
  };
  const typeToRelationshipMap: Record<string, string> = {
    illustrationId: "art",
    oracleId: "oracle",
  };

  payload.relationships?.forEach((r) => {
    let name, tagType;
    const isTheRelatedTag = payload[r.foreignKey] === r.relatedId;
    let link = `https://scryfall.com/search?q=${r.foreignKey}=`;

    if (isTheRelatedTag) {
      name = r.contentName;
      tagType = r.classifier;
      link += r.contentId;
    } else {
      name = r.relatedName;
      tagType = r.classifierInverse;
      link += r.relatedId;
    }

    const relationshipsFromType =
      relationships[typeToRelationshipMap[r.foreignKey]];

    if (relationshipsFromType) {
      relationshipsFromType.push({
        link,
        tagType,
        name,
      });
    }
  });

  return relationships;
}

export async function requestTags(
  taggerData: TaggerLookupData
): Promise<TagEntries> {
  const payload = await bus.emitAsPromise<TaggerPayload>(
    events.TAGGER_TAGS_REQUEST,
    taggerData
  );

  const tags = collectTags(payload);
  const relationships = collectRelationships(payload);
  const artEntries = tags.art.concat(tags.print).concat(relationships.art);
  const oracleEntries = tags.oracle.concat(relationships.oracle);

  return {
    art: artEntries,
    oracle: oracleEntries,
    taggerLink: `https://tagger.scryfall.com/card/${taggerData.set}/${taggerData.number}`,
  };
}
