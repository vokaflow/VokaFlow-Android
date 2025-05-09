"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Animated, StyleSheet, View, type ImageProps } from "react-native"

interface AnimatedLogoProps {
  size?: "small" | "medium" | "large" | "xlarge"
  style?: ImageProps["style"]
  animation?: "fade" | "scale" | "pulse" | "bounce" | "none"
  duration?: number
  delay?: number
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = "medium",
  style,
  animation = "fade",
  duration = 1000,
  delay = 0,
}) => {
  // Valores de animación
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const bounceAnim = useRef(new Animated.Value(0)).current

  // Determinar tamaño basado en la prop
  const getDimensions = () => {
    switch (size) {
      case "small":
        return { width: 60, height: 60 }
      case "medium":
        return { width: 100, height: 100 }
      case "large":
        return { width: 150, height: 150 }
      case "xlarge":
        return { width: 200, height: 200 }
      default:
        return { width: 100, height: 100 }
    }
  }

  const dimensions = getDimensions()

  // Iniciar animación cuando el componente se monte
  useEffect(() => {
    let animationSequence

    switch (animation) {
      case "fade":
        animationSequence = Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        })
        break
      case "scale":
        animationSequence = Animated.parallel([
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
      case "pulse":
        // Iniciar con opacidad completa para pulso
        fadeAnim.setValue(1)
        animationSequence = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        )
        break
      case "bounce":
        // Iniciar con opacidad completa para rebote
        fadeAnim.setValue(1)
        scaleAnim.setValue(1)
        animationSequence = Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -10,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        )
        break
      case "none":
      default:
        // Sin animación, solo establecer valores finales
        fadeAnim.setValue(1)
        scaleAnim.setValue(1)
        break
    }

    if (animationSequence) {
      animationSequence.start()
    }

    // Limpiar animación al desmontar
    return () => {
      if (animationSequence && animationSequence.stop) {
        animationSequence.stop()
      }
    }
  }, [animation, duration, delay, fadeAnim, scaleAnim, bounceAnim])

  // Aplicar transformaciones según el tipo de animación
  const getAnimatedStyle = () => {
    switch (animation) {
      case "fade":
        return {
          opacity: fadeAnim,
        }
      case "scale":
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      case "pulse":
        return {
          transform: [{ scale: scaleAnim }],
        }
      case "bounce":
        return {
          transform: [{ translateY: bounceAnim }],
        }
      case "none":
      default:
        return {}
    }
  }

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../../assets/logo_vokaflow.png")}
        style={[styles.logo, dimensions, getAnimatedStyle(), style]}
        resizeMode="contain"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
})
