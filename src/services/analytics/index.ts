import { Platform } from "react-native"
import { mmkvStorage } from "../storage/mmkv"
import { errorService, ErrorType } from "../error"
import { configService } from "../config"
import { profileService } from "../profile"

// Tipos de eventos
export enum AnalyticsEventType {
  SCREEN_VIEW = "screen_view",
  USER_ACTION = "user_action",
  ERROR = "error",
  PERFORMANCE = "performance",
  ENGAGEMENT = "engagement",
  CONVERSION = "conversion",
  CUSTOM = "custom",
}

// Interfaz para eventos de analítica
export interface AnalyticsEvent {
  type: AnalyticsEventType
  name: string
  timestamp: number
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
}

class AnalyticsService {
  private readonly eventsKey = "analytics_events"
  private readonly userPropertiesKey = "analytics_user_properties"
  private readonly sessionKey = "analytics_session"
  private readonly maxQueueSize = 100
  private readonly batchSize = 20
  private readonly flushInterval = 60000 // 1 minuto
  private flushIntervalId: NodeJS.Timeout | null = null
  private sessionId: string | null = null

  /**
   * Inicializa el servicio de analíticas
   */
  async initialize(): Promise<void> {
    // Verificar si las analíticas están habilitadas
    const featuresConfig = configService.getSection("features")

    if (!featuresConfig.analytics) {
      console.log("Analíticas deshabilitadas en la configuración")
      return
    }

    // Iniciar sesión de analíticas
    this.startSession()

    // Iniciar envío periódico de eventos
    this.startEventFlushing()
  }

  /**
   * Registra un evento de analítica
   */
  async trackEvent(type: AnalyticsEventType, name: string, properties?: Record<string, any>): Promise<void> {
    // Verificar si las analíticas están habilitadas
    const featuresConfig = configService.getSection("features")

    if (!featuresConfig.analytics) {
      return
    }

    try {
      // Crear evento
      const event: AnalyticsEvent = {
        type,
        name,
        timestamp: Date.now(),
        properties,
        userId: await this.getUserId(),
        sessionId: this.sessionId,
      }

      // Añadir evento a la cola
      this.addEventToQueue(event)

      // Si es un evento importante, enviar inmediatamente
      if (type === AnalyticsEventType.ERROR || type === AnalyticsEventType.CONVERSION) {
        this.flushEvents()
      }
    } catch (error) {
      errorService.captureError(error, ErrorType.UNKNOWN, {
        method: "track_event",
        eventType: type,
        eventName: name,
      })
    }
  }

  /**
   * Registra una vista de pantalla
   */
  trackScreenView(screenName: string, properties?: Record<string, any>): void {
    this.trackEvent(AnalyticsEventType.SCREEN_VIEW, screenName, properties)
  }

  /**
   * Registra una acción del usuario
   */
  trackUserAction(actionName: string, properties?: Record<string, any>): void {
    this.trackEvent(AnalyticsEventType.USER_ACTION, actionName, properties)
  }

  /**
   * Registra un error
   */
  trackError(errorName: string, properties?: Record<string, any>): void {
    this.trackEvent(AnalyticsEventType.ERROR, errorName, properties)
  }

  /**
   * Registra una métrica de rendimiento
   */
  trackPerformance(metricName: string, properties?: Record<string, any>): void {
    this.trackEvent(AnalyticsEventType.PERFORMANCE, metricName, properties)
  }

  /**
   * Establece propiedades del usuario
   */
  async setUserProperties(properties: Record<string, any>): Promise<void> {
    try {
      const userId = await this.getUserId()

      if (!userId) {
        return
      }

      const userPropertiesJson = mmkvStorage.getString(this.userPropertiesKey)
      const userProperties = userPropertiesJson ? JSON.parse(userPropertiesJson) : {}

      userProperties[userId] = {
        ...(userProperties[userId] || {}),
        ...properties,
        lastUpdated: Date.now(),
      }

      mmkvStorage.set(this.userPropertiesKey, JSON.stringify(userProperties))
    } catch (error) {
      errorService.captureError(error, ErrorType.UNKNOWN, {
        method: "set_user_properties",
      })
    }
  }

