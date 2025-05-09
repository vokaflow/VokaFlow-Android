"use client"

import React from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useDailyMissions } from "../../hooks/useDailyMissions"
import { useTheme } from "../../hooks/useTheme"
import { ListItemTransition } from "../../components/navigation/ListItemTransition"
import { ScreenTransition } from "../../components/navigation/ScreenTransition"

export const SpecialRewardsScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const { specialRewards, loadSpecialRewards } = useDailyMissions()

  // Agrupar recompensas por tipo
  const groupedRewards = React.useMemo(() => {
    const groups = {}
    specialRewards.forEach((reward) => {
      if (!groups[reward.type]) {
        groups[reward.type] = []
      }
      groups[reward.type].push(reward)
    })
    return groups
  }, [specialRewards])

  // Obtener nombre legible del tipo de recompensa
  const getRewardTypeName = (type) => {
    switch (type) {
      case "theme":
        return "Temas"
      case "avatar":
        return "Marcos de Avatar"
      case "sound":
        return "Sonidos"
      case "emoji":
        return "Emojis"
      case "background":
        return "Fondos"
      case "sticker":
        return "Stickers"
      default:
        return type
    }
  }

  // Obtener color según rareza
  const getRarityColor = (rarity) => {
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
  const getRarityText = (rarity) => {
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

  // Renderizar cada recompensa con animación
  const renderReward = ({ item, index }) => (
    <ListItemTransition index={index} type="scale" duration={300}>
      <TouchableOpacity
        style={[
          styles.rewardCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: getRarityColor(item.rarity),
          },
        ]}
        onPress={() => {
          // Aquí se podría implementar la funcionalidad para usar la recompensa
        }}
      >
        <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) }]}>
          <Text style={styles.rarityText}>{getRarityText(item.rarity)}</Text>
        </View>

        <Feather name={item.icon as any} size={32} color={getRarityColor(item.rarity)} style={styles.rewardIcon} />

        <Text style={[styles.rewardTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={[styles.rewardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      </TouchableOpacity>
    </ListItemTransition>
  )

  // Renderizar cada sección con animación
  const renderSection = ({ item: type, index }) => (
    <ListItemTransition index={index} type="slide-up" duration={400}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{getRewardTypeName(type)}</Text>

        <FlatList
          data={groupedRewards[type]}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderReward}
          contentContainerStyle={styles.rewardsList}
        />
      </View>
    </ListItemTransition>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTransition type="fade">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Recompensas Especiales</Text>
          <View style={{ width: 24 }} />
        </View>

        {specialRewards.length === 0 ? (
          <ListItemTransition index={0} type="fade" duration={500}>
            <View style={styles.emptyContainer}>
              <Feather name="gift" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aún no has obtenido recompensas especiales
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Completa misiones diarias para conseguirlas
              </Text>
            </View>
          </ListItemTransition>
        ) : (
          <FlatList
            data={Object.keys(groupedRewards)}
            keyExtractor={(item) => item}
            renderItem={renderSection}
            contentContainerStyle={styles.listContent}
            onRefresh={loadSpecialRewards}
            refreshing={false}
          />
        )}
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  rewardsList: {
    paddingRight: 16,
  },
  rewardCard: {
    width: 150,
    height: 180,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderLeftWidth: 3,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  rarityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  rewardIcon: {
    alignSelf: "center",
    marginVertical: 12,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
  },
})
