"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Animated, StyleSheet } from "react-native"

interface TabTransitionProps {
  children: React.ReactNode
  index: number
  activeIndex: number
}

export const TabTransition: React.FC<TabTransitionProps> = ({ children, index, activeIndex }) => {
  const opacity = useRef(new Animated.Value(index === activeIndex ? 1 : 0)).current
  const translateX = useRef(new Animated.Value(index === activeIndex ? 0 : index > activeIndex ? 100 : -100)).current
  const scale = useRef(new Animated.Value(index === activeIndex ? 1 : 0.9)).current

  useEffect(() => {
    if (index === activeIndex) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      // Animar salida
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: index > activeIndex ? 100 : -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [activeIndex, index, opacity, translateX, scale])

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateX }, { scale }],
          zIndex: index === activeIndex ? 1 : 0,
          position: "absolute",
          width: "100%",
          height: "100%",
        },
      ]}
      pointerEvents={index === activeIndex ? "auto" : "none"}
    >
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
