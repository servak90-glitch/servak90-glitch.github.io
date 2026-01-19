
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.voidpiercer.game',
  appName: 'Cosmic Excavator',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      // Полностью скрываем статус-бар для fullscreen игры
      style: 'DARK',
      overlaysWebView: false,
      backgroundColor: '#000000'
    },
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#000000'
    }
  }
};

export default config;
