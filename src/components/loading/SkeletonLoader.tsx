"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { StyleSheet, Animated, type ViewStyle, Easing } from "react-native"
import { useTheme } from "../../hooks/useTheme"

type SkeletonShape = "rectangle" | "circle" | "text" | "card" | "avatar" | "button"
type SkeletonVariant = "default" | "wave" | "pulse" | "neon"

interface SkeletonLoaderProps {
  shape?: SkeletonShape
  variant?: SkeletonVariant
  width?: number | string
  height?: number | string
  borderRadius?: number
  style?: ViewStyle
  children?: React.ReactNode
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  shape = "rectangle",
  variant = "default",
  width,
  height,
  borderRadius,
  style,
  children,
}) => {
  const { colors, isDark } = useTheme()
  const animatedValue = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0.3)).current

  // Determinar dimensiones basadas en la forma
  const getDimensions = (): { width: number | string; height: number | string; borderRadius: number } => {
    switch (shape) {
      case "circle":
        return {
          width: width || 50,
          height: height || 50,
          borderRadius: 1000,
        }
      case "text":
        return {
          width: width || "100%",
          height: height || 16,
          borderRadius: 4,
        }
      case "card":
        return {
          width: width || "100%",
          height: height || 120,
          borderRadius: 8,
        }
      case "avatar":
        return {
          width: width || 40,
          height: height || 40,
          borderRadius: 1000,
        }
      case "button":
        return {
          width: width || 120,
          height: height || 40,
          borderRadius: 8,
        }
      default:
        return {
          width: width || 100,
          height: height || 100,
          borderRadius: borderRadius || 4,
        }
    }
  }

  const dimensions = getDimensions()

  useEffect(() => {
    // Animación según la variante
    switch (variant) {
      case "wave":
        Animated.loop(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1500,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
        ).start()
        break
      case "pulse":
        Animated.loop(
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.6,
              duration: 800,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0.3,
              duration: 800,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
          ]),
        ).start()
        break
      case "neon":
        Animated.loop(
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.8,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0.4,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
          ]),
        ).start()
        break
      default:
        Animated.loop(
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.5,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0.3,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
          ]),
        ).start()
    }
  }, [variant, animatedValue, fadeAnim])

  // Interpolación para la animación de onda
  const gradientTranslate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-dimensions.width, dimensions.width],
  })

  // Estilos según la variante
  const getSkeletonStyle = () => {
    const baseStyle = {
      width: dimensions.width,
      height: dimensions.height,
      borderRadius: dimensions.borderRadius,
    }

    switch (variant) {
      case "wave":
        return {
          ...baseStyle,
          backgroundColor: isDark ? colors.background.secondary : colors.background.tertiary,
          overflow: "hidden",
        }
      case "pulse":
        return {
          ...baseStyle,
          backgroundColor: isDark ? colors.background.secondary : colors.background.tertiary,
          opacity: fadeAnim,
        }
      case "neon":
        return {
          ...baseStyle,
          backgroundColor: isDark ? colors.background.secondary : colors.background.tertiary,
          borderWidth: 1,
          borderColor: colors.primary,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: fadeAnim,
          shadowRadius: 5,
          elevation: 5,
        }
      default:
        return {
          ...baseStyle,
          backgroundColor: isDark ? colors.background.secondary : colors.background.tertiary,
          opacity: fadeAnim,
        }
    }
  }

  return (
    <Animated.View style={[getSkeletonStyle(), style]}>
      {variant === "wave" && (
        <Animated.View
          style={[
            styles.wave,
            {
              transform: [{ translateX: gradientTranslate }],
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.3)",
            },
          ]}
        />
      )}
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wave: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
})
