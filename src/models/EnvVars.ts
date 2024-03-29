const {
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  REACT_APP_FIREBASE_APP_ID,
  REACT_APP_ENV,
  REACT_APP_NEW_CANVAS,
} = process.env

export const ENV_VARS = {
  firebaseApiKey: REACT_APP_FIREBASE_API_KEY,
  firebaseAuthDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
  firebaseProjectId: REACT_APP_FIREBASE_PROJECT_ID,
  firebaseStorageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
  firebaseMessagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  firebaseAppId: REACT_APP_FIREBASE_APP_ID,
  env: REACT_APP_ENV,
  newCanvas: REACT_APP_NEW_CANVAS === 'true',
} as const
