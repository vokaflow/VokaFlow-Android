"use client"

import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useStats } from "../../hooks/useStats"
import { theme } from "../../theme"
import { Ionicons } from "@expo/vector-icons"
import { Dimensions } from "react-native"
import { useProfiles } from "../../hooks/useProfiles"
import { AnimatedLineChart } from "../../components/charts/AnimatedLineChart"
import { AnimatedPieChart } from "../../components/charts/AnimatedPieChart"
import { AnimatedBarChart } from "../../components/charts/AnimatedBarChart"
import { AnimatedProgressChart } from "../../components/charts/AnimatedProgressChart"

const screenWidth = Dimensions.get("window").width

export const DashboardScreen: React.FC = () => {
  const { stats, loading, error, updateStats } = useStats()
  const { activeProfile } = useProfiles()

  useEffect(() => {
    updateStats()
  }, [updateStats])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ff4d4d" />
        <Text style={styles.errorText}>Error al cargar estadísticas</Text>
        <TouchableOpacity style={styles.retryButton} onPress={updateStats}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!stats) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics" size={48} color={theme.colors.primary} />
        <Text style={styles.emptyText}>No hay estadísticas disponibles</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={updateStats}>
          <Text style={styles.refreshButtonText}>Actualizar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Preparar datos para gráficos
  const messageData = Object.keys(stats.messagesByDay)
    .slice(-7)
    .map((date) => ({
      label: date.split("-")[2], // Solo mostrar el día
      value: stats.messagesByDay[date],
    }))

  const mediaData = [
    { label: "Imágenes", value: stats.mediaByType.images },
    { label: "Audio", value: stats.mediaByType.audio },
    { label: "Videos", value: stats.mediaByType.videos },
    { label: "Documentos", value: stats.mediaByType.documents },
  ]

  const translationTypeData = [
    { label: "Texto-Texto", value: stats.translationsByType.textToText },
    { label: "Audio-Texto", value: stats.translationsByType.audioToText },
    { label: "Audio-Audio", value: stats.translationsByType.audioToAudio },
    { label: "Visual AR", value: stats.translationsByType.visualAR },
  ]

  // Calcular porcentaje de almacenamiento
  const totalStorage = stats.storageUsage.total
  const storagePercentage = totalStorage > 0 ? stats.storageUsage.messages / totalStorage : 0
  const mediaPercentage = totalStorage > 0 ? stats.storageUsage.media / totalStorage : 0
  const cachePercentage = totalStorage > 0 ? stats.storageUsage.cache / totalStorage : 0

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>{activeProfile ? `Perfil: ${activeProfile.name}` : "Estadísticas de uso"}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={updateStats}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.refreshButtonText}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Tarjetas de estadísticas destacadas */}
      <View style={styles.statsCards}>
        <View style={styles.card}>
          <Ionicons name="chatbubbles" size={24} color={theme.colors.primary} />
          <Text style={styles.cardValue}>{stats.totalMessagesSent + stats.totalMessagesReceived}</Text>
          <Text style={styles.cardLabel}>Mensajes Totales</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="language" size={24} color={theme.colors.primary} />
          <Text style={styles.cardValue}>{stats.totalTranslations}</Text>
          <Text style={styles.cardLabel}>Traducciones</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="images" size={24} color={theme.colors.primary} />
          <Text style={styles.cardValue}>{stats.totalMediaShared}</Text>
          <Text style={styles.cardLabel}>Archivos Compartidos</Text>
        </View>
      </View>

      {/* Gráfico de mensajes por día */}
      <View style={styles.chartContainer}>
        <AnimatedLineChart
          data={messageData}
          title="Mensajes por Día"
          height={220}
          showGrid={true}
          color={theme.colors.primary}
        />
      </View>

      {/* Gráfico de tipos de archivos */}
      <View style={styles.chartContainer}>
        <AnimatedPieChart data={mediaData} title="Tipos de Archivos Compartidos" height={280} showValues={true} />
      </View>

      {/* Gráfico de tipos de traducción */}
      <View style={styles.chartContainer}>
        <AnimatedBarChart data={translationTypeData} title="Tipos de Traducción" height={220} />
      </View>

      {/* Estadísticas de almacenamiento */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Almacenamiento</Text>
        <View style={styles.storageContainer}>
          <View style={styles.progressCharts}>
            <AnimatedProgressChart
              progress={storagePercentage}
              size={80}
              strokeWidth={8}
              title="Mensajes"
              subtitle={`${(stats.storageUsage.messages / 1024 / 1024).toFixed(2)} MB`}
              color={theme.colors.primary}
            />
            <AnimatedProgressChart
              progress={mediaPercentage}
              size={80}
              strokeWidth={8}
              title="Multimedia"
              subtitle={`${(stats.storageUsage.media / 1024 / 1024).toFixed(2)} MB`}
              color={theme.colors.secondary}
            />
            <AnimatedProgressChart
              progress={cachePercentage}
              size={80}
              strokeWidth={8}
              title="Caché"
              subtitle={`${(stats.storageUsage.cache / 1024 / 1024).toFixed(2)} MB`}
              color="#33FF57"
            />
          </View>
          <Text style={styles.totalStorage}>Total: {(stats.storageUsage.total / 1024 / 1024).toFixed(2)} MB</Text>
          <Text style={styles.compressionSavings}>
            Ahorro por compresión: {(stats.compressionSavings / 1024 / 1024).toFixed(2)} MB
          </Text>
        </View>
      </View>

      {/* Chats más activos */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Chats Más Activos</Text>
        {stats.topChats.length > 0 ? (
          stats.topChats.map((chat, index) => (
            <View key={chat.id} style={styles.chatItem}>
              <Text style={styles.chatRank}>{index + 1}</Text>
              <Text style={styles.chatName}>{chat.name}</Text>
              <Text style={styles.chatCount}>{chat.count} mensajes</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyListText}>No hay chats activos</Text>
        )}
      </View>

      {/* Estadísticas de conectividad */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Conectividad</Text>
        <View style={styles.connectivityStats}>
          <View style={styles.connectivityItem}>
            <AnimatedProgressChart
              progress={stats.onlinePercentage / 100}
              size={100}
              strokeWidth={10}
              title="Tiempo Online"
              subtitle={`${stats.onlinePercentage}%`}
              color={theme.colors.success}
            />
          </View>
          <View style={styles.connectivityItem}>
            <View style={styles.offlineStats}>
              <Ionicons name="time-outline" size={32} color={theme.colors.warning} />
              <Text style={styles.offlineValue}>
                {Math.floor(stats.offlineTime / 60)} h {stats.offlineTime % 60} min
              </Text>
              <Text style={styles.offlineLabel}>Tiempo Offline</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.lastUpdated}>Última actualización: {new Date(stats.lastUpdated).toLocaleString()}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.text,
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  errorText: {
    color: theme.colors.text,
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  emptyText: {
    color: theme.colors.text,
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statsCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "30%",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  chartContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  sectionContainer: {
    margin: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 16,
  },
  storageContainer: {
    width: "100%",
  },
  progressCharts: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  totalStorage: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  compressionSavings: {
    color: theme.colors.primary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  chatRank: {
    width: 30,
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  chatName: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  chatCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyListText: {
    color: theme.colors.textSecondary,
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
  connectivityStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  connectivityItem: {
    alignItems: "center",
    width: "45%",
  },
  offlineStats: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 16,
  },
  offlineValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  offlineLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  lastUpdated: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginVertical: 16,
  },
})
