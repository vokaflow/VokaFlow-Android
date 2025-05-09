import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { AccessibleButton } from "../accessibility/AccessibleButton"
import { theme } from "../../theme"
import { Ionicons } from "@expo/vector-icons"

interface ConfirmModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  type?: "info" | "success" | "warning" | "danger"
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  type = "info",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  destructive = false,
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
      case "danger":
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
        <AccessibleButton onPress={onCancel} variant="ghost" style={styles.cancelButton} hapticType="light">
          {cancelText}
        </AccessibleButton>
        <AccessibleButton
          onPress={onConfirm}
          variant={destructive ? "danger" : type === "danger" ? "danger" : type === "warning" ? "warning" : "primary"}
          style={styles.confirmButton}
          hapticType={destructive ? "error" : "medium"}
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
})
