"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useDailyMissions } from "../../hooks/useDailyMissions"
import { useTheme } from "../../hooks/useTheme"
import { ScreenTransition } from "../../components/navigation/ScreenTransition"

export const RewardsScreen = () => {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { stats, specialRewards } = useDailyMissions()
  const [activeTab, setActiveTab] = useState("missions")

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTransition type="fade" duration={500}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Recompensas</Text>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "missions" && { borderBottomColor: colors.primary }]}
              onPress={() => setActiveTab("missions")}
            >
              <Text
                style={[styles.tabText, { color: activeTab === "missions" ? colors.primary : colors.textSecondary }]}
              >
                Misiones
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "achievements" && { borderBottomColor: colors.primary }]}
              onPress={() => setActiveTab("achievements")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === "achievements" ? colors.primary : colors.textSecondary },
                ]}
              >
                Logros
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "rewards" && { borderBottomColor: colors.primary }]}
              onPress={() => setActiveTab("rewards")}
            >
              <Text
                style={[styles.tabText, { color: activeTab === "rewards" ? colors.primary : colors.textSecondary }]}
              >
                Colección
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {activeTab === "missions" && (
            <ScreenTransition type="slide" duration={300}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Misiones Diarias</Text>
                  <TouchableOpacity
                    style={[styles.viewAllButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("DailyMissions")}
                  >
                    <Text style={styles.viewAllButtonText}>Ver Todas</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
                  <View style={styles.statItem}>
                    <Feather name="check-circle" size={24} color={colors.success} />
                    <Text style={[styles.statValue, { color: colors.text }]}>{stats?.totalCompleted || 0}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completadas</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Feather name="award" size={24} color={colors.primary} />
                    <Text style={[styles.statValue, { color: colors.text }]}>{stats?.totalPoints || 0}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Puntos</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Feather name="gift" size={24} color={colors.secondary} />
                    <Text style={[styles.statValue, { color: colors.text }]}>{stats?.specialRewards || 0}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Recompensas</Text>
                  </View>
                </View>
              </View>
            </ScreenTransition>
          )}

          {activeTab === "achievements" && (
            <ScreenTransition type="slide" duration={300}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Logros</Text>
                  <TouchableOpacity
                    style={[styles.viewAllButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("Achievements")}
                  >
                    <Text style={styles.viewAllButtonText}>Ver Todos</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
                  <Feather name="award" size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Completa misiones para desbloquear logros
                  </Text>
                </View>
              </View>
            </ScreenTransition>
          )}

          {activeTab === "rewards" && (
            <ScreenTransition type="slide" duration={300}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Recompensas Especiales</Text>
                  <TouchableOpacity
                    style={[styles.viewAllButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("SpecialRewards")}
                  >
                    <Text style={styles.viewAllButtonText}>Ver Todas</Text>
                  </TouchableOpacity>
                </View>

                {specialRewards && specialRewards.length > 0 ? (
                  <View style={[styles.rewardsGrid, { backgroundColor: colors.cardBackground }]}>
                    {specialRewards.slice(0, 3).map((reward) => (
                      <TouchableOpacity
                        key={reward.id}
                        style={styles.rewardItem}
                        onPress={() => navigation.navigate("RewardDetails", { reward })}
                      >
                        <Feather name={reward.icon} size={32} color={colors.primary} />
                        <Text style={[styles.rewardTitle, { color: colors.text }]} numberOfLines={1}>
                          {reward.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
                    <Feather name="gift" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      Completa misiones para obtener recompensas especiales
                    </Text>
                  </View>
                )}
              </View>
            </ScreenTransition>
          )}
        </ScrollView>
      </ScreenTransition>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewAllButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  rewardsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  rewardItem: {
    alignItems: "center",
    width: "30%",
  },
  rewardTitle: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
})
