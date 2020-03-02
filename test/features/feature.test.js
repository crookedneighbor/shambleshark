import Feature from 'Features/feature'
import storage from 'Lib/storage'
import deckParser from 'Lib/deck-parser'

describe('Base Feature', function () {
  beforeEach(function () {
    jest.spyOn(storage, 'get').mockResolvedValue()
    jest.spyOn(storage, 'set').mockResolvedValue()
  })

  it('requires a run method', async function () {
    const spy = jest.fn()

    class FeatureWithoutRun extends Feature {
    }
    class FeatureWithRun extends Feature {
      async run () {
        spy()

        return 'foo'
      }
    }
    const featureWithoutRun = new FeatureWithoutRun()
    const featureWithRun = new FeatureWithRun()

    await expect(featureWithoutRun.run()).rejects.toThrow('Method not Implemented')

    await expect(featureWithRun.run()).resolves.toBe('foo')
    expect(spy).toBeCalledTimes(1)
  })

  describe('enable', function () {
    class FeatureThatEnables extends Feature {
    }
    FeatureThatEnables.metadata = {
      id: 'feature-that-enables'
    }

    it('sets enabled property for feature on storage', async function () {
      jest.spyOn(FeatureThatEnables, 'saveSetting').mockResolvedValue()
      await FeatureThatEnables.enable()

      expect(FeatureThatEnables.saveSetting).toBeCalledTimes(1)
      expect(FeatureThatEnables.saveSetting).toBeCalledWith('enabled', true)
    })
  })

  describe('disable', function () {
    class FeatureThatDisables extends Feature {
    }
    FeatureThatDisables.metadata = {
      id: 'feature-that-disables'
    }

    it('saves feature on storage', async function () {
      jest.spyOn(FeatureThatDisables, 'saveSetting').mockResolvedValue()
      await FeatureThatDisables.disable()

      expect(FeatureThatDisables.saveSetting).toBeCalledTimes(1)
      expect(FeatureThatDisables.saveSetting).toBeCalledWith('enabled', false)
    })
  })

  describe('isEnabled', function () {
    class FeatureThatReportsIfItsEnabled extends Feature {
    }
    FeatureThatReportsIfItsEnabled.metadata = {
      id: 'feature-that-reports'
    }

    it('resolves to true if feature is enabled', async function () {
      const feature = new FeatureThatReportsIfItsEnabled()

      jest.spyOn(FeatureThatReportsIfItsEnabled, 'getSettings').mockResolvedValue({
        enabled: true
      })

      await expect(feature.isEnabled()).resolves.toBe(true)

      expect(FeatureThatReportsIfItsEnabled.getSettings).toBeCalledTimes(1)
    })

    it('resolves to false if feature is disabled', async function () {
      const feature = new FeatureThatReportsIfItsEnabled()

      jest.spyOn(FeatureThatReportsIfItsEnabled, 'getSettings').mockResolvedValue({
        enabled: false
      })

      await expect(feature.isEnabled()).resolves.toBe(false)

      expect(FeatureThatReportsIfItsEnabled.getSettings).toBeCalledTimes(1)
    })
  })

  describe('getSettings', function () {
    class FeatureWithSavedSettings extends Feature {
    }
    FeatureWithSavedSettings.metadata = {
      id: 'feature-with-saved'
    }
    FeatureWithSavedSettings.settingsDefaults = {
      enabled: true,
      foo: 'bar',
      baz: 'buz'
    }
    class FutureFeatureWithSavedSettings extends Feature {
    }
    FutureFeatureWithSavedSettings.metadata = {
      id: 'future-feature',
      futureFeature: true
    }

    it('calls out to storage for settings', async function () {
      storage.get.mockResolvedValue({
        foo: 'value1',
        baz: 'value2'
      })
      const settings = await FeatureWithSavedSettings.getSettings()

      expect(storage.get).toBeCalledTimes(1)
      expect(storage.get).toBeCalledWith('feature-with-saved')
      expect(settings.enabled).toBe(true)
      expect(settings.foo).toBe('value1')
      expect(settings.baz).toBe('value2')
    })

    it('applies defaults when param is not available', async function () {
      storage.get.mockResolvedValue({
        foo: 'value1'
      })
      const settings = await FeatureWithSavedSettings.getSettings()

      expect(storage.get).toBeCalledTimes(1)
      expect(storage.get).toBeCalledWith('feature-with-saved')
      expect(settings.enabled).toBe(true)
      expect(settings.foo).toBe('value1')
      expect(settings.baz).toBe('buz')
    })

    it('applies defaults when existing settingsa re not available and future opt in setting is not available', async function () {
      storage.get.mockResolvedValueOnce()
      storage.get.mockResolvedValueOnce()

      const settings = await FeatureWithSavedSettings.getSettings()

      expect(storage.get).toBeCalledTimes(2)
      expect(storage.get).toBeCalledWith('feature-with-saved')
      expect(storage.get).toBeCalledWith('future-opt-in')
      expect(settings.enabled).toBe(true)
      expect(settings.foo).toBe('bar')
      expect(settings.baz).toBe('buz')
    })

    it('applies defaults when existing settings are not available and future opt in setting is enabled', async function () {
      storage.get.mockResolvedValueOnce()
      storage.get.mockResolvedValueOnce({
        enabled: true
      })

      const settings = await FeatureWithSavedSettings.getSettings()

      expect(storage.get).toBeCalledTimes(2)
      expect(storage.get).toBeCalledWith('feature-with-saved')
      expect(storage.get).toBeCalledWith('future-opt-in')
      expect(settings.enabled).toBe(true)
      expect(settings.foo).toBe('bar')
      expect(settings.baz).toBe('buz')
    })

    it('saves it as enabled "false" when no previous settings are present and future opt in is disabled', async function () {
      storage.get.mockResolvedValueOnce()
      storage.get.mockResolvedValueOnce({
        enabled: false
      })
      const settings = await FeatureWithSavedSettings.getSettings()

      expect(storage.get).toBeCalledTimes(2)
      expect(storage.get).toBeCalledWith('feature-with-saved')
      expect(storage.get).toBeCalledWith('future-opt-in')
      expect(storage.set).toBeCalledTimes(1)
      expect(storage.set).toBeCalledWith('feature-with-saved', {
        enabled: false
      })

      expect(settings.enabled).toBe(false)
    })

    it('saves it as enabled "true" when no previous settings are present and future opt in is enabled', async function () {
      storage.get.mockResolvedValueOnce()
      storage.get.mockResolvedValueOnce({
        enabled: true
      })
      const settings = await FeatureWithSavedSettings.getSettings()

      expect(storage.get).toBeCalledTimes(2)
      expect(storage.get).toBeCalledWith('feature-with-saved')
      expect(storage.get).toBeCalledWith('future-opt-in')
      expect(storage.set).toBeCalledTimes(1)
      expect(storage.set).toBeCalledWith('feature-with-saved', {
        enabled: true
      })

      expect(settings.enabled).toBe(true)
    })

    it('does not save it as enabled "false" if feature is a future feature', async function () {
      storage.get.mockResolvedValueOnce()
      storage.get.mockResolvedValueOnce({
        enabled: false
      })
      const settings = await FutureFeatureWithSavedSettings.getSettings()

      expect(storage.get).toBeCalledTimes(2)
      expect(storage.get).toBeCalledWith('future-feature')
      expect(storage.get).toBeCalledWith('future-opt-in')
      expect(storage.set).toBeCalledTimes(0)

      expect(settings.enabled).toBe(false)
    })

    it('resolves with enabled false if feature is a future feature', async function () {
      storage.get.mockResolvedValueOnce()
      storage.get.mockResolvedValueOnce({
        enabled: true
      })
      const settings = await FutureFeatureWithSavedSettings.getSettings()

      expect(storage.get).toBeCalledTimes(2)
      expect(storage.get).toBeCalledWith('future-feature')
      expect(storage.get).toBeCalledWith('future-opt-in')
      expect(storage.set).toBeCalledTimes(0)

      expect(settings.enabled).toBe(false)
    })
  })

  describe('saveSetting', function () {
    class FeatureThatSavesSettings extends Feature {
    }
    FeatureThatSavesSettings.metadata = {
      id: 'feature-that-saves'
    }
    FeatureThatSavesSettings.settingsDefaults = {
      enabled: true,
      foo: 'bar'
    }

    it('grabs previously saved settings and overwrites the single property', async function () {
      jest.spyOn(FeatureThatSavesSettings, 'getSettings').mockResolvedValue({
        foo: 'bar',
        baz: 'buz'
      })
      await FeatureThatSavesSettings.saveSetting('foo', 'value')

      expect(FeatureThatSavesSettings.getSettings).toBeCalledTimes(1)
      expect(storage.set).toBeCalledTimes(1)
      expect(storage.set).toBeCalledWith('feature-that-saves', {
        baz: 'buz',
        foo: 'value'
      })
    })

    it('rejects if attempting to set a property that does not exist in defaults', async function () {
      let error

      jest.spyOn(FeatureThatSavesSettings, 'getSettings').mockResolvedValue({
        foo: 'bar',
        baz: 'buz'
      })

      try {
        await FeatureThatSavesSettings.saveSetting('does-not-exist', 'value')
      } catch (e) {
        error = e
      }

      expect(error).toBeTruthy()
      expect(error.message).toBe('Internal Error: Could not find property "does-not-exist" on feature')

      expect(storage.set).toBeCalledTimes(0)
    })
  })

  describe('getDeckMetadata', function () {
    let feature, fakeDeck, entries

    class SubFeature extends Feature {
    }
    SubFeature.metadata = {
      id: 'feature-that-enables'
    }

    beforeEach(function () {
      feature = new SubFeature()
      fakeDeck = { id: 'deck-id' }
      entries = []
      jest.spyOn(deckParser, 'flattenEntries').mockReturnValue(entries)
    })

    it('fetches stored data for deck id', async function () {
      const fakeData = {
        foo: 'bar',
        entries: {}
      }

      storage.get.mockResolvedValue(fakeData)

      const data = await feature.getDeckMetadata(fakeDeck)

      expect(storage.get).toBeCalledTimes(1)
      expect(storage.get).toBeCalledWith('deck-id')
      expect(data).toBe(fakeData)
    })

    it('saves an empty shell if stored data does not exist', async function () {
      storage.get.mockResolvedValue()
      const data = await feature.getDeckMetadata(fakeDeck)

      expect(storage.get).toBeCalledTimes(1)
      expect(storage.get).toBeCalledWith('deck-id')
      expect(storage.set).toBeCalledTimes(1)
      expect(storage.set).toBeCalledWith('deck-id', {
        entries: {}
      })

      expect(data).toEqual({
        entries: {}
      })
    })

    it('saves an empty entries object if stored data does not incude it', async function () {
      const fakeData = { foo: 'bar' }

      storage.get.mockResolvedValue(fakeData)

      const data = await feature.getDeckMetadata(fakeDeck)

      expect(storage.get).toBeCalledTimes(1)
      expect(storage.get).toBeCalledWith('deck-id')
      expect(storage.set).toBeCalledTimes(1)
      expect(storage.set).toBeCalledWith('deck-id', {
        foo: 'bar',
        entries: {}
      })

      expect(data).toEqual({
        foo: 'bar',
        entries: {}
      })
    })

    it('saves any entries that don\'t exist in stored data but do exist in deck', async function () {
      const fakeData = {
        foo: 'bar',
        entries: {
          'a-1': {
            foo: 'bar'
          }
        }
      }
      entries.push({
        id: 'a-1'
      })
      entries.push({
        id: 'b-2'
      })

      storage.get.mockResolvedValue(fakeData)

      const data = await feature.getDeckMetadata(fakeDeck)

      expect(storage.get).toBeCalledTimes(1)
      expect(storage.get).toBeCalledWith('deck-id')
      expect(storage.set).toBeCalledTimes(1)
      expect(storage.set).toBeCalledWith('deck-id', {
        foo: 'bar',
        entries: {
          'a-1': {
            foo: 'bar'
          },
          'b-2': {}
        }
      })

      expect(data).toEqual({
        foo: 'bar',
        entries: {
          'a-1': {
            foo: 'bar'
          },
          'b-2': {}
        }
      })
    })

    it('does not save if no default data is added', async function () {
      const fakeData = {
        foo: 'bar',
        entries: {
          'a-1': {
            foo: 'bar'
          },
          'b-2': {
            foo: 'baz'
          }
        }
      }
      entries.push({
        id: 'a-1'
      })
      entries.push({
        id: 'b-2'
      })

      storage.get.mockResolvedValue(fakeData)

      const data = await feature.getDeckMetadata(fakeDeck)

      expect(storage.get).toBeCalledTimes(1)
      expect(storage.get).toBeCalledWith('deck-id')
      expect(storage.set).not.toBeCalled()

      expect(data).toEqual({
        foo: 'bar',
        entries: {
          'a-1': {
            foo: 'bar'
          },
          'b-2': {
            foo: 'baz'
          }
        }
      })
    })
  })

  describe('setDeckMetadata', function () {
    let feature, fakeDeck

    class SubFeature extends Feature {
    }
    SubFeature.metadata = {
      id: 'feature-that-enables'
    }

    beforeEach(function () {
      feature = new SubFeature()
      jest.spyOn(feature, 'getDeckMetadata').mockResolvedValue({
        oldData: 'old'
      })
      fakeDeck = {
        id: 'deck-id'
      }
    })

    it('gets deck metadata', async function () {
      await feature.setDeckMetadata(fakeDeck, 'foo', 'bar')

      expect(feature.getDeckMetadata).toBeCalledTimes(1)
      expect(feature.getDeckMetadata).toBeCalledWith(fakeDeck)
    })

    it('saves value to deck metadata', async function () {
      await feature.setDeckMetadata(fakeDeck, 'newData', 'new')

      expect(storage.set).toBeCalledTimes(1)
      expect(storage.set).toBeCalledWith('deck-id', {
        oldData: 'old',
        newData: 'new'
      })
    })
  })
})
