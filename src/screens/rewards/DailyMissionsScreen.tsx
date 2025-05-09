"use client"

import React, { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useDailyMissions } from "../../hooks/useDailyMissions"
import { MissionCard } from "../../components/missions/MissionCard"
import { RewardModal } from "../../components/missions/RewardModal"
import { MissionStats } from "../../components/missions/MissionStats"
import { useTheme } from "../../hooks/useTheme"
import { MissionRarity } from "../../services/missions"
import { AnimatedLogo } from "../../components/common/AnimatedLogo"
import { ListItemTransition } from "../../components/navigation/ListItemTransition"
import { ScreenTransition } from "../../components/navigation/ScreenTransition"
import { AccessibleButton } from "../../components/accessibility/AccessibleButton"
import { IconButton } from "../../components/accessibility/IconButton"
import { HapticType } from "../../services/feedback/hapticFeedback"

export const DailyMissionsScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const { missions, loading, refreshing, refreshMissions, claimReward, stats } = useDailyMissions()

  const [rewardModalVisible, setRewardModalVisible] = useState(false)
  const [currentReward, setCurrentReward] = useState(null)

  // Filtrar misiones por estado
  const [filter, setFilter] = useState("all") // 'all', 'active', 'completed'

  const filteredMissions = React.useMemo(() => {
    switch (filter) {
      case "active":
        return missions.filter((mission) => !mission.isCompleted)
      case "completed":
        return missions.filter((mission) => mission.isCompleted)
      default:
        return missions
    }
  }, [missions, filter])

  // Ordenar misiones: primero completadas no reclamadas, luego por rareza, luego por progreso
  const sortedMissions = React.useMemo(() => {
    return [...filteredMissions].sort((a, b) => {
      // Primero las completadas no reclamadas
      if (a.isCompleted && !a.isClaimed && !(b.isCompleted && !b.isClaimed)) return -1
      if (b.isCompleted && !b.isClaimed && !(a.isCompleted && !a.isClaimed)) return 1

      // Luego por rareza (de mayor a menor)
      const rarityOrder = {
        [MissionRarity.LEGENDARY]: 0,
        [MissionRarity.EPIC]: 1,
        [MissionRarity.RARE]: 2,
        [MissionRarity.UNCOMMON]: 3,
        [MissionRarity.COMMON]: 4,
      }

      if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
        return rarityOrder[a.rarity] - rarityOrder[b.rarity]
      }

      // Finalmente por progreso (de mayor a menor)
      return b.progress - a.progress
    })
  }, [filteredMissions])

  // Manejar reclamo de recompensa
  const handleClaimReward = async (missionId) => {
    const result = await claimReward(missionId)
    if (result.success) {
      setCurrentReward(result)
      setRewardModalVisible(true)
    }
  }

  // Añadir una referencia de animación después de los estados
  const logoRotateAnim = useRef(new Animated.Value(0)).current

  // Añadir un useEffect para la animación del logo
  useEffect(() => {
    // Crear una animación de rotación suave para el logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateAnim, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [logoRotateAnim])

  // Crear el interpolador para la rotación
  const spin = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  // Renderizar cada misión con animación
  const renderMission = ({ item, index }) => (
    <ListItemTransition index={index} type="slide-up" duration={400}>
      <MissionCard mission={item} onClaim={handleClaimReward} />
    </ListItemTransition>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTransition type="fade">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <AnimatedLogo size="small" animation="pulse" duration={2000} style={{ transform: [{ rotate: spin }] }} />
            <Text style={[styles.title, { color: colors.text }]}>Misiones Diarias</Text>
          </View>
          <IconButton
            icon={<Feather name="gift" size={24} color="#fff" />}
            accessibilityLabel="Ver recompensas especiales"
            onPress={() => navigation.navigate("SpecialRewards")}
            variant="primary"
            size="medium"
            hapticType={HapticType.LIGHT}
            animationPreset="scale"
            style={{ backgroundColor: colors.primary }}
          />
        </View>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          <ListItemTransition index={0} type="fade-scale" duration={300}>
            <AccessibleButton
              label="Todas"
              onPress={() => setFilter("all")}
              variant={filter === "all" ? "primary" : "ghost"}
              size="small"
              hapticType={HapticType.LIGHT}
              animationPreset="scale"
              style={styles.filterButton}
            />
          </ListItemTransition>

          <ListItemTransition index={1} type="fade-scale" duration={300}>
            <AccessibleButton
              label="Activas"
              onPress={() => setFilter("active")}
              variant={filter === "active" ? "primary" : "ghost"}
              size="small"
              hapticType={HapticType.LIGHT}
              animationPreset="scale"
              style={styles.filterButton}
            />
          </ListItemTransition>

          <ListItemTransition index={2} type="fade-scale" duration={300}>
            <AccessibleButton
              label="Completadas"
              onPress={() => setFilter("completed")}
              variant={filter === "completed" ? "primary" : "ghost"}
              size="small"
              hapticType={HapticType.LIGHT}
              animationPreset="scale"
              style={styles.filterButton}
            />
          </ListItemTransition>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {stats && (
              <ListItemTransition index={0} type="fade" duration={500}>
                <MissionStats stats={stats} />
              </ListItemTransition>
            )}

            <FlatList
              data={sortedMissions}
              keyExtractor={(item) => item.id}
              renderItem={renderMission}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshMissions}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              ListEmptyComponent={
                <ListItemTransition index={0} type="fade" duration={500}>
                  <View style={styles.emptyContainer}>
                    <Feather name="inbox" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay misiones disponibles</Text>
                  </View>
                </ListItemTransition>
              }
              contentContainerStyle={styles.listContent}
            />
          </>
        )}

        <RewardModal visible={rewardModalVisible} onClose={() => setRewardModalVisible(false)} reward={currentReward} />
      </ScreenTransition>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
})
