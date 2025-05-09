"use client"

import type React from "react"
import { useEffect } from "react"
import { View, StyleSheet, Animated, Easing, type ViewStyle } from "react-native"
import { useTheme } from "../../hooks/useTheme"

type SpinnerVariant = "circle" | "dots" | "pulse" | "wave" | "neon"
type SpinnerSize = "small" | "medium" | "large"

interface SpinnerProps {
  variant?: SpinnerVariant
  size?: SpinnerSize
  color?: string
  style?: ViewStyle
  speed?: "slow" | "normal" | "fast"
}

export const Spinner: React.FC<SpinnerProps> = ({
  variant = "circle",
  size = "medium",
  color,
  style,
  speed = "normal",
}) => {
  const { colors } = useTheme()
  const spinnerColor = color || colors.primary

  // Determinar tamaño basado en la prop size
  const getSize = (): number => {
    switch (size) {
      case "small":
        return 24
      case "large":
        return 48
      default:
        return 36
    }
  }

  // Determinar velocidad basada en la prop speed
  const getDuration = (): number => {
    switch (speed) {
      case "slow":
        return 2000
      case "fast":
        return 800
      default:
        return 1200
    }
  }

  const spinnerSize = getSize()
  const duration = getDuration()

  // Animación de rotación
  const spinValue = new Animated.Value(0)

  // Animación de opacidad para dots y pulse
  const opacityValues = [new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]

  // Animación de escala para pulse
  const scaleValues = [new Animated.Value(0.8), new Animated.Value(0.8), new Animated.Value(0.8)]

  // Animación para wave
  const waveValues = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]

  useEffect(() => {
    // Animación de rotación continua
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()

    // Animaciones para dots y pulse
    if (variant === "dots" || variant === "pulse") {
      const animations = opacityValues.map((value, index) => {
        return Animated.sequence([
          Animated.delay(index * (duration / 3)),
          Animated.parallel([
            Animated.timing(value, {
              toValue: 1,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            ...(variant === "pulse"
              ? [
                  Animated.timing(scaleValues[index], {
                    toValue: 1,
                    duration: duration / 2,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                  }),
                ]
              : []),
          ]),
          Animated.parallel([
            Animated.timing(value, {
              toValue: 0.3,
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            ...(variant === "pulse"
              ? [
                  Animated.timing(scaleValues[index], {
                    toValue: 0.8,
                    duration: duration / 2,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                  }),
                ]
              : []),
          ]),
        ])
      })

      Animated.loop(Animated.parallel(animations)).start()
    }

    // Animación para wave
    if (variant === "wave") {
      const animations = waveValues.map((value, index) => {
        return Animated.sequence([
          Animated.delay(index * (duration / 5)),
          Animated.timing(value, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      })

      Animated.loop(Animated.parallel(animations)).start()
    }
  }, [variant, duration])

  // Interpolación para la rotación
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  // Renderizar spinner según la variante
  const renderSpinner = () => {
    switch (variant) {
      case "circle":
        return (
          <View style={[styles.container, { width: spinnerSize, height: spinnerSize }, style]}>
            <Animated.View
              style={[
                styles.circle,
                {
                  width: spinnerSize,
                  height: spinnerSize,
                  borderColor: spinnerColor,
                  borderWidth: spinnerSize / 10,
                  transform: [{ rotate: spin }],
                },
              ]}
            />
          </View>
        )

      case "dots":
        return (
          <View style={[styles.dotsContainer, { height: spinnerSize }, style]}>
            {opacityValues.map((opacity, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: spinnerSize / 3,
                    height: spinnerSize / 3,
                    backgroundColor: spinnerColor,
                    opacity,
                    marginHorizontal: spinnerSize / 10,
                  },
                ]}
              />
            ))}
          </View>
        )

      case "pulse":
        return (
          <View style={[styles.dotsContainer, { height: spinnerSize }, style]}>
            {opacityValues.map((opacity, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: spinnerSize / 3,
                    height: spinnerSize / 3,
                    backgroundColor: spinnerColor,
                    opacity,
                    transform: [{ scale: scaleValues[index] }],
                    marginHorizontal: spinnerSize / 10,
                  },
                ]}
              />
            ))}
          </View>
        )

      case "wave":
        return (
          <View style={[styles.waveContainer, { height: spinnerSize }, style]}>
            {waveValues.map((value, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveLine,
                  {
                    width: spinnerSize / 10,
                    height: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [spinnerSize / 4, spinnerSize],
                    }),
                    backgroundColor: spinnerColor,
                    marginHorizontal: spinnerSize / 15,
                  },
                ]}
              />
            ))}
          </View>
        )

      case "neon":
        return (
          <View style={[styles.container, { width: spinnerSize, height: spinnerSize }, style]}>
            <Animated.View
              style={[
                styles.neonCircle,
                {
                  width: spinnerSize,
                  height: spinnerSize,
                  borderColor: spinnerColor,
                  borderWidth: spinnerSize / 15,
                  transform: [{ rotate: spin }],
                  shadowColor: spinnerColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: spinnerSize / 5,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.neonInnerCircle,
                {
                  width: spinnerSize * 0.6,
                  height: spinnerSize * 0.6,
                  borderColor: spinnerColor,
                  borderWidth: spinnerSize / 20,
                  transform: [
                    {
                      rotate: spin.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["360deg", "0deg"],
                      }),
                    },
                  ],
                  shadowColor: spinnerColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: spinnerSize / 8,
                },
              ]}
            />
          </View>
        )

      default:
        return null
    }
  }

  return renderSpinner()
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    borderRadius: 1000,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    borderRadius: 1000,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  waveLine: {
    borderRadius: 100,
  },
  neonCircle: {
    borderRadius: 1000,
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    position: "absolute",
  },
  neonInnerCircle: {
    borderRadius: 1000,
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
  },
})
