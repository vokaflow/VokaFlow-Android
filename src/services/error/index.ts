import { mmkvStorage } from "../storage/mmkv"

// Tipos de errores
export enum ErrorType {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  DATABASE = "database",
  VALIDATION = "validation",
  PERMISSION = "permission",
  UNKNOWN = "unknown",
}

// Interfaz para errores estructurados
export interface AppError {
  type: ErrorType
  code: string
  message: string
  timestamp: number
  data?: any
  stack?: string
}

// Declare __DEV__ if it's not already defined (e.g., in a testing environment)
declare const __DEV__: boolean

class ErrorService {
  private readonly errorLogKey = "error_log"
  private readonly maxLogSize = 100 // Máximo número de errores a almacenar

  /**
   * Captura y registra un error
   */
  captureError(error: Error | any, type: ErrorType = ErrorType.UNKNOWN, data?: any): AppError {
    // Crear error estructurado
    const appError: AppError = {
      type,
      code: error.code || "unknown_error",
      message: error.message || "Se produjo un error desconocido",
      timestamp: Date.now(),
      data,
      stack: error.stack,
    }

    // Registrar error
    this.logError(appError)

    // En desarrollo, mostrar en consola
    if (__DEV__) {
      console.error("Error capturado:", appError)
    }

    return appError
  }

  /**
   * Registra un error en el almacenamiento local
   */
  private logError(error: AppError): void {
    const errors = this.getErrorLog()

    // Añadir nuevo error al principio
    errors.unshift(error)

    // Limitar tamaño del log
    if (errors.length > this.maxLogSize) {
      errors.length = this.maxLogSize
    }

    mmkvStorage.set(this.errorLogKey, JSON.stringify(errors))
  }

  /**
   * Obtiene el registro de errores
   */
  getErrorLog(): AppError[] {
    const log = mmkvStorage.getString(this.errorLogKey)
    return log ? JSON.parse(log) : []
  }

  /**
   * Limpia el registro de errores
   */
  clearErrorLog(): void {
    mmkvStorage.delete(this.errorLogKey)
  }

  /**
   * Obtiene un mensaje amigable para el usuario basado en el tipo de error
   */
  getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return "Hubo un problema de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente."

      case ErrorType.AUTHENTICATION:
        return "Hubo un problema con tu autenticación. Por favor, inicia sesión nuevamente."

      case ErrorType.DATABASE:
        return "Hubo un problema al acceder a los datos. Por favor, intenta nuevamente más tarde."

      case ErrorType.VALIDATION:
        return error.message || "La información proporcionada no es válida. Por favor, verifica e intenta nuevamente."

      case ErrorType.PERMISSION:
        return "No tienes permiso para realizar esta acción."

      default:
        return "Ocurrió un error inesperado. Por favor, intenta nuevamente más tarde."
    }
  }

  /**
   * Determina si un error debe ser reportado al servidor
   */
  shouldReportError(error: AppError): boolean {
    // No reportar errores de validación o permisos
    if (error.type === ErrorType.VALIDATION || error.type === ErrorType.PERMISSION) {
      return false
    }

    // No reportar ciertos errores de red que son comunes
    if (error.type === ErrorType.NETWORK && (error.code === "network_offline" || error.code === "timeout")) {
      return false
    }

    return true
  }

  /**
   * Envía un informe de error al servidor (implementación simulada)
   */
  async reportErrorToServer(error: AppError): Promise<boolean> {
    if (!this.shouldReportError(error)) {
      return false
    }

    try {
      // Aquí iría la lógica para enviar el error a un servicio como Sentry, Firebase Crashlytics, etc.
      console.log("Enviando error al servidor:", error)

      // Simulamos una respuesta exitosa
      return true
    } catch (e) {
      console.error("Error al reportar error:", e)
      return false
    }
  }
}

export const errorService = new ErrorService()
