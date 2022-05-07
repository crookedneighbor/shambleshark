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

  payload.edges.forEach((edge) => {
    if (edge.__typename !== "Tagging") {
      return;
    }
    const tag = edge.tag;
    const tagType = tag.type;
    const key = tagToCollectionMap[tagType];
    const tagsByType = tags[key];

    if (tagsByType) {
      tagsByType.push({
        link: `https://tagger.scryfall.com/tags/${tag.namespace}/${tag.slug}`,
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

  payload.edges.forEach((edge) => {
    if (edge.__typename !== "Relationship") {
      return;
    }

    let name, tagType;
    const isTheRelatedTag = payload[edge.foreignKey] === edge.relatedId;
    let link = `https://scryfall.com/search?q=${edge.foreignKey}=`;

    if (isTheRelatedTag) {
      name = edge.subjectName;
      tagType = edge.classifier;
      link += edge.subjectId;
    } else {
      name = edge.relatedName;
      tagType = edge.classifierInverse;
      link += edge.relatedId;
    }

    const relationshipsFromType =
      relationships[typeToRelationshipMap[edge.foreignKey]];

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
  const { data } = await window
    .fetch(
      `https://tagger.scryfall.com/graphql/registry?name=shambleshark_card_edges&set=${taggerData.set}&number=${taggerData.number}`,
      {
        method: "POST",
      }
    )
    .then((res) => {
      return res.json();
    });
  const payload = data.card;

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
