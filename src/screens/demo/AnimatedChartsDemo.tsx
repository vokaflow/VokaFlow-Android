"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useTheme } from "../../hooks/useTheme"
import { useAccessibility } from "../../hooks/useAccessibility"
import { AnimatedBarChart } from "../../components/charts/AnimatedBarChart"
import { AnimatedLineChart } from "../../components/charts/AnimatedLineChart"
import { AnimatedPieChart } from "../../components/charts/AnimatedPieChart"
import { AnimatedAreaChart } from "../../components/charts/AnimatedAreaChart"
import { AnimatedRadarChart } from "../../components/charts/AnimatedRadarChart"
import { AnimatedProgressChart } from "../../components/charts/AnimatedProgressChart"
import { Ionicons } from "@expo/vector-icons"

export const AnimatedChartsDemo: React.FC = () => {
  const { colors } = useTheme()
  const { areAnimationsEnabled, updateConfig, config } = useAccessibility()
  const [refreshKey, setRefreshKey] = useState(0)

  // Datos de ejemplo para los gráficos
  const barData = [
    { label: "Lun", value: 42 },
    { label: "Mar", value: 68 },
    { label: "Mié", value: 35 },
    { label: "Jue", value: 56 },
    { label: "Vie", value: 78 },
    { label: "Sáb", value: 90 },
    { label: "Dom", value: 48 },
  ]

  const lineData = [
    { label: "Ene", value: 20 },
    { label: "Feb", value: 45 },
    { label: "Mar", value: 28 },
    { label: "Abr", value: 80 },
    { label: "May", value: 99 },
    { label: "Jun", value: 43 },
  ]

  const pieData = [
    { label: "Trabajo", value: 35 },
    { label: "Familia", value: 25 },
    { label: "Ocio", value: 20 },
    { label: "Salud", value: 15 },
    { label: "Otros", value: 5 },
  ]

  const radarData = [
    { label: "Fuerza", value: 80, maxValue: 100 },
    { label: "Velocidad", value: 70, maxValue: 100 },
    { label: "Resistencia", value: 90, maxValue: 100 },
    { label: "Precisión", value: 60, maxValue: 100 },
    { label: "Agilidad", value: 75, maxValue: 100 },
    { label: "Equilibrio", value: 85, maxValue: 100 },
  ]

  // Función para refrescar los gráficos
  const refreshCharts = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Función para alternar las animaciones
  const toggleAnimations = async () => {
    await updateConfig({ reduceMotion: !config.reduceMotion })
    refreshCharts()
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Gráficos Animados</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Visualización de datos con animaciones</Text>

        <View style={styles.controls}>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={refreshCharts}>
            <Ionicons name="refresh" size={16} color="white" />
            <Text style={styles.buttonText}>Refrescar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: areAnimationsEnabled() ? colors.error : colors.success }]}
            onPress={toggleAnimations}
          >
            <Ionicons name={areAnimationsEnabled() ? "eye-off" : "eye"} size={16} color="white" />
            <Text style={styles.buttonText}>
              {areAnimationsEnabled() ? "Desactivar Animaciones" : "Activar Animaciones"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Gráfico de Barras</Text>
        <AnimatedBarChart key={`bar-${refreshKey}`} data={barData} title="Actividad Semanal" height={220} />
      </View>

      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Gráfico de Líneas</Text>
        <AnimatedLineChart key={`line-${refreshKey}`} data={lineData} title="Tendencia Mensual" height={220} />
      </View>

      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Gráfico de Área</Text>
        <AnimatedAreaChart key={`area-${refreshKey}`} data={lineData} title="Progreso Acumulado" height={220} />
      </View>

      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Gráfico Circular</Text>
        <AnimatedPieChart key={`pie-${refreshKey}`} data={pieData} title="Distribución del Tiempo" height={300} />
      </View>

      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Gráfico de Radar</Text>
        <AnimatedRadarChart key={`radar-${refreshKey}`} data={radarData} title="Análisis de Habilidades" height={300} />
      </View>

      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Gráficos de Progreso</Text>
        <View style={styles.progressContainer}>
          <AnimatedProgressChart
            key={`progress1-${refreshKey}`}
            progress={0.75}
            title="Completado"
            subtitle="75% del objetivo"
            size={120}
          />
          <AnimatedProgressChart
            key={`progress2-${refreshKey}`}
            progress={0.42}
            title="En Progreso"
            subtitle="42% completado"
            size={120}
            color={colors.warning}
          />
          <AnimatedProgressChart
            key={`progress3-${refreshKey}`}
            progress={0.9}
            title="Casi Terminado"
            subtitle="90% completado"
            size={120}
            color={colors.success}
          />
        </View>
      </View>
    </ScrollView>
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
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  controls: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    marginLeft: 6,
    fontWeight: "500",
  },
  chartSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
})
