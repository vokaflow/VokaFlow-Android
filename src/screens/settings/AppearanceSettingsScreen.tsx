"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { useSelector, useDispatch } from "react-redux"
import { updateThemeConfig } from "../../store/slices/themeSlice"
import { themeService, accentColors, contrastLevels, fontSizes, animationPresets } from "../../services/theme"
import type { RootState } from "../../store"
import { useTranslation } from "../../hooks/useTranslation"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export default function AppearanceSettingsScreen({ navigation }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { config, theme } = useSelector((state: RootState) => state.theme)
  const [selectedAccent, setSelectedAccent] = useState(config.accentColor)
  const [selectedContrast, setSelectedContrast] = useState(config.contrastLevel)
  const [selectedFontSize, setSelectedFontSize] = useState(config.fontSize)
  const [selectedAnimations, setSelectedAnimations] = useState(config.animations)

  // Guardar cambios cuando se modifiquen las selecciones
  useEffect(() => {
    const saveChanges = async () => {
      const newConfig = {
        ...config,
        accentColor: selectedAccent,
        contrastLevel: selectedContrast,
        fontSize: selectedFontSize,
        animations: selectedAnimations,
      }

      await themeService.saveThemeConfig(newConfig)
      const newTheme = themeService.generateTheme(newConfig)
      dispatch(updateThemeConfig(newConfig))
    }

    saveChanges()
  }, [selectedAccent, selectedContrast, selectedFontSize, selectedAnimations])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t("settings.appearance.accentColor")}
          </Text>
          <View style={styles.colorGrid}>
            {Object.entries(accentColors).map(([colorName, colorValue]) => (
              <TouchableOpacity
                key={colorName}
                style={[
                  styles.colorOption,
                  { backgroundColor: colorValue.primary },
                  selectedAccent === colorName && styles.selectedOption,
                ]}
                onPress={() => setSelectedAccent(colorName)}
              >
                {selectedAccent === colorName && <Icon name="check" size={24} color="#FFFFFF" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("settings.appearance.contrast")}</Text>
          <View style={styles.optionsRow}>
            {Object.keys(contrastLevels).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: selectedContrast === level ? theme.colors.accent.primary : "transparent",
                  },
                ]}
                onPress={() => setSelectedContrast(level)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: selectedContrast === level ? theme.colors.accent.primary : theme.colors.text },
                  ]}
                >
                  {t(`settings.appearance.contrastLevels.${level}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("settings.appearance.fontSize")}</Text>
          <View style={styles.optionsRow}>
            {Object.keys(fontSizes).map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: selectedFontSize === size ? theme.colors.accent.primary : "transparent",
                  },
                ]}
                onPress={() => setSelectedFontSize(size)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: selectedFontSize === size ? theme.colors.accent.primary : theme.colors.text,
                      fontSize: size === "small" ? 14 : size === "medium" ? 16 : size === "large" ? 18 : 20,
                    },
                  ]}
                >
                  {t(`settings.appearance.fontSizes.${size}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("settings.appearance.animations")}</Text>
          <View style={styles.optionsRow}>
            {Object.keys(animationPresets).map((animation) => (
              <TouchableOpacity
                key={animation}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: selectedAnimations === animation ? theme.colors.accent.primary : "transparent",
                  },
                ]}
                onPress={() => setSelectedAnimations(animation)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: selectedAnimations === animation ? theme.colors.accent.primary : theme.colors.text },
                  ]}
                >
                  {t(`settings.appearance.animationLevels.${animation}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.previewSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("settings.appearance.preview")}</Text>
          <View style={[styles.previewCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
              {t("settings.appearance.previewTitle")}
            </Text>
            <Text style={[styles.previewText, { color: theme.colors.text }]}>
              {t("settings.appearance.previewText")}
            </Text>
            <TouchableOpacity style={[styles.previewButton, { backgroundColor: theme.colors.accent.primary }]}>
              <Text style={styles.previewButtonText}>{t("settings.appearance.previewButton")}</Text>
            </TouchableOpacity>
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
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedOption: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 12,
    minWidth: "30%",
    alignItems: "center",
  },
  optionText: {
    fontWeight: "500",
  },
  previewSection: {
    padding: 16,
    marginBottom: 24,
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  previewText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  previewButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  previewButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
})
