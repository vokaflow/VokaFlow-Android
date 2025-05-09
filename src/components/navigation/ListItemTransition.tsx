"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Animated, StyleSheet, type ViewStyle } from "react-native"

export type AnimationType = "fade" | "slide-up" | "slide-right" | "scale" | "fade-scale"

interface ListItemTransitionProps {
  children: React.ReactNode
  index: number
  duration?: number
  delay?: number
  style?: ViewStyle
  type?: AnimationType
  enabled?: boolean
}

export const ListItemTransition: React.FC<ListItemTransitionProps> = ({
  children,
  index,
  duration = 300,
  delay = 0,
  style,
  type = "slide-up",
  enabled = true,
}) => {
  // Valores de animación
  const opacity = useRef(new Animated.Value(enabled ? 0 : 1)).current
  const translateY = useRef(new Animated.Value(enabled ? 50 : 0)).current
  const translateX = useRef(new Animated.Value(enabled ? -50 : 0)).current
  const scale = useRef(new Animated.Value(enabled ? 0.8 : 1)).current

  useEffect(() => {
    if (!enabled) return

    // Calcular retraso basado en el índice
    const itemDelay = delay + index * 50

    // Configurar animaciones según el tipo
    const animations = []

    if (type === "fade" || type === "fade-scale") {
      animations.push(
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay: itemDelay,
          useNativeDriver: true,
        }),
      )
    }

    if (type === "slide-up") {
      animations.push(
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay: itemDelay,
          useNativeDriver: true,
        }),
      )
      if (!animations.find((a) => a.config?.toValue === opacity)) {
        animations.push(
          Animated.timing(opacity, {
            toValue: 1,
            duration,
            delay: itemDelay,
            useNativeDriver: true,
          }),
        )
      }
    }

    if (type === "slide-right") {
      animations.push(
        Animated.timing(translateX, {
          toValue: 0,
          duration,
          delay: itemDelay,
          useNativeDriver: true,
        }),
      )
      if (!animations.find((a) => a.config?.toValue === opacity)) {
        animations.push(
          Animated.timing(opacity, {
            toValue: 1,
            duration,
            delay: itemDelay,
            useNativeDriver: true,
          }),
        )
      }
    }

    if (type === "scale" || type === "fade-scale") {
      animations.push(
        Animated.timing(scale, {
          toValue: 1,
          duration,
          delay: itemDelay,
          useNativeDriver: true,
        }),
      )
    }

    // Iniciar animaciones
    Animated.parallel(animations).start()

    // Limpiar animación al desmontar
    return () => {
      animations.forEach((anim) => anim.stop())
    }
  }, [opacity, translateY, translateX, scale, index, duration, delay, type, enabled])

  // Configurar transformaciones según el tipo de animación
  const getAnimatedStyle = () => {
    const animatedStyle: any = {}

    if (type === "fade" || type === "fade-scale") {
      animatedStyle.opacity = opacity
    }

    const transform = []

    if (type === "slide-up") {
      transform.push({ translateY })
      if (!animatedStyle.opacity) {
        animatedStyle.opacity = opacity
      }
    }

    if (type === "slide-right") {
      transform.push({ translateX })
      if (!animatedStyle.opacity) {
        animatedStyle.opacity = opacity
      }
    }

    if (type === "scale" || type === "fade-scale") {
      transform.push({ scale })
    }

    if (transform.length > 0) {
      animatedStyle.transform = transform
    }

    return animatedStyle
  }

  return <Animated.View style={[styles.container, getAnimatedStyle(), style]}>{children}</Animated.View>
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
})
