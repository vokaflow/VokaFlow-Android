"use client"

import type React from "react"
import { TouchableOpacity, Text, StyleSheet, View, Animated } from "react-native"
import { useAccessibility } from "../../hooks/useAccessibility"
import { useFeedback } from "../../hooks/useFeedback"
import { HapticType } from "../../services/feedback/hapticFeedback"
import { useState, useRef, useEffect } from "react"
import { useAccessibleAnimation } from "../../hooks/useAccessibleAnimation"

interface AccessibleButtonProps {
  onPress: () => void
  label: string
  hint?: string
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success"
  size?: "small" | "medium" | "large"
  icon?: React.ReactNode
  disabled?: boolean
  fullWidth?: boolean
  style?: any
  textStyle?: any
  hapticType?: HapticType
  animationPreset?: "scale" | "opacity" | "highlight" | "none"
  loading?: boolean
}

export const AccessibleButton = ({
  onPress,
  label,
  hint,
  variant = "primary",
  size = "medium",
  icon,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  hapticType = HapticType.LIGHT,
  animationPreset = "scale",
  loading = false,
}: AccessibleButtonProps) => {
  const { a11yProps, fontSize, touchSize, provideFeedback, getContrastColors, isAnimationTypeEnabled } =
    useAccessibility()
  const { triggerHaptic } = useFeedback()
  const colors = getContrastColors()
  const touch = touchSize()
  const [isPressed, setIsPressed] = useState(false)

  // Determinar si las animaciones de botones están habilitadas
  const buttonsAnimationEnabled = isAnimationTypeEnabled("buttons")

  // Usar el hook de animación accesible para la escala
  const scaleAnimation = useAccessibleAnimation({
    type: "scale",
    enabled: buttonsAnimationEnabled && animationPreset === "scale",
    animationType: "buttons",
    initialValue: 1,
    finalValue: 0.95,
    autoPlay: false,
    baseDuration: 100,
  })

  // Usar el hook de animación accesible para la opacidad
  const opacityAnimation = useAccessibleAnimation({
    type: "fade",
    enabled: buttonsAnimationEnabled && animationPreset === "opacity",
    animationType: "buttons",
    initialValue: 1,
    finalValue: 0.8,
    autoPlay: false,
    baseDuration: 100,
  })

  // Usar el hook de animación accesible para el resaltado
  const highlightAnim = useRef(new Animated.Value(0)).current

  // Determinar altura del botón según tamaño
  const getHeight = () => {
    switch (size) {
      case "small":
        return touch.buttonHeight * 0.8
      case "large":
        return touch.buttonHeight * 1.2
      default:
        return touch.buttonHeight
    }
  }

  // Determinar estilos según variante
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "#FF00FF", // Magenta neón
          borderColor: "transparent",
          textColor: "#FFFFFF",
          highlightColor: "rgba(255, 255, 255, 0.3)",
        }
      case "secondary":
        return {
          backgroundColor: "#00FFFF", // Cian neón
          borderColor: "transparent",
          textColor: "#000000",
          highlightColor: "rgba(0, 0, 0, 0.1)",
        }
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: "#FF00FF", // Magenta neón
          textColor: "#FF00FF",
          highlightColor: "rgba(255, 0, 255, 0.1)",
        }
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
          textColor: colors.textPrimary,
          highlightColor: "rgba(255, 255, 255, 0.1)",
        }
      case "danger":
        return {
          backgroundColor: "#FF3B30",
          borderColor: "transparent",
          textColor: "#FFFFFF",
          highlightColor: "rgba(255, 255, 255, 0.3)",
        }
      case "success":
        return {
          backgroundColor: "#34C759",
          borderColor: "transparent",
          textColor: "#FFFFFF",
          highlightColor: "rgba(255, 255, 255, 0.3)",
        }
      default:
        return {
          backgroundColor: "#FF00FF", // Magenta neón
          borderColor: "transparent",
          textColor: "#FFFFFF",
          highlightColor: "rgba(255, 255, 255, 0.3)",
        }
    }
  }

  const variantStyles = getVariantStyles()
  const buttonHeight = getHeight()

  // Efecto para animar el botón cuando cambia isPressed
  useEffect(() => {
    if (animationPreset === "none" || disabled || !buttonsAnimationEnabled) return

    if (isPressed) {
      // Animación al presionar
      if (animationPreset === "scale") {
        scaleAnimation.play()
      }

      if (animationPreset === "opacity") {
        opacityAnimation.play()
      }

      if (animationPreset === "highlight") {
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }).start()
      }
    } else {
      // Animación al soltar
      if (animationPreset === "scale") {
        scaleAnimation.reverse()
      }

      if (animationPreset === "opacity") {
        opacityAnimation.reverse()
      }

      if (animationPreset === "highlight") {
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start()
      }
    }
  }, [isPressed, animationPreset, disabled, buttonsAnimationEnabled])

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
    if (animationPreset === "none" || disabled || !buttonsAnimationEnabled) return {}

    if (animationPreset === "scale") {
      return {
        transform: [{ scale: scaleAnimation.animatedValue }],
      }
    }

    if (animationPreset === "opacity") {
      return {
        transform: [{ scale: scaleAnimation.animatedValue }],
        opacity: opacityAnimation.animatedValue,
      }
    }

    if (animationPreset === "highlight") {
      return {
        backgroundColor: highlightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [variantStyles.backgroundColor, variantStyles.highlightColor],
        }),
      }
    }

    return {}
  }

  return (
    <Animated.View style={[getAnimationStyle(), fullWidth && styles.fullWidthContainer]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            height: buttonHeight,
            minWidth: fullWidth ? "100%" : touch.buttonMinWidth,
            backgroundColor: disabled ? "#666666" : variantStyles.backgroundColor,
            borderColor: disabled ? "#444444" : variantStyles.borderColor,
            borderRadius: touch.borderRadius,
            opacity: disabled ? 0.6 : 1,
            paddingHorizontal: touch.spacing * 2,
          },
          fullWidth && styles.fullWidth,
          style,
        ]}
        activeOpacity={0.9}
        {...a11yProps(label, hint || `Presiona para ${label}`, "button", { disabled })}
      >
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {loading ? (
            <View style={styles.loadingIndicator} />
          ) : (
            <Text
              style={[
                styles.text,
                {
                  fontSize: fontSize(size === "small" ? "sm" : size === "large" ? "lg" : "md"),
                  color: disabled ? "#BBBBBB" : variantStyles.textColor,
                },
                textStyle,
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  fullWidthContainer: {
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  fullWidth: {
    width: "100%",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderTopColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },
})
