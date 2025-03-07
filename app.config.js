const GOOGLE_SERVICES_JSON = process.env.GOOGLE_SERVICES_JSON;

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
    },
  },
};
