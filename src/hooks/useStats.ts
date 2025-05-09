"use client"

import { useState, useEffect, useCallback } from "react"
import { statsService, type UsageStats } from "../services/stats"

export function useStats() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const currentStats = await statsService.getStats()
      setStats(currentStats)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error fetching stats"))
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStats = useCallback(async () => {
    try {
      setLoading(true)
      const updatedStats = await statsService.updateStats()
      setStats(updatedStats)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error updating stats"))
    } finally {
      setLoading(false)
    }
  }, [])

  const resetStats = useCallback(async () => {
    try {
      setLoading(true)
      await statsService.resetStats()
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error resetting stats"))
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    fetchStats,
    updateStats,
    resetStats,
    logActiveTime: statsService.logActiveTime.bind(statsService),
    logOfflineTime: statsService.logOfflineTime.bind(statsService),
    logTranslation: statsService.logTranslation.bind(statsService),
    logCompressionSaving: statsService.logCompressionSaving.bind(statsService),
  }
}
