import storage from '../lib/storage'

const notImplementedError = new Error('Method not Implemented')

function createStaticProperty (propertyName) {
  const privatePropertyName = `_${propertyName}`

  Object.defineProperty(Feature, propertyName, {
    get: function () {
      return this.hasOwnProperty(privatePropertyName) ? this[privatePropertyName] : void 0 // eslint-disable-line no-prototype-builtins
    },
    set: function (value) { this[privatePropertyName] = value }
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

    settings[property] = value

    return storage.set({
      [this.metadata.id]: settings
    })
  }

  static async getSettings () {
    let settings = await storage.get(this.metadata.id)

    settings = Object.assign({}, this.settingsDefaults, settings)

    return settings
  }
}

createStaticProperty('metadata')
createStaticProperty('settingsDefaults')

export default Feature
