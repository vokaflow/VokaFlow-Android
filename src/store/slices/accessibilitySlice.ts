import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

// Tipos para la configuración de accesibilidad
interface AccessibilityConfig {
  highContrast: "normal" | "high" | "highest"
  fontSize: "small" | "medium" | "large" | "extraLarge"
  reduceMotion: boolean
  screenReader: boolean
  vibrationIntensity: "light" | "medium" | "strong"
  touchSize: "normal" | "large" | "extraLarge"
  autoplayMedia: boolean
  transcribeAudio: boolean
  visualNotifications: boolean
  monoAudio: boolean
  invertColors: boolean
  reduceTransparency: boolean
}

interface AccessibilityState {
  config: AccessibilityConfig
  isLoaded: boolean
}

// Estado inicial
const initialState: AccessibilityState = {
  config: {
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
  },
  isLoaded: false,
}

// Slice de Redux
const accessibilitySlice = createSlice({
  name: "accessibility",
  initialState,
  reducers: {
    setAccessibilityConfig: (state, action: PayloadAction<AccessibilityConfig>) => {
      state.config = action.payload
      state.isLoaded = true
    },
    updateAccessibilityConfig: (state, action: PayloadAction<Partial<AccessibilityConfig>>) => {
      state.config = {
        ...state.config,
        ...action.payload,
      }
    },
  },
})

export const { setAccessibilityConfig, updateAccessibilityConfig } = accessibilitySlice.actions
export default accessibilitySlice.reducer
