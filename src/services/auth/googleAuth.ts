import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin"
import auth from "@react-native-firebase/auth"
import { profileService } from "../profile"
import { mmkvStorage } from "../storage/mmkv"
import { errorService, ErrorType } from "../error"
import { sessionService } from "../session"

// Configuración de Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: "991486137413-d8jgs4sdctgkb9gq404pu3n23n7n44j7.apps.googleusercontent.com",
    offlineAccess: true,
    forceCodeForRefreshToken: true, // Forzar la obtención de un token de actualización
  })
}

class GoogleAuthService {
  private readonly tokenKey = "google_auth_token"
  private readonly userKey = "google_user"
  private readonly lastSignInKey = "google_last_signin"

  /**
   * Inicia sesión con Google
   */
  async signIn(profileType: "personal" | "professional"): Promise<boolean> {
    try {
      console.log("Iniciando autenticación con Google...")

      // Comprobar si el usuario ya está autenticado con Google
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      console.log("Play Services disponibles")

      // Iniciar el flujo de autenticación con Google
      const { idToken, user } = await GoogleSignin.signIn()
      console.log("Token de Google obtenido")

      // Guardar información del usuario de Google
      this.saveGoogleUser(user)

      // Registrar fecha de último inicio de sesión
      mmkvStorage.set(this.lastSignInKey, Date.now().toString())

      // Crear credencial para Firebase
      const googleCredential = auth.GoogleAuthProvider.credential(idToken)

      // Autenticar con Firebase usando la credencial de Google
      const userCredential = await auth().signInWithCredential(googleCredential)
      console.log("Autenticación con Firebase exitosa")

      // Verificar si ya existe un perfil para este usuario de Firebase
      const profiles = await profileService.getProfilesByFirebaseUid(userCredential.user.uid, profileType)

      if (profiles.length === 0) {
        // Crear un nuevo perfil si no existe
        await profileService.createProfile({
          name: userCredential.user.displayName || userCredential.user.email?.split("@")[0] || "Usuario",
          type: profileType,
          theme: "default",
          firebaseUid: userCredential.user.uid,
          avatar: userCredential.user.photoURL || undefined,
        })
      } else {
        // Activar el perfil existente
        await profileService.switchProfile(profiles[0].id)
      }

      // Obtener token de Firebase
      const token = await userCredential.user.getIdToken()

      // Guardar token en almacenamiento seguro
      const prefix = profileService.getStoragePrefix()
      mmkvStorage.set(`${prefix}${this.tokenKey}`, token)

      // Iniciar sesión en el servicio de sesión
      await sessionService.startSession(
        userCredential.user.uid,
        token,
        userCredential.user.refreshToken,
        3600, // 1 hora
      )

      return true
    } catch (error: any) {
      // Registrar error con el servicio de errores
      errorService.captureError(error, ErrorType.AUTHENTICATION, {
        method: "google_signin",
        profileType,
      })

      console.error("Error detallado en autenticación con Google:", JSON.stringify(error))

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow")
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress")
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available")
      }

      return false
    }
  }

  /**
   * Cierra sesión en Google
   */
  async signOut(): Promise<void> {
    try {
      // Cerrar sesión en Google
      await GoogleSignin.signOut()

      // Eliminar información guardada
      const prefix = profileService.getStoragePrefix()
      mmkvStorage.delete(`${prefix}${this.tokenKey}`)
      mmkvStorage.delete(this.userKey)

      // La sesión de Firebase se cerrará en el método signOut de profileAuthService
    } catch (error) {
      errorService.captureError(error, ErrorType.AUTHENTICATION, {
        method: "google_signout",
      })
    }
  }

  /**
   * Verifica si el usuario está autenticado con Google
   */
  async isSignedIn(): Promise<boolean> {
    try {
      return await GoogleSignin.isSignedIn()
    } catch (error) {
      errorService.captureError(error, ErrorType.AUTHENTICATION, {
        method: "google_check_signin",
      })
      return false
    }
  }

  /**
   * Obtiene el usuario actual de Google
   */
  getGoogleUser(): any {
    const userData = mmkvStorage.getString(this.userKey)
    return userData ? JSON.parse(userData) : null
  }

  /**
   * Guarda la información del usuario de Google
   */
  private saveGoogleUser(user: any): void {
    mmkvStorage.set(this.userKey, JSON.stringify(user))
  }

  /**
   * Obtiene la fecha del último inicio de sesión con Google
   */
  getLastSignInDate(): Date | null {
    const timestamp = mmkvStorage.getString(this.lastSignInKey)
    return timestamp ? new Date(Number.parseInt(timestamp)) : null
  }

  /**
   * Renueva el token de autenticación de Google
   */
  async refreshToken(): Promise<string | null> {
    try {
      const { idToken } = await GoogleSignin.getTokens()
      return idToken
    } catch (error) {
      errorService.captureError(error, ErrorType.AUTHENTICATION, {
        method: "google_refresh_token",
      })
      return null
    }
  }
}

export const googleAuthService = new GoogleAuthService()
