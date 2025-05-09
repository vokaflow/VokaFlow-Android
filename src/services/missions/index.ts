import { database } from "../database"
import { profileService } from "../profile"
import { rewardsService, RewardAction } from "../rewards"
import { mmkvStorage } from "../storage/mmkv"
import { Platform } from "react-native"
import * as Notifications from "expo-notifications"
import { Q } from "@nozbe/watermelondb"

// Tipos de acciones para misiones
export enum MissionActionType {
  SEND_MESSAGES = "send_messages",
  COMPLETE_TRANSLATIONS = "complete_translations",
  SHARE_MEDIA = "share_media",
  USE_FEATURES = "use_features",
  CHAT_DURATION = "chat_duration",
  ADD_CONTACTS = "add_contacts",
  UPDATE_STATUS = "update_status",
  CHANGE_SETTINGS = "change_settings",
  USE_OFFLINE = "use_offline",
  COMPRESS_MEDIA = "compress_media",
}

// Rareza de las misiones
export enum MissionRarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
}

// Interfaz para misiones
export interface MissionTemplate {
  id: string
  title: string
  description: string
  icon: string
  actionType: MissionActionType
  targetValue: number
  pointsReward: number
  rarity: MissionRarity
  specialRewardChance?: number // Probabilidad de obtener recompensa especial (0-1)
}

class MissionsService {
  private lastGeneratedKey = "last_missions_generated"
  private missionTemplates: MissionTemplate[] = [
    // Misiones comunes (diarias fáciles)
    {
      id: "send_5_messages",
      title: "Comunicador Activo",
      description: "Envía 5 mensajes a cualquier contacto",
      icon: "message-circle",
      actionType: MissionActionType.SEND_MESSAGES,
      targetValue: 5,
      pointsReward: 25,
      rarity: MissionRarity.COMMON,
    },
    {
      id: "translate_3_messages",
      title: "Traductor del Día",
      description: "Traduce 3 mensajes a cualquier idioma",
      icon: "globe",
      actionType: MissionActionType.COMPLETE_TRANSLATIONS,
      targetValue: 3,
      pointsReward: 30,
      rarity: MissionRarity.COMMON,
    },
    {
      id: "share_2_media",
      title: "Compartidor Visual",
      description: "Comparte 2 archivos multimedia con tus contactos",
      icon: "image",
      actionType: MissionActionType.SHARE_MEDIA,
      targetValue: 2,
      pointsReward: 20,
      rarity: MissionRarity.COMMON,
    },
    {
      id: "use_2_features",
      title: "Explorador de Funciones",
      description: "Utiliza 2 funciones diferentes de la aplicación",
      icon: "compass",
      actionType: MissionActionType.USE_FEATURES,
      targetValue: 2,
      pointsReward: 15,
      rarity: MissionRarity.COMMON,
    },

    // Misiones poco comunes (un poco más difíciles)
    {
      id: "send_10_messages",
      title: "Mensajero Prolífico",
      description: "Envía 10 mensajes en un solo día",
      icon: "message-square",
      actionType: MissionActionType.SEND_MESSAGES,
      targetValue: 10,
      pointsReward: 40,
      rarity: MissionRarity.UNCOMMON,
      specialRewardChance: 0.2,
    },
    {
      id: "translate_5_messages",
      title: "Políglota del Día",
      description: "Traduce 5 mensajes a diferentes idiomas",
      icon: "globe",
      actionType: MissionActionType.COMPLETE_TRANSLATIONS,
      targetValue: 5,
      pointsReward: 50,
      rarity: MissionRarity.UNCOMMON,
      specialRewardChance: 0.2,
    },
    {
      id: "chat_15_minutes",
      title: "Conversador Dedicado",
      description: "Mantén conversaciones durante 15 minutos en total",
      icon: "clock",
      actionType: MissionActionType.CHAT_DURATION,
      targetValue: 15,
      pointsReward: 35,
      rarity: MissionRarity.UNCOMMON,
      specialRewardChance: 0.2,
    },

    // Misiones raras (desafiantes)
    {
      id: "send_20_messages",
      title: "Comunicador Experto",
      description: "Envía 20 mensajes a diferentes contactos",
      icon: "send",
      actionType: MissionActionType.SEND_MESSAGES,
      targetValue: 20,
      pointsReward: 75,
      rarity: MissionRarity.RARE,
      specialRewardChance: 0.4,
    },
    {
      id: "translate_10_messages",
      title: "Traductor Maestro",
      description: "Traduce 10 mensajes en un solo día",
      icon: "globe",
      actionType: MissionActionType.COMPLETE_TRANSLATIONS,
      targetValue: 10,
      pointsReward: 80,
      rarity: MissionRarity.RARE,
      specialRewardChance: 0.4,
    },
    {
      id: "share_5_media",
      title: "Creador de Contenido",
      description: "Comparte 5 archivos multimedia diferentes",
      icon: "film",
      actionType: MissionActionType.SHARE_MEDIA,
      targetValue: 5,
      pointsReward: 70,
      rarity: MissionRarity.RARE,
      specialRewardChance: 0.4,
    },

    // Misiones épicas (muy desafiantes)
    {
      id: "use_all_features",
      title: "Maestro de VokaFlow",
      description: "Utiliza todas las funciones principales de la aplicación en un día",
      icon: "award",
      actionType: MissionActionType.USE_FEATURES,
      targetValue: 8,
      pointsReward: 120,
      rarity: MissionRarity.EPIC,
      specialRewardChance: 0.7,
    },
    {
      id: "offline_master",
      title: "Maestro Offline",
      description: "Utiliza la aplicación en modo offline durante 30 minutos",
      icon: "wifi-off",
      actionType: MissionActionType.USE_OFFLINE,
      targetValue: 30,
      pointsReward: 100,
      rarity: MissionRarity.EPIC,
      specialRewardChance: 0.7,
    },

    // Misiones legendarias (las más difíciles)
    {
      id: "communication_legend",
      title: "Leyenda de la Comunicación",
      description: "Envía 50 mensajes, traduce 20 y comparte 10 archivos en un día",
      icon: "star",
      actionType: MissionActionType.SEND_MESSAGES, // Usamos este tipo pero verificaremos múltiples condiciones
      targetValue: 50,
      pointsReward: 200,
      rarity: MissionRarity.LEGENDARY,
      specialRewardChance: 1.0, // 100% de probabilidad de recompensa especial
    },
  ]

