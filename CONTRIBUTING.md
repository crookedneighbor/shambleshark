# Contributing to Shambleshark

Contributions are very welcome!

## Development

The project is built using webpack to build a Chrome and Firefox extension. You will need [Node](https://nodejs.org/) and npm to run the project locally.

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

## Project Structure

The bulk of the project is in the src/js directory. It's split up into a few various parts.

### Scryfall Page

This is the main entry point for the extension. It detects what page the user is on and loads the correct page modifying script for that page as well as embeds a script onto the Scryfall page for communicating with the Scryfall API objects (see next section).

### Embedded Scryfall Page

The embedded script. It mainly adds hooks for communicating with various deckbuilder events.

### Features

The extension is largely built around the idea of features. Each feature is grouped together with features that exist in the same section of the Scryfall website. The sections include:

- Deck Editing Features
- Deck Display Features
- Search Result Features
- Global Features

Each feature script inherits from a base Feature class. This class is responsible for managing the user's settings in localStorage.

Each child class has it's own folder with an entry script. If it requires any styling changes, the css file is included in the same directory and imported by the entry script.

Each child class has a static `metadata` object compromised of:

- id: A unique id for the feature
- section: The id of the section where it belongs. Corresponds to the page where it runs.
- title: A human readable title to display for the feature in the options page
- description: A human readable description to display for the feature in the options page

Each child class may have a static `settingDefinitions` array compromised of objects that determine the sub-settings that the feature has. The feature will only include this array if it has sub-features that can be adjusted by the user. Each object has the shape:

- id: A unique id for the sub-feature
- label: A human readable label for the options page to display
- input: The kind of input to display for setting the sub-feature.

Each child class has a static `settingsDefaults` object to indicate what the default values for configurable sub-features are. Each one has at least an `enabled` key to indicate whether this feature should be turned on by default or not. If the child class has any settingDefinitions, then it should also have a property for each of the ids in those setting definitions.

Each child class implements a `run` method to activate the feature. On each page, the feature is checked if it is enabled and then `run` is called if it is.

If your feature requires a style change

### Options page

A page where each of the features is displayed with ways to configure them.

### Background script

This script is responsible for a few things:

- Opening the options page on initial install so the user can choose what features they want and opt out of automatically getting new features
- Rewriting the web request headers for tagger.scryfall.com so that it can be embedded within the main Scryfall site in an iframe

### Other Embedded Scripts

In addition, a script gets injected into tagger.scryfall.com and edhrec.com to assist with gathering data for various features.

## Expectations

### Automated Testing

When you add or change a feature, it's expected that a test will go along with it. If you've never written an automated test before, don't worry! Open a PR anyway and I'll be happy to help you along.

## Gotchas

### Creating HTML Elements

Firefox doesn't like the `innerHTML =` method of setting the value of an HTMLElement. Because of this, use the `Lib/create-element` helper instead. This will return a document fragment, so you may need to use `.firstChild` if you've created a single HTML container.

### Styling

Always use a `css` file for setting styles. Again, Firefox has issues when using inline styles.
