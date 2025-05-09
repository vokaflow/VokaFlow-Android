"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAccessibility } from "../../hooks/useAccessibility"
import { AccessibleText } from "../../components/accessibility/AccessibleText"
import { AccessibleButton } from "../../components/accessibility/AccessibleButton"
import { Toast } from "../../components/notifications/Toast"
import { Spinner } from "../../components/loading/Spinner"
import { ProgressBar } from "../../components/loading/ProgressBar"
import { ParallaxHeader } from "../../components/parallax/ParallaxHeader"
import { ParallaxImage } from "../../components/parallax/ParallaxImage"
import { useAccessibleAnimation } from "../../hooks/useAccessibleAnimation"
import { Animated } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export default function AccessibleAnimationDemoScreen({ navigation }) {
  const { config, getContrastColors, isAnimationTypeEnabled } = useAccessibility()
  const colors = getContrastColors()
  const [showToast, setShowToast] = useState(false)
  const [progress, setProgress] = useState(0.3)

  // Animaciones accesibles para demostración
  const fadeAnimation = useAccessibleAnimation({
    type: "fade",
    animationType: "transitions",
    baseDuration: 1000,
    loop: true,
  })

  const bounceAnimation = useAccessibleAnimation({
    type: "bounce",
    animationType: "icons",
    baseDuration: 1500,
    loop: true,
  })

  const rotateAnimation = useAccessibleAnimation({
    type: "rotate",
    animationType: "icons",
    baseDuration: 2000,
    loop: true,
  })

  const pulseAnimation = useAccessibleAnimation({
    type: "pulse",
    animationType: "buttons",
    baseDuration: 1200,
    loop: true,
  })

  // Incrementar progreso para demostración
  const incrementProgress = () => {
    setProgress((prev) => (prev >= 1 ? 0 : prev + 0.1))
  }

  // Mostrar toast para demostración
  const showToastDemo = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ParallaxHeader
        title="Animaciones Accesibles"
        subtitle="Demostración de animaciones adaptadas a preferencias de accesibilidad"
        height={200}
        parallaxEnabled={isAnimationTypeEnabled("parallax")}
      />

      <ScrollView>
        <View style={styles.section}>
          <AccessibleText variant="h2">Estado Actual</AccessibleText>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <AccessibleText variant="body">Reducir Movimiento:</AccessibleText>
              <View
                style={[styles.statusIndicator, { backgroundColor: config.reduceMotion ? "#FF3B30" : "#34C759" }]}
              />
            </View>
            <View style={styles.statusItem}>
              <AccessibleText variant="body">Nivel de Animaciones:</AccessibleText>
              <AccessibleText variant="body" color="#FF00FF">
                {config.animationPreset === "full"
                  ? "Completo"
                  : config.animationPreset === "reduced"
                    ? "Reducido"
                    : config.animationPreset === "minimal"
                      ? "Mínimo"
                      : "Ninguno"}
              </AccessibleText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <AccessibleText variant="h2">Botones</AccessibleText>
          <View style={styles.demoRow}>
            <AccessibleButton
              label="Escala"
              onPress={() => {}}
              variant="primary"
              animationPreset="scale"
              style={styles.demoButton}
            />
            <AccessibleButton
              label="Opacidad"
              onPress={() => {}}
              variant="secondary"
              animationPreset="opacity"
              style={styles.demoButton}
            />
            <AccessibleButton
              label="Resaltado"
              onPress={() => {}}
              variant="outline"
              animationPreset="highlight"
              style={styles.demoButton}
            />
          </View>
        </View>

        <View style={styles.section}>
          <AccessibleText variant="h2">Notificaciones</AccessibleText>
          <AccessibleButton label="Mostrar Toast" onPress={showToastDemo} variant="primary" fullWidth />
          {showToast && (
            <Toast
              notification={{
                id: "demo",
                type: "success",
                message: "Esta es una notificación de demostración",
                title: "Notificación",
                animation: "slide",
              }}
              onClose={() => setShowToast(false)}
              style={styles.toast}
            />
          )}
        </View>

        <View style={styles.section}>
          <AccessibleText variant="h2">Indicadores de Carga</AccessibleText>
          <View style={styles.loadersContainer}>
            <View style={styles.loaderItem}>
              <AccessibleText variant="caption">Circle</AccessibleText>
              <Spinner type="circle" size="medium" />
            </View>
            <View style={styles.loaderItem}>
              <AccessibleText variant="caption">Dots</AccessibleText>
              <Spinner type="dots" size="medium" />
            </View>
            <View style={styles.loaderItem}>
              <AccessibleText variant="caption">Wave</AccessibleText>
              <Spinner type="wave" size="medium" />
            </View>
            <View style={styles.loaderItem}>
              <AccessibleText variant="caption">Neon</AccessibleText>
              <Spinner type="neon" size="medium" />
            </View>
          </View>

          <View style={styles.progressContainer}>
            <AccessibleText variant="body">Barra de Progreso ({Math.round(progress * 100)}%)</AccessibleText>
            <ProgressBar progress={progress} style={styles.progressBar} />
            <AccessibleButton
              label="Incrementar Progreso"
              onPress={incrementProgress}
              variant="secondary"
              size="small"
            />
          </View>
        </View>

        <View style={styles.section}>
          <AccessibleText variant="h2">Animaciones Personalizadas</AccessibleText>
          <View style={styles.customAnimationsContainer}>
            <View style={styles.animationItem}>
              <AccessibleText variant="caption">Fade</AccessibleText>
              <Animated.View
                style={[
                  styles.animationBox,
                  {
                    backgroundColor: "#FF00FF",
                    opacity: fadeAnimation.animatedValue,
                  },
                ]}
              />
            </View>

            <View style={styles.animationItem}>
              <AccessibleText variant="caption">Bounce</AccessibleText>
              <Animated.View
                style={[
                  styles.animationBox,
                  {
                    backgroundColor: "#00FFFF",
                    transform: [{ scale: bounceAnimation.animatedValue }],
                  },
                ]}
              />
            </View>

            <View style={styles.animationItem}>
              <AccessibleText variant="caption">Rotate</AccessibleText>
              <Animated.View
                style={[
                  styles.animationBox,
                  {
                    backgroundColor: "#FFFF00",
                    transform: [
                      {
                        rotate: rotateAnimation.animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Icon name="star" size={24} color="#000" />
              </Animated.View>
            </View>

            <View style={styles.animationItem}>
              <AccessibleText variant="caption">Pulse</AccessibleText>
              <Animated.View
                style={[
                  styles.animationBox,
                  {
                    backgroundColor: "#FF3B30",
                    transform: [{ scale: pulseAnimation.animatedValue }],
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <AccessibleText variant="h2">Parallax</AccessibleText>
          <View style={styles.parallaxContainer}>
            <ParallaxImage
              source={{ uri: "https://picsum.photos/id/237/400/200" }}
              height={200}
              parallaxFactor={0.5}
              enabled={isAnimationTypeEnabled("parallax")}
              style={styles.parallaxImage}
            />
            <AccessibleText variant="caption" style={styles.parallaxCaption}>
              Desplázate para ver el efecto parallax
            </AccessibleText>
          </View>
        </View>

        <View style={styles.section}>
          <AccessibleButton
            label="Ir a Configuración de Accesibilidad"
            onPress={() => navigation.navigate("AccessibilitySettings")}
            variant="primary"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  statusContainer: {
    marginTop: 8,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    padding: 12,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  demoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  demoButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  toast: {
    position: "relative",
    marginTop: 16,
  },
  loadersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 24,
  },
  loaderItem: {
    alignItems: "center",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    marginVertical: 12,
  },
  customAnimationsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    flexWrap: "wrap",
  },
  animationItem: {
    alignItems: "center",
    width: "48%",
    marginBottom: 16,
  },
  animationBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  parallaxContainer: {
    marginTop: 12,
  },
  parallaxImage: {
    borderRadius: 8,
  },
  parallaxCaption: {
    textAlign: "center",
    marginTop: 8,
  },
})
