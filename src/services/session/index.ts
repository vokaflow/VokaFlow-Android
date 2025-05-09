import { mmkvStorage } from "../storage/mmkv"
import { profileService } from "../profile"
import { securityService } from "../security"
import { errorService, ErrorType } from "../error"
import { configService } from "../config"

// Interfaz para la información de sesión
export interface SessionInfo {
  userId: string
  profileId: string
  token: string
  refreshToken?: string
  expiresAt: number
  lastActivity: number
}

class SessionService {
  private readonly sessionKey = "user_session"
  private sessionTimeout: number = 30 * 60 * 1000 // 30 minutos por defecto
  private sessionCheckInterval: NodeJS.Timeout | null = null

  /**
   * Inicializa el servicio de sesión
   */
  async initialize(): Promise<void> {
    // Cargar configuración de tiempo de sesión
    const securityConfig = configService.getSection("security")
    this.sessionTimeout = securityConfig.sessionTimeout

    // Iniciar verificación periódica de sesión
    this.startSessionCheck()
  }

  /**
   * Inicia una nueva sesión
   */
  async startSession(userId: string, token: string, refreshToken?: string, expiresIn = 3600): Promise<void> {
    const profileId = profileService.getActiveProfileId() || ""

    if (!profileId) {
      throw errorService.captureError(new Error("No hay un perfil activo"), ErrorType.AUTHENTICATION)
    }

    const expiresAt = Date.now() + expiresIn * 1000

    const sessionInfo: SessionInfo = {
      userId,
      profileId,
      token,
      refreshToken,
      expiresAt,
      lastActivity: Date.now(),
    }

    // Guardar información de sesión
    this.saveSession(sessionInfo)

    // Iniciar verificación periódica de sesión
    this.startSessionCheck()
  }

  /**
   * Actualiza la actividad del usuario para mantener la sesión activa
   */
  updateActivity(): void {
    const session = this.getSession()

    if (session) {
      session.lastActivity = Date.now()
      this.saveSession(session)
    }
  }

  /**
   * Verifica si hay una sesión activa
   */
  isSessionActive(): boolean {
    const session = this.getSession()

    if (!session) {
      return false
    }

    // Verificar si la sesión ha expirado
    if (Date.now() > session.expiresAt) {
      return false
    }

    // Verificar si ha habido actividad reciente
    if (Date.now() - session.lastActivity > this.sessionTimeout) {
      return false
    }

    // Verificar si el token está en la lista negra
    if (securityService.isTokenBlacklisted(session.token)) {
      return false
    }

    return true
  }

  /**
   * Obtiene el token de autenticación actual
   */
  getAuthToken(): string | null {
    const session = this.getSession()
    return session && this.isSessionActive() ? session.token : null
  }

  /**
   * Cierra la sesión actual
   */
  endSession(): void {
    const session = this.getSession()

    if (session) {
      // Añadir token a la lista negra
      securityService.invalidateToken(session.token)
    }

    // Eliminar información de sesión
    this.clearSession()

    // Detener verificación periódica
    this.stopSessionCheck()
  }

  /**
   * Renueva el token de autenticación
   */
  async refreshAuthToken(): Promise<string | null> {
    const session = this.getSession()

    if (!session || !session.refreshToken) {
      return null
    }

    try {
      // Aquí iría la lógica para renovar el token con el servidor
      // Por ahora, simulamos una renovación exitosa

      const newToken = `new_token_${Date.now()}`
      const newRefreshToken = `new_refresh_token_${Date.now()}`
      const expiresIn = 3600 // 1 hora

      // Actualizar la sesión con el nuevo token
      await this.startSession(session.userId, newToken, newRefreshToken, expiresIn)

      return newToken
    } catch (error) {
      errorService.captureError(error, ErrorType.AUTHENTICATION)
      return null
    }
  }

  /**
   * Obtiene la información de sesión actual
   */
  private getSession(): SessionInfo | null {
    const prefix = profileService.getStoragePrefix()
    const sessionData = mmkvStorage.getString(`${prefix}${this.sessionKey}`)

    if (!sessionData) {
      return null
    }

    try {
      return JSON.parse(sessionData)
    } catch (error) {
      errorService.captureError(error, ErrorType.UNKNOWN)
      return null
    }
  }

  /**
   * Guarda la información de sesión
   */
  private saveSession(session: SessionInfo): void {
    const prefix = profileService.getStoragePrefix()
    mmkvStorage.set(`${prefix}${this.sessionKey}`, JSON.stringify(session))
  }

  /**
   * Elimina la información de sesión
   */
  private clearSession(): void {
    const prefix = profileService.getStoragePrefix()
    mmkvStorage.delete(`${prefix}${this.sessionKey}`)
  }

  /**
   * Inicia la verificación periódica de sesión
   */
  private startSessionCheck(): void {
    // Detener verificación anterior si existe
    this.stopSessionCheck()

    // Verificar sesión cada minuto
    this.sessionCheckInterval = setInterval(() => {
      if (!this.isSessionActive()) {
        // Si la sesión ya no está activa, intentar renovar el token
        this.refreshAuthToken().catch(() => {
          // Si falla la renovación, cerrar sesión
          this.endSession()

          // Aquí se podría emitir un evento para que la UI muestre un mensaje
          // o redirija al usuario a la pantalla de inicio de sesión
        })
      }
    }, 60000) // Verificar cada minuto
  }

  /**
   * Detiene la verificación periódica de sesión
   */
  private stopSessionCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
  }
}

export const sessionService = new SessionService()
