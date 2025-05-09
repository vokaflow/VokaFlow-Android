import { mmkvStorage } from "../storage/mmkv"
import { Platform } from "react-native"

declare const __DEV__: boolean

// Valores por defecto para la configuración
const DEFAULT_CONFIG = {
  api: {
    baseUrl: "https://api.vokaflow.com",
    timeout: 30000, // 30 segundos
    retryAttempts: 3,
    cacheTime: 5 * 60 * 1000, // 5 minutos
  },
  app: {
    version: "1.0.0",
    buildNumber: "1",
    environment: __DEV__ ? "development" : "production",
    updateCheckInterval: 24 * 60 * 60 * 1000, // 24 horas
  },
  features: {
    offlineMode: true,
    pushNotifications: true,
    analytics: true,
    crashReporting: true,
    feedback: true,
    rateApp: true,
  },
  ui: {
    animationsEnabled: true,
    hapticFeedback: true,
    darkMode: "system", // 'system', 'light', 'dark'
    fontScale: 1.0,
  },
  security: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutos
    biometricAuth: true,
    screenLock: false,
  },
  performance: {
    imageQuality: "auto", // 'low', 'medium', 'high', 'auto'
    prefetchImages: true,
    prefetchData: true,
  },
}

// Tipo para la configuración
type ConfigType = typeof DEFAULT_CONFIG

class ConfigService {
  private readonly configKey = "app_config"
  private config: ConfigType = DEFAULT_CONFIG
  private isInitialized = false

  /**
   * Inicializa el servicio de configuración
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Cargar configuración guardada
    const savedConfig = mmkvStorage.getString(this.configKey)

    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        this.config = this.mergeConfigs(DEFAULT_CONFIG, parsedConfig)
      } catch (error) {
        console.error("Error parsing saved config:", error)
        this.config = DEFAULT_CONFIG
      }
    } else {
      this.config = DEFAULT_CONFIG
      this.saveConfig()
    }

    // Aplicar configuraciones específicas de plataforma
    this.applyPlatformSpecificConfig()

    this.isInitialized = true
  }

  /**
   * Obtiene toda la configuración
   */
  getConfig(): ConfigType {
    return this.config
  }

  /**
   * Obtiene una sección específica de la configuración
   */
  getSection<K extends keyof ConfigType>(section: K): ConfigType[K] {
    return this.config[section]
  }

  /**
   * Actualiza una sección de la configuración
   */
  updateSection<K extends keyof ConfigType>(section: K, updates: Partial<ConfigType[K]>): void {
    this.config[section] = {
      ...this.config[section],
      ...updates,
    }

    this.saveConfig()
  }

  /**
   * Restablece la configuración a los valores por defecto
   */
  resetToDefaults(): void {
    this.config = DEFAULT_CONFIG
    this.saveConfig()
  }

  /**
   * Guarda la configuración actual
   */
  private saveConfig(): void {
    mmkvStorage.set(this.configKey, JSON.stringify(this.config))
  }

  /**
   * Combina dos objetos de configuración
   */
  private mergeConfigs(defaultConfig: any, savedConfig: any): any {
    const result = { ...defaultConfig }

    // Recorrer todas las propiedades del objeto guardado
    for (const key in savedConfig) {
      if (Object.prototype.hasOwnProperty.call(savedConfig, key)) {
        // Si la propiedad es un objeto y existe en el objeto por defecto
        if (
          typeof savedConfig[key] === "object" &&
          savedConfig[key] !== null &&
          typeof defaultConfig[key] === "object" &&
          defaultConfig[key] !== null
        ) {
          // Recursivamente combinar los objetos anidados
          result[key] = this.mergeConfigs(defaultConfig[key], savedConfig[key])
        } else {
          // De lo contrario, usar el valor guardado
          result[key] = savedConfig[key]
        }
      }
    }

    return result
  }

  /**
   * Aplica configuraciones específicas de plataforma
   */
  private applyPlatformSpecificConfig(): void {
    if (Platform.OS === "ios") {
      // Configuraciones específicas para iOS
      this.config.ui.hapticFeedback = true
    } else if (Platform.OS === "android") {
      // Configuraciones específicas para Android
    }
  }
}

export const configService = new ConfigService()
