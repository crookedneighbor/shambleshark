export interface Tagging {
  tag: {
    name: string;
    type: string;
    slug: string;
    typeSlug: string;
  };
}

export interface Relationship {
  classifierInverse: string;
  relatedName: string;
  classifier: string;
  contentName: string;
  contentId: string;
  relatedId: string;
  foreignKey: "illustrationId" | "oracleId";
  illustrationId?: string;
  oracleId?: string;
}

type TagEdge = {
  id: string;
  tag: {
    name: string;
    slug: string;
    type: "ILLUSTRATION_TAG" | "ORACLE_CARD_TAG" | "PRINTING_TAG";
    typeSlug: "artwork" | "card" | "prints";
    __typename: "Tag";
  };
  __typename: "Tagging";
};

type RelationshipEdge = {
  classifier: string;
  classifierInverse: string;
  contentId: string;
  contentName: string;
  foreignKey: "illustrationId" | "oracleId";
  id: string;
  relatedId: string;
  relatedName: string;
  __typename: "Relationship";
};

export type TaggerPayload = {
  illustrationId: string;
  oracleId: string;
  edges: Array<TagEdge | RelationshipEdge>;
};
