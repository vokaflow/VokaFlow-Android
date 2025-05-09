"use client"

import { useState, useEffect, useCallback } from "react"
import { profileService, type ProfileData } from "../services/profile"
import type Profile from "../services/database/models/Profile"

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true)
      const allProfiles = await profileService.getProfiles()
      setProfiles(allProfiles)

      const active = await profileService.getActiveProfile()
      setActiveProfile(active)

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error fetching profiles"))
    } finally {
      setLoading(false)
    }
  }, [])

  const createProfile = useCallback(
    async (profileData: ProfileData) => {
      try {
        setLoading(true)
        const newProfile = await profileService.createProfile(profileData)
        await fetchProfiles()
        return newProfile
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error creating profile"))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchProfiles],
  )

  const switchProfile = useCallback(
    async (profileId: string) => {
      try {
        setLoading(true)
        await profileService.switchProfile(profileId)
        await fetchProfiles()
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error switching profile"))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchProfiles],
  )

  const updateProfile = useCallback(
    async (profileId: string, profileData: Partial<ProfileData>) => {
      try {
        setLoading(true)
        await profileService.updateProfile(profileId, profileData)
        await fetchProfiles()
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error updating profile"))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchProfiles],
  )

  const deleteProfile = useCallback(
    async (profileId: string) => {
      try {
        setLoading(true)
        await profileService.deleteProfile(profileId)
        await fetchProfiles()
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error deleting profile"))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchProfiles],
  )

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  return {
    profiles,
    activeProfile,
    loading,
    error,
    fetchProfiles,
    createProfile,
    switchProfile,
    updateProfile,
    deleteProfile,
  }
}
