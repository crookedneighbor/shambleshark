# Shambleshark (Unofficial Scryfall Browser Extension)

An unofficial browser extension to add additional functionality to the Scryfall website. This extension is not developed by the Scryfall team. For support, please [open an issue](https://github.com/crookedneighbor/shambleshark/issues).

As with many extensions, it relies on the DOM structure and JavaScript of Scryfall remaining consistent. So if something changes on Scryfall, it may result in the extension breaking. If that happens, [open an issue](https://github.com/crookedneighbor/shambleshark/issues) and we will work to fix it.

## Contributing

Checkout the [contributing guide](./CONTRIBUTING.md) for info about how to contribute.

## Packing for Production

When a version is ready for release run:

```sh
$ NODE_ENV=production npm run build
```

Now, the content of `build/google_chrome` and `build/firefox` folders will be the extension in a state ready to be submitted to the Chrome Web Store and Mozilla Add-ons.

Just take a look at the [official guide](https://developer.chrome.com/webstore/publish) to more infos about publishing in the Chrome Web Store.

## Tests

Unit tests are run via jest.

```
npm test
```
