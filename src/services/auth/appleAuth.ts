import { Platform } from "react-native"
import auth from "@react-native-firebase/auth"
import { appleAuth } from "@invertase/react-native-apple-authentication"
import { profileService } from "../profile"
import { mmkvStorage } from "../storage/mmkv"
import { errorService, ErrorType } from "../error"
import { sessionService } from "../session"

class AppleAuthService {
  private readonly tokenKey = "apple_auth_token"
  private readonly userKey = "apple_user"
  private readonly lastSignInKey = "apple_last_signin"

  /**
   * Inicia sesión con Apple
   */
  async signIn(profileType: "personal" | "professional"): Promise<boolean> {
    // Solo disponible en iOS
    if (Platform.OS !== "ios") {
      console.log("Apple Sign In solo está disponible en iOS")
      return false
    }

    try {
      console.log("Iniciando autenticación con Apple...")

      // Realizar solicitud de inicio de sesión
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      })

      // Asegurarse de que se obtuvo un identityToken
      if (!appleAuthRequestResponse.identityToken) {
        console.log("Apple Sign In falló - no se recibió identity token")
        return false
      }

      console.log("Token de Apple obtenido")

      // Guardar información del usuario de Apple (si está disponible)
      if (appleAuthRequestResponse.fullName) {
        this.saveAppleUser({
          email: appleAuthRequestResponse.email,
          fullName: appleAuthRequestResponse.fullName,
        })
      }

      // Registrar fecha de último inicio de sesión
      mmkvStorage.set(this.lastSignInKey, Date.now().toString())

      // Crear credencial para Firebase
      const appleCredential = auth.AppleAuthProvider.credential(
        appleAuthRequestResponse.identityToken,
        appleAuthRequestResponse.nonce,
      )

      // Autenticar con Firebase usando la credencial de Apple
      const userCredential = await auth().signInWithCredential(appleCredential)
      console.log("Autenticación con Firebase exitosa")

      // Obtener información del usuario
      const { user } = userCredential
      const displayName =
        user.displayName ||
        (appleAuthRequestResponse.fullName
          ? `${appleAuthRequestResponse.fullName.givenName || ""} ${appleAuthRequestResponse.fullName.familyName || ""}`.trim()
          : user.email?.split("@")[0] || "Usuario")

      // Verificar si ya existe un perfil para este usuario de Firebase
      const profiles = await profileService.getProfilesByFirebaseUid(user.uid, profileType)

      if (profiles.length === 0) {
        // Crear un nuevo perfil si no existe
        await profileService.createProfile({
          name: displayName,
          type: profileType,
          theme: "default",
          firebaseUid: user.uid,
          avatar: user.photoURL || undefined,
        })
      } else {
        // Activar el perfil existente
        await profileService.switchProfile(profiles[0].id)
      }

      // Obtener token de Firebase
      const token = await user.getIdToken()

      // Guardar token en almacenamiento seguro
      const prefix = profileService.getStoragePrefix()
      mmkvStorage.set(`${prefix}${this.tokenKey}`, token)

      // Iniciar sesión en el servicio de sesión
      await sessionService.startSession(
        user.uid,
        token,
        user.refreshToken,
        3600, // 1 hora
      )

      return true
    } catch (error: any) {
      // Registrar error con el servicio de errores
      errorService.captureError(error, ErrorType.AUTHENTICATION, {
        method: "apple_signin",
        profileType,
      })

      console.error("Error detallado en autenticación con Apple:", JSON.stringify(error))

      if (error.code === appleAuth.Error.CANCELED) {
        console.log("Usuario canceló el inicio de sesión con Apple")
      } else {
        console.log(`Error de Apple Sign In: ${error.code}`, error)
      }

      return false
    }
  }

  /**
   * Verifica si Apple Sign In está soportado en el dispositivo
   */
  async isSupported(): Promise<boolean> {
    return Platform.OS === "ios" && appleAuth.isSupported
  }

  /**
   * Obtiene el usuario de Apple guardado
   */
  getAppleUser(): any {
    const userData = mmkvStorage.getString(this.userKey)
    return userData ? JSON.parse(userData) : null
  }

  /**
   * Guarda la información del usuario de Apple
   */
  private saveAppleUser(user: any): void {
    mmkvStorage.set(this.userKey, JSON.stringify(user))
  }

  /**
   * Obtiene la fecha del último inicio de sesión con Apple
   */
  getLastSignInDate(): Date | null {
    const timestamp = mmkvStorage.getString(this.lastSignInKey)
    return timestamp ? new Date(Number.parseInt(timestamp)) : null
  }

  /**
   * Limpia los datos de autenticación de Apple
   */
  clearAuthData(): void {
    mmkvStorage.delete(this.userKey)
    mmkvStorage.delete(this.lastSignInKey)

    const prefix = profileService.getStoragePrefix()
    mmkvStorage.delete(`${prefix}${this.tokenKey}`)
  }
}

export const appleAuthService = new AppleAuthService()
