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

export interface TaggerPayload {
  illustrationId?: string;
  oracleId?: string;
  taggings?: Tagging[];
  relationships?: Relationship[];
}
