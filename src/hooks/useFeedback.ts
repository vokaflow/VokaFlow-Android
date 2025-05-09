"use client"

import { useCallback } from "react"
import { useAccessibility } from "./useAccessibility"
import { hapticFeedback, HapticType } from "../services/feedback/hapticFeedback"

export function useFeedback() {
  const { preferences } = useAccessibility()

  const triggerHaptic = useCallback(
    (type: HapticType = HapticType.LIGHT) => {
      // Solo proporcionar feedback táctil si está habilitado en las preferencias
      if (preferences.hapticFeedback) {
        hapticFeedback.trigger(type)
      }
    },
    [preferences.hapticFeedback],
  )

  return {
    triggerHaptic,
    isHapticEnabled: preferences.hapticFeedback,
    isHapticSupported: hapticFeedback.isSupported(),
  }
}
