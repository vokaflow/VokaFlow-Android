import { MMKV } from "react-native-mmkv"
import { Vibration } from "react-native"
import * as Notifications from "expo-notifications"
import { Audio } from "expo-av"
import { profileService } from "../profile"

// Almacenamiento local para configuraciones de notificaciones
const notificationStorage = new MMKV({
  id: "notification-storage",
  encryptionKey: "notification-encryption-key",
})

// Sonidos disponibles
export const notificationSounds = {
  default: require("../../../assets/sounds/default-notification.mp3"),
  subtle: require("../../../assets/sounds/subtle-notification.mp3"),
  electronic: require("../../../assets/sounds/electronic-notification.mp3"),
  neon: require("../../../assets/sounds/neon-notification.mp3"),
  minimal: require("../../../assets/sounds/minimal-notification.mp3"),
}

// Patrones de vibración
export const vibrationPatterns = {
  default: [0, 300],
  double: [0, 200, 100, 200],
  long: [0, 500],
  gentle: [0, 100, 50, 100],
  intense: [0, 300, 100, 300, 100, 300],
}

// Configuración por defecto
const defaultNotificationConfig = {
  enabled: true,
  sound: "default",
  vibration: "default",
  showContent: true,
  doNotDisturbEnabled: false,
  doNotDisturbStart: "22:00",
  doNotDisturbEnd: "08:00",
  notificationTypes: {
    messages: true,
    translations: true,
    updates: true,
    calls: true,
  },
}

// Servicio de notificaciones personalizadas
export const customNotificationService = {
  // Inicializar configuración
  initialize: async () => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    // Cargar configuración guardada o usar valores por defecto
    const savedConfig = notificationStorage.getString(`notification-config-${profileId}`)

    if (savedConfig) {
      return JSON.parse(savedConfig)
    }

    // Si no hay configuración guardada, guardar la configuración por defecto
    notificationStorage.set(`notification-config-${profileId}`, JSON.stringify(defaultNotificationConfig))
    return defaultNotificationConfig
  },

  // Guardar configuración
  saveNotificationConfig: async (config) => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    notificationStorage.set(
      `notification-config-${profileId}`,
      JSON.stringify({
        ...defaultNotificationConfig,
        ...config,
      }),
    )

    return config
  },

  // Obtener configuración actual
  getNotificationConfig: async () => {
    const activeProfile = await profileService.getActiveProfile()
    const profileId = activeProfile?.id || "default"

    const savedConfig = notificationStorage.getString(`notification-config-${profileId}`)

    if (savedConfig) {
      return JSON.parse(savedConfig)
    }

    return defaultNotificationConfig
  },

  // Verificar si estamos en horario de No Molestar
  isInDoNotDisturbTime: (config) => {
    if (!config.doNotDisturbEnabled) return false

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    const startParts = config.doNotDisturbStart.split(":")
    const endParts = config.doNotDisturbEnd.split(":")

    const startHour = Number.parseInt(startParts[0], 10)
    const startMinute = Number.parseInt(startParts[1], 10)
    const endHour = Number.parseInt(endParts[0], 10)
    const endMinute = Number.parseInt(endParts[1], 10)

    const currentTime = currentHour * 60 + currentMinute
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute

    // Si el horario de No Molestar cruza la medianoche
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime
    }

    return currentTime >= startTime && currentTime <= endTime
  },

  // Reproducir sonido de notificación
  playNotificationSound: async (soundName) => {
    try {
      const soundFile = notificationSounds[soundName] || notificationSounds.default
      const { sound } = await Audio.Sound.createAsync(soundFile)
      await sound.playAsync()

      // Liberar recursos cuando termine de reproducirse
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync()
        }
      })
    } catch (error) {
      console.error("Error playing notification sound:", error)
    }
  },

  // Ejecutar vibración
  vibrate: (patternName) => {
    const pattern = vibrationPatterns[patternName] || vibrationPatterns.default
    Vibration.vibrate(pattern)
  },

  // Mostrar notificación personalizada
  showNotification: async (title, body, data = {}, options = {}) => {
    try {
      const config = await customNotificationService.getNotificationConfig()

      // Verificar si las notificaciones están habilitadas
      if (!config.enabled) return

      // Verificar si estamos en horario de No Molestar
      if (customNotificationService.isInDoNotDisturbTime(config)) return

      // Verificar si el tipo de notificación está habilitado
      const notificationType = data.type || "messages"
      if (!config.notificationTypes[notificationType]) return

      // Preparar contenido según configuración de privacidad
      let notificationBody = body
      if (!config.showContent) {
        notificationBody = "Nueva notificación recibida"
      }

      // Mostrar notificación
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: notificationBody,
          data,
          sound: config.sound !== "none",
        },
        trigger: null,
      })

      // Reproducir sonido personalizado si está habilitado
      if (config.sound !== "none") {
        await customNotificationService.playNotificationSound(config.sound)
      }

      // Vibrar si está habilitado
      if (config.vibration !== "none") {
        customNotificationService.vibrate(config.vibration)
      }
    } catch (error) {
      console.error("Error showing notification:", error)
    }
  },
}
