'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    hinting: false,

    'ember-cli-babel': {
      enableTypeScriptTransform: true,
    },
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  const { maybeEmbroider } = require('@embroider/test-setup');

  return maybeEmbroider(app, {
    packageRules: [
      {
        // Components used during testing,
        // these are dynamically registered during the tests
        package: 'dummy',
        components: {
          '{{foo}}': {
            safeToIgnore: true,
          },
        },
      },
    ],
  });
};
