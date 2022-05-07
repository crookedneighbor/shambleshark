import { requestTags, TaggerLookupData } from "Lib/tagger-bridge";

import type { TaggerPayload } from "Js/types/tagger";

describe("tagger bridge", () => {
  describe("requestTags", () => {
    let requestData: TaggerLookupData;
    let lookupResult: TaggerPayload;

    beforeEach(() => {
      requestData = {
        set: "DOM",
        number: "123",
      };
      lookupResult = {
        illustrationId: "illustration-id",
        oracleId: "oracle-id",
        edges: [
          {
            id: "some-id",
            __typename: "Tagging",
            tag: {
              name: "Tag 1",
              type: "ILLUSTRATION_TAG",
              slug: "tag-1",
              namespace: "artwork",
              __typename: "Tag",
            },
          },
          {
            id: "some-id",
            __typename: "Tagging",
            tag: {
              name: "Tag 2",
              type: "ORACLE_CARD_TAG",
              slug: "tag-2",
              namespace: "card",
              __typename: "Tag",
            },
          },
          {
            id: "some-id",
            __typename: "Tagging",
            tag: {
              name: "Tag 3",
              type: "PRINTING_TAG",
              slug: "tag-3",
              namespace: "print",
              __typename: "Tag",
            },
          },
          {
            id: "some-id",
            foreignKey: "illustrationId",
            relatedId: "related-id",
            subjectName: "Depicts Relationship",
            subjectId: "depicts-id",
            relatedName: "Depicted Relationship",
            classifier: "DEPICTS",
            classifierInverse: "DEPICTED_IN",
            __typename: "Relationship",
          },
          {
            id: "some-id",
            foreignKey: "oracleId",
            relatedId: "related-id",
            subjectName: "Better Than Relationship",
            subjectId: "worse-than-id",
            relatedName: "Worse Than Relationship",
            classifier: "BETTER_THAN",
            classifierInverse: "WORSE_THAN",
            __typename: "Relationship",
          },
        ],
      };

      window.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              data: {
                card: lookupResult,
              },
            }),
        });
      });
    });

    it("requests tags from tagger", async () => {
      await requestTags(requestData);

      expect(window.fetch).toBeCalledWith(
        "https://tagger.scryfall.com/graphql/registry?name=shambleshark_card_edges&set=DOM&number=123",
        {
          method: "POST",
        }
      );
    });

    it("collects tags in groups", async () => {
      const tags = await requestTags(requestData);

      expect(tags.art).toEqual([
        {
          name: "Tag 1",
          isTag: true,
          tagType: "ILLUSTRATION_TAG",
          link: "https://tagger.scryfall.com/tags/artwork/tag-1",
        },
        {
          name: "Tag 3",
          isTag: true,
          tagType: "PRINTING_TAG",
          link: "https://tagger.scryfall.com/tags/prints/tag-3",
        },
        {
          name: "Depicted Relationship",
          tagType: "DEPICTED_IN",
          link: "https://scryfall.com/search?q=illustrationId=related-id",
        },
      ]);
      expect(tags.oracle).toEqual([
        {
          name: "Tag 2",
          isTag: true,
          tagType: "ORACLE_CARD_TAG",
          link: "https://tagger.scryfall.com/tags/card/tag-2",
        },
        {
          name: "Worse Than Relationship",
          tagType: "WORSE_THAN",
          link: "https://scryfall.com/search?q=oracleId=related-id",
        },
      ]);
    });

    it("ignores any other types", async () => {
      lookupResult.edges.push({
        id: "some-id",
        __typename: "Tagging",
        tag: {
          name: "bad type",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          type: "NONE",
          slug: "bad-type",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          namespace: "none",
          __typename: "Tag",
        },
      });

      const tags = await requestTags(requestData);

      expect(tags.art.length).toBe(3);
      expect(tags.oracle.length).toBe(2);
    });

    it("uses subjectName and classifier when it is the related tag", async () => {
      lookupResult.edges = [
        {
          id: "some-id",
          __typename: "Relationship",
          foreignKey: "oracleId",
          relatedId: "oracle-id",
          subjectName: "Content Name",
          subjectId: "better-than-id",
          relatedName: "Related Name",
          classifier: "BETTER_THAN",
          classifierInverse: "WORSE_THAN",
        },
      ];
      const tags = await requestTags(requestData);

      expect(tags.oracle[0]).toEqual({
        name: "Content Name",
        tagType: "BETTER_THAN",
        link: "https://scryfall.com/search?q=oracleId=better-than-id",
      });
    });

    it("uses relatedName and classifierInverse when it is the related tag", async () => {
      lookupResult.edges = [
        {
          id: "some-id",
          __typename: "Relationship",
          foreignKey: "oracleId",
          relatedId: "not-oracle-id",
          subjectName: "Content Name",
          subjectId: "better-than-id",
          relatedName: "Related Name",
          classifier: "BETTER_THAN",
          classifierInverse: "WORSE_THAN",
        },
      ];
      const tags = await requestTags(requestData);

      expect(tags.oracle[0]).toEqual({
        name: "Related Name",
        tagType: "WORSE_THAN",
        link: "https://scryfall.com/search?q=oracleId=not-oracle-id",
      });
    });

    it("skips any unknown foreign keys", async () => {
      lookupResult.edges.push({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        foreignKey: "unknown",
        relatedId: "not-oracle-id",
        subjectName: "Content Name",
        subjectId: "better-than-id",
        relatedName: "Related Name",
        classifier: "BETTER_THAN",
        classifierInverse: "WORSE_THAN",
        __typename: "Relationship",
      });
      const tags = await requestTags(requestData);

      expect(tags.art.length).toEqual(3);
      expect(tags.oracle.length).toEqual(2);
    });
  });
});
