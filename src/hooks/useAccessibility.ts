"use client"

import { useState, useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import accessibilityService, { contrastLevels } from "../services/accessibility"
import { setAccessibilityConfig } from "../store/slices/accessibilitySlice"
import type { RootState } from "../store"

export const useAccessibility = () => {
  const dispatch = useDispatch()
  const { config } = useSelector((state: RootState) => state.accessibility)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = await accessibilityService.getAccessibilityConfig()
        dispatch(setAccessibilityConfig(savedConfig))
        setIsLoaded(true)
      } catch (error) {
        console.error("Error loading accessibility config:", error)
        setIsLoaded(true)
      }
    }

    if (!isLoaded) {
      loadConfig()
    }
  }, [dispatch, isLoaded])

  // Actualizar configuración
  const updateConfig = useCallback(
    async (newConfig) => {
      try {
        const updatedConfig = await accessibilityService.saveAccessibilityConfig({
          ...config,
          ...newConfig,
        })
        dispatch(setAccessibilityConfig(updatedConfig))
        return true
      } catch (error) {
        console.error("Error updating accessibility config:", error)
        return false
      }
    },
    [config, dispatch],
  )

  // Calcular tamaño de fuente
  const fontSize = useCallback(
    (size) => {
      return accessibilityService.calculateFontSize(size, config)
    },
    [config],
  )

  // Obtener tamaños de elementos táctiles
  const touchSize = useCallback(() => {
    return accessibilityService.calculateTouchSize(config)
  }, [config])

  // Proporcionar feedback táctil
  const provideFeedback = useCallback(
    (type) => {
      return accessibilityService.provideFeedback(type, config)
    },
    [config],
  )

  // Verificar contraste
  const checkContrast = useCallback((foreground, background) => {
    return accessibilityService.checkContrast(foreground, background)
  }, [])

  // Generar propiedades de accesibilidad
  const a11yProps = useCallback((label, hint, role = "button", state = {}) => {
    return accessibilityService.getAccessibilityProps(label, hint, role, state)
  }, [])

  // Obtener colores según nivel de contraste
  const getContrastColors = useCallback(() => {
    return contrastLevels[config?.highContrast || "normal"]
  }, [config])

  // Nuevas funciones para animaciones

  // Verificar si las animaciones están habilitadas globalmente
  const areAnimationsEnabled = useCallback(() => {
    return !config?.reduceMotion && accessibilityService.getAnimationConfig(config).enabled
  }, [config])

  // Verificar si un tipo específico de animación está habilitado
  const isAnimationTypeEnabled = useCallback(
    (type) => {
      return accessibilityService.isAnimationTypeEnabled(type, config)
    },
    [config],
  )

  // Calcular duración de animación según preferencias
  const getAnimationDuration = useCallback(
    (baseDuration) => {
      return accessibilityService.calculateAnimationDuration(baseDuration, config)
    },
    [config],
  )

  // Obtener complejidad de animación según preferencias
  const getAnimationComplexity = useCallback(() => {
    return accessibilityService.getAnimationComplexity(config)
  }, [config])

  // Obtener configuración completa de animación
  const getAnimationConfig = useCallback(() => {
    return accessibilityService.getAnimationConfig(config)
  }, [config])

  return {
    config,
    isLoaded,
    updateConfig,
    fontSize,
    touchSize,
    provideFeedback,
    checkContrast,
    a11yProps,
    getContrastColors,
    // Nuevas funciones para animaciones
    areAnimationsEnabled,
    isAnimationTypeEnabled,
    getAnimationDuration,
    getAnimationComplexity,
    getAnimationConfig,
  }
}
