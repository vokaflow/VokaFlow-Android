"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Text, type ViewStyle } from "react-native"
import { useTheme } from "../../hooks/useTheme"

type ProgressVariant = "default" | "gradient" | "striped" | "neon"

interface ProgressBarProps {
  progress: number // 0 to 100
  variant?: ProgressVariant
  height?: number
  width?: number | string
  showPercentage?: boolean
  color?: string
  backgroundColor?: string
  style?: ViewStyle
  animated?: boolean
  label?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = "default",
  height = 8,
  width = "100%",
  showPercentage = false,
  color,
  backgroundColor,
  style,
  animated = true,
  label,
}) => {
  const { colors } = useTheme()
  const progressColor = color || colors.primary
  const bgColor = backgroundColor || colors.background.secondary

  // Valor animado para el progreso
  const progressAnim = useRef(new Animated.Value(0)).current
  // Valor animado para el efecto de brillo
  const shineAnim = useRef(new Animated.Value(-100)).current
  // Valor animado para el efecto de pulso neón
  const neonAnim = useRef(new Animated.Value(0)).current

  // Actualizar la animación cuando cambia el progreso
  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start()
    } else {
      progressAnim.setValue(progress)
    }
  }, [progress, animated, progressAnim])

  // Animaciones adicionales según la variante
  useEffect(() => {
    if (variant === "striped" || variant === "gradient") {
      Animated.loop(
        Animated.timing(shineAnim, {
          toValue: 100,
          duration: 1500,
          useNativeDriver: false,
        }),
      ).start()
    }

    if (variant === "neon") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(neonAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(neonAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      ).start()
    }
  }, [variant, shineAnim, neonAnim])

  // Interpolación para el ancho de la barra de progreso
  const width_interpolated = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  })

  // Renderizar la barra de progreso según la variante
  const renderProgressBar = () => {
    switch (variant) {
      case "gradient":
        return (
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: width_interpolated,
                height,
                backgroundColor: progressColor,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.shine,
                {
                  transform: [{ translateX: shineAnim }],
                },
              ]}
            />
          </Animated.View>
        )

      case "striped":
        return (
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: width_interpolated,
                height,
                backgroundColor: progressColor,
              },
            ]}
          >
            <View style={styles.stripes} />
          </Animated.View>
        )

      case "neon":
        return (
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: width_interpolated,
                height,
                backgroundColor: progressColor,
                shadowColor: progressColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: neonAnim,
                shadowRadius: height / 2,
                elevation: 5,
              },
            ]}
          />
        )

      default:
        return (
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: width_interpolated,
                height,
                backgroundColor: progressColor,
              },
            ]}
          />
        )
    }
  }

  return (
    <View style={[styles.container, { width }, style]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View style={[styles.progressContainer, { height, backgroundColor: bgColor }]}>{renderProgressBar()}</View>
      {showPercentage && (
        <Animated.Text style={[styles.percentage, { color: colors.text }]}>
          {progressAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ["0%", "100%"],
          })}
        </Animated.Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressContainer: {
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  shine: {
    width: 30,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    position: "absolute",
    top: 0,
    left: 0,
    transform: [{ skewX: "-20deg" }],
  },
  stripes: {
    width: "100%",
    height: "100%",
    backgroundImage:
      "linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)",
    backgroundSize: "1rem 1rem",
  },
})
