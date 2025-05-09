import { database } from "../database"
import type Profile from "../database/models/Profile"
import { mmkvStorage } from "../storage/mmkv"
import { Q } from "@nozbe/watermelondb"

export interface ProfileData {
  name: string
  type: "personal" | "professional"
  avatar?: string
  theme: string
  firebaseUid?: string
}

class ProfileService {
  private activeProfileKey = "active_profile_id"

  async createProfile(profileData: ProfileData): Promise<Profile> {
    return database.write(async () => {
      const profile = await database.get<Profile>("profiles").create((record) => {
        record.name = profileData.name
        record.type = profileData.type
        record.avatar = profileData.avatar
        record.theme = profileData.theme
        record.firebaseUid = profileData.firebaseUid
        record.isActive = true
      })

      // Desactivar otros perfiles
      await this.deactivateOtherProfiles(profile.id)

      // Guardar el ID del perfil activo
      this.setActiveProfileId(profile.id)

      return profile
    })
  }

  async getProfiles(): Promise<Profile[]> {
    return database.get<Profile>("profiles").query().fetch()
  }

  // Nuevo método para obtener perfiles por Firebase UID y tipo
  async getProfilesByFirebaseUid(firebaseUid: string, type?: "personal" | "professional"): Promise<Profile[]> {
    let query = database.get<Profile>("profiles").query(Q.where("firebase_uid", firebaseUid))

    if (type) {
      query = query.extend(Q.where("type", type))
    }

    return query.fetch()
  }

  async getActiveProfile(): Promise<Profile | null> {
    const activeProfileId = this.getActiveProfileId()
    if (!activeProfileId) return null

    try {
      return await database.get<Profile>("profiles").find(activeProfileId)
    } catch (error) {
      console.error("Error getting active profile:", error)
      return null
    }
  }

  async switchProfile(profileId: string): Promise<Profile> {
    return database.write(async () => {
      const profile = await database.get<Profile>("profiles").find(profileId)

      // Activar el perfil seleccionado
      await profile.update((record) => {
        record.isActive = true
      })

      // Desactivar otros perfiles
      await this.deactivateOtherProfiles(profileId)

      // Guardar el ID del perfil activo
      this.setActiveProfileId(profileId)

      return profile
    })
  }

  async updateProfile(profileId: string, profileData: Partial<ProfileData>): Promise<Profile> {
    return database.write(async () => {
      const profile = await database.get<Profile>("profiles").find(profileId)

      await profile.update((record) => {
        if (profileData.name) record.name = profileData.name
        if (profileData.type) record.type = profileData.type
        if (profileData.avatar !== undefined) record.avatar = profileData.avatar
        if (profileData.theme) record.theme = profileData.theme
        if (profileData.firebaseUid) record.firebaseUid = profileData.firebaseUid
      })

      return profile
    })
  }

  async deleteProfile(profileId: string): Promise<void> {
    return database.write(async () => {
      const profile = await database.get<Profile>("profiles").find(profileId)
      await profile.markAsDeleted()

      // Si el perfil eliminado era el activo, activar otro perfil
      if (this.getActiveProfileId() === profileId) {
        const profiles = await this.getProfiles()
        if (profiles.length > 0) {
          await this.switchProfile(profiles[0].id)
        } else {
          this.clearActiveProfileId()
        }
      }
    })
  }

  private async deactivateOtherProfiles(activeProfileId: string): Promise<void> {
    const otherProfiles = await database
      .get<Profile>("profiles")
      .query(Q.where("id", Q.notEq(activeProfileId)))
      .fetch()

    await database.write(async () => {
      for (const profile of otherProfiles) {
        await profile.update((record) => {
          record.isActive = false
        })
      }
    })
  }

  getActiveProfileId(): string | null {
    return mmkvStorage.getString(this.activeProfileKey) || null
  }

  setActiveProfileId(profileId: string): void {
    mmkvStorage.set(this.activeProfileKey, profileId)
  }

  clearActiveProfileId(): void {
    mmkvStorage.delete(this.activeProfileKey)
  }

  // Método para obtener el prefijo de almacenamiento basado en el perfil activo
  // Esto se usará para separar los datos en MMKV por perfil
  getStoragePrefix(): string {
    const profileId = this.getActiveProfileId()
    return profileId ? `profile_${profileId}_` : "default_"
  }
}

export const profileService = new ProfileService()
