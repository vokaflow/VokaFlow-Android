"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from "react-native"
import { AnimatedLogo } from "../../components/common/AnimatedLogo"
import { ParticleEffect } from "../../components/splash/ParticleEffect"
import { theme } from "../../theme"

const { width, height } = Dimensions.get("window")

interface SplashScreenProps {
  onFinish: () => void
  minDisplayTime?: number
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, minDisplayTime = 2500 }) => {
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const progressWidth = useRef(new Animated.Value(0)).current
  const glowAnim = useRef(new Animated.Value(0)).current

  // Referencia para rastrear el tiempo de inicio
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    // Secuencia de animación para la entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    // Animación de brillo pulsante
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ).start()

    // Animación de la barra de progreso
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: minDisplayTime,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start()

    // Calcular el ancho de la barra de progreso
    progressAnim.addListener(({ value }) => {
      progressWidth.setValue(value * (width - 80))
    })

    // Temporizador para asegurar un tiempo mínimo de visualización
    const timer = setTimeout(() => {
      // Calcular cuánto tiempo ha pasado
      const elapsedTime = Date.now() - startTimeRef.current
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime)

      // Si ya ha pasado el tiempo mínimo, hacer la transición inmediatamente
      // De lo contrario, esperar el tiempo restante
      setTimeout(() => {
        // Animación de salida
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Llamar a onFinish cuando la animación de salida termine
          onFinish()
        })
      }, remainingTime)
    }, minDisplayTime)

    // Limpiar el temporizador y los listeners al desmontar
    return () => {
      clearTimeout(timer)
      progressAnim.removeAllListeners()
    }
  }, [fadeAnim, scaleAnim, progressAnim, progressWidth, glowAnim, minDisplayTime, onFinish])

  // Interpolación para el efecto de brillo
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8],
  })

  return (
    <View style={styles.container}>
      {/* Efecto de partículas en el fondo */}
      <ParticleEffect count={40} />

      {/* Efecto de brillo alrededor del logo */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowOpacity,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <AnimatedLogo size="xlarge" animation="none" />
        <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>VokaFlow</Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>Comunicación sin barreras</Animated.Text>
      </Animated.View>

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  glow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.primary,
    opacity: 0.2,
    zIndex: -1,
  },
  logoContainer: {
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginTop: 20,
  },
  tagline: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginTop: 10,
  },
  progressBarContainer: {
    width: width - 80,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    marginTop: 60,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  footer: {
    position: "absolute",
    bottom: 40,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
})