  // Inicializar el servicio de misiones
  async initialize(): Promise<void> {
    // Verificar si es necesario generar nuevas misiones
    await this.checkAndGenerateDailyMissions()

    // Solicitar permisos para notificaciones si es necesario
    if (Platform.OS !== "web") {
      const { status } = await Notifications.getPermissionsAsync()
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync()
      }
    }
  }

  // Verificar si es necesario generar nuevas misiones diarias
  private async checkAndGenerateDailyMissions(): Promise<void> {
    const prefix = profileService.getStoragePrefix()
    const lastGenerated = mmkvStorage.getString(`${prefix}${this.lastGeneratedKey}`)
    const today = new Date().toISOString().split("T")[0]

    if (!lastGenerated || lastGenerated !== today) {
      // Es un nuevo día, generar nuevas misiones
      await this.generateDailyMissions()
      mmkvStorage.set(`${prefix}${this.lastGeneratedKey}`, today)

      // Programar notificación para informar sobre nuevas misiones
      this.scheduleNewMissionsNotification()
    }
  }

  // Generar misiones diarias aleatorias
  private async generateDailyMissions(): Promise<void> {
    try {
      const activeProfile = await profileService.getActiveProfile()
      if (!activeProfile) return

      // Eliminar misiones anteriores que no se hayan completado
      await this.clearExpiredMissions()

      // Seleccionar misiones aleatorias según rareza
      const selectedMissions = this.selectRandomMissions()

      // Crear nuevas misiones en la base de datos
      await database.write(async () => {
        const missionsCollection = database.get("daily_missions")

        for (const mission of selectedMissions) {
          const expiresAt = new Date()
          expiresAt.setHours(23, 59, 59, 999) // Expira al final del día

          await missionsCollection.create((record) => {
            record.missionId = mission.id
            record.profileId = activeProfile.id
            record.title = mission.title
            record.description = mission.description
            record.icon = mission.icon
            record.actionType = mission.actionType
            record.targetValue = mission.targetValue
            record.currentValue = 0
            record.pointsReward = mission.pointsReward
            record.isCompleted = false
            record.isClaimed = false
            record.expiresAt = expiresAt
          })
        }
      })
    } catch (error) {
      console.error("Error generating daily missions:", error)
    }
  }

  // Seleccionar misiones aleatorias según rareza
  private selectRandomMissions(): MissionTemplate[] {
    const selectedMissions: MissionTemplate[] = []

    // Seleccionar 3 misiones comunes
    const commonMissions = this.missionTemplates.filter((m) => m.rarity === MissionRarity.COMMON)
    this.shuffleArray(commonMissions)
    selectedMissions.push(...commonMissions.slice(0, 3))

    // Seleccionar 1-2 misiones poco comunes
    const uncommonMissions = this.missionTemplates.filter((m) => m.rarity === MissionRarity.UNCOMMON)
    this.shuffleArray(uncommonMissions)
    selectedMissions.push(...uncommonMissions.slice(0, Math.random() > 0.5 ? 2 : 1))

    // 50% de probabilidad de una misión rara
    if (Math.random() > 0.5) {
      const rareMissions = this.missionTemplates.filter((m) => m.rarity === MissionRarity.RARE)
      this.shuffleArray(rareMissions)
      selectedMissions.push(rareMissions[0])
    }

    // 20% de probabilidad de una misión épica
    if (Math.random() > 0.8) {
      const epicMissions = this.missionTemplates.filter((m) => m.rarity === MissionRarity.EPIC)
      this.shuffleArray(epicMissions)
      selectedMissions.push(epicMissions[0])
    }

    // 5% de probabilidad de una misión legendaria
    if (Math.random() > 0.95) {
      const legendaryMissions = this.missionTemplates.filter((m) => m.rarity === MissionRarity.LEGENDARY)
      this.shuffleArray(legendaryMissions)
      selectedMissions.push(legendaryMissions[0])
    }

    return selectedMissions
  }

  // Mezclar array (algoritmo Fisher-Yates)
  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  // Eliminar misiones expiradas
  private async clearExpiredMissions(): Promise<void> {
    try {
      const activeProfile = await profileService.getActiveProfile()
      if (!activeProfile) return

      const expiredMissions = await database
        .get("daily_missions")
        .query(
          Q.where("profile_id", activeProfile.id),
          Q.where("is_claimed", false),
          Q.where("expires_at", Q.lt(Date.now())),
        )
        .fetch()

      if (expiredMissions.length > 0) {
        await database.write(async () => {
          for (const mission of expiredMissions) {
            await mission.destroyPermanently()
          }
        })
      }
    } catch (error) {
      console.error("Error clearing expired missions:", error)
    }
  }

  // Programar notificación para nuevas misiones
  private async scheduleNewMissionsNotification(): Promise<void> {
    if (Platform.OS === "web") return

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Nuevas misiones disponibles!",
          body: "Completa las misiones diarias para obtener recompensas especiales.",
          data: { screen: "DailyMissions" },
        },
        trigger: { seconds: 2 }, // Mostrar después de 2 segundos
      })
    } catch (error) {
      console.error("Error scheduling notification:", error)
    }
  }

  // Obtener todas las misiones diarias activas
  async getDailyMissions(): Promise<any[]> {
    try {
      const activeProfile = await profileService.getActiveProfile()
      if (!activeProfile) return []

      const missions = await database
        .get("daily_missions")
        .query(Q.where("profile_id", activeProfile.id), Q.where("expires_at", Q.gt(Date.now())))
        .fetch()

      return missions.map((mission) => ({
        id: mission.id,
        missionId: mission.missionId,
        title: mission.title,
        description: mission.description,
        icon: mission.icon,
        actionType: mission.actionType,
        targetValue: mission.targetValue,
        currentValue: mission.currentValue,
        progress: Math.min(mission.currentValue / mission.targetValue, 1),
        pointsReward: mission.pointsReward,
        isCompleted: mission.isCompleted,
        isClaimed: mission.isClaimed,
        expiresAt: new Date(mission.expiresAt),
        rarity: this.getMissionRarity(mission.missionId),
      }))
    } catch (error) {
      console.error("Error getting daily missions:", error)
      return []
    }
  }

  // Obtener la rareza de una misión por su ID
  private getMissionRarity(missionId: string): MissionRarity {
    const template = this.missionTemplates.find((m) => m.id === missionId)
    return template ? template.rarity : MissionRarity.COMMON
  }

  // Actualizar progreso de una misión
  async updateMissionProgress(actionType: MissionActionType, value = 1): Promise<void> {
    try {
      const activeProfile = await profileService.getActiveProfile()
      if (!activeProfile) return

      // Obtener misiones activas del tipo de acción especificado
      const missions = await database
        .get("daily_missions")
        .query(
          Q.where("profile_id", activeProfile.id),
          Q.where("action_type", actionType),
          Q.where("is_completed", false),
          Q.where("expires_at", Q.gt(Date.now())),
        )
        .fetch()

      if (missions.length > 0) {
        await database.write(async () => {
          for (const mission of missions) {
            // Caso especial para la misión legendaria
            if (mission.missionId === "communication_legend") {
              // Esta misión requiere verificar múltiples condiciones
              // Aquí simplemente actualizamos el progreso para la condición actual
              await this.updateLegendaryMissionProgress(mission, actionType, value)
            } else {
              // Actualizar progreso normal
              const newValue = mission.currentValue + value
              await mission.update((record) => {
                record.currentValue = newValue

                // Verificar si se ha completado la misión
                if (newValue >= mission.targetValue && !mission.isCompleted) {
                  record.isCompleted = true

                  // Programar notificación de misión completada
                  this.scheduleMissionCompletedNotification(mission.title)
                }
              })
            }
          }
        })
      }
    } catch (error) {
      console.error("Error updating mission progress:", error)
    }
  }

  // Actualizar progreso de la misión legendaria
  private async updateLegendaryMissionProgress(
    mission: any,
    actionType: MissionActionType,
    value: number,
  ): Promise<void> {
    // Obtener el progreso actual de la misión legendaria
    const legendaryProgress = await this.getLegendaryMissionProgress()

    // Actualizar el progreso según el tipo de acción
    switch (actionType) {
      case MissionActionType.SEND_MESSAGES:
        legendaryProgress.messages += value
        break
      case MissionActionType.COMPLETE_TRANSLATIONS:
        legendaryProgress.translations += value
        break
      case MissionActionType.SHARE_MEDIA:
        legendaryProgress.media += value
        break
    }

    // Guardar el progreso actualizado
    const prefix = profileService.getStoragePrefix()
    mmkvStorage.set(`${prefix}legendary_mission_progress`, JSON.stringify(legendaryProgress))

    // Calcular el progreso total (normalizado a un valor entre 0 y 1)
    const messagesProgress = Math.min(legendaryProgress.messages / 50, 1)
    const translationsProgress = Math.min(legendaryProgress.translations / 20, 1)
    const mediaProgress = Math.min(legendaryProgress.media / 10, 1)

    // Calcular el progreso promedio
    const averageProgress = (messagesProgress + translationsProgress + mediaProgress) / 3
    const normalizedProgress = Math.floor(averageProgress * mission.targetValue)

    // Actualizar la misión
    await mission.update((record) => {
      record.currentValue = normalizedProgress

      // Verificar si se ha completado la misión (todas las condiciones cumplidas)
      if (
        legendaryProgress.messages >= 50 &&
        legendaryProgress.translations >= 20 &&
        legendaryProgress.media >= 10 &&
        !mission.isCompleted
      ) {
        record.isCompleted = true

        // Programar notificación de misión legendaria completada
        this.scheduleMissionCompletedNotification(mission.title, true)
      }
    })
  }

  // Obtener el progreso actual de la misión legendaria
  private async getLegendaryMissionProgress(): Promise<{ messages: number; translations: number; media: number }> {
    const prefix = profileService.getStoragePrefix()
    const progressJson = mmkvStorage.getString(`${prefix}legendary_mission_progress`)

    if (progressJson) {
      return JSON.parse(progressJson)
    }

    // Valor inicial
    const initialProgress = { messages: 0, translations: 0, media: 0 }
    mmkvStorage.set(`${prefix}legendary_mission_progress`, JSON.stringify(initialProgress))
    return initialProgress
  }

  // Programar notificación de misión completada
  private async scheduleMissionCompletedNotification(missionTitle: string, isLegendary = false): Promise<void> {
    if (Platform.OS === "web") return

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isLegendary ? "¡Misión Legendaria Completada!" : "¡Misión Completada!",
          body: `Has completado la misión "${missionTitle}". ¡Reclama tu recompensa!`,
          data: { screen: "DailyMissions" },
        },
        trigger: { seconds: 1 },
      })
    } catch (error) {
      console.error("Error scheduling notification:", error)
    }
  }

  // Reclamar recompensa de una misión completada
  async claimMissionReward(missionId: string): Promise<{ success: boolean; points: number; specialReward?: any }> {
    try {
      const mission = await database.get("daily_missions").find(missionId)

      if (!mission || !mission.isCompleted || mission.isClaimed) {
        return { success: false, points: 0 }
      }

      // Buscar la plantilla de la misión para verificar si tiene recompensa especial
      const missionTemplate = this.missionTemplates.find((m) => m.id === mission.missionId)
      let specialReward = null

      // Verificar si se obtiene una recompensa especial
      if (missionTemplate?.specialRewardChance && Math.random() <= missionTemplate.specialRewardChance) {
        specialReward = await this.generateSpecialReward(missionTemplate.rarity)
      }

      // Actualizar la misión como reclamada
      await database.write(async () => {
        await mission.update((record) => {
          record.isClaimed = true
        })

        // Registrar en el historial de misiones
        await database.get("mission_history").create((record) => {
          record.profileId = mission.profileId
          record.missionId = mission.missionId
          record.completedAt = Date.now()
          record.pointsEarned = mission.pointsReward
          if (specialReward) {
            record.rewardId = specialReward.id
          }
        })
      })

      // Añadir puntos al usuario
      await rewardsService.addPoints(mission.pointsReward)

      // Registrar acción en el sistema de recompensas
      await rewardsService.trackAction(RewardAction.DAILY_MISSION_COMPLETED)

      return {
        success: true,
        points: mission.pointsReward,
        specialReward,
      }
    } catch (error) {
      console.error("Error claiming mission reward:", error)
      return { success: false, points: 0 }
    }
  }

  // Generar una recompensa especial basada en la rareza de la misión
  private async generateSpecialReward(missionRarity: MissionRarity): Promise<any> {
    try {
      // Determinar la rareza de la recompensa basada en la rareza de la misión
      let rewardRarity = "common"

      switch (missionRarity) {
        case MissionRarity.COMMON:
          rewardRarity = Math.random() > 0.9 ? "uncommon" : "common"
          break
        case MissionRarity.UNCOMMON:
          rewardRarity = Math.random() > 0.7 ? "rare" : "uncommon"
          break
        case MissionRarity.RARE:
          rewardRarity = Math.random() > 0.6 ? "epic" : "rare"
          break
        case MissionRarity.EPIC:
          rewardRarity = Math.random() > 0.5 ? "legendary" : "epic"
          break
        case MissionRarity.LEGENDARY:
          rewardRarity = "legendary"
          break
      }

      // Generar una recompensa según la rareza
      const rewardId = `special_reward_${Date.now()}`
      const rewardTypes = ["theme", "avatar", "sound", "emoji", "background", "sticker"]
      const randomType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)]

      let title, description, icon, data

      switch (randomType) {
        case "theme":
          title = `Tema ${this.getRewardRarityName(rewardRarity)}`
          description = `Un tema exclusivo de rareza ${rewardRarity}`
          icon = "palette"
          data = { themeId: `theme_${rewardRarity}_${Date.now()}` }
          break
        case "avatar":
          title = `Marco de Avatar ${this.getRewardRarityName(rewardRarity)}`
          description = `Un marco exclusivo para tu avatar de rareza ${rewardRarity}`
          icon = "user"
          data = { frameId: `frame_${rewardRarity}_${Date.now()}` }
          break
        case "sound":
          title = `Sonido ${this.getRewardRarityName(rewardRarity)}`
          description = `Un sonido exclusivo para notificaciones de rareza ${rewardRarity}`
          icon = "bell"
          data = { soundId: `sound_${rewardRarity}_${Date.now()}` }
          break
        case "emoji":
          title = `Emoji ${this.getRewardRarityName(rewardRarity)}`
          description = `Un emoji exclusivo de rareza ${rewardRarity}`
          icon = "smile"
          data = { emojiId: `emoji_${rewardRarity}_${Date.now()}` }
          break
        case "background":
          title = `Fondo ${this.getRewardRarityName(rewardRarity)}`
          description = `Un fondo exclusivo para chats de rareza ${rewardRarity}`
          icon = "image"
          data = { backgroundId: `bg_${rewardRarity}_${Date.now()}` }
          break
        case "sticker":
          title = `Sticker ${this.getRewardRarityName(rewardRarity)}`
          description = `Un sticker exclusivo de rareza ${rewardRarity}`
          icon = "sticker"
          data = { stickerId: `sticker_${rewardRarity}_${Date.now()}` }
          break
      }

      // Guardar la recompensa en la base de datos
      let reward
      await database.write(async () => {
        reward = await database.get("mission_rewards").create((record) => {
          record.rewardId = rewardId
          record.title = title
          record.description = description
          record.icon = icon
          record.rarity = rewardRarity
          record.type = randomType
          record.data = JSON.stringify(data)
        })
      })

      return {
        id: rewardId,
        title,
        description,
        icon,
        rarity: rewardRarity,
        type: randomType,
        data,
      }
    } catch (error) {
      console.error("Error generating special reward:", error)
      return null
    }
  }

  // Obtener nombre de rareza para mostrar
  private getRewardRarityName(rarity: string): string {
    switch (rarity) {
      case "common":
        return "Común"
      case "uncommon":
        return "Poco Común"
      case "rare":
        return "Raro"
      case "epic":
        return "Épico"
      case "legendary":
        return "Legendario"
      default:
        return "Desconocido"
    }
  }

  // Obtener todas las recompensas especiales del usuario
  async getSpecialRewards(): Promise<any[]> {
    try {
      const activeProfile = await profileService.getActiveProfile()
      if (!activeProfile) return []

      // Obtener IDs de recompensas del historial de misiones
      const missionHistory = await database
        .get("mission_history")
        .query(Q.where("profile_id", activeProfile.id))
        .fetch()

      const rewardIds = missionHistory.filter((history) => history.rewardId).map((history) => history.rewardId)

      if (rewardIds.length === 0) return []

      // Obtener detalles de las recompensas
      const rewards = await database
        .get("mission_rewards")
        .query(Q.where("reward_id", Q.oneOf(rewardIds)))
        .fetch()

      return rewards.map((reward) => ({
        id: reward.id,
        rewardId: reward.rewardId,
        title: reward.title,
        description: reward.description,
        icon: reward.icon,
        rarity: reward.rarity,
        type: reward.type,
        data: JSON.parse(reward.data),
      }))
    } catch (error) {
      console.error("Error getting special rewards:", error)
      return []
    }
  }

  // Obtener estadísticas de misiones
  async getMissionStats(): Promise<any> {
    try {
      const activeProfile = await profileService.getActiveProfile()
      if (!activeProfile) return {}

      const missionHistory = await database
        .get("mission_history")
        .query(Q.where("profile_id", activeProfile.id))
        .fetch()

      const totalCompleted = missionHistory.length
      const totalPoints = missionHistory.reduce((sum, history) => sum + history.pointsEarned, 0)
      const specialRewards = missionHistory.filter((history) => history.rewardId).length

      // Agrupar por tipo de misión
      const missionTypes: Record<string, number> = {}
      for (const history of missionHistory) {
        const mission = this.missionTemplates.find((m) => m.id === history.missionId)
        if (mission) {
          const type = mission.actionType
          missionTypes[type] = (missionTypes[type] || 0) + 1
        }
      }

      return {
        totalCompleted,
        totalPoints,
        specialRewards,
        missionTypes,
      }
    } catch (error) {
      console.error("Error getting mission stats:", error)
      return {}
    }
  }

  // Resetear misiones diarias (para pruebas)
  async resetDailyMissions(): Promise<void> {
    try {
      const activeProfile = await profileService.getActiveProfile()
      if (!activeProfile) return

      await database.write(async () => {
        const missions = await database.get("daily_missions").query(Q.where("profile_id", activeProfile.id)).fetch()

        for (const mission of missions) {
          await mission.destroyPermanently()
        }
      })

      const prefix = profileService.getStoragePrefix()
      mmkvStorage.delete(`${prefix}${this.lastGeneratedKey}`)
      mmkvStorage.delete(`${prefix}legendary_mission_progress`)

      await this.generateDailyMissions()
    } catch (error) {
      console.error("Error resetting daily missions:", error)
    }
  }
}

export const missionsService = new MissionsService()
