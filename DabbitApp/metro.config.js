// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
    blacklistRE: /__tests__\/.*/,
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
  };

  config.watchFolders = [
    path.resolve(__dirname)
  ];

  // Enable Hermes
  config.transformer.enableBabelRCLookup = false;
  config.transformer.enableBabelRuntime = true;

  return config;
})(); 