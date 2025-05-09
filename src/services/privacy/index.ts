import { MMKV } from "react-native-mmkv"
import * as LocalAuthentication from "expo-local-authentication"
import { profileService } from "../profile"
import { storageService } from "../storage"

// Almacenamiento local para configuraciones de privacidad
const privacyStorage = new MMKV({
  id: "privacy-storage",
  encryptionKey: "privacy-encryption-key",
})

// Configuración por defecto
const defaultPrivacyConfig = {
  appLockEnabled: false,
  appLockMethod: "pin", // 'pin', 'biometric'
  appLockPin: "",
  hideContentInAppSwitcher: true,
  sensitiveContentBlur: true,
  autoDeletionEnabled: false,
  autoDeletionPeriod: 90, // días
  privateMode: false,
}

// Servicio de privacidad
export const privacyService = {
  // Inicializar configuración
  initialize: async () => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    // Cargar configuración guardada o usar valores por defecto
    const savedConfig = privacyStorage.getString(`privacy-config-${profileId}`)

    if (savedConfig) {
      return JSON.parse(savedConfig)
    }

    // Si no hay configuración guardada, guardar la configuración por defecto
    privacyStorage.set(`privacy-config-${profileId}`, JSON.stringify(defaultPrivacyConfig))
    return defaultPrivacyConfig
  },

  // Guardar configuración
  savePrivacyConfig: async (config) => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    privacyStorage.set(
      `privacy-config-${profileId}`,
      JSON.stringify({
        ...defaultPrivacyConfig,
        ...config,
      }),
    )

    return config
  },

  // Obtener configuración actual
  getPrivacyConfig: async () => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    const savedConfig = privacyStorage.getString(`privacy-config-${profileId}`)

    if (savedConfig) {
      return JSON.parse(savedConfig)
    }

    return defaultPrivacyConfig
  },

  // Verificar si el dispositivo soporta autenticación biométrica
  checkBiometricSupport: async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()

    return {
      supported: hasHardware && isEnrolled,
      biometricTypes: await LocalAuthentication.supportedAuthenticationTypesAsync(),
    }
  },

  // Autenticar con biometría
  authenticateWithBiometrics: async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autenticación requerida",
        fallbackLabel: "Usar PIN",
      })

      return result.success
    } catch (error) {
      console.error("Error en autenticación biométrica:", error)
      return false
    }
  },

  // Verificar PIN
  verifyPin: async (inputPin) => {
    const config = await privacyService.getPrivacyConfig()
    return inputPin === config.appLockPin
  },

  // Establecer PIN
  setPin: async (newPin) => {
    const config = await privacyService.getPrivacyConfig()

    await privacyService.savePrivacyConfig({
      ...config,
      appLockPin: newPin,
      appLockMethod: "pin",
      appLockEnabled: true,
    })

    return true
  },

  // Activar/desactivar modo privado
  togglePrivateMode: async (enabled) => {
    const config = await privacyService.getPrivacyConfig()

    await privacyService.savePrivacyConfig({
      ...config,
      privateMode: enabled,
    })

    return enabled
  },

  // Ejecutar auto-borrado según configuración
  runAutoDeleteIfNeeded: async () => {
    const config = await privacyService.getPrivacyConfig()

    if (!config.autoDeletionEnabled) return

    const now = new Date()
    const cutoffDate = new Date(now.setDate(now.getDate() - config.autoDeletionPeriod))

    // Eliminar mensajes antiguos
    await storageService.deleteMessagesOlderThan(cutoffDate)

    // Eliminar archivos multimedia antiguos
    await storageService.deleteMediaFilesOlderThan(cutoffDate)
  },
}
