"use client"

import { MMKV } from "react-native-mmkv"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setTheme } from "../../store/slices/themeSlice"
import { profileService } from "../profile"

// Almacenamiento local para temas
const themeStorage = new MMKV({
  id: "theme-storage",
  encryptionKey: "theme-encryption-key",
})

// Colores de acento disponibles
export const accentColors = {
  magenta: {
    primary: "#FF00FF",
    secondary: "#CC00CC",
    tertiary: "#990099",
  },
  blue: {
    primary: "#00FFFF",
    secondary: "#00CCCC",
    tertiary: "#009999",
  },
  orange: {
    primary: "#FF8800",
    secondary: "#CC6600",
    tertiary: "#994C00",
  },
  green: {
    primary: "#00FF88",
    secondary: "#00CC66",
    tertiary: "#00994C",
  },
  purple: {
    primary: "#8800FF",
    secondary: "#6600CC",
    tertiary: "#4C0099",
  },
}

// Niveles de contraste
export const contrastLevels = {
  high: {
    background: "#000000",
    surface: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
  },
  medium: {
    background: "#121212",
    surface: "#1E1E1E",
    card: "#252525",
    text: "#F0F0F0",
  },
  low: {
    background: "#1A1A1A",
    surface: "#252525",
    card: "#2C2C2C",
    text: "#E0E0E0",
  },
}

// Tamaños de fuente
export const fontSizes = {
  small: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
  },
  medium: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 22,
  },
  large: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
    xxl: 24,
  },
  extraLarge: {
    xs: 16,
    sm: 18,
    md: 20,
    lg: 22,
    xl: 24,
    xxl: 26,
  },
}

// Configuración de animaciones
export const animationPresets = {
  none: {
    enabled: false,
    duration: 0,
  },
  minimal: {
    enabled: true,
    duration: 150,
  },
  normal: {
    enabled: true,
    duration: 300,
  },
  elaborate: {
    enabled: true,
    duration: 500,
  },
}

// Configuración por defecto
const defaultThemeConfig = {
  accentColor: "magenta",
  contrastLevel: "medium",
  fontSize: "medium",
  animations: "normal",
  darkMode: true, // Siempre true para VokaFlow
}

// Servicio de temas
export const themeService = {
  // Inicializar tema
  initialize: async () => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    // Cargar configuración guardada o usar valores por defecto
    const savedConfig = themeStorage.getString(`theme-config-${profileId}`)

    if (savedConfig) {
      return JSON.parse(savedConfig)
    }

    // Si no hay configuración guardada, guardar la configuración por defecto
    themeStorage.set(`theme-config-${profileId}`, JSON.stringify(defaultThemeConfig))
    return defaultThemeConfig
  },

  // Guardar configuración de tema
  saveThemeConfig: async (config) => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    themeStorage.set(
      `theme-config-${profileId}`,
      JSON.stringify({
        ...defaultThemeConfig,
        ...config,
      }),
    )

    return config
  },

  // Obtener configuración actual
  getThemeConfig: async () => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    const savedConfig = themeStorage.getString(`theme-config-${profileId}`)

    if (savedConfig) {
      return JSON.parse(savedConfig)
    }

    return defaultThemeConfig
  },

  // Generar tema completo basado en la configuración
  generateTheme: (config) => {
    const { accentColor, contrastLevel, fontSize, animations } = config

    return {
      colors: {
        accent: accentColors[accentColor] || accentColors.magenta,
        ...(contrastLevels[contrastLevel] || contrastLevels.medium),
        // Colores adicionales para la interfaz
        success: "#00CC66",
        warning: "#FFCC00",
        error: "#FF3333",
        info: "#3399FF",
      },
      typography: {
        sizes: fontSizes[fontSize] || fontSizes.medium,
        fontFamily: {
          regular: "Roboto-Regular",
          medium: "Roboto-Medium",
          bold: "Roboto-Bold",
          light: "Roboto-Light",
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      },
      animation: animationPresets[animations] || animationPresets.normal,
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        round: 9999,
      },
    }
  },
}

// Hook para usar el tema
export const useTheme = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const loadTheme = async () => {
      const config = await themeService.initialize()
      const theme = themeService.generateTheme(config)
      dispatch(setTheme({ config, theme }))
    }

    loadTheme()
  }, [dispatch])
}
