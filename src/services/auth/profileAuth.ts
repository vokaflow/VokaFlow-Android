import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth"
import { profileService } from "../profile"
import { database } from "../database"
import type User from "../database/models/User"
import { mmkvStorage } from "../storage/mmkv"
import { googleAuthService } from "./googleAuth"
import { appleAuthService } from "./appleAuth"

class ProfileAuthService {
  async signInWithEmailAndPassword(
    email: string,
    password: string,
    profileType: "personal" | "professional",
  ): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      // Autenticar con Firebase
      const userCredential = await auth().signInWithEmailAndPassword(email, password)

      // Verificar si ya existe un perfil para este usuario de Firebase
      const profiles = await profileService.getProfilesByFirebaseUid(userCredential.user.uid, profileType)

      if (profiles.length === 0) {
        // Crear un nuevo perfil si no existe
        await profileService.createProfile({
          name: userCredential.user.displayName || email.split("@")[0],
          type: profileType,
          theme: "default",
          firebaseUid: userCredential.user.uid,
        })
      } else {
        // Activar el perfil existente
        await profileService.switchProfile(profiles[0].id)
      }

      // Guardar token de autenticación en MMKV con prefijo de perfil
      const token = await userCredential.user.getIdToken()
      const prefix = profileService.getStoragePrefix()
      mmkvStorage.set(`${prefix}auth_token`, token)

      return userCredential
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  async signInWithGoogle(profileType: "personal" | "professional"): Promise<boolean> {
    return googleAuthService.signIn(profileType)
  }

  async signInWithApple(profileType: "personal" | "professional"): Promise<boolean> {
    return appleAuthService.signIn(profileType)
  }

  async signOut(): Promise<void> {
    try {
      // Obtener el prefijo del perfil actual
      const prefix = profileService.getStoragePrefix()

      // Eliminar token de autenticación
      mmkvStorage.delete(`${prefix}auth_token`)

      // Cerrar sesión en Google si es necesario
      if (await googleAuthService.isSignedIn()) {
        await googleAuthService.signOut()
      }

      // Cerrar sesión en Firebase
      await auth().signOut()
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const activeProfile = await profileService.getActiveProfile()
      if (!activeProfile || !activeProfile.firebaseUid) return null

      const users = await database.get<User>("users").query().where("firebase_uid", activeProfile.firebaseUid).fetch()

      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  // Verificar si hay un usuario autenticado para el perfil actual
  async isAuthenticated(): Promise<boolean> {
    const prefix = profileService.getStoragePrefix()
    const token = mmkvStorage.getString(`${prefix}auth_token`)
    return !!token
  }

  // Verificar si Apple Sign In está disponible
  async isAppleSignInAvailable(): Promise<boolean> {
    return appleAuthService.isSupported()
  }
}

export const profileAuthService = new ProfileAuthService()
