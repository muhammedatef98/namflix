module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated resolved to v4 under SDK 54, so the worklets plugin is the
    // correct one (v3 used 'react-native-reanimated/plugin'). Must be last.
    plugins: ['react-native-worklets/plugin'],
  };
};
