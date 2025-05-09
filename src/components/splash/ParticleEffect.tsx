"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Easing, Dimensions } from "react-native"
import { theme } from "../../theme"

const { width, height } = Dimensions.get("window")

interface Particle {
  id: number
  x: Animated.Value
  y: Animated.Value
  scale: Animated.Value
  opacity: Animated.Value
  speed: number
  size: number
  color: string
}

interface ParticleEffectProps {
  count?: number
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({ count = 30 }) => {
  // Referencia para almacenar las partículas
  const particlesRef = useRef<Particle[]>([])

  // Crear partículas al montar el componente
  useEffect(() => {
    // Colores posibles para las partículas (basados en los colores de la app)
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.primary + "80", // Con transparencia
      theme.colors.secondary + "80", // Con transparencia
      "#FFFFFF20", // Blanco con alta transparencia
    ]

    // Crear partículas
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        id: i,
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        scale: new Animated.Value(Math.random() * 0.5 + 0.5),
        opacity: new Animated.Value(Math.random() * 0.5 + 0.2),
        speed: Math.random() * 2 + 1,
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    particlesRef.current = particles

    // Animar cada partícula
    particles.forEach((particle) => {
      animateParticle(particle)
    })

    // Limpiar animaciones al desmontar
    return () => {
      particles.forEach((particle) => {
        particle.x.stopAnimation()
        particle.y.stopAnimation()
        particle.scale.stopAnimation()
        particle.opacity.stopAnimation()
      })
    }
  }, [count])

  // Función para animar una partícula
  const animateParticle = (particle: Particle) => {
    // Valores aleatorios para la animación
    const newX = Math.random() * width
    const newY = Math.random() * height
    const duration = 3000 + Math.random() * 5000 // Entre 3 y 8 segundos

    // Animar posición, escala y opacidad
    Animated.parallel([
      Animated.timing(particle.x, {
        toValue: newX,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(particle.y, {
        toValue: newY,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(particle.scale, {
          toValue: Math.random() * 0.5 + 0.5,
          duration: duration / 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: Math.random() * 0.5 + 0.2,
          duration: duration / 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(particle.opacity, {
          toValue: Math.random() * 0.5 + 0.5,
          duration: duration / 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: Math.random() * 0.3 + 0.1,
          duration: duration / 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Cuando la animación termina, iniciar una nueva
      animateParticle(particle)
    })
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {particlesRef.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: particle.size / 2,
              transform: [{ translateX: particle.x }, { translateY: particle.y }, { scale: particle.scale }],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  particle: {
    position: "absolute",
  },
})
