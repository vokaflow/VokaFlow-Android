import { database } from "../database"
import { profileService } from "../profile"
import { mmkvStorage } from "../storage/mmkv"

// Tipos de acciones que pueden otorgar puntos
export enum RewardAction {
  MESSAGE_SENT = "message_sent",
  TRANSLATION_COMPLETED = "translation_completed",
  DAILY_LOGIN = "daily_login",
  STREAK_MILESTONE = "streak_milestone",
  FEATURE_USED = "feature_used",
  PROFILE_COMPLETED = "profile_completed",
  MEDIA_SHARED = "media_shared",
  CHAT_CREATED = "chat_created",
  OFFLINE_USE = "offline_use",
  SETTINGS_CUSTOMIZED = "settings_customized",
}

// Niveles de usuario
export enum UserLevel {
  NOVICE = "novice",
  APPRENTICE = "apprentice",
  ADEPT = "adept",
  EXPERT = "expert",
  MASTER = "master",
  GRANDMASTER = "grandmaster",
}

// Interfaz para los datos de usuario relacionados con recompensas
export interface UserRewardsData {
  points: number
  level: UserLevel
  streak: number
  lastLoginDate: string
  achievements: string[] // IDs de logros obtenidos
  rewards: string[] // IDs de recompensas desbloqueadas
}

class RewardsService {
  private userDataKey = "rewards_user_data"
  private actionsCountKey = "rewards_actions_count"

  // Inicializar el servicio de recompensas
  async initialize(): Promise<void> {
    const prefix = profileService.getStoragePrefix()
    const userData = mmkvStorage.getString(`${prefix}${this.userDataKey}`)

    if (!userData) {
      // Crear datos iniciales de usuario
      const initialData: UserRewardsData = {
        points: 0,
        level: UserLevel.NOVICE,
        streak: 0,
        lastLoginDate: new Date().toISOString().split("T")[0],
        achievements: [],
        rewards: [],
      }

      mmkvStorage.set(`${prefix}${this.userDataKey}`, JSON.stringify(initialData))
      mmkvStorage.set(`${prefix}${this.actionsCountKey}`, JSON.stringify({}))

      // Inicializar logros y recompensas en la base de datos
      await this.initializeAchievementsAndRewards()
    } else {
      // Actualizar streak si es un nuevo día
      await this.checkDailyLogin()
    }
  }

