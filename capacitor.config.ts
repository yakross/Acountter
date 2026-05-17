import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.financeai.app',
  appName: 'FinanceAI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
