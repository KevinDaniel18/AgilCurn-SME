const GOOGLE_SERVICES_JSON = process.env.GOOGLE_SERVICES_JSON;
const API_KEY = process.env.API_KEY;
const AUTH_DOMAIN = process.env.AUTH_DOMAIN;
const PROJECT_ID = process.env.PROJECT_ID;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET;
const MESSAGING_SENDER_ID = process.env.MESSAGING_SENDER_ID;
const APP_ID = process.env.APP_ID;
const MEASUREMENT_ID = process.env.MEASUREMENT_ID;
const EXPO_PRODUCTION_API_URL = process.env.EXPO_PRODUCTION_API_URL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLUSTER = process.env.CLUSTER;
const PUSHER_KEY = process.env.PUSHER_KEY;

export default {
  expo: {
    name: "agilCurn",
    slug: "agilCurn",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.kevsc.agilCurn",
      googleServicesFile: GOOGLE_SERVICES_JSON ?? "./google-services.json",
      permissions: ["READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-secure-store", "expo-asset", "expo-document-picker"],
    extra: {
      eas: {
        projectId: "86c70fe6-a49c-45b9-9b60-4bf313682857",
      },
      googleServicesJson: GOOGLE_SERVICES_JSON,
      apiKey: API_KEY,
      authDomain: AUTH_DOMAIN,
      projectId: PROJECT_ID,
      storageBucket: STORAGE_BUCKET,
      messagingSenderId: MESSAGING_SENDER_ID,
      appId: APP_ID,
      measurementId: MEASUREMENT_ID,
      apiUrl: EXPO_PRODUCTION_API_URL,
      clientId: CLIENT_ID,
      cluster: CLUSTER,
      pusherKey: PUSHER_KEY,
    },
  },
};
