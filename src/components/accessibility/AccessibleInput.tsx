"use client"

import { useState } from "react"
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from "react-native"
import { useAccessibility } from "../../hooks/useAccessibility"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

interface AccessibleInputProps {
  value: string
  onChangeText: (text: string) => void
  label: string
  placeholder?: string
  error?: string
  secureTextEntry?: boolean
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad"
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  autoCorrect?: boolean
  multiline?: boolean
  maxLength?: number
  style?: any
  inputStyle?: any
  onBlur?: () => void
  onFocus?: () => void
}

export const AccessibleInput = ({
  value,
  onChangeText,
  label,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  multiline = false,
  maxLength,
  style,
  inputStyle,
  onBlur,
  onFocus,
}: AccessibleInputProps) => {
  const { a11yProps, fontSize, touchSize, getContrastColors } = useAccessibility()
  const [isFocused, setIsFocused] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const colors = getContrastColors()
  const touch = touchSize()

  const handleFocus = () => {
    setIsFocused(true)
    if (onFocus) onFocus()
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (onBlur) onBlur()
  }

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.label,
          {
            fontSize: fontSize("sm"),
            color: error ? "#FF3333" : isFocused ? "#FF00FF" : colors.textSecondary,
          },
        ]}
        {...a11yProps(label, "", "text")}
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? "#FF3333" : isFocused ? "#FF00FF" : colors.backgroundTertiary,
            backgroundColor: colors.backgroundSecondary,
            minHeight: multiline ? touch.buttonHeight * 2 : touch.buttonHeight,
            borderRadius: touch.borderRadius,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            {
              fontSize: fontSize("md"),
              color: colors.textPrimary,
              textAlignVertical: multiline ? "top" : "center",
              paddingTop: multiline ? touch.spacing : 0,
            },
            inputStyle,
          ]}
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={placeholder}
          accessibilityRole="text"
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.visibilityToggle}
            {...a11yProps(
              isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña",
              "Toca para cambiar la visibilidad de la contraseña",
              "button",
            )}
          >
            <Icon name={isPasswordVisible ? "eye-off" : "eye"} size={touch.iconSize} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text
          style={[
            styles.errorText,
            {
              fontSize: fontSize("sm"),
              color: "#FF3333",
            },
          ]}
          {...a11yProps(`Error: ${error}`, "", "text")}
        >
          {error}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  visibilityToggle: {
    padding: 8,
  },
  errorText: {
    marginTop: 4,
  },
})
