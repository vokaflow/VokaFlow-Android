import { InteractionManager, Platform, NativeModules } from "react-native"

declare const __DEV__: boolean

class MemoryService {
  /**
   * Libera memoria no utilizada
   */
  async freeMemory(): Promise<void> {
    if (Platform.OS === "ios") {
      // En iOS, sugerir al recolector de basura que se ejecute
      if (global.gc) {
        global.gc()
      }
    } else if (Platform.OS === "android") {
      // En Android, intentar liberar memoria a través de Java
      try {
        const { MemoryOptimizer } = NativeModules
        if (MemoryOptimizer && MemoryOptimizer.trimMemory) {
          await MemoryOptimizer.trimMemory()
        }
      } catch (error) {
        console.warn("Error al intentar liberar memoria en Android:", error)
      }
    }
  }

  /**
   * Libera memoria después de que las interacciones de la interfaz hayan terminado
   */
  freeMemoryAfterInteractions(): void {
    InteractionManager.runAfterInteractions(() => {
      this.freeMemory()
    })
  }

  /**
   * Monitorea el uso de memoria (solo para desarrollo)
   */
  startMemoryMonitoring(intervalMs = 10000): () => void {
    if (!__DEV__) return () => {}

    const intervalId = setInterval(() => {
      if (global.performance && global.performance.memory) {
        const memoryInfo = global.performance.memory
        console.log("Uso de memoria:", {
          totalJSHeapSize: this.formatBytes(memoryInfo.totalJSHeapSize),
          usedJSHeapSize: this.formatBytes(memoryInfo.usedJSHeapSize),
          jsHeapSizeLimit: this.formatBytes(memoryInfo.jsHeapSizeLimit),
        })
      }
    }, intervalMs)

    return () => clearInterval(intervalId)
  }

  /**
   * Formatea bytes a una unidad legible
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}

export const memoryService = new MemoryService()
