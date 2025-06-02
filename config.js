import Constants from "expo-constants";

const {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
  apiUrl,
  clientId,
  cluster,
  pusherKey,
} = Constants.expoConfig.extra;

export default {
  firebase: {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  },
  api: {
    baseUrl: apiUrl,
  },
  pusher: {
    key: pusherKey,
    cluster,
  },
  google: {
    clientId,
  },
};
