import { mmkvStorage } from "../storage/mmkv"
import * as Crypto from "expo-crypto"

/**
 * Servicio para manejar aspectos de seguridad de la aplicación
 */
class SecurityService {
  private readonly securityPrefix = "security_"
  private readonly tokenBlacklistKey = `${this.securityPrefix}token_blacklist`
  private readonly lastPasswordChangeKey = `${this.securityPrefix}last_password_change`
  private readonly securitySettingsKey = `${this.securityPrefix}settings`

  /**
   * Inicializa el servicio de seguridad
   */
  async initialize(): Promise<void> {
    // Inicializar lista negra de tokens si no existe
    if (!mmkvStorage.getString(this.tokenBlacklistKey)) {
      mmkvStorage.set(this.tokenBlacklistKey, JSON.stringify([]))
    }

    // Inicializar configuración de seguridad si no existe
    if (!mmkvStorage.getString(this.securitySettingsKey)) {
      const defaultSettings = {
        requireBiometricForSensitiveOperations: true,
        sessionTimeout: 30 * 60 * 1000, // 30 minutos
        passwordMinLength: 8,
        passwordRequireSpecialChars: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        maxFailedLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutos
      }
      mmkvStorage.set(this.securitySettingsKey, JSON.stringify(defaultSettings))
    }
  }

  /**
   * Genera un hash seguro para una contraseña
   */
  async hashPassword(password: string): Promise<string> {
    // En una aplicación real, usaríamos bcrypt o similar
    // Aquí usamos SHA-256 como ejemplo simplificado
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password)
  }

  /**
   * Verifica si una contraseña cumple con los requisitos de seguridad
   */
  validatePassword(password: string): { valid: boolean; message: string } {
    const settings = this.getSecuritySettings()

    if (password.length < settings.passwordMinLength) {
      return {
        valid: false,
        message: `La contraseña debe tener al menos ${settings.passwordMinLength} caracteres`,
      }
    }

    if (settings.passwordRequireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return {
        valid: false,
        message: "La contraseña debe contener al menos un carácter especial",
      }
    }

    if (settings.passwordRequireNumbers && !/\d/.test(password)) {
      return {
        valid: false,
        message: "La contraseña debe contener al menos un número",
      }
    }

    if (settings.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: "La contraseña debe contener al menos una letra mayúscula",
      }
    }

    return { valid: true, message: "Contraseña válida" }
  }

  /**
   * Añade un token a la lista negra (para invalidar sesiones)
   */
  invalidateToken(token: string): void {
    const blacklist = this.getTokenBlacklist()
    blacklist.push({
      token,
      timestamp: Date.now(),
    })

    // Limpiar tokens antiguos (más de 7 días)
    const updatedBlacklist = blacklist.filter((item) => Date.now() - item.timestamp < 7 * 24 * 60 * 60 * 1000)

    mmkvStorage.set(this.tokenBlacklistKey, JSON.stringify(updatedBlacklist))
  }

  /**
   * Verifica si un token está en la lista negra
   */
  isTokenBlacklisted(token: string): boolean {
    const blacklist = this.getTokenBlacklist()
    return blacklist.some((item) => item.token === token)
  }

  /**
   * Registra un cambio de contraseña
   */
  recordPasswordChange(userId: string): void {
    mmkvStorage.set(`${this.lastPasswordChangeKey}_${userId}`, Date.now().toString())
  }

  /**
   * Obtiene la fecha del último cambio de contraseña
   */
  getLastPasswordChange(userId: string): Date | null {
    const timestamp = mmkvStorage.getString(`${this.lastPasswordChangeKey}_${userId}`)
    return timestamp ? new Date(Number.parseInt(timestamp)) : null
  }

  /**
   * Obtiene la configuración de seguridad
   */
  getSecuritySettings(): any {
    const settings = mmkvStorage.getString(this.securitySettingsKey)
    return settings ? JSON.parse(settings) : {}
  }

  /**
   * Actualiza la configuración de seguridad
   */
  updateSecuritySettings(settings: Partial<any>): void {
    const currentSettings = this.getSecuritySettings()
    mmkvStorage.set(this.securitySettingsKey, JSON.stringify({ ...currentSettings, ...settings }))
  }

  /**
   * Genera un ID único seguro
   */
  generateSecureId(): string {
    return Crypto.randomUUID()
  }

  /**
   * Sanitiza una cadena para prevenir inyecciones
   */
  sanitizeInput(input: string): string {
    // Implementación básica, en producción usar una biblioteca más robusta
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
  }

  private getTokenBlacklist(): Array<{ token: string; timestamp: number }> {
    const blacklist = mmkvStorage.getString(this.tokenBlacklistKey)
    return blacklist ? JSON.parse(blacklist) : []
  }
}

export const securityService = new SecurityService()
