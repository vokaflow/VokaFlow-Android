"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from "react-native"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import { useTranslation } from "../../hooks/useTranslation"
import { SafeAreaView } from "react-native-safe-area-context"
import { privacyService } from "../../services/privacy"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { TextInput } from "react-native-gesture-handler"

export default function PrivacySecurityScreen({ navigation }) {
  const { t } = useTranslation()
  const { theme } = useSelector((state: RootState) => state.theme)

  const [config, setConfig] = useState({
    appLockEnabled: false,
    appLockMethod: "pin",
    appLockPin: "",
    hideContentInAppSwitcher: true,
    sensitiveContentBlur: true,
    autoDeletionEnabled: false,
    autoDeletionPeriod: 90,
    privateMode: false,
  })

  const [biometricSupport, setBiometricSupport] = useState({
    supported: false,
    biometricTypes: [],
  })

  const [showPinSetup, setShowPinSetup] = useState(false)
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      const savedConfig = await privacyService.getPrivacyConfig()
      setConfig(savedConfig)

      const biometricStatus = await privacyService.checkBiometricSupport()
      setBiometricSupport(biometricStatus)
    }

    loadConfig()
  }, [])

  // Guardar cambios cuando se modifica la configuración
  useEffect(() => {
    const saveConfig = async () => {
      await privacyService.savePrivacyConfig(config)
    }

    saveConfig()
  }, [config])

  // Manejar cambio en el método de bloqueo
  const handleLockMethodChange = (method) => {
    if (method === "biometric" && !biometricSupport.supported) {
      Alert.alert(
        t("settings.privacy.biometricNotSupported.title"),
        t("settings.privacy.biometricNotSupported.message"),
        [{ text: t("common.ok") }],
      )
      return
    }

    setConfig({
      ...config,
      appLockMethod: method,
    })

    if (method === "pin") {
      setShowPinSetup(true)
    }
  }

  // Manejar configuración de PIN
  const handlePinSetup = async () => {
    if (pin.length < 4) {
      Alert.alert(t("settings.privacy.pinTooShort.title"), t("settings.privacy.pinTooShort.message"), [
        { text: t("common.ok") },
      ])
      return
    }

    if (pin !== confirmPin) {
      Alert.alert(t("settings.privacy.pinMismatch.title"), t("settings.privacy.pinMismatch.message"), [
        { text: t("common.ok") },
      ])
      return
    }

    await privacyService.setPin(pin)
    setConfig({
      ...config,
      appLockEnabled: true,
      appLockPin: pin,
    })
    setShowPinSetup(false)
    setPin("")
    setConfirmPin("")
  }

  // Manejar activación/desactivación del modo privado
  const handlePrivateModeToggle = async (value) => {
    await privacyService.togglePrivateMode(value)
    setConfig({
      ...config,
      privateMode: value,
    })
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("settings.privacy.appLock")}</Text>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {t("settings.privacy.enableAppLock")}
            </Text>
            <Switch
              value={config.appLockEnabled}
              onValueChange={(value) => {
                if (value && !config.appLockPin) {
                  setShowPinSetup(true)
                } else {
                  setConfig({ ...config, appLockEnabled: value })
                }
              }}
              trackColor={{ false: "#767577", true: theme.colors.accent.secondary }}
              thumbColor={config.appLockEnabled ? theme.colors.accent.primary : "#f4f3f4"}
            />
          </View>

          {config.appLockEnabled && (
            <View style={styles.lockMethodContainer}>
              <Text style={[styles.lockMethodLabel, { color: theme.colors.text }]}>
                {t("settings.privacy.lockMethod")}
              </Text>

              <View style={styles.lockMethodOptions}>
                <TouchableOpacity
                  style={[
                    styles.lockMethodOption,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: config.appLockMethod === "pin" ? theme.colors.accent.primary : "transparent",
                    },
                  ]}
                  onPress={() => handleLockMethodChange("pin")}
                >
                  <Icon name="pin" size={24} color={theme.colors.text} />
                  <Text style={[styles.lockMethodText, { color: theme.colors.text }]}>{t("settings.privacy.pin")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.lockMethodOption,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: config.appLockMethod === "biometric" ? theme.colors.accent.primary : "transparent",
                      opacity: biometricSupport.supported ? 1 : 0.5,
                    },
                  ]}
                  onPress={() => handleLockMethodChange("biometric")}
                  disabled={!biometricSupport.supported}
                >
                  <Icon name="fingerprint" size={24} color={theme.colors.text} />
                  <Text style={[styles.lockMethodText, { color: theme.colors.text }]}>
                    {t("settings.privacy.biometric")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showPinSetup && (
            <View style={styles.pinSetupContainer}>
              <Text style={[styles.pinSetupTitle, { color: theme.colors.text }]}>{t("settings.privacy.setupPin")}</Text>

              <TextInput
                style={[styles.pinInput, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                placeholder={t("settings.privacy.enterPin")}
                placeholderTextColor="gray"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
                value={pin}
                onChangeText={setPin}
              />

              <TextInput
                style={[styles.pinInput, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                placeholder={t("settings.privacy.confirmPin")}
                placeholderTextColor="gray"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
                value={confirmPin}
                onChangeText={setConfirmPin}
              />

              <View style={styles.pinButtonsContainer}>
                <TouchableOpacity
                  style={[styles.pinButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => setShowPinSetup(false)}
                >
                  <Text style={[styles.pinButtonText, { color: theme.colors.text }]}>{t("common.cancel")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pinButton, { backgroundColor: theme.colors.accent.primary }]}
                  onPress={handlePinSetup}
                >
                  <Text style={styles.pinButtonText}>{t("common.save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("settings.privacy.contentPrivacy")}
          </Text>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {t("settings.privacy.hideContentInAppSwitcher")}
            </Text>
            <Switch
              value={config.hideContentInAppSwitcher}
              onValueChange={(value) => setConfig({ ...config, hideContentInAppSwitcher: value })}
              trackColor={{ false: "#767577", true: theme.colors.accent.secondary }}
              thumbColor={config.hideContentInAppSwitcher ? theme.colors.accent.primary : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {t("settings.privacy.blurSensitiveContent")}
            </Text>
            <Switch
              value={config.sensitiveContentBlur}
              onValueChange={(value) => setConfig({ ...config, sensitiveContentBlur: value })}
              trackColor={{ false: "#767577", true: theme.colors.accent.secondary }}
              thumbColor={config.sensitiveContentBlur ? theme.colors.accent.primary : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("settings.privacy.dataDeletion")}</Text>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              {t("settings.privacy.enableAutoDeletion")}
            </Text>
            <Switch
              value={config.autoDeletionEnabled}
              onValueChange={(value) => setConfig({ ...config, autoDeletionEnabled: value })}
              trackColor={{ false: "#767577", true: theme.colors.accent.secondary }}
              thumbColor={config.autoDeletionEnabled ? theme.colors.accent.primary : "#f4f3f4"}
            />
          </View>

          {config.autoDeletionEnabled && (
            <View style={styles.periodSelector}>
              <Text style={[styles.periodLabel, { color: theme.colors.text }]}>
                {t("settings.privacy.autoDeletionPeriod")}
              </Text>

              <View style={styles.periodOptions}>
                {[30, 90, 180, 365].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.periodOption,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: config.autoDeletionPeriod === days ? theme.colors.accent.primary : "transparent",
                      },
                    ]}
                    onPress={() => setConfig({ ...config, autoDeletionPeriod: days })}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        { color: config.autoDeletionPeriod === days ? theme.colors.accent.primary : theme.colors.text },
                      ]}
                    >
                      {days === 30
                        ? t("settings.privacy.period30Days")
                        : days === 90
                          ? t("settings.privacy.period90Days")
                          : days === 180
                            ? t("settings.privacy.period180Days")
                            : t("settings.privacy.period365Days")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("settings.privacy.privateMode")}</Text>

          <View style={styles.privateModeContainer}>
            <View style={styles.privateModeHeader}>
              <Text style={[styles.privateModeTitle, { color: theme.colors.text }]}>
                {t("settings.privacy.enablePrivateMode")}
              </Text>
              <Switch
                value={config.privateMode}
                onValueChange={handlePrivateModeToggle}
                trackColor={{ false: "#767577", true: theme.colors.accent.secondary }}
                thumbColor={config.privateMode ? theme.colors.accent.primary : "#f4f3f4"}
              />
            </View>

            <Text style={[styles.privateModeDescription, { color: theme.colors.text }]}>
              {t("settings.privacy.privateModeDescription")}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    flex: 1,
    marginRight: 8,
  },
  lockMethodContainer: {
    marginTop: 16,
  },
  lockMethodLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  lockMethodOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lockMethodOption: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    borderWidth: 2,
  },
  lockMethodText: {
    marginTop: 8,
    fontSize: 14,
  },
  pinSetupContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  pinSetupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  pinInput: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  pinButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pinButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  pinButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  periodSelector: {
    marginTop: 16,
  },
  periodLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  periodOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  periodOption: {
    width: "48%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
  },
  periodText: {
    fontSize: 14,
    fontWeight: "500",
  },
  privateModeContainer: {
    marginTop: 8,
  },
  privateModeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  privateModeTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  privateModeDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
})
