import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { AccessibleButton } from "../accessibility/AccessibleButton"
import { theme } from "../../theme"
import { Ionicons } from "@expo/vector-icons"

interface AlertModalProps {
  title: string
  message: string
  onClose: () => void
  type?: "info" | "success" | "warning" | "error"
  confirmText?: string
}

export const AlertModal: React.FC<AlertModalProps> = ({
  title,
  message,
  onClose,
  type = "info",
  confirmText = "OK",
}) => {
  // Configurar el icono y el color según el tipo
  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return {
          icon: "checkmark-circle",
          color: theme.colors.success,
        }
      case "warning":
        return {
          icon: "warning",
          color: theme.colors.warning,
        }
      case "error":
        return {
          icon: "alert-circle",
          color: theme.colors.error,
        }
      case "info":
      default:
        return {
          icon: "information-circle",
          color: theme.colors.primary,
        }
    }
  }

  const { icon, color } = getIconAndColor()

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.buttonContainer}>
        <AccessibleButton
          onPress={onClose}
          variant={type === "error" ? "danger" : type === "warning" ? "warning" : "primary"}
          style={styles.button}
        >
          {confirmText}
        </AccessibleButton>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    minWidth: 120,
  },
})