  // Inicializar logros y recompensas en la base de datos
  private async initializeAchievementsAndRewards(): Promise<void> {
    try {
      await database.write(async () => {
        const achievementsCollection = database.get("achievements")
        const rewardsCollection = database.get("rewards")

        // Verificar si ya existen logros
        const existingAchievements = await achievementsCollection.query().fetch()
        if (existingAchievements.length === 0) {
          // Crear logros predefinidos
          await achievementsCollection.create((achievement) => {
            achievement.id = "daily_login_7"
            achievement.title = "Comunicador Constante"
            achievement.description = "Inicia sesión 7 días consecutivos"
            achievement.icon = "calendar-check"
            achievement.points = 50
            achievement.requirement = 7
            achievement.category = "login"
          })

          await achievementsCollection.create((achievement) => {
            achievement.id = "messages_sent_100"
            achievement.title = "Mensajero Prolífico"
            achievement.description = "Envía 100 mensajes"
            achievement.icon = "message-circle"
            achievement.points = 75
            achievement.requirement = 100
            achievement.category = "messages"
          })

          await achievementsCollection.create((achievement) => {
            achievement.id = "translations_50"
            achievement.title = "Traductor Experto"
            achievement.description = "Completa 50 traducciones"
            achievement.icon = "globe"
            achievement.points = 100
            achievement.requirement = 50
            achievement.category = "translations"
          })

          await achievementsCollection.create((achievement) => {
            achievement.id = "features_used_10"
            achievement.title = "Explorador de Funciones"
            achievement.description = "Utiliza 10 funciones diferentes de la app"
            achievement.icon = "compass"
            achievement.points = 60
            achievement.requirement = 10
            achievement.category = "features"
          })

          await achievementsCollection.create((achievement) => {
            achievement.id = "media_shared_25"
            achievement.title = "Compartidor Multimedia"
            achievement.description = "Comparte 25 archivos multimedia"
            achievement.icon = "image"
            achievement.points = 50
            achievement.requirement = 25
            achievement.category = "media"
          })
        }

        // Verificar si ya existen recompensas
        const existingRewards = await rewardsCollection.query().fetch()
        if (existingRewards.length === 0) {
          // Crear recompensas predefinidas
          await rewardsCollection.create((reward) => {
            reward.id = "theme_neon_blue"
            reward.title = "Tema Neón Azul"
            reward.description = "Desbloquea un tema exclusivo con acentos neón azul"
            reward.icon = "palette"
            reward.pointsRequired = 100
            reward.category = "theme"
            reward.data = JSON.stringify({ themeId: "neon_blue" })
          })

          await rewardsCollection.create((reward) => {
            reward.id = "avatar_frame_gold"
            reward.title = "Marco de Avatar Dorado"
            reward.description = "Marco dorado exclusivo para tu avatar de perfil"
            reward.icon = "user"
            reward.pointsRequired = 200
            reward.category = "avatar"
            reward.data = JSON.stringify({ frameId: "gold" })
          })

          await rewardsCollection.create((reward) => {
            reward.id = "notification_sound_premium"
            reward.title = "Sonido Premium de Notificación"
            reward.description = "Sonido exclusivo para tus notificaciones"
            reward.icon = "bell"
            reward.pointsRequired = 150
            reward.category = "sound"
            reward.data = JSON.stringify({ soundId: "premium_1" })
          })

          await rewardsCollection.create((reward) => {
            reward.id = "chat_background_exclusive"
            reward.title = "Fondo de Chat Exclusivo"
            reward.description = "Fondo personalizado para tus conversaciones"
            reward.icon = "image"
            reward.pointsRequired = 300
            reward.category = "background"
            reward.data = JSON.stringify({ backgroundId: "exclusive_1" })
          })

          await rewardsCollection.create((reward) => {
            reward.id = "emoji_pack_special"
            reward.title = "Pack de Emojis Especiales"
            reward.description = "Colección exclusiva de emojis para tus mensajes"
            reward.icon = "smile"
            reward.pointsRequired = 250
            reward.category = "emoji"
            reward.data = JSON.stringify({ packId: "special_1" })
          })
        }
      })
    } catch (error) {
      console.error("Error initializing achievements and rewards:", error)
    }
  }

  // Verificar inicio de sesión diario y actualizar streak
  private async checkDailyLogin(): Promise<void> {
    const prefix = profileService.getStoragePrefix()
    const userData = mmkvStorage.getString(`${prefix}${this.userDataKey}`)

    if (userData) {
      const data: UserRewardsData = JSON.parse(userData)
      const today = new Date().toISOString().split("T")[0]
      const lastLogin = data.lastLoginDate

      if (lastLogin !== today) {
        // Es un nuevo día
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split("T")[0]

        if (lastLogin === yesterdayStr) {
          // Día consecutivo, incrementar streak
          data.streak += 1

          // Verificar si alcanzó un hito de streak
          if (data.streak === 7 || data.streak === 30 || data.streak === 100) {
            await this.trackAction(RewardAction.STREAK_MILESTONE, data.streak)
          }
        } else {
          // Streak roto
          data.streak = 1
        }

        // Actualizar fecha de último inicio de sesión
        data.lastLoginDate = today

        // Otorgar puntos por inicio de sesión diario
        await this.addPoints(10)

        // Registrar acción de inicio de sesión diario
        await this.trackAction(RewardAction.DAILY_LOGIN)

        // Guardar datos actualizados
        mmkvStorage.set(`${prefix}${this.userDataKey}`, JSON.stringify(data))
      }
    }
  }

  // Obtener datos de usuario relacionados con recompensas
  async getUserData(): Promise<UserRewardsData> {
    const prefix = profileService.getStoragePrefix()
    const userData = mmkvStorage.getString(`${prefix}${this.userDataKey}`)

    if (userData) {
      return JSON.parse(userData)
    }

    // Si no hay datos, inicializar el servicio
    await this.initialize()
    return this.getUserData()
  }

  // Añadir puntos al usuario
  async addPoints(points: number): Promise<number> {
    const prefix = profileService.getStoragePrefix()
    const userData = mmkvStorage.getString(`${prefix}${this.userDataKey}`)

    if (userData) {
      const data: UserRewardsData = JSON.parse(userData)
      data.points += points

      // Verificar si el usuario sube de nivel
      const newLevel = this.calculateLevel(data.points)
      if (newLevel !== data.level) {
        data.level = newLevel
        // Aquí se podría mostrar una notificación de subida de nivel
      }

      // Guardar datos actualizados
      mmkvStorage.set(`${prefix}${this.userDataKey}`, JSON.stringify(data))
      return data.points
    }

    return 0
  }

