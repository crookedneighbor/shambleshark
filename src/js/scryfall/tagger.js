import bus from 'framebus'
import iframe from '../lib/iframe'

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
}`

export default function () {
  if (!iframe.isInsideIframe()) {
    // no need to set listeners when not access from iframe
    return
  }

  bus.on('TAGGER_TAGS_REQUEST', (config, reply) => {
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

    global.fetch('https://tagger.scryfall.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({
        operationName: 'FetchCard',
        query,
        variables: {
          back: false,
          set: config.set,
          number: config.number
        }
      })
    }).then(res => res.json()).then(payload => reply(payload.data.card))
  })

  bus.emit('TAGGER_READY')
}
