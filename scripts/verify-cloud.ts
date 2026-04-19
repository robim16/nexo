import admin from 'firebase-admin'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const serviceAccount = {
  projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
  clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function verify() {
  const usersSnap = await db.collection('users').get()
  const postsSnap = await db.collection('posts').get()
  
  console.log(`📊 Reporte de la Nube:`)
  console.log(`👥 Usuarios: ${usersSnap.size}`)
  console.log(`📝 Publicaciones: ${postsSnap.size}`)
  
  if (usersSnap.size > 0) {
    console.log('Primer usuario encontrado:', usersSnap.docs[0].data().displayName)
  }
}

verify()
