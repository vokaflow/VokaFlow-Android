import { database } from "../database"
import { profileService } from "../profile"
import { mmkvStorage } from "../storage/mmkv"
import { Q } from "@nozbe/watermelondb"

export interface UsageStats {
  // Estadísticas de traducción
  totalTranslations: number
  translationsByLanguage: Record<string, number>
  translationsByType: {
    textToText: number
    audioToText: number
    audioToAudio: number
    visualAR: number
  }

  // Estadísticas de chat
  totalMessagesSent: number
  totalMessagesReceived: number
  messagesByDay: Record<string, number>
  topChats: Array<{ id: string; name: string; count: number }>

  // Estadísticas de multimedia
  totalMediaShared: number
  mediaByType: {
    images: number
    audio: number
    documents: number
    videos: number
  }

  // Estadísticas de tiempo
  totalActiveTime: number // en minutos
  activeTimeByDay: Record<string, number>

  // Estadísticas de conectividad
  onlinePercentage: number
  offlineTime: number // en minutos

  // Estadísticas de almacenamiento
  storageUsage: {
    messages: number // en bytes
    media: number
    cache: number
    total: number
  }
  compressionSavings: number // en bytes

  // Fecha de última actualización
  lastUpdated: number
}

class StatsService {
  private statsKey = "usage_stats"

  // Obtener estadísticas actuales
  async getStats(): Promise<UsageStats> {
    const prefix = profileService.getStoragePrefix()
    const statsJson = mmkvStorage.getString(`${prefix}${this.statsKey}`)

    if (statsJson) {
      return JSON.parse(statsJson)
    }

    // Si no hay estadísticas, crear estadísticas iniciales
    const initialStats: UsageStats = {
      totalTranslations: 0,
      translationsByLanguage: {},
      translationsByType: {
        textToText: 0,
        audioToText: 0,
        audioToAudio: 0,
        visualAR: 0,
      },
      totalMessagesSent: 0,
      totalMessagesReceived: 0,
      messagesByDay: {},
      topChats: [],
      totalMediaShared: 0,
      mediaByType: {
        images: 0,
        audio: 0,
        documents: 0,
        videos: 0,
      },
      totalActiveTime: 0,
      activeTimeByDay: {},
      onlinePercentage: 100,
      offlineTime: 0,
      storageUsage: {
        messages: 0,
        media: 0,
        cache: 0,
        total: 0,
      },
      compressionSavings: 0,
      lastUpdated: Date.now(),
    }

    await this.saveStats(initialStats)
    return initialStats
  }

  // Guardar estadísticas
  async saveStats(stats: UsageStats): Promise<void> {
    const prefix = profileService.getStoragePrefix()
    mmkvStorage.set(
      `${prefix}${this.statsKey}`,
      JSON.stringify({
        ...stats,
        lastUpdated: Date.now(),
      }),
    )
  }

  // Actualizar estadísticas
  async updateStats(): Promise<UsageStats> {
    const currentStats = await this.getStats()
    const activeProfile = await profileService.getActiveProfile()

    if (!activeProfile) return currentStats

    try {
      // Calcular estadísticas de mensajes
      const messages = await database.get("messages").query(Q.where("profile_id", activeProfile.id)).fetch()

      const messagesSent = messages.filter((m) => m.senderId === activeProfile.id).length
      const messagesReceived = messages.length - messagesSent

      // Agrupar mensajes por día
      const messagesByDay: Record<string, number> = {}
      messages.forEach((message) => {
        const date = new Date(message.createdAt).toISOString().split("T")[0]
        messagesByDay[date] = (messagesByDay[date] || 0) + 1
      })

      // Calcular chats más activos
      const chatCounts: Record<string, { count: number; name: string }> = {}
      for (const message of messages) {
        const chatId = message.chatId
        if (!chatCounts[chatId]) {
          const chat = await message.chat.fetch()
          chatCounts[chatId] = { count: 0, name: chat.name }
        }
        chatCounts[chatId].count++
      }

      const topChats = Object.entries(chatCounts)
        .map(([id, { count, name }]) => ({ id, name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Calcular estadísticas de multimedia
      const mediaFiles = await database.get("media_files").query(Q.where("profile_id", activeProfile.id)).fetch()

      const mediaByType = {
        images: mediaFiles.filter((m) => m.type.startsWith("image/")).length,
        audio: mediaFiles.filter((m) => m.type.startsWith("audio/")).length,
        videos: mediaFiles.filter((m) => m.type.startsWith("video/")).length,
        documents: mediaFiles.filter(
          (m) => !m.type.startsWith("image/") && !m.type.startsWith("audio/") && !m.type.startsWith("video/"),
        ).length,
      }

      // Calcular uso de almacenamiento
      const mediaSize = mediaFiles.reduce((total, file) => total + (file.size || 0), 0)
      const messagesSize = messages.reduce((total, msg) => total + JSON.stringify(msg).length, 0)

      // Actualizar estadísticas
      const updatedStats: UsageStats = {
        ...currentStats,
        totalMessagesSent: messagesSent,
        totalMessagesReceived: messagesReceived,
        messagesByDay,
        topChats,
        totalMediaShared: mediaFiles.length,
        mediaByType,
        storageUsage: {
          ...currentStats.storageUsage,
          messages: messagesSize,
          media: mediaSize,
          total: messagesSize + mediaSize + (currentStats.storageUsage.cache || 0),
        },
        lastUpdated: Date.now(),
      }

      await this.saveStats(updatedStats)
      return updatedStats
    } catch (error) {
      console.error("Error updating stats:", error)
      return currentStats
    }
  }

  // Registrar tiempo activo
  async logActiveTime(minutes: number): Promise<void> {
    const stats = await this.getStats()
    const today = new Date().toISOString().split("T")[0]

    stats.totalActiveTime += minutes
    stats.activeTimeByDay[today] = (stats.activeTimeByDay[today] || 0) + minutes

    await this.saveStats(stats)
  }

  // Registrar tiempo offline
  async logOfflineTime(minutes: number): Promise<void> {
    const stats = await this.getStats()

    stats.offlineTime += minutes

    // Recalcular porcentaje online
    const totalTime = stats.totalActiveTime
    stats.onlinePercentage = totalTime > 0 ? Math.round(((totalTime - stats.offlineTime) / totalTime) * 100) : 100

    await this.saveStats(stats)
  }

  // Registrar traducción
  async logTranslation(
    sourceLanguage: string,
    targetLanguage: string,
    type: "textToText" | "audioToText" | "audioToAudio" | "visualAR",
  ): Promise<void> {
    const stats = await this.getStats()

    stats.totalTranslations++
    stats.translationsByLanguage[sourceLanguage] = (stats.translationsByLanguage[sourceLanguage] || 0) + 1
    stats.translationsByLanguage[targetLanguage] = (stats.translationsByLanguage[targetLanguage] || 0) + 1
    stats.translationsByType[type]++

    await this.saveStats(stats)
  }

  // Registrar ahorro por compresión
  async logCompressionSaving(bytes: number): Promise<void> {
    const stats = await this.getStats()

    stats.compressionSavings += bytes

    await this.saveStats(stats)
  }

  // Resetear estadísticas
  async resetStats(): Promise<void> {
    const prefix = profileService.getStoragePrefix()
    mmkvStorage.delete(`${prefix}${this.statsKey}`)
    await this.getStats() // Inicializar nuevas estadísticas
  }
}

export const statsService = new StatsService()
