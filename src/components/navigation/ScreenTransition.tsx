"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Animated, StyleSheet, Dimensions } from "react-native"

const { width, height } = Dimensions.get("window")

interface ScreenTransitionProps {
  children: React.ReactNode
  type?: "fade" | "slide" | "zoom" | "none"
  duration?: number
  delay?: number
  style?: any
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  type = "fade",
  duration = 300,
  delay = 0,
  style,
}) => {
  // Valores de animación
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateYAnim = useRef(new Animated.Value(50)).current
  const translateXAnim = useRef(new Animated.Value(width)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    // Configurar animación según el tipo
    let animation

    switch (type) {
      case "fade":
        animation = Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ])
        break
      case "slide":
        animation = Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration,
            delay,
            useNativeDriver: true,
          }),
        ])
        break
      case "zoom":
        animation = Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            delay,
            useNativeDriver: true,
          }),
        ])
        break
      case "none":
        fadeAnim.setValue(1)
        translateYAnim.setValue(0)
        scaleAnim.setValue(1)
        break
      default:
        animation = Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        })
    }

    // Iniciar animación
    if (animation) {
      animation.start()
    }

    // Limpiar animación al desmontar
    return () => {
      if (animation && animation.stop) {
        animation.stop()
      }
    }
  }, [type, duration, delay, fadeAnim, translateYAnim, translateXAnim, scaleAnim])

  // Configurar estilos según el tipo de animación
  const getAnimatedStyle = () => {
    switch (type) {
      case "fade":
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      case "slide":
        return {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        }
      case "zoom":
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      case "none":
      default:
        return {
          opacity: 1,
        }
    }
  }

  return <Animated.View style={[styles.container, getAnimatedStyle(), style]}>{children}</Animated.View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
