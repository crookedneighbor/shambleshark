# Scryfall Extend

An unofficial extension to add additional functionality to the Scryfall website.

As with many extensions, it relies on the DOM structure and JavaScript of Scryfall remaining consistent. So if something changes on Scryfall, it may result in the extension breaking. If that happens, [open an issue](https://github.com/crookedneighbor/scryfall-extend/issues) and we will work to fix it.

## Using the unpacked extension

### In development

1. Install the node dependencies:

    ```sh
    npm install
    ```

1. Start the development server:

    ```sh
    $ npm start
    $ # use `BROWSER=FIREFOX npm start` if you prefer to develop in Firefox
    ```

1. Add the unpacked extension to Chrome. See [steps 1-3 here](https://developer.chrome.com/extensions/getstarted#manifest).

1. You're done! Open up the Scryfall website. Any changes you make in the code will be built automatically, but the unpacked extension will need to be updated to get those changes. Navigate to `chrome://extensions` and select the refresh icon in the unpacked extension.

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
