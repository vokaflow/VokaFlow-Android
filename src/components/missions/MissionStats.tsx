"use client"

import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../../hooks/useTheme"

interface MissionStatsProps {
  stats: {
    totalCompleted: number
    totalPoints: number
    specialRewards: number
    missionTypes: Record<string, number>
  }
}

export const MissionStats: React.FC<MissionStatsProps> = ({ stats }) => {
  const { colors } = useTheme()

  if (!stats) return null

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.title, { color: colors.text }]}>Estadísticas de Misiones</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Feather name="check-circle" size={24} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalCompleted}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completadas</Text>
        </View>

        <View style={styles.statItem}>
          <Feather name="award" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalPoints}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Puntos</Text>
        </View>

        <View style={styles.statItem}>
          <Feather name="gift" size={24} color={colors.missionEpic} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.specialRewards}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Recompensas</Text>
        </View>
      </View>

      {Object.keys(stats.missionTypes).length > 0 && (
        <View style={styles.typesContainer}>
          <Text style={[styles.typesTitle, { color: colors.text }]}>Tipos de Misiones</Text>

          {Object.entries(stats.missionTypes).map(([type, count]) => (
            <View key={type} style={styles.typeItem}>
              <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>{getMissionTypeName(type)}</Text>
              <Text style={[styles.typeValue, { color: colors.text }]}>{count}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

// Función para obtener nombre legible del tipo de misión
function getMissionTypeName(type: string): string {
  switch (type) {
    case "send_messages":
      return "Enviar mensajes"
    case "complete_translations":
      return "Completar traducciones"
    case "share_media":
      return "Compartir multimedia"
    case "use_features":
      return "Usar funciones"
    case "chat_duration":
      return "Tiempo de chat"
    case "add_contacts":
      return "Añadir contactos"
    case "update_status":
      return "Actualizar estado"
    case "change_settings":
      return "Cambiar configuración"
    case "use_offline":
      return "Usar modo offline"
    case "compress_media":
      return "Comprimir multimedia"
    default:
      return type
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  typesContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
    paddingTop: 16,
  },
  typesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  typeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
  },
  typeValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
})
