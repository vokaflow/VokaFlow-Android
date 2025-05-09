import type React from "react"
import { Text, StyleSheet } from "react-native"
import { useAccessibility } from "../../hooks/useAccessibility"

interface AccessibleTextProps {
  children: React.ReactNode
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "caption" | "label"
  color?: string
  align?: "left" | "center" | "right"
  style?: any
  numberOfLines?: number
  selectable?: boolean
  accessibilityLabel?: string
}

export const AccessibleText = ({
  children,
  variant = "body",
  color,
  align = "left",
  style,
  numberOfLines,
  selectable = false,
  accessibilityLabel,
}: AccessibleTextProps) => {
  const { fontSize, a11yProps, getContrastColors } = useAccessibility()
  const colors = getContrastColors()

  // Determinar tamaño de fuente según variante
  const getFontSize = () => {
    switch (variant) {
      case "h1":
        return fontSize("xxxl")
      case "h2":
        return fontSize("xxl")
      case "h3":
        return fontSize("xl")
      case "h4":
        return fontSize("lg")
      case "body":
        return fontSize("md")
      case "caption":
      case "label":
        return fontSize("sm")
      default:
        return fontSize("md")
    }
  }

  // Determinar peso de fuente según variante
  const getFontWeight = () => {
    switch (variant) {
      case "h1":
      case "h2":
      case "h3":
        return "bold"
      case "h4":
      case "label":
        return "600"
      default:
        return "normal"
    }
  }

  // Determinar color de texto según variante
  const getTextColor = () => {
    if (color) return color

    switch (variant) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
        return colors.textPrimary
      case "body":
        return colors.textSecondary
      case "caption":
      case "label":
        return colors.textTertiary
      default:
        return colors.textSecondary
    }
  }

  // Determinar rol de accesibilidad según variante
  const getAccessibilityRole = () => {
    switch (variant) {
      case "h1":
        return "header"
      case "h2":
      case "h3":
      case "h4":
        return "header"
      case "label":
        return "text"
      default:
        return "text"
    }
  }

  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          color: getTextColor(),
          textAlign: align,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      selectable={selectable}
      {...a11yProps(accessibilityLabel || (typeof children === "string" ? children : ""), "", getAccessibilityRole())}
    >
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  text: {
    marginVertical: 4,
  },
})
