import { Vibration, Platform } from "react-native"
import * as Haptics from "expo-haptics"

export enum HapticType {
  LIGHT = "light",
  MEDIUM = "medium",
  HEAVY = "heavy",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

export const hapticFeedback = {
  /**
   * Proporciona feedback táctil según el tipo especificado
   */
  trigger: (type: HapticType = HapticType.LIGHT) => {
    try {
      // Usar Expo Haptics si está disponible (mejor experiencia)
      if (Haptics) {
        switch (type) {
          case HapticType.LIGHT:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            break
          case HapticType.MEDIUM:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            break
          case HapticType.HEAVY:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            break
          case HapticType.SUCCESS:
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            break
          case HapticType.WARNING:
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
            break
          case HapticType.ERROR:
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            break
          default:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
      } else {
        // Fallback a la API básica de Vibration
        switch (type) {
          case HapticType.LIGHT:
            Vibration.vibrate(10)
            break
          case HapticType.MEDIUM:
            Vibration.vibrate(20)
            break
          case HapticType.HEAVY:
            Vibration.vibrate(30)
            break
          case HapticType.SUCCESS:
            Vibration.vibrate([0, 50, 50, 50])
            break
          case HapticType.WARNING:
            Vibration.vibrate([0, 50, 100, 50])
            break
          case HapticType.ERROR:
            Vibration.vibrate([0, 50, 50, 50, 50, 50])
            break
          default:
            Vibration.vibrate(10)
        }
      }
    } catch (error) {
      console.log("Error al proporcionar feedback táctil:", error)
    }
  },

  /**
   * Verifica si el dispositivo soporta feedback táctil
   */
  isSupported: (): boolean => {
    return Platform.OS !== "web"
  },
}
