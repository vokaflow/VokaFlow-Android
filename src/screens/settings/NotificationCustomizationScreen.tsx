"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from "react-native"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import { useTranslation } from "../../hooks/useTranslation"
import { SafeAreaView } from "react-native-safe-area-context"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import {
  customNotificationService,
  notificationSounds,
  vibrationPatterns,
} from "../../services/notifications/customNotifications"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export default function NotificationCustomizationScreen({ navigation }) {
  const { t } = useTranslation()
  const { theme } = useSelector((state: RootState) => state.theme)

  const [config, setConfig] = useState({
    enabled: true,
    sound: "default",
    vibration: "default",
    showContent: true,
    doNotDisturbEnabled: false,
    doNotDisturbStart: "22:00",
    doNotDisturbEnd: "08:00",
    notificationTypes: {
      messages: true,
      translations: true,
      updates: true,
      calls: true,
    },
  })

  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false)
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false)

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      const savedConfig = await customNotificationService.getNotificationConfig()
      setConfig(savedConfig)
    }

    loadConfig()
  }, [])

  // Guardar cambios cuando se modifica la configuración
  useEffect(() => {
    const saveConfig = async () => {
      await customNotificationService.saveNotificationConfig(config)
    }

    saveConfig()
  }, [config])

  // Manejadores para los selectores de tiempo
  const handleStartTimeConfirm = (date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    setConfig({
      ...config,
      doNotDisturbStart: `${hours}:${minutes}`,
    })
    setStartTimePickerVisible(false)
  }

  const handleEndTimeConfirm = (date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    setConfig({
      ...config,
      doNotDisturbEnd: `${hours}:${minutes}`,
    })
    setEndTimePickerVisible(false)
  }

  // Función para reproducir sonido de prueba
  const playTestSound = async (soundName) => {
    await customNotificationService.playNotificationSound(soundName)
  }

  // Función para probar vibración
  const testVibration = (patternName) => {
    customNotificationService.vibrate(patternName)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("settings.notifications.general")}</Text>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {t("settings.notifications.enableNotifications")}
            </Text>
            <Switch
              value={config.enabled}
              onValueChange={(value) => setConfig({ ...config, enabled: value })}
              trackColor={{ false: "#767577", true: theme.colors.accent.secondary }}
              thumbColor={config.enabled ? theme.colors.accent.primary : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {t("settings.notifications.showContent")}
            </Text>
            <Switch
              value={config.showContent}
              onValueChange={(value) => setConfig({ ...config, showContent: value })}
              trackColor={{ false: "#767577", true: theme.colors.accent.secondary }}
              thumbColor={config.showContent ? theme.colors.accent.primary : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("settings.notifications.sound")}</Text>

          {Object.keys(notificationSounds).map((soundName) => (
            <TouchableOpacity
              key={soundName}
              style={[
                styles.optionRow,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: config.sound === soundName ? theme.colors.accent.primary : "transparent",
                },
              ]}
              onPress={() => setConfig({ ...config, sound: soundName })}
            >
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {t(`settings.notifications.sounds.${soundName}`)}
                </Text>
                {config.sound === soundName && <Icon name="check" size={24} color={theme.colors.accent.primary} />}
              </View>
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: theme.colors.accent.primary }]}
                onPress={() => playTestSound(soundName)}
              >
                <Icon name="play" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("settings.notifications.vibration")}
          </Text>

          {Object.keys(vibrationPatterns).map((patternName) => (
            <TouchableOpacity
              key={patternName}
              style={[
                styles.optionRow,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: config.vibration === patternName ? theme.colors.accent.primary : "transparent",
                },
              ]}
              onPress={() => setConfig({ ...config, vibration: patternName })}
            >
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {t(`settings.notifications.vibrations.${patternName}`)}
                </Text>
                {config.vibration === patternName && (
                  <Icon name="check" size={24} color={theme.colors.accent.primary} />
                )}
              </View>
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: theme.colors.accent.primary }]}
                onPress={() => testVibration(patternName)}
              >
                <Icon name="vibrate" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("settings.notifications.doNotDisturb")}
          </Text>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {t("settings.notifications.enableDoNotDisturb")}
            </Text>
            <Switch
              value={config.doNotDisturbEnabled}
              onValueChange={(value) => setConfig({ ...config, doNotDisturbEnabled: value })}
              trackColor={{ false: "#767577", true: theme.colors.accent.secondary }}
              thumbColor={config.doNotDisturbEnabled ? theme.colors.accent.primary : "#f4f3f4"}
            />
          </View>

          {config.doNotDisturbEnabled && (
            <>
              <TouchableOpacity
                style={[styles.timeSelector, { backgroundColor: theme.colors.card }]}
                onPress={() => setStartTimePickerVisible(true)}
              >
                <Text style={[styles.timeSelectorLabel, { color: theme.colors.text }]}>
                  {t("settings.notifications.startTime")}
                </Text>
                <Text style={[styles.timeValue, { color: theme.colors.accent.primary }]}>
                  {config.doNotDisturbStart}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timeSelector, { backgroundColor: theme.colors.card }]}
                onPress={() => setEndTimePickerVisible(true)}
              >
                <Text style={[styles.timeSelectorLabel, { color: theme.colors.text }]}>
                  {t("settings.notifications.endTime")}
                </Text>
                <Text style={[styles.timeValue, { color: theme.colors.accent.primary }]}>{config.doNotDisturbEnd}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("settings.notifications.notificationTypes")}
          </Text>

          {Object.keys(config.notificationTypes).map((type) => (
            <View key={type} style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                {t(`settings.notifications.types.${type}`)}
              </Text>
              <Switch
                value={config.notificationTypes[type]}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    notificationTypes: {
                      ...config.notificationTypes,
                      [type]: value,
                    },
                  })
                }
                trackColor={{ false: "#767577", true: theme.colors.accent.secondary }}
                thumbColor={config.notificationTypes[type] ? theme.colors.accent.primary : "#f4f3f4"}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        onConfirm={handleStartTimeConfirm}
        onCancel={() => setStartTimePickerVisible(false)}
      />

      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        onConfirm={handleEndTimeConfirm}
        onCancel={() => setEndTimePickerVisible(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  settingLabel: {
    fontSize: 16,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 16,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  timeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  timeSelectorLabel: {
    fontSize: 16,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
})
