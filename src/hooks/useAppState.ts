"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { AppState, type AppStateStatus } from "react-native"
import { statsService } from "../services/stats"
import { connectivityService } from "../services/connectivity"

/**
 * Hook para gestionar el estado de la aplicación (foreground/background)
 * y realizar acciones automáticas según el estado
 */
export function useAppState() {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState)
  const [isActive, setIsActive] = useState<boolean>(appState === "active")
  const lastActiveTimestamp = useRef<number>(Date.now())
  const backgroundTime = useRef<number>(0)

  // Manejar cambios en el estado de la aplicación
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      const now = Date.now()

      // Si la app pasa de activa a background
      if (appState === "active" && nextAppState.match(/inactive|background/)) {
        lastActiveTimestamp.current = now
      }

      // Si la app vuelve a estar activa
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        // Calcular tiempo en background (en minutos)
        backgroundTime.current = Math.round((now - lastActiveTimestamp.current) / 60000)

        // Si estuvo más de 1 minuto en background, registrar
        if (backgroundTime.current >= 1) {
          // Verificar conectividad al volver
          connectivityService.checkConnectivity()

          // Registrar tiempo inactivo
          statsService.logOfflineTime(backgroundTime.current)
        }
      }

      setAppState(nextAppState)
      setIsActive(nextAppState === "active")
    },
    [appState],
  )

  // Suscribirse a cambios de estado de la aplicación
  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [handleAppStateChange])

  // Devolver estado actual y tiempo en background
  return {
    appState,
    isActive,
    backgroundTime: backgroundTime.current,
  }
}
