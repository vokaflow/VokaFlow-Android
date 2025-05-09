import type React from "react"
import { Image, StyleSheet, View, type ImageProps } from "react-native"

interface LogoProps {
  size?: "small" | "medium" | "large" | "xlarge"
  style?: ImageProps["style"]
}

export const Logo: React.FC<LogoProps> = ({ size = "medium", style }) => {
  // Determinar tamaño basado en la prop
  const getDimensions = () => {
    switch (size) {
      case "small":
        return { width: 60, height: 60 }
      case "medium":
        return { width: 100, height: 100 }
      case "large":
        return { width: 150, height: 150 }
      case "xlarge":
        return { width: 200, height: 200 }
      default:
        return { width: 100, height: 100 }
    }
  }

  const dimensions = getDimensions()

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/logo_vokaflow.png")}
        style={[styles.logo, dimensions, style]}
        resizeMode="contain"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
})
