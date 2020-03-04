import deckParser from 'Lib/deck-parser'
import storage from 'Lib/storage'
import {
  FEATURE_IDS as ids
} from 'Constants'

const notImplementedError = new Error('Method not Implemented')

function createStaticProperty (propertyName, defaultValue) {
  const privatePropertyName = `_${propertyName}`

  Object.defineProperty(Feature, propertyName, {
    get () {
      return this.hasOwnProperty(privatePropertyName) ? this[privatePropertyName] : defaultValue // eslint-disable-line no-prototype-builtins
    },
    set (value) {
      this[privatePropertyName] = value
    }
  })
}

class Feature {
  async run () {
    return Promise.reject(notImplementedError)
  }

  isEnabled () {
    return this.constructor.getSettings()
      .then(settings => settings.enabled)
  }

  static enable () {
    return this.saveSetting('enabled', true)
  }

  static disable () {
    return this.saveSetting('enabled', false)
  }

  static async saveSetting (property, value) {
    // TODO put these in a queue to avoid race conditions
    // of too many settings being saved at once
    const settings = await this.getSettings()

    if (!(property in this.settingsDefaults)) {
      return Promise.reject(new Error(`Internal Error: Could not find property "${property}" on feature`))
    }

    settings[property] = value

    return storage.set(this.metadata.id, settings)
  }

  static async getSettings () {
    let settings = await storage.get(this.metadata.id)

    if (!settings) {
      const futureFeatureSettings = await storage.get(ids.FutureFeatureOptIn)
      const disableFutureFeature = futureFeatureSettings && futureFeatureSettings.enabled === false

      settings = {
        enabled: !disableFutureFeature && !this.metadata.futureFeature
      }

      if (!this.metadata.futureFeature) {
        // if not a future feature, we should save the settings
        // so that if the future feature setting gets toggled,
        // we still maintain the enabled state
        await storage.set(this.metadata.id, settings)
      }
    }

    return Object.assign({}, this.settingsDefaults, settings)
  }

  static async saveData (key, value) {
    return storage.set(`${this.metadata.id}:${key}`, value)
  }

  static async getData (key) {
    return storage.get(`${this.metadata.id}:${key}`)
  }
}

createStaticProperty('metadata')
createStaticProperty('settingsDefaults')
createStaticProperty('settingDefinitions', [])

export default Feature
