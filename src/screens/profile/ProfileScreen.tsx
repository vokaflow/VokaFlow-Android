"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, Image, Animated, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../hooks/useTheme"
import { useProfiles } from "../../hooks/useProfiles"
import { ParallaxScrollView } from "../../components/parallax/ParallaxScrollView"
import { ParallaxHeader } from "../../components/parallax/ParallaxHeader"
import { ParallaxItem } from "../../components/parallax/ParallaxItem"
import { AccessibleButton } from "../../components/accessibility/AccessibleButton"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export const ProfileScreen: React.FC = () => {
  const { colors } = useTheme()
  const { activeProfile } = useProfiles()
  const [scrollY] = useState(new Animated.Value(0))

  // Si no hay perfil activo, mostrar mensaje
  if (!activeProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Feather name="user-x" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No hay perfil activo</Text>
          <AccessibleButton
            label="Seleccionar Perfil"
            onPress={() => {}}
            variant="primary"
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    )
  }

  // Renderizar cabecera con parallax
  const renderHeader = () => (
    <ParallaxHeader
      height={300}
      scrollY={scrollY}
      backgroundImage={
        activeProfile.coverImage ? (
          <Image source={{ uri: activeProfile.coverImage }} style={styles.headerBackgroundImage} />
        ) : (
          <View style={[styles.headerBackgroundFallback, { backgroundColor: colors.primary }]} />
        )
      }
      foregroundContent={
        <View style={styles.headerContent}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                activeProfile.avatar ? { uri: activeProfile.avatar } : require("../../../assets/default-avatar.png")
              }
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.profileName}>{activeProfile.name}</Text>
          <Text style={styles.profileBio}>{activeProfile.bio || "Sin biografía"}</Text>
        </View>
      }
    />
  )

  // Datos de ejemplo para la demostración
  const statsItems = [
    { id: "1", title: "Mensajes", value: activeProfile.stats?.totalMessages || 0, icon: "message-circle" },
    { id: "2", title: "Traducciones", value: activeProfile.stats?.totalTranslations || 0, icon: "globe" },
    { id: "3", title: "Archivos", value: activeProfile.stats?.totalFiles || 0, icon: "file" },
    { id: "4", title: "Misiones", value: activeProfile.stats?.completedMissions || 0, icon: "award" },
    { id: "5", title: "Puntos", value: activeProfile.stats?.totalPoints || 0, icon: "star" },
  ]

  // Renderizar capas de parallax
  const renderLayers = () => [
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
                      inputRange: [0, 300],
                      outputRange: [0, -50],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    translateX: scrollY.interpolate({
                      inputRange: [0, 300],
                      outputRange: [0, 30],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <Feather name="star" size={20} color={colors.primary} />
          </Animated.View>
          <Animated.View
            style={[
              styles.floatingIcon,
              {
                left: 100,
                top: 150,
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [0, 300],
                      outputRange: [0, -70],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    translateX: scrollY.interpolate({
                      inputRange: [0, 300],
                      outputRange: [0, -40],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <Feather name="award" size={25} color={colors.secondary} />
          </Animated.View>
          <Animated.View
            style={[
              styles.floatingIcon,
              {
                right: 50,
                top: 200,
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [0, 300],
                      outputRange: [0, -100],
                      extrapolate: "clamp",
                    }),
                  },
                  {
                    translateX: scrollY.interpolate({
                      inputRange: [0, 300],
                      outputRange: [0, -20],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <Feather name="message-circle" size={22} color={colors.accent} />
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
        headerParallaxAmount={0.5}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Estadísticas</Text>

          <View style={styles.statsContainer}>
            {statsItems.map((item, index) => (
              <ParallaxItem
                key={item.id}
                scrollY={scrollY}
                offsetY={350 + index * 70} // Posición en la que comienza el efecto
                parallaxAmount={0.1} // Cantidad de efecto parallax
                style={[styles.statCard, { backgroundColor: colors.cardBackground }]}
              >
                <View style={[styles.statIconContainer, { backgroundColor: colors.primary + "20" }]}>
                  <Feather name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <View style={styles.statContent}>
                  <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{item.title}</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
                </View>
              </ParallaxItem>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferencias</Text>

          <View style={[styles.preferencesCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.preferenceItem}>
              <Feather name="globe" size={20} color={colors.primary} />
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>Idioma Principal</Text>
              <Text style={[styles.preferenceValue, { color: colors.textSecondary }]}>
                {activeProfile.preferences?.language || "Español"}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.preferenceItem}>
              <Feather name="moon" size={20} color={colors.primary} />
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>Tema</Text>
              <Text style={[styles.preferenceValue, { color: colors.textSecondary }]}>
                {activeProfile.preferences?.theme || "Oscuro"}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.preferenceItem}>
              <Feather name="bell" size={20} color={colors.primary} />
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>Notificaciones</Text>
              <Text style={[styles.preferenceValue, { color: colors.textSecondary }]}>
                {activeProfile.preferences?.notifications ? "Activadas" : "Desactivadas"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionSection}>
          <AccessibleButton
            label="Editar Perfil"
            onPress={() => {}}
            variant="primary"
            leftIcon="edit-2"
            style={styles.actionButton}
          />
          <AccessibleButton
            label="Cambiar Perfil"
            onPress={() => {}}
            variant="outline"
            leftIcon="users"
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    width: "60%",
  },
  headerBackgroundImage: {
    width: "100%",
    height: "100%",
  },
  headerBackgroundFallback: {
    width: "100%",
    height: "100%",
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  profileBio: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsContainer: {
    marginTop: 10,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  preferencesCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  preferenceLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  preferenceValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    width: "100%",
  },
  actionSection: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
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
