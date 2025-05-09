import { InteractionManager } from "react-native"
import { mmkvStorage } from "../services/storage/mmkv"

/**
 * Utilidad para optimizar el rendimiento de la aplicación
 */
export const performance = {
  /**
   * Ejecuta una tarea después de que las interacciones de la interfaz hayan terminado
   * para evitar bloqueos en la UI
   */
  runAfterInteractions: (task: () => any): Promise<any> => {
    return InteractionManager.runAfterInteractions(() => {
      return task();
    });
  },

  /**
   * Almacena en caché el resultado de una función costosa
   */
  memoize: <T>(fn: (...args: any[]) => T, getKey: (...args: any[]) => string): ((...args: any[]) => T) => {
    const cache: Record<string, { value: T; timestamp: number }> = {};
    
    return (...args: any[]): T => {
      const key = getKey(...args);
      const now = Date.now();
      
      // Si el resultado está en caché y no ha expirado (1 hora)
      if (cache[key] && now - cache[key].timestamp < 3600000) {
        return cache[key].value;
      }
      
      // Calcular el resultado y almacenarlo en caché
      const result = fn(...args);
      cache[key] = { value: result, timestamp: now };
      return result;
    };
  },

  /**
   * Almacena en caché el resultado de una función asíncrona costosa
   */
  memoizeAsync: <T>(
    fn: (...args: any[]) => Promise<T>,
    getKey: (...args: any[]) => string,
    ttlMs: number = 3600000 // 1 hora por defecto
  ): ((...args: any[]) => Promise<T>) => {
    const cachePrefix = 'perf_cache_';
    
    return async (...args: any[]): Promise<T> => {
      const key = `${cachePrefix}${getKey(...args)}`;
      const now = Date.now();
      const cached = mmkvStorage.getString(key);
      
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.timestamp && parsed.value) {
            const { value, timestamp } = parsed;
            if (now - timestamp < ttlMs) {
              return value as T;
            }
          }
        } catch (error) {
          // Si falla el parseo, se ignora la caché y se recalcula
          console.warn("Error parsing cache:", error);
        }
      }
      
      const result = await fn(...args);
      mmkvStorage.set(key, JSON.stringify({ value: result, timestamp: now }));
      return result;
    };
  },

  /**
   * Limpia la caché de rendimiento
   */
  clearCache: () => {
    const allKeys = mmkvStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith('perf_cache_'));
    
    cacheKeys.forEach(key => {
      mmkvStorage.delete(key);
    });
  }
};
