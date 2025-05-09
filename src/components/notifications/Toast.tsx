"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { theme } from "../../theme"
import type { Notification } from "../../contexts/NotificationContext"
import { hapticFeedback } from "../../services/feedback/hapticFeedback"

const { width } = Dimensions.get("window")

interface ToastProps {
  notification: Notification
  onClose: () => void
  style?: StyleProp<ViewStyle>
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose, style }) => {
  const insets = useSafeAreaInsets()
  const {
    message,
    type = "info",
    title,
    position = "top",
    animation = "slide",
    action,
    icon,
    showProgress,
    progress = 0,
  } = notification

  // Referencias para animaciones
  const translateY = useRef(new Animated.Value(position === "top" ? -200 : 200)).current
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.8)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  // Actualizar la animación de progreso cuando cambia el progreso
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [progress, progressAnim])

  // Animar la entrada del toast
  useEffect(() => {
    // Aplicar feedback táctil según el tipo de notificación
    switch (type) {
      case "success":
        hapticFeedback.success()
        break
      case "error":
        hapticFeedback.error()
        break
      case "warning":
        hapticFeedback.warning()
        break
      case "info":
        hapticFeedback.light()
        break
    }

    // Animar según el tipo de animación
    switch (animation) {
      case "slide":
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start()
        break
      case "fade":
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start()
        break
      case "bounce":
        Animated.sequence([
          Animated.spring(translateY, {
            toValue: 0,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: position === "top" ? -20 : 20,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
        ]).start()
        break
      case "zoom":
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start()
        break
      case "flip":
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start()
        break
      case "pulse":
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        ]).start()
        break
      case "shake":
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: -10,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 10,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: -10,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
          ]),
        ]).start()
        break
    }

    // Limpiar animaciones al desmontar
    return () => {
      translateY.stopAnimation()
      opacity.stopAnimation()
      scale.stopAnimation()
      rotateAnim.stopAnimation()
    }
  }, [animation, opacity, rotateAnim, scale, translateY, type])

  // Obtener los estilos de animación según el tipo de animación
  const getAnimatedStyles = () => {
    switch (animation) {
      case "slide":
        return {
          transform: [{ translateY }],
        }
      case "fade":
        return {
          opacity,
        }
      case "bounce":
        return {
          transform: [{ translateY }],
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
              rotateX: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["90deg", "0deg"],
              }),
            },
          ],
        }
      case "pulse":
        return {
          opacity,
          transform: [{ scale }],
        }
      case "shake":
        return {
          opacity,
          transform: [{ translateY }],
        }
      default:
        return {
          transform: [{ translateY }],
        }
    }
  }

  // Obtener el icono según el tipo de notificación
  const getIcon = () => {
    if (icon) return icon

    switch (type) {
      case "success":
        return "checkmark-circle"
      case "error":
        return "alert-circle"
      case "warning":
        return "warning"
      case "info":
      default:
        return "information-circle"
    }
  }

  // Obtener el color según el tipo de notificación
  const getColor = () => {
    switch (type) {
      case "success":
        return theme.colors.success
      case "error":
        return theme.colors.error
      case "warning":
        return theme.colors.warning
      case "info":
      default:
        return theme.colors.primary
    }
  }

  // Obtener los estilos de posición
  const getPositionStyles = () => {
    return {
      [position]: position === "top" ? insets.top + 10 : insets.bottom + 10,
    }
  }

  return (
    <Animated.View
      style={[styles.container, getPositionStyles(), getAnimatedStyles(), { backgroundColor: getColor() }, style]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={getIcon()} size={24} color="white" />
        </View>
        <View style={styles.textContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          {action && (
            <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {showProgress && (
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    maxWidth: 500,
    alignSelf: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    color: "white",
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
  actionButton: {
    marginTop: 8,
  },
  actionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  progressContainer: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
})
