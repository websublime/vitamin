
/** @type {import('vls').VeturConfig} */
module.exports = {
  // **optional** default: `[{ root: './' }]`
  // support monorepos
  projects: [
    './packages/playground', // shorthand for only root.
    './packages/vitamin' // shorthand for only root.
  ],
  // **optional** default: `{}`
  // override vscode settings
  // Notice: It only affects the settings used by Vetur.
  settings: {
    'vetur.experimental.templateInterpolationService': true,
    'vetur.useWorkspaceDependencies': true
  }
};
