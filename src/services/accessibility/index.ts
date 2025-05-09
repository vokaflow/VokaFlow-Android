import { MMKV } from "react-native-mmkv"
import { PixelRatio, Platform, Vibration } from "react-native"
import * as Haptics from "expo-haptics"
import { profileService } from "../profile"

// Almacenamiento para configuraciones de accesibilidad
const accessibilityStorage = new MMKV({
  id: "accessibility-storage",
  encryptionKey: "accessibility-encryption-key",
})

// Niveles de contraste disponibles
export const contrastLevels = {
  normal: {
    textPrimary: "#FFFFFF",
    textSecondary: "#E0E0E0",
    textTertiary: "#BBBBBB",
    backgroundPrimary: "#121212",
    backgroundSecondary: "#1E1E1E",
    backgroundTertiary: "#2A2A2A",
  },
  high: {
    textPrimary: "#FFFFFF",
    textSecondary: "#F0F0F0",
    textTertiary: "#E0E0E0",
    backgroundPrimary: "#000000",
    backgroundSecondary: "#0A0A0A",
    backgroundTertiary: "#151515",
  },
  highest: {
    textPrimary: "#FFFFFF",
    textSecondary: "#FFFFFF",
    textTertiary: "#F0F0F0",
    backgroundPrimary: "#000000",
    backgroundSecondary: "#000000",
    backgroundTertiary: "#0A0A0A",
  },
}

// Tamaños de fuente disponibles
export const fontSizes = {
  small: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },
  medium: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  large: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 32,
  },
  extraLarge: {
    xs: 16,
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
    xxxl: 36,
  },
}

// Patrones de vibración para feedback táctil
export const vibrationPatterns = {
  light: {
    success: [0, 40],
    error: [0, 40, 30, 40],
    warning: [0, 30, 20, 30],
    notification: [0, 20],
  },
  medium: {
    success: [0, 60],
    error: [0, 60, 50, 60],
    warning: [0, 50, 30, 50],
    notification: [0, 40],
  },
  strong: {
    success: [0, 100],
    error: [0, 100, 80, 100],
    warning: [0, 80, 50, 80],
    notification: [0, 60],
  },
}

// Tamaños de elementos táctiles
export const touchSizes = {
  normal: {
    buttonHeight: 48,
    buttonMinWidth: 48,
    iconSize: 24,
    spacing: 8,
    borderRadius: 8,
  },
  large: {
    buttonHeight: 56,
    buttonMinWidth: 56,
    iconSize: 28,
    spacing: 12,
    borderRadius: 10,
  },
  extraLarge: {
    buttonHeight: 64,
    buttonMinWidth: 64,
    iconSize: 32,
    spacing: 16,
    borderRadius: 12,
  },
}

// Configuraciones de animación
export const animationPresets = {
  full: {
    enabled: true,
    duration: 1,
    complexity: "complex",
  },
  reduced: {
    enabled: true,
    duration: 0.7,
    complexity: "simple",
  },
  minimal: {
    enabled: true,
    duration: 0.5,
    complexity: "minimal",
  },
  none: {
    enabled: false,
    duration: 0,
    complexity: "none",
  },
}

// Configuración por defecto
const defaultAccessibilityConfig = {
  highContrast: "normal",
  fontSize: "medium",
  reduceMotion: false,
  screenReader: false,
  vibrationIntensity: "medium",
  touchSize: "normal",
  autoplayMedia: true,
  transcribeAudio: true,
  visualNotifications: true,
  monoAudio: false,
  invertColors: false,
  reduceTransparency: false,
  // Nuevas configuraciones para animaciones
  animationPreset: "full",
  parallaxEffects: true,
  animatedTransitions: true,
  animatedNotifications: true,
  animatedButtons: true,
  animatedLoaders: true,
  animatedIcons: true,
  animatedBackgrounds: true,
}

