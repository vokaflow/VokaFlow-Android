"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { TouchableOpacity, StyleSheet, Animated, Text, View } from "react-native"
import { useAccessibility } from "../../hooks/useAccessibility"
import { useFeedback } from "../../hooks/useFeedback"
import { HapticType } from "../../services/feedback/hapticFeedback"

interface FloatingActionButtonProps {
  onPress: () => void
  icon: React.ReactNode
  label?: string
  accessibilityLabel: string
  hint?: string
  position?: "bottomRight" | "bottomLeft" | "topRight" | "topLeft" | "center"
  size?: "small" | "medium" | "large"
  disabled?: boolean
  style?: any
  hapticType?: HapticType
  showLabel?: boolean
}

export const FloatingActionButton = ({
  onPress,
  icon,
  label,
  accessibilityLabel,
  hint,
  position = "bottomRight",
  size = "medium",
  disabled = false,
  style,
  hapticType = HapticType.MEDIUM,
  showLabel = false,
}: FloatingActionButtonProps) => {
  const { a11yProps, touchSize, provideFeedback, getContrastColors } = useAccessibility()
  const { triggerHaptic } = useFeedback()
  const colors = getContrastColors()
  const touch = touchSize()

  // Valores de animación
  const scaleAnim = useRef(new Animated.Value(1)).current
  const shadowAnim = useRef(new Animated.Value(1)).current
  const [isPressed, setIsPressed] = useState(false)

  // Determinar tamaño del botón según el tamaño especificado
  const getSize = () => {
    switch (size) {
      case "small":
        return 48
      case "large":
        return 72
      default:
        return 56
    }
  }

  // Determinar posición del botón
  const getPositionStyle = () => {
    const margin = 16

    switch (position) {
      case "bottomRight":
        return {
          position: "absolute",
          bottom: margin,
          right: margin,
        }
      case "bottomLeft":
        return {
          position: "absolute",
          bottom: margin,
          left: margin,
        }
      case "topRight":
        return {
          position: "absolute",
          top: margin,
          right: margin,
        }
      case "topLeft":
        return {
          position: "absolute",
          top: margin,
          left: margin,
        }
      case "center":
        return {
          position: "absolute",
          bottom: "50%",
          right: "50%",
          transform: [{ translateX: getSize() / 2 }, { translateY: getSize() / 2 }],
        }
      default:
        return {
          position: "absolute",
          bottom: margin,
          right: margin,
        }
    }
  }

  const buttonSize = getSize()

  // Efecto para animar el botón cuando cambia isPressed
  useEffect(() => {
    if (disabled) return

    if (isPressed) {
      // Animación al presionar
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: false,
        }),
      ]).start()
    } else {
      // Animación al soltar
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start()
    }
  }, [isPressed, disabled, scaleAnim, shadowAnim])

  // Proporcionar feedback táctil al presionar
  const handlePressIn = () => {
    setIsPressed(true)
    triggerHaptic(hapticType)
  }

  const handlePressOut = () => {
    setIsPressed(false)
  }

  const handlePress = () => {
    provideFeedback("success")
    onPress()
  }

  // Calcular sombra basada en la animación
  const getShadowStyle = () => {
    return {
      shadowOpacity: shadowAnim.interpolate({
        inputRange: [0.5, 1],
        outputRange: [0.2, 0.4],
      }),
      shadowRadius: shadowAnim.interpolate({
        inputRange: [0.5, 1],
        outputRange: [3, 8],
      }),
      elevation: shadowAnim.interpolate({
        inputRange: [0.5, 1],
        outputRange: [4, 8],
      }),
    }
  }

  return (
    <Animated.View
      style={[
        getPositionStyle(),
        {
          transform: [{ scale: scaleAnim }],
        },
        getShadowStyle(),
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor: disabled ? "#666666" : "#FF00FF", // Magenta neón
            borderRadius: buttonSize / 2,
            opacity: disabled ? 0.6 : 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
          },
          style,
        ]}
        activeOpacity={0.9}
        {...a11yProps(accessibilityLabel, hint || `Presiona para ${accessibilityLabel}`, "button", { disabled })}
      >
        <View style={styles.iconContainer}>{icon}</View>
      </TouchableOpacity>

      {showLabel && label && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    position: "absolute",
    top: -30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "center",
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
})
