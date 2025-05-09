import { TouchableOpacity, Text, StyleSheet, View, Image, ActivityIndicator } from "react-native"

interface GoogleSignInButtonProps {
  onPress: () => void
  loading?: boolean
  text?: string
}

export const GoogleSignInButton = ({
  onPress,
  loading = false,
  text = "Continuar con Google",
}: GoogleSignInButtonProps) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} disabled={loading} activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color="#1F1F1F" size="small" />
      ) : (
        <View style={styles.contentContainer}>
          <Image source={require("../../../assets/google_logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.text}>{text}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    height: 50,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  text: {
    color: "#1F1F1F",
    fontSize: 16,
    fontWeight: "600",
  },
})
