"use client"
import { View, ScrollView, StyleSheet, Switch, TouchableOpacity } from "react-native"
import { useAccessibility } from "../../hooks/useAccessibility"
import { AccessibleText } from "../../components/accessibility/AccessibleText"
import { AccessibleButton } from "../../components/accessibility/AccessibleButton"
import { SafeAreaView } from "react-native-safe-area-context"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export default function AccessibilitySettingsScreen({ navigation }) {
  const { config, updateConfig, fontSize, touchSize, provideFeedback, getContrastColors } = useAccessibility()
  const colors = getContrastColors()
  const touch = touchSize()

  // Función para actualizar una configuración específica
  const handleToggle = (key, value) => {
    provideFeedback("success")
    updateConfig({ [key]: value })
  }

  // Función para seleccionar una opción
  const handleSelect = (key, value) => {
    provideFeedback("success")
    updateConfig({ [key]: value })
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <ScrollView>
        <View style={styles.section}>
          <AccessibleText variant="h2">Configuración Visual</AccessibleText>

          <View style={styles.optionContainer}>
            <AccessibleText variant="body">Contraste</AccessibleText>
            <View style={styles.optionsRow}>
              {["normal", "high", "highest"].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: config.highContrast === level ? "#FF00FF" : "transparent",
                      borderRadius: touch.borderRadius,
                      padding: touch.spacing,
                    },
                  ]}
                  onPress={() => handleSelect("highContrast", level)}
                  accessible={true}
                  accessibilityLabel={`Contraste ${level}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: config.highContrast === level }}
                >
                  <AccessibleText
                    variant="body"
                    color={config.highContrast === level ? "#FF00FF" : colors.textSecondary}
                  >
                    {level === "normal" ? "Normal" : level === "high" ? "Alto" : level === "highest" ? "Máximo" : level}
                  </AccessibleText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.optionContainer}>
            <AccessibleText variant="body">Tamaño de texto</AccessibleText>
            <View style={styles.optionsRow}>
              {["small", "medium", "large", "extraLarge"].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: config.fontSize === size ? "#FF00FF" : "transparent",
                      borderRadius: touch.borderRadius,
                      padding: touch.spacing,
                    },
                  ]}
                  onPress={() => handleSelect("fontSize", size)}
                  accessible={true}
                  accessibilityLabel={`Tamaño de texto ${size}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: config.fontSize === size }}
                >
                  <AccessibleText
                    variant="body"
                    color={config.fontSize === size ? "#FF00FF" : colors.textSecondary}
                    style={{
                      fontSize:
                        size === "small"
                          ? fontSize("sm")
                          : size === "medium"
                            ? fontSize("md")
                            : size === "large"
                              ? fontSize("lg")
                              : fontSize("xl"),
                    }}
                  >
                    {size === "small"
                      ? "Pequeño"
                      : size === "medium"
                        ? "Medio"
                        : size === "large"
                          ? "Grande"
                          : "Extra Grande"}
                  </AccessibleText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.switchOption}>
            <View style={styles.switchLabel}>
              <Icon name="invert-colors" size={touch.iconSize} color={colors.textSecondary} />
              <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                Invertir colores
              </AccessibleText>
            </View>
            <Switch
              value={config.invertColors}
              onValueChange={(value) => handleToggle("invertColors", value)}
              trackColor={{ false: "#767577", true: "#FF00FF" }}
              thumbColor={config.invertColors ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              accessible={true}
              accessibilityLabel="Invertir colores"
              accessibilityRole="switch"
              accessibilityState={{ checked: config.invertColors }}
            />
          </View>

          <View style={styles.switchOption}>
            <View style={styles.switchLabel}>
              <Icon name="blur" size={touch.iconSize} color={colors.textSecondary} />
              <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                Reducir transparencia
              </AccessibleText>
            </View>
            <Switch
              value={config.reduceTransparency}
              onValueChange={(value) => handleToggle("reduceTransparency", value)}
              trackColor={{ false: "#767577", true: "#FF00FF" }}
              thumbColor={config.reduceTransparency ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              accessible={true}
              accessibilityLabel="Reducir transparencia"
              accessibilityRole="switch"
              accessibilityState={{ checked: config.reduceTransparency }}
            />
          </View>
        </View>

        {/* Nueva sección para animaciones */}
        <View style={styles.section}>
          <AccessibleText variant="h2">Animaciones y Movimiento</AccessibleText>

          <View style={styles.switchOption}>
            <View style={styles.switchLabel}>
              <Icon name="animation" size={touch.iconSize} color={colors.textSecondary} />
              <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                Reducir movimiento
              </AccessibleText>
            </View>
            <Switch
              value={config.reduceMotion}
              onValueChange={(value) => handleToggle("reduceMotion", value)}
              trackColor={{ false: "#767577", true: "#FF00FF" }}
              thumbColor={config.reduceMotion ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              accessible={true}
              accessibilityLabel="Reducir movimiento"
              accessibilityRole="switch"
              accessibilityState={{ checked: config.reduceMotion }}
            />
          </View>

          {!config.reduceMotion && (
            <>
              <View style={styles.optionContainer}>
                <AccessibleText variant="body">Nivel de animaciones</AccessibleText>
                <View style={styles.optionsRow}>
                  {["full", "reduced", "minimal", "none"].map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: config.animationPreset === preset ? "#FF00FF" : "transparent",
                          borderRadius: touch.borderRadius,
                          padding: touch.spacing,
                        },
                      ]}
                      onPress={() => handleSelect("animationPreset", preset)}
                      accessible={true}
                      accessibilityLabel={`Nivel de animaciones ${preset}`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: config.animationPreset === preset }}
                    >
                      <AccessibleText
                        variant="body"
                        color={config.animationPreset === preset ? "#FF00FF" : colors.textSecondary}
                      >
                        {preset === "full"
                          ? "Completo"
                          : preset === "reduced"
                            ? "Reducido"
                            : preset === "minimal"
                              ? "Mínimo"
                              : "Ninguno"}
                      </AccessibleText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.switchOption}>
                <View style={styles.switchLabel}>
                  <Icon name="gesture-swipe" size={touch.iconSize} color={colors.textSecondary} />
                  <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                    Efectos parallax
                  </AccessibleText>
                </View>
                <Switch
                  value={config.parallaxEffects}
                  onValueChange={(value) => handleToggle("parallaxEffects", value)}
                  trackColor={{ false: "#767577", true: "#FF00FF" }}
                  thumbColor={config.parallaxEffects ? "#FFFFFF" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  accessible={true}
                  accessibilityLabel="Efectos parallax"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: config.parallaxEffects }}
                />
              </View>

              <View style={styles.switchOption}>
                <View style={styles.switchLabel}>
                  <Icon name="transition" size={touch.iconSize} color={colors.textSecondary} />
                  <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                    Transiciones animadas
                  </AccessibleText>
                </View>
                <Switch
                  value={config.animatedTransitions}
                  onValueChange={(value) => handleToggle("animatedTransitions", value)}
                  trackColor={{ false: "#767577", true: "#FF00FF" }}
                  thumbColor={config.animatedTransitions ? "#FFFFFF" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  accessible={true}
                  accessibilityLabel="Transiciones animadas"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: config.animatedTransitions }}
                />
              </View>

              <View style={styles.switchOption}>
                <View style={styles.switchLabel}>
                  <Icon name="bell-ring" size={touch.iconSize} color={colors.textSecondary} />
                  <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                    Notificaciones animadas
                  </AccessibleText>
                </View>
                <Switch
                  value={config.animatedNotifications}
                  onValueChange={(value) => handleToggle("animatedNotifications", value)}
                  trackColor={{ false: "#767577", true: "#FF00FF" }}
                  thumbColor={config.animatedNotifications ? "#FFFFFF" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  accessible={true}
                  accessibilityLabel="Notificaciones animadas"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: config.animatedNotifications }}
                />
              </View>

              <View style={styles.switchOption}>
                <View style={styles.switchLabel}>
                  <Icon name="gesture-tap-button" size={touch.iconSize} color={colors.textSecondary} />
                  <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                    Botones animados
                  </AccessibleText>
                </View>
                <Switch
                  value={config.animatedButtons}
                  onValueChange={(value) => handleToggle("animatedButtons", value)}
                  trackColor={{ false: "#767577", true: "#FF00FF" }}
                  thumbColor={config.animatedButtons ? "#FFFFFF" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  accessible={true}
                  accessibilityLabel="Botones animados"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: config.animatedButtons }}
                />
              </View>

              <View style={styles.switchOption}>
                <View style={styles.switchLabel}>
                  <Icon name="loading" size={touch.iconSize} color={colors.textSecondary} />
                  <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                    Indicadores de carga animados
                  </AccessibleText>
                </View>
                <Switch
                  value={config.animatedLoaders}
                  onValueChange={(value) => handleToggle("animatedLoaders", value)}
                  trackColor={{ false: "#767577", true: "#FF00FF" }}
                  thumbColor={config.animatedLoaders ? "#FFFFFF" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  accessible={true}
                  accessibilityLabel="Indicadores de carga animados"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: config.animatedLoaders }}
                />
              </View>

              <View style={styles.switchOption}>
                <View style={styles.switchLabel}>
                  <Icon name="shape" size={touch.iconSize} color={colors.textSecondary} />
                  <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                    Iconos animados
                  </AccessibleText>
                </View>
                <Switch
                  value={config.animatedIcons}
                  onValueChange={(value) => handleToggle("animatedIcons", value)}
                  trackColor={{ false: "#767577", true: "#FF00FF" }}
                  thumbColor={config.animatedIcons ? "#FFFFFF" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  accessible={true}
                  accessibilityLabel="Iconos animados"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: config.animatedIcons }}
                />
              </View>

              <View style={styles.switchOption}>
                <View style={styles.switchLabel}>
                  <Icon name="image" size={touch.iconSize} color={colors.textSecondary} />
                  <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                    Fondos animados
                  </AccessibleText>
                </View>
                <Switch
                  value={config.animatedBackgrounds}
                  onValueChange={(value) => handleToggle("animatedBackgrounds", value)}
                  trackColor={{ false: "#767577", true: "#FF00FF" }}
                  thumbColor={config.animatedBackgrounds ? "#FFFFFF" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  accessible={true}
                  accessibilityLabel="Fondos animados"
                  accessibilityRole="switch"
                  accessibilityState={{ checked: config.animatedBackgrounds }}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <AccessibleText variant="h2">Configuración Táctil</AccessibleText>

          <View style={styles.optionContainer}>
            <AccessibleText variant="body">Tamaño de elementos táctiles</AccessibleText>
            <View style={styles.optionsRow}>
              {["normal", "large", "extraLarge"].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: config.touchSize === size ? "#FF00FF" : "transparent",
                      borderRadius: touch.borderRadius,
                      padding: touch.spacing,
                    },
                  ]}
                  onPress={() => handleSelect("touchSize", size)}
                  accessible={true}
                  accessibilityLabel={`Tamaño de elementos táctiles ${size}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: config.touchSize === size }}
                >
                  <AccessibleText variant="body" color={config.touchSize === size ? "#FF00FF" : colors.textSecondary}>
                    {size === "normal"
                      ? "Normal"
                      : size === "large"
                        ? "Grande"
                        : size === "extraLarge"
                          ? "Extra Grande"
                          : size}
                  </AccessibleText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.optionContainer}>
            <AccessibleText variant="body">Intensidad de vibración</AccessibleText>
            <View style={styles.optionsRow}>
              {["light", "medium", "strong"].map((intensity) => (
                <TouchableOpacity
                  key={intensity}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: config.vibrationIntensity === intensity ? "#FF00FF" : "transparent",
                      borderRadius: touch.borderRadius,
                      padding: touch.spacing,
                    },
                  ]}
                  onPress={() => handleSelect("vibrationIntensity", intensity)}
                  accessible={true}
                  accessibilityLabel={`Intensidad de vibración ${intensity}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: config.vibrationIntensity === intensity }}
                >
                  <AccessibleText
                    variant="body"
                    color={config.vibrationIntensity === intensity ? "#FF00FF" : colors.textSecondary}
                  >
                    {intensity === "light"
                      ? "Suave"
                      : intensity === "medium"
                        ? "Media"
                        : intensity === "strong"
                          ? "Fuerte"
                          : intensity}
                  </AccessibleText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <AccessibleText variant="h2">Configuración Auditiva</AccessibleText>

          <View style={styles.switchOption}>
            <View style={styles.switchLabel}>
              <Icon name="ear-hearing" size={touch.iconSize} color={colors.textSecondary} />
              <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                Audio mono
              </AccessibleText>
            </View>
            <Switch
              value={config.monoAudio}
              onValueChange={(value) => handleToggle("monoAudio", value)}
              trackColor={{ false: "#767577", true: "#FF00FF" }}
              thumbColor={config.monoAudio ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              accessible={true}
              accessibilityLabel="Audio mono"
              accessibilityRole="switch"
              accessibilityState={{ checked: config.monoAudio }}
            />
          </View>

          <View style={styles.switchOption}>
            <View style={styles.switchLabel}>
              <Icon name="text-to-speech" size={touch.iconSize} color={colors.textSecondary} />
              <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                Transcribir mensajes de audio
              </AccessibleText>
            </View>
            <Switch
              value={config.transcribeAudio}
              onValueChange={(value) => handleToggle("transcribeAudio", value)}
              trackColor={{ false: "#767577", true: "#FF00FF" }}
              thumbColor={config.transcribeAudio ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              accessible={true}
              accessibilityLabel="Transcribir mensajes de audio"
              accessibilityRole="switch"
              accessibilityState={{ checked: config.transcribeAudio }}
            />
          </View>

          <View style={styles.switchOption}>
            <View style={styles.switchLabel}>
              <Icon name="play-circle" size={touch.iconSize} color={colors.textSecondary} />
              <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                Reproducción automática de medios
              </AccessibleText>
            </View>
            <Switch
              value={config.autoplayMedia}
              onValueChange={(value) => handleToggle("autoplayMedia", value)}
              trackColor={{ false: "#767577", true: "#FF00FF" }}
              thumbColor={config.autoplayMedia ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              accessible={true}
              accessibilityLabel="Reproducción automática de medios"
              accessibilityRole="switch"
              accessibilityState={{ checked: config.autoplayMedia }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <AccessibleText variant="h2">Notificaciones</AccessibleText>

          <View style={styles.switchOption}>
            <View style={styles.switchLabel}>
              <Icon name="bell-ring" size={touch.iconSize} color={colors.textSecondary} />
              <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                Notificaciones visuales
              </AccessibleText>
            </View>
            <Switch
              value={config.visualNotifications}
              onValueChange={(value) => handleToggle("visualNotifications", value)}
              trackColor={{ false: "#767577", true: "#FF00FF" }}
              thumbColor={config.visualNotifications ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              accessible={true}
              accessibilityLabel="Notificaciones visuales"
              accessibilityRole="switch"
              accessibilityState={{ checked: config.visualNotifications }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <AccessibleText variant="h2">Lector de pantalla</AccessibleText>

          <View style={styles.switchOption}>
            <View style={styles.switchLabel}>
              <Icon name="text-to-speech" size={touch.iconSize} color={colors.textSecondary} />
              <AccessibleText variant="body" style={{ marginLeft: touch.spacing }}>
                Optimizar para lector de pantalla
              </AccessibleText>
            </View>
            <Switch
              value={config.screenReader}
              onValueChange={(value) => handleToggle("screenReader", value)}
              trackColor={{ false: "#767577", true: "#FF00FF" }}
              thumbColor={config.screenReader ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              accessible={true}
              accessibilityLabel="Optimizar para lector de pantalla"
              accessibilityRole="switch"
              accessibilityState={{ checked: config.screenReader }}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <AccessibleButton
            label="Restablecer configuración predeterminada"
            onPress={() => {
              provideFeedback("warning")
              updateConfig({
                highContrast: "normal",
                fontSize: "medium",
                reduceMotion: false,
                screenReader: false,
                vibrationIntensity: "medium",
                touchSize: "normal",
                autoplayMedia: true,
                transcribeAudio: true,
                visualNotifications: true,
                monoAudio: false,
                invertColors: false,
                reduceTransparency: false,
                // Nuevas configuraciones para animaciones
                animationPreset: "full",
                parallaxEffects: true,
                animatedTransitions: true,
                animatedNotifications: true,
                animatedButtons: true,
                animatedLoaders: true,
                animatedIcons: true,
                animatedBackgrounds: true,
              })
            }}
            variant="outline"
            fullWidth
          />
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
  optionContainer: {
    marginVertical: 16,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  optionButton: {
    marginVertical: 4,
    minWidth: "30%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  switchOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 24,
  },
})
