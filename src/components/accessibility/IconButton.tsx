"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { TouchableOpacity, StyleSheet, Animated, Easing, View } from "react-native"
import { useAccessibility } from "../../hooks/useAccessibility"
import { useFeedback } from "../../hooks/useFeedback"
import { HapticType } from "../../services/feedback/hapticFeedback"

interface IconButtonProps {
  onPress: () => void
  icon: React.ReactNode
  accessibilityLabel: string
  hint?: string
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success"
  size?: "small" | "medium" | "large"
  disabled?: boolean
  style?: any
  hapticType?: HapticType
  animationPreset?: "scale" | "opacity" | "rotate" | "none"
}

export const IconButton = ({
  onPress,
  icon,
  accessibilityLabel,
  hint,
  variant = "primary",
  size = "medium",
  disabled = false,
  style,
  hapticType = HapticType.LIGHT,
  animationPreset = "scale",
}: IconButtonProps) => {
  const { a11yProps, touchSize, provideFeedback, getContrastColors } = useAccessibility()
  const { triggerHaptic } = useFeedback()
  const colors = getContrastColors()
  const touch = touchSize()

  // Valores de animación
  const scaleAnim = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const [isPressed, setIsPressed] = useState(false)

  // Determinar tamaño del botón según el tamaño especificado
  const getSize = () => {
    switch (size) {
      case "small":
        return 36
      case "large":
        return 56
      default:
        return 44
    }
  }

  // Determinar estilos según variante
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "#FF00FF", // Magenta neón
          borderColor: "transparent",
        }
      case "secondary":
        return {
          backgroundColor: "#00FFFF", // Cian neón
          borderColor: "transparent",
        }
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: "#FF00FF", // Magenta neón
        }
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
        }
      case "danger":
        return {
          backgroundColor: "#FF3B30",
          borderColor: "transparent",
        }
      case "success":
        return {
          backgroundColor: "#34C759",
          borderColor: "transparent",
        }
      default:
        return {
          backgroundColor: "#FF00FF", // Magenta neón
          borderColor: "transparent",
        }
    }
  }

  const variantStyles = getVariantStyles()
  const buttonSize = getSize()

  // Efecto para animar el botón cuando cambia isPressed
  useEffect(() => {
    if (animationPreset === "none" || disabled) return

    if (isPressed) {
      // Animación al presionar
      if (animationPreset === "scale" || animationPreset === "opacity") {
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start()
      }

      if (animationPreset === "opacity") {
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }).start()
      }

      if (animationPreset === "rotate") {
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }).start()
      }
    } else {
      // Animación al soltar
      if (animationPreset === "scale" || animationPreset === "opacity") {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }).start()
      }

      if (animationPreset === "opacity") {
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start()
      }

      if (animationPreset === "rotate") {
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }).start()
      }
    }
  }, [isPressed, animationPreset, disabled, scaleAnim, opacityAnim, rotateAnim])

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

  // Calcular estilos de animación
  const getAnimationStyle = () => {
    if (animationPreset === "none" || disabled) return {}

    if (animationPreset === "scale") {
      return {
        transform: [{ scale: scaleAnim }],
      }
    }

    if (animationPreset === "opacity") {
      return {
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }
    }

    if (animationPreset === "rotate") {
      const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "30deg"],
      })

      return {
        transform: [{ scale: scaleAnim }, { rotate }],
      }
    }

    return {}
  }

  return (
    <Animated.View style={[getAnimationStyle()]}>
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
            backgroundColor: disabled ? "#666666" : variantStyles.backgroundColor,
            borderColor: disabled ? "#444444" : variantStyles.borderColor,
            borderRadius: buttonSize / 2,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        activeOpacity={0.9}
        {...a11yProps(accessibilityLabel, hint || `Presiona para ${accessibilityLabel}`, "button", { disabled })}
      >
        <View style={styles.iconContainer}>{icon}</View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
})
