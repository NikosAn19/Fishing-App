import "dotenv/config";

console.log(
  "🔧 App Config - EXPO_PUBLIC_CDN_BASE:",
  process.env.EXPO_PUBLIC_CDN_BASE
);
console.log(
  "🔧 App Config - EXPO_PUBLIC_API_BASE:",
  process.env.EXPO_PUBLIC_API_BASE
);

export default {
  expo: {
    name: "FishingApp",
    slug: "FishingApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    extra: {
      EXPO_PUBLIC_API_BASE:
        process.env.EXPO_PUBLIC_API_BASE || "http://localhost:3000",
      EXPO_PUBLIC_CDN_BASE:
        process.env.EXPO_PUBLIC_CDN_BASE ||
        "https://pub-6152823702fd4064a507eac85c165f45.r2.dev",
    },
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: "AIzaSyClf7gIKtjMPDzqU951NDCvoFlSlia3iYY",
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-router"],
  },
};
