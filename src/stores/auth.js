import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase/config'

const USERS_COLLECTION = 'users'
const DEFAULT_ROLE = 'guest'

function getAuthErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/invalid-credential': 'Incorrect email or password. Please try again.',
    'auth/user-not-found': 'No account was found with this email.',
    'auth/wrong-password': 'Incorrect email or password. Please try again.',
    'auth/weak-password': 'Your password must be at least 6 characters long.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Your browser blocked the Google sign-in popup. Please allow popups and retry.',
    'auth/cancelled-popup-request': 'Google sign-in was cancelled.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Console.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'permission-denied': 'Your user profile could not be saved. Check your Firestore rules.',
  }

  return messages[error?.code] || error?.message || 'Something went wrong. Please try again.'
}

function displayNameFor(firebaseUser, fallbackName) {
  if (fallbackName) return fallbackName
  if (firebaseUser.displayName) return firebaseUser.displayName
  if (firebaseUser.email) return firebaseUser.email.split('@')[0]
  return 'Guest'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => Boolean(user.value))
  const role = computed(() => profile.value?.role || DEFAULT_ROLE)
  const displayName = computed(
    () => profile.value?.name || user.value?.displayName || user.value?.email || 'Guest'
  )
  const email = computed(() => profile.value?.email || user.value?.email || '')
  const photoURL = computed(() => profile.value?.photoURL || user.value?.photoURL || '')
  const initials = computed(() => {
    return (
      displayName.value
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'G'
    )
  })

  let initPromise = null

  async function saveUserDocument(firebaseUser, extra = {}) {
    const userRef = doc(db, USERS_COLLECTION, firebaseUser.uid)
    const snapshot = await getDoc(userRef)
    const provider = firebaseUser.providerData[0]?.providerId || 'password'

    if (!snapshot.exists()) {
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        name: displayNameFor(firebaseUser, extra.name),
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        provider,
        role: DEFAULT_ROLE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } else {
      const existing = snapshot.data()
      await setDoc(
        userRef,
        {
          uid: firebaseUser.uid,
          name: existing.name || displayNameFor(firebaseUser, extra.name),
          email: firebaseUser.email || existing.email || '',
          photoURL: firebaseUser.photoURL || existing.photoURL || '',
          provider,
          role: existing.role || DEFAULT_ROLE,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    const saved = await getDoc(userRef)
    profile.value = { id: saved.id, ...saved.data() }
    return profile.value
  }

  function init() {
    if (initialized.value) return Promise.resolve()
    if (initPromise) return initPromise

    initPromise = new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        user.value = firebaseUser

        if (firebaseUser) {
          try {
            await saveUserDocument(firebaseUser)
          } catch (err) {
            error.value = getAuthErrorMessage(err)
          }
        } else {
          profile.value = null
        }

        if (!initialized.value) {
          initialized.value = true
          resolve()
        }
      })
    })

    return initPromise
  }

  async function login({ email: userEmail, password }) {
    loading.value = true
    error.value = ''

    try {
      const credential = await signInWithEmailAndPassword(auth, userEmail, password)
      user.value = credential.user

      try {
        await saveUserDocument(credential.user)
      } catch (err) {
        error.value = getAuthErrorMessage(err)
      }

      return credential.user
    } catch (err) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    loading.value = true
    error.value = ''

    try {
      const credential = await signInWithPopup(auth, googleProvider)
      user.value = credential.user

      try {
        await saveUserDocument(credential.user)
      } catch (err) {
        error.value = getAuthErrorMessage(err)
      }

      return credential.user
    } catch (err) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register({ name, email: userEmail, password }) {
    loading.value = true
    error.value = ''

    try {
      const credential = await createUserWithEmailAndPassword(auth, userEmail, password)
      await updateProfile(credential.user, { displayName: name })
      user.value = credential.user

      try {
        await saveUserDocument(credential.user, { name })
      } catch (err) {
        error.value = getAuthErrorMessage(err)
      }

      return credential.user
    } catch (err) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUserProfile(data) {
    if (!user.value) return

    loading.value = true
    error.value = ''

    try {
      if (data.name && data.name !== user.value.displayName) {
        await updateProfile(user.value, { displayName: data.name })
      }

      await setDoc(
        doc(db, USERS_COLLECTION, user.value.uid),
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      )

      profile.value = { ...profile.value, ...data }
    } catch (err) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = ''

    try {
      await signOut(auth)
      user.value = null
      profile.value = null
    } catch (err) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    profile,
    initialized,
    loading,
    error,
    isAuthenticated,
    role,
    displayName,
    email,
    photoURL,
    initials,
    init,
    login,
    loginWithGoogle,
    register,
    updateUserProfile,
    logout,
  }
})
