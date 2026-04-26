const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json', 'cjs'];
config.resolver.assetExts = [...config.resolver.assetExts, 'png', 'jpg', 'jpeg'];
config.watchFolders = [__dirname];

module.exports = config;
