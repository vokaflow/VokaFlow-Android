"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Text, Modal, TouchableWithoutFeedback } from "react-native"
import { useTheme } from "../../hooks/useTheme"
import { Spinner } from "./Spinner"

interface LoadingOverlayProps {
  visible: boolean
  message?: string
  spinnerVariant?: "circle" | "dots" | "pulse" | "wave" | "neon"
  spinnerSize?: "small" | "medium" | "large"
  spinnerColor?: string
  backdropOpacity?: number
  dismissable?: boolean
  onDismiss?: () => void
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  spinnerVariant = "neon",
  spinnerSize = "large",
  spinnerColor,
  backdropOpacity = 0.7,
  dismissable = false,
  onDismiss,
}) => {
  const { colors } = useTheme()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible, fadeAnim, scaleAnim])

  const handleBackdropPress = () => {
    if (dismissable && onDismiss) {
      onDismiss()
    }
  }

  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                backgroundColor: colors.background.primary,
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, backdropOpacity],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.content,
                {
                  backgroundColor: colors.background.secondary,
                  shadowColor: spinnerColor || colors.primary,
                },
              ]}
            >
              <Spinner
                variant={spinnerVariant}
                size={spinnerSize}
                color={spinnerColor || colors.primary}
                style={styles.spinner}
              />
              {message && <Text style={[styles.message, { color: colors.text }]}>{message}</Text>}
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  content: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
})
