module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@': './',
            '@components': './components',
            '@utils': './utils',
            '@constants': './constants',
            '@hooks': './hooks',
            '@context': './context',
            '@types': './types',
            '@assets': './assets',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
    ],
  };
}; 