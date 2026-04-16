import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyDRQs_yMFfb61oago_JsV_wvt9yQxqzY5E",
  authDomain:        "digitallibrary-cdde4.firebaseapp.com",
  projectId:         "digitallibrary-cdde4",
  storageBucket:     "digitallibrary-cdde4.firebasestorage.app",
  messagingSenderId: "584471023343",
  appId:             "1:584471023343:web:1690a97938aa83dd56d51a"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)