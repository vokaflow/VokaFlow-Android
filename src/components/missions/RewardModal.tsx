"use client"

import React from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../hooks/useTheme"
import LottieView from "lottie-react-native"

interface RewardModalProps {
  visible: boolean
  onClose: () => void
  reward: {
    points: number
    specialReward?: {
      title: string
      description: string
      icon: string
      rarity: string
    }
  } | null
}

export const RewardModal: React.FC<RewardModalProps> = ({ visible, onClose, reward }) => {
  const { colors } = useTheme()
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current
  const opacityAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      scaleAnim.setValue(0.5)
      opacityAnim.setValue(0)
    }
  }, [visible, scaleAnim, opacityAnim])

  if (!reward) return null

  // Obtener color según rareza
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return colors.missionCommon
      case "uncommon":
        return colors.missionUncommon
      case "rare":
        return colors.missionRare
      case "epic":
        return colors.missionEpic
      case "legendary":
        return colors.missionLegendary
      default:
        return colors.primary
    }
  }

  // Obtener texto de rareza
  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "Común"
      case "uncommon":
        return "Poco común"
      case "rare":
        return "Raro"
      case "epic":
        return "Épico"
      case "legendary":
        return "Legendario"
      default:
        return ""
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.cardBackground,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.confettiContainer}>
            <LottieView
              source={require("../../assets/animations/confetti.json")}
              autoPlay
              loop={false}
              style={styles.confetti}
            />
          </View>

          <View style={styles.header}>
            <Text style={[styles.headerText, { color: colors.text }]}>¡Recompensa Obtenida!</Text>
          </View>

          <View style={styles.pointsContainer}>
            <Feather name="award" size={24} color={colors.primary} />
            <Text style={[styles.pointsText, { color: colors.text }]}>+{reward.points} puntos</Text>
          </View>

          {reward.specialReward && (
            <View style={[styles.specialRewardContainer, { borderColor: getRarityColor(reward.specialReward.rarity) }]}>
              <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(reward.specialReward.rarity) }]}>
                <Text style={styles.rarityText}>{getRarityText(reward.specialReward.rarity)}</Text>
              </View>

              <Feather
                name={reward.specialReward.icon as any}
                size={40}
                color={getRarityColor(reward.specialReward.rarity)}
                style={styles.specialRewardIcon}
              />

              <Text style={[styles.specialRewardTitle, { color: colors.text }]}>{reward.specialReward.title}</Text>

              <Text style={[styles.specialRewardDescription, { color: colors.textSecondary }]}>
                {reward.specialReward.description}
              </Text>
            </View>
          )}

          <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.primary }]} onPress={onClose}>
            <Text style={styles.closeButtonText}>Aceptar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  confetti: {
    width: "100%",
    height: "100%",
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  specialRewardContainer: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 20,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    position: "absolute",
    top: -15,
  },
  rarityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  specialRewardIcon: {
    marginBottom: 12,
  },
  specialRewardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  specialRewardDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})
