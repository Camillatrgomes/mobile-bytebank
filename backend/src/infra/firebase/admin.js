const { initializeApp, getApps, getApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'bytebank-48663'

// Credencial: emulador (FIRESTORE_EMULATOR_HOST), chave (GOOGLE_APPLICATION_CREDENTIALS) ou gcloud.
const app = getApps().length ? getApp() : initializeApp({ projectId: PROJECT_ID })

const db = getFirestore(app)
const auth = getAuth(app)

module.exports = { app, db, auth }