  /**
   * Inicia una nueva sesión de analíticas
   */
  startSession(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

    // Guardar información de sesión
    mmkvStorage.set(
      this.sessionKey,
      JSON.stringify({
        id: this.sessionId,
        startTime: Date.now(),
        device: Platform.OS,
        version: "1.0.0", // Versión de ejemplo
        buildNumber: "1", // Build de ejemplo
      }),
    )

    // Registrar evento de inicio de sesión
    this.trackEvent(AnalyticsEventType.USER_ACTION, "session_start", {
      sessionId: this.sessionId,
    })
  }

  /**
   * Finaliza la sesión actual
   */
  endSession(): void {
    if (!this.sessionId) {
      return
    }

    // Registrar evento de fin de sesión
    this.trackEvent(AnalyticsEventType.USER_ACTION, "session_end", {
      sessionId: this.sessionId,
      duration: Date.now() - this.getSessionStartTime(),
    })

    // Enviar eventos pendientes
    this.flushEvents()

    // Limpiar sesión
    this.sessionId = null
    mmkvStorage.delete(this.sessionKey)
  }

  /**
   * Obtiene el tiempo de inicio de la sesión actual
   */
  private getSessionStartTime(): number {
    const sessionJson = mmkvStorage.getString(this.sessionKey)

    if (!sessionJson) {
      return Date.now()
    }

    try {
      const session = JSON.parse(sessionJson)
      return session.startTime || Date.now()
    } catch (error) {
      return Date.now()
    }
  }

  /**
   * Inicia el envío periódico de eventos
   */
  private startEventFlushing(): void {
    if (this.flushIntervalId) {
      clearInterval(this.flushIntervalId)
    }

    this.flushIntervalId = setInterval(() => {
      this.flushEvents()
    }, this.flushInterval)
  }

  /**
   * Detiene el envío periódico de eventos
   */
  stopEventFlushing(): void {
    if (this.flushIntervalId) {
      clearInterval(this.flushIntervalId)
      this.flushIntervalId = null
    }
  }

  /**
   * Añade un evento a la cola
   */
  private addEventToQueue(event: AnalyticsEvent): void {
    const eventsJson = mmkvStorage.getString(this.eventsKey)
    const events = eventsJson ? JSON.parse(eventsJson) : []

    // Añadir evento a la cola
    events.push(event)

    // Limitar tamaño de la cola
    if (events.length > this.maxQueueSize) {
      events.splice(0, events.length - this.maxQueueSize)
    }

    // Guardar cola actualizada
    mmkvStorage.set(this.eventsKey, JSON.stringify(events))
  }

  /**
   * Envía los eventos pendientes al servidor
   */
  async flushEvents(): Promise<void> {
    try {
      const eventsJson = mmkvStorage.getString(this.eventsKey)

      if (!eventsJson) {
        return
      }

      const events = JSON.parse(eventsJson)

      if (events.length === 0) {
        return
      }

      // Procesar eventos en lotes
      for (let i = 0; i < events.length; i += this.batchSize) {
        const batch = events.slice(i, i + this.batchSize)

        // Enviar lote al servidor
        const success = await this.sendEventsToServer(batch)

        if (!success) {
          // Si falla, dejar los eventos restantes en la cola
          const remainingEvents = events.slice(i)
          mmkvStorage.set(this.eventsKey, JSON.stringify(remainingEvents))
          return
        }
      }

      // Si todos los lotes se enviaron correctamente, limpiar la cola
      mmkvStorage.set(this.eventsKey, JSON.stringify([]))
    } catch (error) {
      errorService.captureError(error, ErrorType.NETWORK, {
        method: "flush_analytics_events",
      })
    }
  }

  /**
   * Envía eventos al servidor
   */
  private async sendEventsToServer(events: AnalyticsEvent[]): Promise<boolean> {
    // En una aplicación real, esto enviaría los eventos a un servidor de analíticas
    // Por ahora, simulamos un envío exitoso
    console.log(`Enviando ${events.length} eventos de analítica al servidor`)

    // Simular éxito
    return true
  }

  /**
   * Obtiene el ID del usuario actual
   */
  private async getUserId(): Promise<string | null> {
    try {
      const activeProfile = await profileService.getActiveProfile()
      return activeProfile?.id || null
    } catch (error) {
      return null
    }
  }
}

export const analyticsService = new AnalyticsService()
