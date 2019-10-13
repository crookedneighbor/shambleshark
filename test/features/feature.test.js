import Feature from '../../src/js/features/feature'
import storage from '../../src/js/lib/storage'

describe('Base Feature', function () {
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
      foo: 'bar',
      baz: 'buz'
    }

    beforeEach(function () {
      jest.spyOn(storage, 'get').mockResolvedValue({})
    })

    it('calls out to storage for settings', async function () {
      storage.get.mockResolvedValue({
        foo: 'value1',
        baz: 'value2'
      })
      const settings = await FeatureWithSavedSettings.getSettings()

      expect(storage.get).toBeCalledTimes(1)
      expect(storage.get).toBeCalledWith('feature-with-saved')
      expect(settings.foo).toBe('value1')
      expect(settings.baz).toBe('value2')
    })

    it('applies defaults when not saved', async function () {
      storage.get.mockResolvedValue({
        foo: 'value1'
      })
      const settings = await FeatureWithSavedSettings.getSettings()

      expect(storage.get).toBeCalledTimes(1)
      expect(storage.get).toBeCalledWith('feature-with-saved')
      expect(settings.foo).toBe('value1')
      expect(settings.baz).toBe('buz')
    })
  })

  describe('saveSetting', function () {
    class FeatureThatSavesSettings extends Feature {
    }
    FeatureThatSavesSettings.metadata = {
      id: 'feature-that-saves'
    }

    beforeEach(function () {
      jest.spyOn(storage, 'set').mockResolvedValue()
    })

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
  })
})
