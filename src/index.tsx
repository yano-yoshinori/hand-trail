import React from 'react'
import ReactDOM from 'react-dom'
import firebase from 'firebase/app'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle'
import '@fortawesome/fontawesome-free/css/all.css'

import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { ENV_VARS } from './models/EnvVars'

const firebaseConfig = {
  apiKey: ENV_VARS.firebaseApiKey,
  authDomain: ENV_VARS.firebaseAuthDomain,
  projectId: ENV_VARS.firebaseProjectId,
  storageBucket: ENV_VARS.firebaseStorageBucket,
  messagingSenderId: ENV_VARS.firebaseMessagingSenderId,
  appId: ENV_VARS.firebaseAppId,
}

// 開発時にリロードされてエラーになるのを回避する
try {
  firebase.app()
} catch (error) {
  firebase.initializeApp(firebaseConfig)
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