// Servicio de accesibilidad
const accessibilityService = {
  // Inicializar configuración
  initialize: async () => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    // Cargar configuración guardada o usar valores por defecto
    const savedConfig = accessibilityStorage.getString(`accessibility-config-${profileId}`)

    if (savedConfig) {
      return JSON.parse(savedConfig)
    }

    // Si no hay configuración guardada, guardar la configuración por defecto
    accessibilityStorage.set(`accessibility-config-${profileId}`, JSON.stringify(defaultAccessibilityConfig))
    return defaultAccessibilityConfig
  },

  // Guardar configuración
  saveAccessibilityConfig: async (config) => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    accessibilityStorage.set(
      `accessibility-config-${profileId}`,
      JSON.stringify({
        ...defaultAccessibilityConfig,
        ...config,
      }),
    )

    return config
  },

  // Obtener configuración actual
  getAccessibilityConfig: async () => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    const savedConfig = accessibilityStorage.getString(`accessibility-config-${profileId}`)

    if (savedConfig) {
      return JSON.parse(savedConfig)
    }

    return defaultAccessibilityConfig
  },

  // Calcular tamaño de fuente adaptado a la densidad de píxeles
  calculateFontSize: (size, config) => {
    const fontSizeConfig = fontSizes[config?.fontSize || "medium"]
    const baseSize = fontSizeConfig[size] || fontSizeConfig.md

    // Ajustar según la densidad de píxeles del dispositivo
    const pixelRatio = PixelRatio.getFontScale()
    return Math.round(baseSize * pixelRatio)
  },

  // Calcular tamaño de elementos táctiles
  calculateTouchSize: (config) => {
    return touchSizes[config?.touchSize || "normal"]
  },

  // Proporcionar feedback táctil
  provideFeedback: async (type, config) => {
    try {
      const intensity = config?.vibrationIntensity || "medium"

      // Usar Haptics si está disponible
      if (Platform.OS === "ios") {
        switch (type) {
          case "success":
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            break
          case "error":
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            break
          case "warning":
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
            break
          default:
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }
      } else {
        // Usar vibración nativa en Android
        const pattern = vibrationPatterns[intensity][type] || vibrationPatterns[intensity].notification
        Vibration.vibrate(pattern)
      }
    } catch (error) {
      console.error("Error providing haptic feedback:", error)
    }
  },

  // Verificar si un color tiene suficiente contraste
  checkContrast: (foreground, background) => {
    // Convertir colores a RGB
    const getRGB = (color) => {
      const hex = color.replace("#", "")
      return {
        r: Number.parseInt(hex.substring(0, 2), 16),
        g: Number.parseInt(hex.substring(2, 4), 16),
        b: Number.parseInt(hex.substring(4, 6), 16),
      }
    }

    // Calcular luminancia
    const getLuminance = (rgb) => {
      const { r, g, b } = rgb
      const a = [r, g, b].map((v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      })
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
    }

    const rgb1 = getRGB(foreground)
    const rgb2 = getRGB(background)
    const l1 = getLuminance(rgb1)
    const l2 = getLuminance(rgb2)

    // Calcular ratio de contraste
    const ratio = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05)

    return {
      ratio,
      isAA: ratio >= 4.5,
      isAAA: ratio >= 7,
    }
  },

  // Generar propiedades de accesibilidad para componentes
  getAccessibilityProps: (label, hint, role = "button", state = {}) => {
    return {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role,
      ...state,
    }
  },

  // Nuevos métodos para animaciones

  // Obtener configuración de animación según preferencias
  getAnimationConfig: (config) => {
    // Si el usuario ha activado reduceMotion, usar el preset "none"
    if (config?.reduceMotion) {
      return animationPresets.none
    }

    // Si no, usar el preset seleccionado
    return animationPresets[config?.animationPreset || "full"]
  },

  // Verificar si un tipo específico de animación está habilitado
  isAnimationTypeEnabled: (type, config) => {
    // Si el usuario ha activado reduceMotion, desactivar todas las animaciones
    if (config?.reduceMotion) {
      return false
    }

    // Verificar si el tipo específico de animación está habilitado
    switch (type) {
      case "parallax":
        return config?.parallaxEffects !== false
      case "transitions":
        return config?.animatedTransitions !== false
      case "notifications":
        return config?.animatedNotifications !== false
      case "buttons":
        return config?.animatedButtons !== false
      case "loaders":
        return config?.animatedLoaders !== false
      case "icons":
        return config?.animatedIcons !== false
      case "backgrounds":
        return config?.animatedBackgrounds !== false
      default:
        return true
    }
  },

  // Calcular duración de animación según preferencias
  calculateAnimationDuration: (baseDuration, config) => {
    const animConfig = accessibilityService.getAnimationConfig(config)
    return baseDuration * animConfig.duration
  },

  // Determinar complejidad de animación según preferencias
  getAnimationComplexity: (config) => {
    const animConfig = accessibilityService.getAnimationConfig(config)
    return animConfig.complexity
  },
}

export default accessibilityService
