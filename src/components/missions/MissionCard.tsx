"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Feather } from "@expo/vector-icons"
import { ProgressBar } from "../rewards/ProgressBar"
import { MissionRarity } from "../../services/missions"
import { useTheme } from "../../hooks/useTheme"

interface MissionCardProps {
  mission: {
    id: string
    title: string
    description: string
    icon: string
    targetValue: number
    currentValue: number
    progress: number
    pointsReward: number
    isCompleted: boolean
    isClaimed: boolean
    rarity: MissionRarity
    expiresAt: Date
  }
  onClaim: (missionId: string) => void
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, onClaim }) => {
  const { colors } = useTheme()

  // Obtener color según rareza
  const getRarityColor = () => {
    switch (mission.rarity) {
      case MissionRarity.COMMON:
        return colors.missionCommon
      case MissionRarity.UNCOMMON:
        return colors.missionUncommon
      case MissionRarity.RARE:
        return colors.missionRare
      case MissionRarity.EPIC:
        return colors.missionEpic
      case MissionRarity.LEGENDARY:
        return colors.missionLegendary
      default:
        return colors.primary
    }
  }

  // Obtener texto de rareza
  const getRarityText = () => {
    switch (mission.rarity) {
      case MissionRarity.COMMON:
        return "Común"
      case MissionRarity.UNCOMMON:
        return "Poco común"
      case MissionRarity.RARE:
        return "Raro"
      case MissionRarity.EPIC:
        return "Épico"
      case MissionRarity.LEGENDARY:
        return "Legendario"
      default:
        return ""
    }
  }

  // Calcular tiempo restante
  const getTimeRemaining = () => {
    const now = new Date()
    const diff = mission.expiresAt.getTime() - now.getTime()

    if (diff <= 0) return "Expirada"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m restantes`
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: getRarityColor() }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Feather name={mission.icon as any} size={20} color={getRarityColor()} />
          <Text style={[styles.title, { color: colors.text }]}>{mission.title}</Text>
        </View>
        <View style={[styles.rarityBadge, { backgroundColor: getRarityColor() }]}>
          <Text style={styles.rarityText}>{getRarityText()}</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>{mission.description}</Text>

      <View style={styles.progressContainer}>
        <ProgressBar progress={mission.progress} color={getRarityColor()} backgroundColor={colors.progressBackground} />
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {mission.currentValue}/{mission.targetValue}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.rewardContainer}>
          <Text style={[styles.rewardLabel, { color: colors.textSecondary }]}>Recompensa:</Text>
          <Text style={[styles.rewardValue, { color: colors.text }]}>{mission.pointsReward} puntos</Text>
        </View>

        {mission.isCompleted && !mission.isClaimed ? (
          <TouchableOpacity
            style={[styles.claimButton, { backgroundColor: getRarityColor() }]}
            onPress={() => onClaim(mission.id)}
          >
            <Text style={styles.claimButtonText}>Reclamar</Text>
          </TouchableOpacity>
        ) : mission.isClaimed ? (
          <View style={[styles.claimedBadge, { backgroundColor: colors.success }]}>
            <Text style={styles.claimedText}>Reclamada</Text>
          </View>
        ) : (
          <Text style={[styles.timeRemaining, { color: colors.textSecondary }]}>{getTimeRemaining()}</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rewardLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  claimButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  claimButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  claimedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  claimedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  timeRemaining: {
    fontSize: 12,
  },
})
