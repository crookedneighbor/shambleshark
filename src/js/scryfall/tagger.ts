import bus from "framebus";
import iframe from "Lib/iframe";
import { BUS_EVENTS as events } from "Constants";

const query = `query FetchCard($set: String!, $number: String!, $back: Boolean = false) {
  card: cardBySet(set: $set, number: $number, back: $back) {
    ...CardAttrs
    taggings {
      ...TaggingAttrs
      tag {
        ...TagAttrs
        __typename
      }
      __typename
    }
    relationships {
      ...RelationshipAttrs
      __typename
    }
    __typename
  }
}

fragment CardAttrs on Card {
  illustrationId
  oracleId
  __typename
}

fragment RelationshipAttrs on Relationship {
  classifier
  classifierInverse
  contentId
  contentName
  foreignKey
  relatedId
  relatedName
  __typename
}

fragment TagAttrs on Tag {
  name
  type
  __typename
}

fragment TaggingAttrs on Tagging {
  __typename
}`;

export default function (): void {
  if (!iframe.isInsideIframe()) {
    // no need to set listeners when not access from iframe
    return;
  }

  bus.on(events.TAGGER_TAGS_REQUEST, (config, reply) => {
    // Firefox errors with a 422 for some reason when
    // using the fetch API inside an iframe, so we must
    // use xhr for this request
    const token = (document.querySelector(
      'meta[name="csrf-token"]'
    ) as HTMLElement).getAttribute("content") as string;
    const xhr = new window.XMLHttpRequest();

    xhr.open("POST", "https://tagger.scryfall.com/graphql", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-CSRF-Token", token);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const json = JSON.parse(xhr.responseText);
        reply(json.data.card);
      }
    };
    const body = JSON.stringify({
      operationName: "FetchCard",
      query,
      variables: {
        back: false,
        set: config.set,
        number: config.number,
      },
    });
    xhr.send(body);
  });

  bus.emit(events.TAGGER_READY);
}
