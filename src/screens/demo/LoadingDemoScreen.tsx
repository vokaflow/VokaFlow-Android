"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from "../../hooks/useTheme"
import { Spinner } from "../../components/loading/Spinner"
import { SkeletonLoader } from "../../components/loading/SkeletonLoader"
import { ProgressBar } from "../../components/loading/ProgressBar"
import { LoadingOverlay } from "../../components/loading/LoadingOverlay"
import { PullToRefresh } from "../../components/loading/PullToRefresh"
import { AccessibleButton } from "../../components/accessibility/AccessibleButton"
import { Feather } from "@expo/vector-icons"

export const LoadingDemoScreen = ({ navigation }) => {
  const { colors } = useTheme()
  const [progress, setProgress] = useState(0)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Simular progreso
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 0
        }
        return prev + 5
      })
    }, 500)

    return () => clearInterval(interval)
  }, [progress])

  // Simular refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setRefreshing(false)
  }

  // Simular carga con overlay
  const showOverlay = () => {
    setOverlayVisible(true)
    setTimeout(() => {
      setOverlayVisible(false)
    }, 3000)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Animaciones de Carga</Text>
        <View style={{ width: 24 }} />
      </View>

      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing} spinnerVariant="neon">
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Spinners</Text>
            <View style={styles.spinnerRow}>
              <View style={styles.spinnerItem}>
                <Spinner variant="circle" color={colors.primary} />
                <Text style={[styles.spinnerLabel, { color: colors.textSecondary }]}>Circle</Text>
              </View>
              <View style={styles.spinnerItem}>
                <Spinner variant="dots" color={colors.secondary} />
                <Text style={[styles.spinnerLabel, { color: colors.textSecondary }]}>Dots</Text>
              </View>
              <View style={styles.spinnerItem}>
                <Spinner variant="pulse" color={colors.success} />
                <Text style={[styles.spinnerLabel, { color: colors.textSecondary }]}>Pulse</Text>
              </View>
              <View style={styles.spinnerItem}>
                <Spinner variant="wave" color={colors.warning} />
                <Text style={[styles.spinnerLabel, { color: colors.textSecondary }]}>Wave</Text>
              </View>
              <View style={styles.spinnerItem}>
                <Spinner variant="neon" color={colors.neon.blue} />
                <Text style={[styles.spinnerLabel, { color: colors.textSecondary }]}>Neon</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Skeleton Loaders</Text>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonItem}>
                <SkeletonLoader shape="avatar" variant="default" />
                <Text style={[styles.skeletonLabel, { color: colors.textSecondary }]}>Default</Text>
              </View>
              <View style={styles.skeletonItem}>
                <SkeletonLoader shape="avatar" variant="wave" />
                <Text style={[styles.skeletonLabel, { color: colors.textSecondary }]}>Wave</Text>
              </View>
              <View style={styles.skeletonItem}>
                <SkeletonLoader shape="avatar" variant="pulse" />
                <Text style={[styles.skeletonLabel, { color: colors.textSecondary }]}>Pulse</Text>
              </View>
              <View style={styles.skeletonItem}>
                <SkeletonLoader shape="avatar" variant="neon" />
                <Text style={[styles.skeletonLabel, { color: colors.textSecondary }]}>Neon</Text>
              </View>
            </View>

            <View style={styles.skeletonCard}>
              <View style={styles.skeletonCardRow}>
                <SkeletonLoader shape="avatar" variant="pulse" width={60} height={60} />
                <View style={styles.skeletonCardContent}>
                  <SkeletonLoader
                    shape="text"
                    variant="pulse"
                    width="80%"
                    height={18}
                    style={styles.skeletonCardText}
                  />
                  <SkeletonLoader
                    shape="text"
                    variant="pulse"
                    width="60%"
                    height={14}
                    style={styles.skeletonCardText}
                  />
                </View>
              </View>
              <SkeletonLoader shape="text" variant="pulse" width="100%" height={16} style={styles.skeletonCardText} />
              <SkeletonLoader shape="text" variant="pulse" width="90%" height={16} style={styles.skeletonCardText} />
              <SkeletonLoader shape="text" variant="pulse" width="95%" height={16} style={styles.skeletonCardText} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Progress Bars</Text>
            <ProgressBar
              progress={progress}
              variant="default"
              showPercentage
              label="Default"
              style={styles.progressBar}
            />
            <ProgressBar
              progress={progress}
              variant="gradient"
              showPercentage
              label="Gradient"
              color={colors.secondary}
              style={styles.progressBar}
            />
            <ProgressBar
              progress={progress}
              variant="striped"
              showPercentage
              label="Striped"
              color={colors.success}
              style={styles.progressBar}
            />
            <ProgressBar
              progress={progress}
              variant="neon"
              showPercentage
              label="Neon"
              color={colors.neon.blue}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Loading Overlay</Text>
            <AccessibleButton
              label="Mostrar Overlay"
              variant="primary"
              onPress={showOverlay}
              style={styles.overlayButton}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pull to Refresh</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Desliza hacia abajo desde la parte superior para ver la animación de Pull to Refresh
            </Text>
          </View>
        </ScrollView>
      </PullToRefresh>

      <LoadingOverlay
        visible={overlayVisible}
        message="Cargando..."
        spinnerVariant="neon"
        spinnerColor={colors.neon.blue}
        dismissable
        onDismiss={() => setOverlayVisible(false)}
      />
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
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  spinnerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  spinnerItem: {
    alignItems: "center",
    width: "18%",
    marginBottom: 16,
  },
  spinnerLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  skeletonItem: {
    alignItems: "center",
    width: "22%",
  },
  skeletonLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  skeletonCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  skeletonCardRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  skeletonCardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  skeletonCardText: {
    marginBottom: 8,
  },
  progressBar: {
    marginBottom: 16,
  },
  overlayButton: {
    alignSelf: "center",
    width: 200,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
  },
})
