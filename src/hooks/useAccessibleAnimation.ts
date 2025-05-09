"use client"

import { useRef, useEffect, useState } from "react"
import { Animated, Easing } from "react-native"
import { useAccessibility } from "./useAccessibility"

type AnimationType = "fade" | "slide" | "scale" | "rotate" | "bounce" | "flip" | "pulse" | "shake"

interface UseAccessibleAnimationProps {
  type: AnimationType
  enabled?: boolean
  baseDuration?: number
  animationType?: "parallax" | "transitions" | "notifications" | "buttons" | "loaders" | "icons" | "backgrounds"
  initialValue?: number
  finalValue?: number
  autoPlay?: boolean
  loop?: boolean
  easing?: (value: number) => number
}

export const useAccessibleAnimation = ({
  type,
  enabled = true,
  baseDuration = 300,
  animationType = "transitions",
  initialValue = 0,
  finalValue = 1,
  autoPlay = true,
  loop = false,
  easing = Easing.inOut(Easing.ease),
}: UseAccessibleAnimationProps) => {
  const { areAnimationsEnabled, isAnimationTypeEnabled, getAnimationDuration, getAnimationComplexity } =
    useAccessibility()
  const animatedValue = useRef(new Animated.Value(initialValue)).current
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true)

  // Determinar si la animación está habilitada según las preferencias de accesibilidad
  useEffect(() => {
    const globalAnimationsEnabled = areAnimationsEnabled()
    const specificAnimationEnabled = isAnimationTypeEnabled(animationType)

    setIsAnimationEnabled(globalAnimationsEnabled && specificAnimationEnabled && enabled)
  }, [areAnimationsEnabled, isAnimationTypeEnabled, animationType, enabled])

  // Calcular duración según preferencias de accesibilidad
  const duration = getAnimationDuration(baseDuration)

  // Obtener complejidad de animación
  const complexity = getAnimationComplexity()

  // Función para iniciar la animación
  const play = () => {
    if (!isAnimationEnabled) {
      // Si las animaciones están desactivadas, establecer directamente el valor final
      animatedValue.setValue(finalValue)
      return
    }

    setIsPlaying(true)

    // Crear la animación según el tipo
    let animation

    switch (type) {
      case "fade":
        animation = Animated.timing(animatedValue, {
          toValue: finalValue,
          duration,
          easing,
          useNativeDriver: true,
        })
        break
      case "slide":
        animation = Animated.spring(animatedValue, {
          toValue: finalValue,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
        break
      case "scale":
        animation = Animated.spring(animatedValue, {
          toValue: finalValue,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
        break
      case "rotate":
        animation = Animated.timing(animatedValue, {
          toValue: finalValue,
          duration,
          easing,
          useNativeDriver: true,
        })
        break
      case "bounce":
        // Simplificar la animación si la complejidad es "minimal"
        if (complexity === "minimal") {
          animation = Animated.spring(animatedValue, {
            toValue: finalValue,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          })
        } else {
          animation = Animated.sequence([
            Animated.spring(animatedValue, {
              toValue: finalValue * 1.2,
              tension: 80,
              friction: 5,
              useNativeDriver: true,
            }),
            Animated.spring(animatedValue, {
              toValue: finalValue * 0.9,
              tension: 80,
              friction: 5,
              useNativeDriver: true,
            }),
            Animated.spring(animatedValue, {
              toValue: finalValue,
              tension: 80,
              friction: 5,
              useNativeDriver: true,
            }),
          ])
        }
        break
      case "flip":
        animation = Animated.timing(animatedValue, {
          toValue: finalValue,
          duration,
          easing,
          useNativeDriver: true,
        })
        break
      case "pulse":
        // Simplificar la animación si la complejidad es "minimal"
        if (complexity === "minimal") {
          animation = Animated.timing(animatedValue, {
            toValue: finalValue,
            duration,
            easing,
            useNativeDriver: true,
          })
        } else {
          animation = Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: finalValue * 1.1,
              duration: duration / 2,
              easing,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: finalValue,
              duration: duration / 2,
              easing,
              useNativeDriver: true,
            }),
          ])
        }
        break
      case "shake":
        // Simplificar la animación si la complejidad es "minimal"
        if (complexity === "minimal") {
          animation = Animated.timing(animatedValue, {
            toValue: finalValue,
            duration,
            easing,
            useNativeDriver: true,
          })
        } else {
          animation = Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: finalValue * -0.5,
              duration: duration / 4,
              easing,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: finalValue * 0.5,
              duration: duration / 4,
              easing,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: finalValue * -0.25,
              duration: duration / 4,
              easing,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: finalValue,
              duration: duration / 4,
              easing,
              useNativeDriver: true,
            }),
          ])
        }
        break
      default:
        animation = Animated.timing(animatedValue, {
          toValue: finalValue,
          duration,
          easing,
          useNativeDriver: true,
        })
    }

    // Configurar animación en bucle si es necesario
    if (loop) {
      Animated.loop(animation).start()
    } else {
      animation.start(({ finished }) => {
        if (finished) {
          setIsPlaying(false)
        }
      })
    }
  }

  // Función para pausar la animación
  const pause = () => {
    setIsPlaying(false)
    animatedValue.stopAnimation()
  }

  // Función para reiniciar la animación
  const reset = () => {
    animatedValue.setValue(initialValue)
    setIsPlaying(false)
  }

  // Función para invertir la animación
  const reverse = () => {
    if (!isAnimationEnabled) {
      // Si las animaciones están desactivadas, establecer directamente el valor inicial
      animatedValue.setValue(initialValue)
      return
    }

    setIsPlaying(true)

    Animated.timing(animatedValue, {
      toValue: initialValue,
      duration,
      easing,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsPlaying(false)
      }
    })
  }

  // Iniciar la animación automáticamente si autoPlay es true
  useEffect(() => {
    if (autoPlay) {
      play()
    }

    // Limpiar animación al desmontar
    return () => {
      animatedValue.stopAnimation()
    }
  }, [isAnimationEnabled]) // Re-ejecutar cuando cambie isAnimationEnabled

  return {
    animatedValue,
    play,
    pause,
    reset,
    reverse,
    isPlaying,
    isEnabled: isAnimationEnabled,
  }
}