  // Calcular nivel basado en puntos
  private calculateLevel(points: number): UserLevel {
    if (points >= 5000) return UserLevel.GRANDMASTER
    if (points >= 2500) return UserLevel.MASTER
    if (points >= 1000) return UserLevel.EXPERT
    if (points >= 500) return UserLevel.ADEPT
    if (points >= 200) return UserLevel.APPRENTICE
    return UserLevel.NOVICE
  }

  // Registrar una acción que puede otorgar puntos
  async trackAction(action: RewardAction, value = 1): Promise<void> {
    const prefix = profileService.getStoragePrefix()
    const actionsCountJson = mmkvStorage.getString(`${prefix}${this.actionsCountKey}`)
    let actionsCount: Record<string, number> = {}

    if (actionsCountJson) {
      actionsCount = JSON.parse(actionsCountJson)
    }

    // Incrementar contador de la acción
    actionsCount[action] = (actionsCount[action] || 0) + value

    // Guardar contador actualizado
    mmkvStorage.set(`${prefix}${this.actionsCountKey}`, JSON.stringify(actionsCount))

    // Otorgar puntos según la acción
    let pointsToAdd = 0
    switch (action) {
      case RewardAction.MESSAGE_SENT:
        pointsToAdd = 1
        break
      case RewardAction.TRANSLATION_COMPLETED:
        pointsToAdd = 5
        break
      case RewardAction.DAILY_LOGIN:
        pointsToAdd = 10
        break
      case RewardAction.STREAK_MILESTONE:
        pointsToAdd = value === 7 ? 50 : value === 30 ? 200 : value === 100 ? 500 : 0
        break
      case RewardAction.FEATURE_USED:
        pointsToAdd = 5
        break
      case RewardAction.PROFILE_COMPLETED:
        pointsToAdd = 20
        break
      case RewardAction.MEDIA_SHARED:
        pointsToAdd = 2
        break
      case RewardAction.CHAT_CREATED:
        pointsToAdd = 5
        break
      case RewardAction.OFFLINE_USE:
        pointsToAdd = 3
        break
      case RewardAction.SETTINGS_CUSTOMIZED:
        pointsToAdd = 5
        break
    }

    if (pointsToAdd > 0) {
      await this.addPoints(pointsToAdd)
    }

    // Verificar logros
    await this.checkAchievements(action, actionsCount[action])
  }

  // Verificar si se ha alcanzado algún logro
  private async checkAchievements(action: RewardAction, count: number): Promise<void> {
    try {
      const userData = await this.getUserData()
      const achievements = await database.get("achievements").query().fetch()

      for (const achievement of achievements) {
        // Verificar si ya se ha obtenido este logro
        if (userData.achievements.includes(achievement.id)) {
          continue
        }

        // Verificar si se cumple el requisito según la acción
        let isAchieved = false

        switch (action) {
          case RewardAction.DAILY_LOGIN:
          case RewardAction.STREAK_MILESTONE:
            if (achievement.category === "login" && userData.streak >= achievement.requirement) {
              isAchieved = true
            }
            break
          case RewardAction.MESSAGE_SENT:
            if (achievement.category === "messages" && count >= achievement.requirement) {
              isAchieved = true
            }
            break
          case RewardAction.TRANSLATION_COMPLETED:
            if (achievement.category === "translations" && count >= achievement.requirement) {
              isAchieved = true
            }
            break
          case RewardAction.FEATURE_USED:
            if (achievement.category === "features" && count >= achievement.requirement) {
              isAchieved = true
            }
            break
          case RewardAction.MEDIA_SHARED:
            if (achievement.category === "media" && count >= achievement.requirement) {
              isAchieved = true
            }
            break
        }

        if (isAchieved) {
          await this.unlockAchievement(achievement.id, achievement.points)
        }
      }
    } catch (error) {
      console.error("Error checking achievements:", error)
    }
  }

