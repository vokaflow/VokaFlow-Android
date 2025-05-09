import type React from "react"
import type { ReactNode } from "react"
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { AccessibleButton } from "../accessibility/AccessibleButton"
import { theme } from "../../theme"
import { Ionicons } from "@expo/vector-icons"

interface FormModalProps {
  title: string
  children: ReactNode
  onSubmit: () => void
  onCancel: () => void
  submitText?: string
  cancelText?: string
  icon?: string
  loading?: boolean
  scrollable?: boolean
  maxHeight?: number | string
}

export const FormModal: React.FC<FormModalProps> = ({
  title,
  children,
  onSubmit,
  onCancel,
  submitText = "Guardar",
  cancelText = "Cancelar",
  icon,
  loading = false,
  scrollable = true,
  maxHeight = "80%",
}) => {
  const Content = scrollable ? ScrollView : View

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardAvoid}>
      <View style={styles.container}>
        <View style={styles.header}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={24} color={theme.colors.primary} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          <AccessibleButton onPress={onCancel} variant="ghost" style={styles.closeButton} accessibilityLabel="Cerrar">
            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
          </AccessibleButton>
        </View>

        <Content
          style={[styles.content, { maxHeight }]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={scrollable}
        >
          {children}
        </Content>

        <View style={styles.footer}>
          <AccessibleButton onPress={onCancel} variant="ghost" style={styles.cancelButton} hapticType="light">
            {cancelText}
          </AccessibleButton>
          <AccessibleButton
            onPress={onSubmit}
            variant="primary"
            style={styles.submitButton}
            loading={loading}
            disabled={loading}
            hapticType="medium"
          >
            {submitText}
          </AccessibleButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    width: "100%",
  },
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconContainer: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: -8,
  },
  content: {
    width: "100%",
  },
  contentContainer: {
    padding: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    marginRight: 8,
  },
  submitButton: {},
})
