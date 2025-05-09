"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { StyleSheet, Animated, RefreshControl, ScrollView, type ScrollViewProps } from "react-native"
import { useTheme } from "../../hooks/useTheme"
import { Spinner } from "./Spinner"

interface PullToRefreshProps extends ScrollViewProps {
  onRefresh: () => Promise<void>
  refreshing: boolean
  spinnerVariant?: "circle" | "dots" | "pulse" | "wave" | "neon"
  spinnerColor?: string
  pullDistance?: number
  children: React.ReactNode
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  refreshing,
  spinnerVariant = "neon",
  spinnerColor,
  pullDistance = 100,
  children,
  ...scrollViewProps
}) => {
  const { colors } = useTheme()
  const spinnerColorValue = spinnerColor || colors.primary
  const [refreshHeight, setRefreshHeight] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRefreshAnimating, setIsRefreshAnimating] = useState(false)
  const refreshAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const scrollRef = useRef<ScrollView>(null)

  // Actualizar estado de refreshing cuando cambia la prop
  useEffect(() => {
    setIsRefreshing(refreshing)
    if (!refreshing && isRefreshAnimating) {
      Animated.timing(refreshAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsRefreshAnimating(false)
      })
    }
  }, [refreshing, isRefreshAnimating, refreshAnim])

  // Animación de rotación continua
  useEffect(() => {
    if (isRefreshing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ).start()
    } else {
      rotateAnim.setValue(0)
    }
  }, [isRefreshing, rotateAnim])

  // Interpolación para la rotación
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  // Interpolación para la opacidad del spinner
  const spinnerOpacity = refreshAnim.interpolate({
    inputRange: [0, pullDistance * 0.3, pullDistance],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  })

  // Interpolación para la escala del spinner
  const spinnerScale = refreshAnim.interpolate({
    inputRange: [0, pullDistance * 0.3, pullDistance],
    outputRange: [0.5, 0.7, 1],
    extrapolate: "clamp",
  })

  // Manejar el evento de refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setIsRefreshAnimating(true)

    try {
      await onRefresh()
    } finally {
      // La animación de cierre se maneja en el useEffect que observa refreshing
    }
  }

  return (
    <ScrollView
      ref={scrollRef}
      {...scrollViewProps}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          progressViewOffset={refreshHeight}
          colors={[spinnerColorValue]}
          tintColor={spinnerColorValue}
          progressBackgroundColor={colors.background.secondary}
          style={{ opacity: 0 }} // Ocultar el RefreshControl nativo
        />
      }
      scrollEventThrottle={16}
      onScroll={(event) => {
        const offsetY = event.nativeEvent.contentOffset.y
        if (offsetY <= 0 && !isRefreshing) {
          const newHeight = Math.abs(offsetY) * 0.5
          setRefreshHeight(newHeight)
          refreshAnim.setValue(Math.min(newHeight, pullDistance))
        }

        // Llamar al onScroll original si existe
        scrollViewProps.onScroll && scrollViewProps.onScroll(event)
      }}
    >
      <Animated.View
        style={[
          styles.refreshContainer,
          {
            height: refreshAnim,
            opacity: spinnerOpacity,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.spinnerContainer,
            {
              transform: [{ scale: spinnerScale }, { rotate: isRefreshing ? rotate : "0deg" }],
            },
          ]}
        >
          <Spinner variant={spinnerVariant} size="medium" color={spinnerColorValue} />
        </Animated.View>
      </Animated.View>
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  refreshContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  spinnerContainer: {
    marginBottom: 10,
  },
})
