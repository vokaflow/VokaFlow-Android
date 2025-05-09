"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  type ViewStyle,
  BackHandler,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { theme } from "../../theme"
import { hapticFeedback } from "../../services/feedback/hapticFeedback"

const { width, height } = Dimensions.get("window")

export type ModalTransition =
  | "fade"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "zoom"
  | "flip"
  | "rotate"
  | "none"

interface ModalProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  transition?: ModalTransition
  duration?: number
  backdropOpacity?: number
  backdropColor?: string
  position?: "center" | "top" | "bottom"
  width?: number | string
  height?: number | string
  style?: StyleProp<ViewStyle>
  avoidKeyboard?: boolean
  closeOnBackdropPress?: boolean
  closeOnBackButton?: boolean
  backdropTransition?: ModalTransition
  useHaptics?: boolean
  hapticType?: "light" | "medium" | "heavy" | "success" | "warning" | "error"
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  transition = "fade",
  duration = 300,
  backdropOpacity = 0.7,
  backdropColor = "#000",
  position = "center",
  width = "85%",
  height = "auto",
  style,
  avoidKeyboard = true,
  closeOnBackdropPress = true,
  closeOnBackButton = true,
  backdropTransition = "fade",
  useHaptics = true,
  hapticType = "light",
}) => {
  const insets = useSafeAreaInsets()
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(height)).current
  const translateX = useRef(new Animated.Value(width)).current
  const rotateVal = useRef(new Animated.Value(0)).current

  // Gestionar el botón de retroceso en Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (visible && closeOnBackButton) {
        onClose()
        return true
      }
      return false
    })

    return () => backHandler.remove()
  }, [visible, closeOnBackButton, onClose])

  // Animar la apertura y cierre del modal
  useEffect(() => {
    if (visible) {
      // Aplicar feedback táctil al abrir
      if (useHaptics) {
        hapticFeedback[hapticType]()
      }

      // Animar la apertura según la transición seleccionada
      Animated.parallel([
        // Animar el fondo
        Animated.timing(opacity, {
          toValue: backdropOpacity,
          duration,
          useNativeDriver: true,
        }),
        // Animar el contenido según la transición
        getOpenAnimation(),
      ]).start()
    } else {
      // Animar el cierre según la transición seleccionada
      Animated.parallel([
        // Animar el fondo
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        // Animar el contenido según la transición
        getCloseAnimation(),
      ]).start()
    }
  }, [visible])

  // Obtener la animación de apertura según la transición
  const getOpenAnimation = () => {
    switch (transition) {
      case "fade":
        return Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      case "slideUp":
        return Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      case "slideDown":
        return Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      case "slideLeft":
        return Animated.spring(translateX, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      case "slideRight":
        return Animated.spring(translateX, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      case "zoom":
        return Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      case "flip":
        return Animated.spring(rotateVal, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      case "rotate":
        return Animated.spring(rotateVal, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      case "none":
      default:
        return Animated.timing(opacity, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        })
    }
  }

  // Obtener la animación de cierre según la transición
  const getCloseAnimation = () => {
    switch (transition) {
      case "fade":
        return Animated.timing(opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        })
      case "slideUp":
        return Animated.timing(translateY, {
          toValue: -height,
          duration,
          useNativeDriver: true,
        })
      case "slideDown":
        return Animated.timing(translateY, {
          toValue: height,
          duration,
          useNativeDriver: true,
        })
      case "slideLeft":
        return Animated.timing(translateX, {
          toValue: -width,
          duration,
          useNativeDriver: true,
        })
      case "slideRight":
        return Animated.timing(translateX, {
          toValue: width,
          duration,
          useNativeDriver: true,
        })
      case "zoom":
        return Animated.timing(scale, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        })
      case "flip":
        return Animated.timing(rotateVal, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        })
      case "rotate":
        return Animated.timing(rotateVal, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        })
      case "none":
      default:
        return Animated.timing(opacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        })
    }
  }

  // Obtener los estilos de animación según la transición
  const getAnimatedStyles = () => {
    switch (transition) {
      case "fade":
        return {
          opacity,
        }
      case "slideUp":
        return {
          opacity,
          transform: [{ translateY }],
        }
      case "slideDown":
        return {
          opacity,
          transform: [{ translateY: Animated.multiply(translateY, -1) }],
        }
      case "slideLeft":
        return {
          opacity,
          transform: [{ translateX }],
        }
      case "slideRight":
        return {
          opacity,
          transform: [{ translateX: Animated.multiply(translateX, -1) }],
        }
      case "zoom":
        return {
          opacity,
          transform: [{ scale }],
        }
      case "flip":
        return {
          opacity,
          transform: [
            {
              rotateY: rotateVal.interpolate({
                inputRange: [0, 1],
                outputRange: ["90deg", "0deg"],
              }),
            },
          ],
        }
      case "rotate":
        return {
          opacity,
          transform: [
            {
              rotate: rotateVal.interpolate({
                inputRange: [0, 1],
                outputRange: ["90deg", "0deg"],
              }),
            },
          ],
        }
      case "none":
      default:
        return {
          opacity,
        }
    }
  }

  // Obtener los estilos de posición
  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return {
          justifyContent: "flex-start",
          paddingTop: insets.top + 20,
        }
      case "bottom":
        return {
          justifyContent: "flex-end",
          paddingBottom: insets.bottom + 20,
        }
      case "center":
      default:
        return {
          justifyContent: "center",
        }
    }
  }

  // Si el modal no es visible, no renderizar nada
  if (!visible && opacity._value === 0) return null

  return (
    <View style={[styles.container, StyleSheet.absoluteFill]}>
      <TouchableWithoutFeedback
        onPress={() => {
          if (closeOnBackdropPress) {
            if (useHaptics) {
              hapticFeedback.light()
            }
            onClose()
          }
        }}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: backdropColor,
              opacity,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" && avoidKeyboard ? "padding" : undefined}
        style={[styles.modalContainer, getPositionStyles()]}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              width,
              height: height === "auto" ? undefined : height,
            },
            getAnimatedStyles(),
            style,
          ]}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
})
