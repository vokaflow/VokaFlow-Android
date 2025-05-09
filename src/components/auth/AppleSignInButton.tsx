import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, View } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome"

interface AppleSignInButtonProps {
  onPress: () => void
  loading?: boolean
  text?: string
}

export const AppleSignInButton = ({
  onPress,
  loading = false,
  text = "Continuar con Apple",
}: AppleSignInButtonProps) => {
  // Solo mostrar en iOS
  if (Platform.OS !== "ios") {
    return null
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      accessibilityLabel="Iniciar sesión con Apple"
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.contentContainer}>
          <Icon name="apple" size={22} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.text}>{text}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#000000",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    flexDirection: "row",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})
