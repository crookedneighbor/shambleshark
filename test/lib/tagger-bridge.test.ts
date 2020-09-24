import bus from "framebus";
import {
  setupBridgeToTagger,
  resetSetupBridgeToTaggerPromise,
  requestTags,
  TaggerLookupData,
} from "Lib/tagger-bridge";
import iframe from "Lib/iframe";
import noop from "Lib/noop";

import type { TaggerPayload } from "Js/types/tagger";
import { mocked } from "ts-jest/utils";

describe("tagger bridge", () => {
  describe("setupBridgeToTagger", () => {
    beforeEach(() => {
      type FramebusMockCallback = (
        data: Record<string, string>,
        cb: () => void
      ) => void;
      mocked(bus.on).mockImplementation(
        (event: string, cb: FramebusMockCallback) => {
          // TODO no data is actually passed here... why does framebus typing care?
          cb({}, noop);

          return true;
        }
      );
      jest.spyOn(iframe, "create").mockImplementation();
    });

    afterEach(() => {
      resetSetupBridgeToTaggerPromise();
    });

    it("sets up iframe and waits for tagger iframe to emit ready event", async () => {
      await setupBridgeToTagger();

      expect(iframe.create).toBeCalledTimes(1);
      expect(iframe.create).toBeCalledWith({
        id: "tagger-iframe",
        src: "https://tagger.scryfall.com",
      });

      expect(bus.on).toBeCalledTimes(1);
      expect(bus.on).toBeCalledWith("TAGGER_READY", expect.any(Function));
    });

    it("only setups up iframes and events once", async () => {
      await setupBridgeToTagger();
      await setupBridgeToTagger();
      await setupBridgeToTagger();
      await setupBridgeToTagger();
      await setupBridgeToTagger();

      expect(iframe.create).toBeCalledTimes(1);
      expect(bus.on).toBeCalledTimes(1);
    });
  });

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
        taggings: [
          {
            tag: {
              name: "Tag 1",
              type: "ILLUSTRATION_TAG",
              slug: "tag-1",
              typeSlug: "artwork",
            },
          },
          {
            tag: {
              name: "Tag 2",
              type: "ORACLE_CARD_TAG",
              slug: "tag-2",
              typeSlug: "card",
            },
          },
          {
            tag: {
              name: "Tag 3",
              type: "PRINTING_TAG",
              slug: "tag-3",
              typeSlug: "prints",
            },
          },
        ],
        relationships: [
          {
            foreignKey: "illustrationId",
            relatedId: "related-id",
            contentName: "Depicts Relationship",
            contentId: "depicts-id",
            relatedName: "Depicted Relationship",
            classifier: "DEPICTS",
            classifierInverse: "DEPICTED_IN",
          },
          {
            foreignKey: "oracleId",
            relatedId: "related-id",
            contentName: "Better Than Relationship",
            contentId: "worse-than-id",
            relatedName: "Worse Than Relationship",
            classifier: "BETTER_THAN",
            classifierInverse: "WORSE_THAN",
          },
        ],
      };

      bus.emit.mockImplementation(
        (
          eventName: string,
          data: TaggerLookupData,
          cb: (payload: TaggerPayload) => void
        ) => {
          cb(lookupResult);
        }
      );
    });

    it("emits event to request tags", async () => {
      await requestTags(requestData);

      expect(bus.emit).toBeCalledTimes(1);
      expect(bus.emit).toBeCalledWith(
        "TAGGER_TAGS_REQUEST",
        requestData,
        expect.any(Function)
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
      lookupResult.taggings!.push({
        tag: {
          name: "bad type",
          type: "NONE",
          slug: "bad-type",
          typeSlug: "none",
        },
      });

      const tags = await requestTags(requestData);

      expect(tags.art.length).toBe(3);
      expect(tags.oracle.length).toBe(2);
    });

    it("uses contentName and classifier when it is the related tag", async () => {
      lookupResult.relationships = [
        {
          foreignKey: "oracleId",
          relatedId: "oracle-id",
          contentName: "Content Name",
          contentId: "better-than-id",
          relatedName: "Related Name",
          classifier: "BETTER_THAN",
          classifierInverse: "WORSE_THAN",
        },
      ];
      const tags = await requestTags(requestData);

      expect(tags.oracle[1]).toEqual({
        name: "Content Name",
        tagType: "BETTER_THAN",
        link: "https://scryfall.com/search?q=oracleId=better-than-id",
      });
    });

    it("uses realtedName and classifierInverse when it is the related tag", async () => {
      lookupResult.relationships = [
        {
          foreignKey: "oracleId",
          relatedId: "not-oracle-id",
          contentName: "Content Name",
          contentId: "better-than-id",
          relatedName: "Related Name",
          classifier: "BETTER_THAN",
          classifierInverse: "WORSE_THAN",
        },
      ];
      const tags = await requestTags(requestData);

      expect(tags.oracle[1]).toEqual({
        name: "Related Name",
        tagType: "WORSE_THAN",
        link: "https://scryfall.com/search?q=oracleId=not-oracle-id",
      });
    });

    it("skips any unknown foreign keys", async () => {
      lookupResult.relationships!.push({
        // Intentionally doing this to force the path for an unknown key
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        foreignKey: "unknown",
        relatedId: "not-oracle-id",
        contentName: "Content Name",
        contentId: "better-than-id",
        relatedName: "Related Name",
        classifier: "BETTER_THAN",
        classifierInverse: "WORSE_THAN",
      });
      const tags = await requestTags(requestData);

      expect(tags.art.length).toEqual(3);
      expect(tags.oracle.length).toEqual(2);
    });
  });
});
