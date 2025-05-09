"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from "react-native"
import { useProfiles } from "../../hooks/useProfiles"
import { Ionicons } from "@expo/vector-icons"
import { theme } from "../../theme"
import { Logo } from "../common/Logo"

export const ProfileSelector: React.FC = () => {
  const { profiles, activeProfile, switchProfile } = useProfiles()
  const [modalVisible, setModalVisible] = useState(false)

  const handleProfileSwitch = async (profileId: string) => {
    try {
      await switchProfile(profileId)
      setModalVisible(false)
    } catch (error) {
      console.error("Error switching profile:", error)
    }
  }

  if (!activeProfile) return null

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileButton} onPress={() => setModalVisible(true)}>
        <View style={styles.logoAndProfile}>
          <Logo size="small" style={styles.smallLogo} />
          {activeProfile.avatar ? (
            <Image source={{ uri: activeProfile.avatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: activeProfile.type === "personal" ? theme.colors.primary : theme.colors.secondary },
              ]}
            >
              <Text style={styles.avatarText}>{activeProfile.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{activeProfile.name}</Text>
          <Text style={styles.profileType}>{activeProfile.type === "personal" ? "Personal" : "Profesional"}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Perfil</Text>

            {profiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={[styles.profileItem, profile.id === activeProfile.id && styles.activeProfileItem]}
                onPress={() => handleProfileSwitch(profile.id)}
              >
                {profile.avatar ? (
                  <Image source={{ uri: profile.avatar }} style={styles.avatarSmall} />
                ) : (
                  <View
                    style={[
                      styles.avatarPlaceholderSmall,
                      { backgroundColor: profile.type === "personal" ? theme.colors.primary : theme.colors.secondary },
                    ]}
                  >
                    <Text style={styles.avatarTextSmall}>{profile.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.profileItemInfo}>
                  <Text style={styles.profileItemName}>{profile.name}</Text>
                  <Text style={styles.profileItemType}>{profile.type === "personal" ? "Personal" : "Profesional"}</Text>
                </View>
                {profile.id === activeProfile.id && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  logoAndProfile: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallLogo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  profileType: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  activeProfileItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholderSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTextSmall: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  profileItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileItemName: {
    color: theme.colors.text,
    fontSize: 16,
  },
  profileItemType: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
})
