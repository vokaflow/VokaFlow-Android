"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useProfiles } from "../../hooks/useProfiles"
import { useTheme } from "../../hooks/useTheme"
import { Feather } from "@expo/vector-icons"
import { ListItemTransition } from "../../components/navigation/ListItemTransition"
import { ScreenTransition } from "../../components/navigation/ScreenTransition"

export default function ProfileManagementScreen({ navigation }) {
  const { profiles, activeProfile, createProfile, deleteProfile, switchProfile } = useProfiles()
  const { colors } = useTheme()
  const [isEditing, setIsEditing] = useState(false)

  const handleCreateProfile = () => {
    // Implementación de creación de perfil
    navigation.navigate("CreateProfile")
  }

  const handleEditProfile = (profile) => {
    // Implementación de edición de perfil
    navigation.navigate("EditProfile", { profileId: profile.id })
  }

  const handleDeleteProfile = (profile) => {
    Alert.alert(
      "Eliminar Perfil",
      `¿Estás seguro de que deseas eliminar el perfil "${profile.name}"? Esta acción no se puede deshacer.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteProfile(profile.id),
        },
      ],
    )
  }

  const handleSwitchProfile = (profile) => {
    if (profile.id !== activeProfile?.id) {
      switchProfile(profile.id)
    }
  }

  const renderProfileItem = ({ item, index }) => (
    <ListItemTransition index={index} type="slide-right" duration={400}>
      <TouchableOpacity
        style={[
          styles.profileItem,
          {
            backgroundColor: colors.cardBackground,
            borderLeftColor: item.id === activeProfile?.id ? colors.primary : "transparent",
          },
        ]}
        onPress={() => (isEditing ? handleEditProfile(item) : handleSwitchProfile(item))}
      >
        <View style={styles.profileInfo}>
          <View
            style={[
              styles.profileAvatar,
              {
                backgroundColor: item.color || colors.primary,
              },
            ]}
          >
            <Text style={styles.profileInitial}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={[styles.profileName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.profileStats, { color: colors.textSecondary }]}>
              {item.stats?.words || 0} palabras • {item.stats?.translations || 0} traducciones
            </Text>
          </View>
        </View>

        {isEditing ? (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.error }]}
            onPress={() => handleDeleteProfile(item)}
          >
            <Feather name="trash-2" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          item.id === activeProfile?.id && (
            <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]}>
              <Feather name="check" size={16} color="#fff" />
            </View>
          )
        )}
      </TouchableOpacity>
    </ListItemTransition>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenTransition type="fade">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Perfiles</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Feather name={isEditing ? "check" : "edit-2"} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={renderProfileItem}
          contentContainerStyle={styles.profilesList}
          ListEmptyComponent={
            <ListItemTransition index={0} type="fade" duration={500}>
              <View style={styles.emptyContainer}>
                <Feather name="users" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay perfiles creados</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Crea un perfil para comenzar a usar la aplicación
                </Text>
              </View>
            </ListItemTransition>
          }
        />

        <ListItemTransition index={profiles.length} type="slide-up" duration={300}>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateProfile}
          >
            <Feather name="plus" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Crear Nuevo Perfil</Text>
          </TouchableOpacity>
        </ListItemTransition>
      </ScreenTransition>
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
  profilesList: {
    padding: 16,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileDetails: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileStats: {
    fontSize: 14,
  },
  activeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
})