  // Desbloquear un logro
  async unlockAchievement(achievementId: string, points: number): Promise<void> {
    try {
      const prefix = profileService.getStoragePrefix()
      const userData = mmkvStorage.getString(`${prefix}${this.userDataKey}`)

      if (userData) {
        const data: UserRewardsData = JSON.parse(userData)

        // Verificar si ya tiene este logro
        if (!data.achievements.includes(achievementId)) {
          // Añadir logro a la lista
          data.achievements.push(achievementId)

          // Añadir puntos por el logro
          data.points += points

          // Guardar datos actualizados
          mmkvStorage.set(`${prefix}${this.userDataKey}`, JSON.stringify(data))

          // Registrar en la base de datos
          const activeProfile = await profileService.getActiveProfile()
          if (activeProfile) {
            await database.write(async () => {
              await database.get("user_achievements").create((record) => {
                record.achievementId = achievementId
                record.profileId = activeProfile.id
                record.unlockedAt = new Date()
              })
            })
          }

          // Aquí se podría mostrar una notificación de logro desbloqueado
          console.log(`Achievement unlocked: ${achievementId}, +${points} points`)
        }
      }
    } catch (error) {
      console.error("Error unlocking achievement:", error)
    }
  }

  // Verificar si se puede desbloquear una recompensa
  async canUnlockReward(rewardId: string): Promise<boolean> {
    try {
      const userData = await this.getUserData()
      const reward = await database.get("rewards").find(rewardId)

      // Verificar si ya tiene esta recompensa
      if (userData.rewards.includes(rewardId)) {
        return false
      }

      // Verificar si tiene suficientes puntos
      return userData.points >= reward.pointsRequired
    } catch (error) {
      console.error("Error checking reward:", error)
      return false
    }
  }

  // Desbloquear una recompensa
  async unlockReward(rewardId: string): Promise<boolean> {
    try {
      const canUnlock = await this.canUnlockReward(rewardId)
      if (!canUnlock) {
        return false
      }

      const prefix = profileService.getStoragePrefix()
      const userData = mmkvStorage.getString(`${prefix}${this.userDataKey}`)
      const reward = await database.get("rewards").find(rewardId)

      if (userData) {
        const data: UserRewardsData = JSON.parse(userData)

        // Añadir recompensa a la lista
        data.rewards.push(rewardId)

        // Guardar datos actualizados
        mmkvStorage.set(`${prefix}${this.userDataKey}`, JSON.stringify(data))

        // Registrar en la base de datos
        const activeProfile = await profileService.getActiveProfile()
        if (activeProfile) {
          await database.write(async () => {
            await database.get("user_rewards").create((record) => {
              record.rewardId = rewardId
              record.profileId = activeProfile.id
              record.unlockedAt = new Date()
            })
          })
        }

        // Aquí se podría mostrar una notificación de recompensa desbloqueada
        console.log(`Reward unlocked: ${rewardId}`)
        return true
      }
    } catch (error) {
      console.error("Error unlocking reward:", error)
    }

    return false
  }

  // Obtener todos los logros disponibles
  async getAllAchievements(): Promise<any[]> {
    try {
      const achievements = await database.get("achievements").query().fetch()
      const userData = await this.getUserData()

      return achievements.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        points: achievement.points,
        requirement: achievement.requirement,
        category: achievement.category,
        unlocked: userData.achievements.includes(achievement.id),
      }))
    } catch (error) {
      console.error("Error getting achievements:", error)
      return []
    }
  }

  // Obtener todas las recompensas disponibles
  async getAllRewards(): Promise<any[]> {
    try {
      const rewards = await database.get("rewards").query().fetch()
      const userData = await this.getUserData()

      return rewards.map((reward) => ({
        id: reward.id,
        title: reward.title,
        description: reward.description,
        icon: reward.icon,
        pointsRequired: reward.pointsRequired,
        category: reward.category,
        data: JSON.parse(reward.data),
        unlocked: userData.rewards.includes(reward.id),
        canUnlock: userData.points >= reward.pointsRequired,
      }))
    } catch (error) {
      console.error("Error getting rewards:", error)
      return []
    }
  }

  // Obtener estadísticas de acciones
  async getActionStats(): Promise<Record<string, number>> {
    const prefix = profileService.getStoragePrefix()
    const actionsCountJson = mmkvStorage.getString(`${prefix}${this.actionsCountKey}`)

    if (actionsCountJson) {
      return JSON.parse(actionsCountJson)
    }

    return {}
  }

  // Resetear datos de recompensas (para pruebas)
  async resetRewardsData(): Promise<void> {
    const prefix = profileService.getStoragePrefix()
    mmkvStorage.delete(`${prefix}${this.userDataKey}`)
    mmkvStorage.delete(`${prefix}${this.actionsCountKey}`)
    await this.initialize()
  }
}

export const rewardsService = new RewardsService()
