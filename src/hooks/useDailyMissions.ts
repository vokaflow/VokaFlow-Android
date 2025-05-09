"use client"

import { useState, useEffect, useCallback } from "react"
import { missionsService } from "../services/missions"

export function useDailyMissions() {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Cargar misiones
  const loadMissions = useCallback(async () => {
    try {
      const dailyMissions = await missionsService.getDailyMissions()
      setMissions(dailyMissions)
    } catch (error) {
      console.error("Error loading daily missions:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Refrescar misiones
  const refreshMissions = useCallback(async () => {
    setRefreshing(true)
    await loadMissions()
  }, [loadMissions])

  // Reclamar recompensa
  const claimReward = useCallback(
    async (missionId) => {
      const result = await missionsService.claimMissionReward(missionId)
      if (result.success) {
        // Actualizar la lista de misiones después de reclamar
        await loadMissions()
      }
      return result
    },
    [loadMissions],
  )

  // Actualizar progreso de una misión
  const updateProgress = useCallback(
    async (actionType, value = 1) => {
      await missionsService.updateMissionProgress(actionType, value)
      await loadMissions()
    },
    [loadMissions],
  )

  // Obtener estadísticas de misiones
  const [stats, setStats] = useState(null)

  const loadStats = useCallback(async () => {
    const missionStats = await missionsService.getMissionStats()
    setStats(missionStats)
  }, [])

  // Obtener recompensas especiales
  const [specialRewards, setSpecialRewards] = useState([])

  const loadSpecialRewards = useCallback(async () => {
    const rewards = await missionsService.getSpecialRewards()
    setSpecialRewards(rewards)
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    loadMissions()
    loadStats()
    loadSpecialRewards()
  }, [loadMissions, loadStats, loadSpecialRewards])

  return {
    missions,
    loading,
    refreshing,
    refreshMissions,
    claimReward,
    updateProgress,
    stats,
    specialRewards,
    loadSpecialRewards,
  }
}
