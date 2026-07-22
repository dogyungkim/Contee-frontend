import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'Contee Mobile',
  slug: 'contee-mobile',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'contee-mobile-dev',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    icon: './assets/expo.icon',
    bundleIdentifier: 'ai.kr.contee.app',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#f8fafc',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    package: 'ai.kr.contee.app',
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#f8fafc',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
}

export default config
