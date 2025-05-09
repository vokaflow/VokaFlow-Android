import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { accentColors, contrastLevels, fontSizes, animationPresets } from "../../services/theme"

// Tipos para el tema
interface ThemeConfig {
  accentColor: keyof typeof accentColors
  contrastLevel: keyof typeof contrastLevels
  fontSize: keyof typeof fontSizes
  animations: keyof typeof animationPresets
  darkMode: boolean
}

interface Theme {
  colors: {
    accent: (typeof accentColors)[keyof typeof accentColors]
    background: string
    surface: string
    card: string
    text: string
    success: string
    warning: string
    error: string
    info: string
  }
  typography: {
    sizes: (typeof fontSizes)[keyof typeof fontSizes]
    fontFamily: {
      regular: string
      medium: string
      bold: string
      light: string
    }
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
  }
  animation: (typeof animationPresets)[keyof typeof animationPresets]
  borderRadius: {
    sm: number
    md: number
    lg: number
    xl: number
    round: number
  }
}

interface ThemeState {
  config: ThemeConfig
  theme: Theme
  isLoaded: boolean
}

// Estado inicial
const initialState: ThemeState = {
  config: {
    accentColor: "magenta",
    contrastLevel: "medium",
    fontSize: "medium",
    animations: "normal",
    darkMode: true,
  },
  theme: {
    colors: {
      accent: accentColors.magenta,
      ...contrastLevels.medium,
      success: "#00CC66",
      warning: "#FFCC00",
      error: "#FF3333",
      info: "#3399FF",
    },
    typography: {
      sizes: fontSizes.medium,
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
    animation: animationPresets.normal,
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      round: 9999,
    },
  },
  isLoaded: false,
}

// Slice de Redux
const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<{ config: ThemeConfig; theme: Theme }>) => {
      state.config = action.payload.config
      state.theme = action.payload.theme
      state.isLoaded = true
    },
    updateThemeConfig: (state, action: PayloadAction<Partial<ThemeConfig>>) => {
      state.config = {
        ...state.config,
        ...action.payload,
      }
    },
  },
})

export const { setTheme, updateThemeConfig } = themeSlice.actions
export default themeSlice.reducer
