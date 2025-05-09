"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Dimensions, Image, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../hooks/useTheme"
import { ParallaxScrollView } from "../../components/parallax/ParallaxScrollView"
import { ParallaxHeader } from "../../components/parallax/ParallaxHeader"
import { ParallaxImage } from "../../components/parallax/ParallaxImage"
import { ParallaxItem } from "../../components/parallax/ParallaxItem"
import { AccessibleButton } from "../../components/accessibility/AccessibleButton"
import { AnimatedLogo } from "../../components/common/AnimatedLogo"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

// Datos de ejemplo para la demostración
const DEMO_ITEMS = [
  {
    id: "1",
    title: "Efecto Parallax Básico",
    description: "Desplazamiento a diferentes velocidades para crear profundidad",
    icon: "layers",
  },
  {
    id: "2",
    title: "Parallax con Zoom",
    description: "Las imágenes se amplían o reducen durante el desplazamiento",
    icon: "zoom-in",
  },
  {
    id: "3",
    title: "Parallax con Rotación",
    description: "Los elementos rotan ligeramente durante el desplazamiento",
    icon: "refresh-cw",
  },
  {
    id: "4",
    title: "Parallax con Opacidad",
    description: "Los elementos cambian de opacidad durante el desplazamiento",
    icon: "eye",
  },
  {
    id: "5",
    title: "Parallax con Escala",
    description: "Los elementos cambian de tamaño durante el desplazamiento",
    icon: "maximize",
  },
  {
    id: "6",
    title: "Parallax con Desplazamiento Horizontal",
    description: "Los elementos se desplazan horizontalmente durante el scroll vertical",
    icon: "move",
  },
]

export const ParallaxDemoScreen: React.FC = () => {
  const { colors } = useTheme()
  const [scrollY] = useState(new Animated.Value(0))
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speed: number }>>([])

  // Generar partículas para el fondo
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * 1000,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 0.5 + 0.1,
    }))
    setParticles(newParticles)
  }, [])

  // Renderizar partículas para el fondo
  const renderParticles = () => (
    <View style={styles.particlesContainer}>
      {particles.map((particle, index) => (
        <View
          key={`particle-${index}`}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: colors.primary,
            },
          ]}
        />
      ))}
    </View>
  )

  // Renderizar cabecera con parallax
  const renderHeader = () => (
    <ParallaxHeader
      height={300}
      scrollY={scrollY}
      backgroundImage={
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          }}
          style={styles.headerBackgroundImage}
        />
      }
      foregroundContent={
        <View style={styles.headerContent}>
          <AnimatedLogo size="large" animation="pulse" />
          <Text style={styles.headerTitle}>Efectos Parallax</Text>
          <Text style={styles.headerSubtitle}>Desplázate para explorar</Text>
        </View>
      }
    />
  )

  // Renderizar capas de parallax
  const renderLayers = () => [
    {
      component: renderParticles(),
      speed: 0.3,
      staticPosition: true,
    },
    {
      component: (
        <View style={styles.floatingIconsContainer}>
          <Animated.View
            style={[
              styles.floatingIcon,
              {
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [0, 500],
                      outputRange: [0, -100],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    translateX: scrollY.interpolate({
                      inputRange: [0, 500],
                      outputRange: [0, 50],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    rotate: scrollY.interpolate({
                      inputRange: [0, 500],
                      outputRange: ["0deg", "45deg"],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <Feather name="star" size={30} color={colors.primary} />
          </Animated.View>
          <Animated.View
            style={[
              styles.floatingIcon,
              {
                left: 100,
                top: 200,
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [0, 500],
                      outputRange: [0, -150],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    translateX: scrollY.interpolate({
                      inputRange: [0, 500],
                      outputRange: [0, -70],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    rotate: scrollY.interpolate({
                      inputRange: [0, 500],
                      outputRange: ["0deg", "-30deg"],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <Feather name="zap" size={40} color={colors.secondary} />
          </Animated.View>
          <Animated.View
            style={[
              styles.floatingIcon,
              {
                right: 50,
                top: 300,
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [0, 500],
                      outputRange: [0, -200],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    translateX: scrollY.interpolate({
                      inputRange: [0, 500],
                      outputRange: [0, -30],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    rotate: scrollY.interpolate({
                      inputRange: [0, 500],
                      outputRange: ["0deg", "90deg"],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <Feather name="hexagon" size={35} color={colors.accent} />
          </Animated.View>
        </View>
      ),
      speed: 0.5,
      staticPosition: true,
    },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ParallaxScrollView
        layers={renderLayers()}
        headerComponent={renderHeader()}
        headerHeight={300}
        headerParallaxAmount={0.6}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ejemplos de Parallax</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Explora diferentes efectos de parallax que puedes implementar en tu aplicación
          </Text>

          <View style={styles.itemsContainer}>
            {DEMO_ITEMS.map((item, index) => (
              <ParallaxItem
                key={item.id}
                scrollY={scrollY}
                offsetY={400 + index * 150} // Posición en la que comienza el efecto
                parallaxAmount={0.1} // Cantidad de efecto parallax
                style={[styles.itemCard, { backgroundColor: colors.cardBackground }]}
              >
                <View style={styles.itemIconContainer}>
                  <Feather name={item.icon as any} size={24} color={colors.primary} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                </View>
              </ParallaxItem>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Imágenes con Parallax</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Las imágenes con efecto parallax añaden profundidad y dinamismo a tu interfaz
          </Text>

          <View style={styles.imagesContainer}>
            <ParallaxImage
              source={{
                uri: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
              }}
              scrollY={scrollY}
              offsetY={1000} // Posición en la que comienza el efecto
              parallaxAmount={0.3} // Cantidad de efecto parallax
              height={200}
              style={styles.parallaxImage}
            />

            <ParallaxImage
              source={{
                uri: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
              }}
              scrollY={scrollY}
              offsetY={1250} // Posición en la que comienza el efecto
              parallaxAmount={0.2} // Cantidad de efecto parallax
              height={200}
              style={styles.parallaxImage}
            />

            <ParallaxImage
              source={{
                uri: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
              }}
              scrollY={scrollY}
              offsetY={1500} // Posición en la que comienza el efecto
              parallaxAmount={0.4} // Cantidad de efecto parallax
              height={200}
              style={styles.parallaxImage}
            />
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>¿Listo para implementar parallax?</Text>
          <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
            Utiliza estos componentes en tus pantallas para crear experiencias visuales impactantes
          </Text>
          <AccessibleButton
            label="Explorar Documentación"
            onPress={() => {}}
            variant="primary"
            size="large"
            style={styles.actionButton}
          />
        </View>
      </ParallaxScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackgroundImage: {
    width: "100%",
    height: "100%",
    opacity: 0.7,
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  itemsContainer: {
    marginTop: 20,
  },
  itemCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: 14,
  },
  imagesContainer: {
    marginTop: 20,
  },
  parallaxImage: {
    width: "100%",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  actionSection: {
    padding: 20,
    alignItems: "center",
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  actionDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  actionButton: {
    width: "80%",
  },
  particlesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  particle: {
    position: "absolute",
    borderRadius: 50,
  },
  floatingIconsContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  floatingIcon: {
    position: "absolute",
    left: 50,
    top: 100,
  },
})
