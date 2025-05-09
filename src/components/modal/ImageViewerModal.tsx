"use client"

import type React from "react"
import { useState } from "react"
import { View, StyleSheet, Image, Dimensions, TouchableOpacity, ActivityIndicator, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { theme } from "../../theme"
import { AccessibleButton } from "../accessibility/AccessibleButton"
import { PinchGestureHandler, PanGestureHandler } from "react-native-gesture-handler"
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

const { width, height } = Dimensions.get("window")

interface ImageViewerModalProps {
  imageUrl: string
  onClose: () => void
  title?: string
  allowShare?: boolean
  allowSave?: boolean
  onShare?: () => void
  onSave?: () => void
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  onClose,
  title,
  allowShare = true,
  allowSave = true,
  onShare,
  onSave,
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Valores animados para gestos
  const scale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  // Manejador de gestos de pellizco (zoom)
  const pinchHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      scale.value = Math.max(1, Math.min(event.scale, 5))
    },
    onEnd: () => {
      if (scale.value < 1.2) {
        scale.value = withSpring(1)
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
      }
    },
  })

  // Manejador de gestos de arrastre
  const panHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value
      ctx.startY = translateY.value
    },
    onActive: (event, ctx: any) => {
      translateX.value = ctx.startX + event.translationX
      translateY.value = ctx.startY + event.translationY
    },
    onEnd: () => {
      if (scale.value < 1.2) {
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
      }
    },
  })

  // Estilos animados
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
    }
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {title && <Text style={styles.title}>{title}</Text>}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <PanGestureHandler onGestureEvent={panHandler} enabled={!loading}>
        <Animated.View style={styles.imageContainer}>
          <PinchGestureHandler onGestureEvent={pinchHandler} enabled={!loading}>
            <Animated.View style={[styles.imageWrapper, animatedImageStyle]}>
              {loading && !error && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              )}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                  <Text style={styles.errorText}>Error al cargar la imagen</Text>
                </View>
              )}
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="contain"
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setLoading(false)
                  setError(true)
                }}
              />
            </Animated.View>
          </PinchGestureHandler>
        </Animated.View>
      </PanGestureHandler>

      <View style={styles.footer}>
        {allowShare && (
          <AccessibleButton
            variant="ghost"
            style={styles.actionButton}
            onPress={onShare}
            accessibilityLabel="Compartir imagen"
          >
            <Ionicons name="share-outline" size={24} color="white" />
            <Text style={styles.actionText}>Compartir</Text>
          </AccessibleButton>
        )}
        {allowSave && (
          <AccessibleButton
            variant="ghost"
            style={styles.actionButton}
            onPress={onSave}
            accessibilityLabel="Guardar imagen"
          >
            <Ionicons name="download-outline" size={24} color="white" />
            <Text style={styles.actionText}>Guardar</Text>
          </AccessibleButton>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: width,
    height: height * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "white",
    marginTop: 8,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
  },
})
