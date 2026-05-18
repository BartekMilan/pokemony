const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const localModuleRoot = path.resolve(projectRoot, 'modules/expo-settings');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [localModuleRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(localModuleRoot, 'node_modules'),
];

module.exports = config;
