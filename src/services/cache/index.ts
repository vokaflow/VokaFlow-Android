import { mmkvStorage } from "../storage/mmkv"
import { errorService, ErrorType } from "../error"

// Interfaz para elementos en caché
interface CacheItem<T> {
  value: T
  timestamp: number
  expiry: number | null
}

class CacheService {
  private readonly cachePrefix = "cache_"

  /**
   * Guarda un valor en caché
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    try {
      const cacheKey = this.getCacheKey(key)
      const item: CacheItem<T> = {
        value,
        timestamp: Date.now(),
        expiry: ttlMs ? Date.now() + ttlMs : null,
      }

      mmkvStorage.set(cacheKey, JSON.stringify(item))
    } catch (error) {
      errorService.captureError(error, ErrorType.UNKNOWN, {
        method: "cache_set",
        key,
      })
    }
  }

  /**
   * Obtiene un valor de la caché
   */
  get<T>(key: string): T | null {
    try {
      const cacheKey = this.getCacheKey(key)
      const itemJson = mmkvStorage.getString(cacheKey)

      if (!itemJson) {
        return null
      }

      const item: CacheItem<T> = JSON.parse(itemJson)

      // Verificar si el elemento ha expirado
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key)
        return null
      }

      return item.value
    } catch (error) {
      errorService.captureError(error, ErrorType.UNKNOWN, {
        method: "cache_get",
        key,
      })
      return null
    }
  }

  /**
   * Elimina un valor de la caché
   */
  remove(key: string): void {
    try {
      const cacheKey = this.getCacheKey(key)
      mmkvStorage.delete(cacheKey)
    } catch (error) {
      errorService.captureError(error, ErrorType.UNKNOWN, {
        method: "cache_remove",
        key,
      })
    }
  }

  /**
   * Verifica si un valor existe en la caché y no ha expirado
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Limpia toda la caché
   */
  clear(): void {
    try {
      const allKeys = mmkvStorage.getAllKeys()
      const cacheKeys = allKeys.filter((key) => key.startsWith(this.cachePrefix))

      cacheKeys.forEach((key) => {
        mmkvStorage.delete(key)
      })
    } catch (error) {
      errorService.captureError(error, ErrorType.UNKNOWN, {
        method: "cache_clear",
      })
    }
  }

  /**
   * Limpia los elementos expirados de la caché
   */
  clearExpired(): void {
    try {
      const allKeys = mmkvStorage.getAllKeys()
      const cacheKeys = allKeys.filter((key) => key.startsWith(this.cachePrefix))

      cacheKeys.forEach((key) => {
        const itemJson = mmkvStorage.getString(key)

        if (itemJson) {
          try {
            const item = JSON.parse(itemJson)

            if (item.expiry && Date.now() > item.expiry) {
              mmkvStorage.delete(key)
            }
          } catch (e) {
            // Si hay un error al parsear, eliminar el elemento
            mmkvStorage.delete(key)
          }
        }
      })
    } catch (error) {
      errorService.captureError(error, ErrorType.UNKNOWN, {
        method: "cache_clear_expired",
      })
    }
  }

  /**
   * Obtiene información sobre el uso de la caché
   */
  getStats(): { count: number; size: number; oldestTimestamp: number | null } {
    try {
      const allKeys = mmkvStorage.getAllKeys()
      const cacheKeys = allKeys.filter((key) => key.startsWith(this.cachePrefix))

      let totalSize = 0
      let oldestTimestamp: number | null = null

      cacheKeys.forEach((key) => {
        const itemJson = mmkvStorage.getString(key)

        if (itemJson) {
          totalSize += itemJson.length

          try {
            const item = JSON.parse(itemJson)

            if (item.timestamp && (!oldestTimestamp || item.timestamp < oldestTimestamp)) {
              oldestTimestamp = item.timestamp
            }
          } catch (e) {
            // Ignorar errores de parseo
          }
        }
      })

      return {
        count: cacheKeys.length,
        size: totalSize,
        oldestTimestamp,
      }
    } catch (error) {
      errorService.captureError(error, ErrorType.UNKNOWN, {
        method: "cache_get_stats",
      })

      return {
        count: 0,
        size: 0,
        oldestTimestamp: null,
      }
    }
  }

  /**
   * Obtiene la clave de caché completa
   */
  private getCacheKey(key: string): string {
    return `${this.cachePrefix}${key}`
  }
}

export const cacheService = new CacheService()
