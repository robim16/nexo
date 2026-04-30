import admin from 'firebase-admin'
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import { readFileSync } from 'fs'
import { join } from 'path'

dotenv.config({ path: '.env.local' })

const useEmulators = process.env.VITE_USE_FIREBASE_EMULATORS === 'true'

if (useEmulators) {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081'
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
  console.log('🔧 Conectando a emuladores de Firebase...')
  
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'nexo-firebase-2bcd8'
  })
} else {
  console.log('🌐 Conectando a Firebase Cloud...')
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
      clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
  } catch (error) {
    console.error('❌ Error al inicializar Firebase Admin:', error)
    process.exit(1)
  }
}

const db = admin.firestore()
const auth = admin.auth()

const users = [
  {
    uid: 'user_1',
    email: 'elara@nexo.com',
    displayName: 'Elara Vance',
    bio: 'Exploradora del metaverso y entusiasta del diseño minimalista. 🌌',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elara'
  },
  {
    uid: 'user_2',
    email: 'jax@nexo.com',
    displayName: 'Jax Thorne',
    bio: 'Fullstack Developer | Amante del café y de las arquitecturas limpias. ☕💻',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jax'
  },
  {
    uid: 'user_3',
    email: 'nova@nexo.com',
    displayName: 'Nova Sky',
    bio: 'Fotógrafa urbana. Capturando la luz en el caos. 📸✨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nova'
  }
]

const posts = [
  {
    authorId: 'user_1',
    content: 'Acabo de migrar mi espacio de trabajo a un entorno totalmente minimalista. Menos es más. #Minimalism #Design #Focus',
    images: ['https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800'],
    visibility: 'PUBLIC'
  },
  {
    authorId: 'user_2',
    content: 'Probando la nueva arquitectura limpia en el proyecto Nexo. La separación de responsabilidades es clave para la escalabilidad. 🚀',
    images: [],
    visibility: 'PUBLIC'
  },
  {
    authorId: 'user_3',
    content: 'Atardecer en la ciudad. Los colores de hoy fueron irreales. 🌆',
    images: ['https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800'],
    visibility: 'PUBLIC'
  },
  {
    authorId: 'user_1',
    content: '¿Alguien ha probado el nuevo plugin de Pinia para persistencia? Es una maravilla. #Vuejs #Pinia',
    images: [],
    visibility: 'PUBLIC'
  }
]

async function seed() {
  console.log('🌱 Iniciando siembra de datos en la nube...')

  try {
    // 1. Crear Usuarios en Auth y Firestore
    for (const u of users) {
      console.log(`👤 Procesando usuario: ${u.displayName}`)
      
      try {
        await auth.createUser({
          uid: u.uid,
          email: u.email,
          password: 'password123',
          displayName: u.displayName,
          photoURL: u.avatar
        })
        console.log(`   ✅ Usuario ${u.email} creado en Auth.`)
      } catch (e: any) {
        if (e.code === 'auth/uid-already-exists' || e.code === 'auth/email-already-exists') {
          console.log(`   ℹ️ El usuario ${u.email} ya existe. Actualizando datos en Firestore...`)
        } else {
          console.error(`   ❌ Error en Auth para ${u.email}:`, e.message)
        }
      }

      const userDoc = {
        id: u.uid,
        email: u.email,
        displayName: u.displayName,
        bio: u.bio,
        avatar: u.avatar,
        followersCount: 0,
        followingCount: 0,
        postsCount: posts.filter(p => p.authorId === u.uid).length,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        isVerified: u.uid === 'user_1',
        isActive: true
      }

      await db.collection('users').doc(u.uid).set(userDoc)
    }

    // 2. Crear Publicaciones
    console.log('📝 Creando publicaciones...')
    for (const p of posts) {
      const postId = uuidv4()
      const postDoc = {
        id: postId,
        authorId: p.authorId,
        content: p.content,
        images: p.images,
        mentions: [],
        hashtags: p.content.match(/#\w+/g) || [],
        likes: users.filter(() => Math.random() > 0.5).map(u => u.uid),
        likesCount: 0,
        commentsCount: Math.floor(Math.random() * 5),
        sharesCount: Math.floor(Math.random() * 10),
        visibility: p.visibility,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        isEdited: false
      }
      postDoc.likesCount = postDoc.likes.length

      await db.collection('posts').doc(postId).set(postDoc)

      // Crear algunos comentarios para el post
      if (postDoc.commentsCount > 0) {
        for (let i = 0; i < postDoc.commentsCount; i++) {
          const commentId = uuidv4()
          const commenter = users[Math.floor(Math.random() * users.length)]
          await db.collection('posts').doc(postId).collection('comments').doc(commentId).set({
            id: commentId,
            postId: postId,
            authorId: commenter.uid,
            content: '¡Excelente publicación! 👏',
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
          })
        }
      }
    }

    // 3. Crear Seguimientos Reales
    console.log('🤝 Creando relaciones de seguimiento...')
    const follows = [
      { followerId: 'user_1', followingId: 'user_2' },
      { followerId: 'user_1', followingId: 'user_3' },
      { followerId: 'user_2', followingId: 'user_1' },
      { followerId: 'user_3', followingId: 'user_1' }
    ]

    for (const f of follows) {
      const followId = uuidv4()
      await db.collection('follows').doc(followId).set({
        id: followId,
        followerId: f.followerId,
        followingId: f.followingId,
        createdAt: admin.firestore.Timestamp.now()
      })
    }

    // Actualizar contadores de usuarios basados en los follows reales
    // (Aunque los repositorios ahora los cuentan dinámicamente, mantenemos consistencia en los docs)
    for (const u of users) {
      const followersCount = follows.filter(f => f.followingId === u.uid).length
      const followingCount = follows.filter(f => f.followerId === u.uid).length
      await db.collection('users').doc(u.uid).update({
        followersCount,
        followingCount
      })
    }

    console.log('✅ Siembra en la nube completada con éxito.')
  } catch (error) {
    console.error('❌ Error crítico durante la siembra:', error)
    process.exit(1)
  }
}

seed()
