"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { profileAuthService } from "../../services/auth/profileAuth"
import { theme } from "../../theme"
import { AnimatedLogo } from "../../components/common/AnimatedLogo"
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton"
import { AppleSignInButton } from "../../components/auth/AppleSignInButton"

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const [error, setError] = useState("")
  const [profileType, setProfileType] = useState<"personal" | "professional">("personal")
  const [isAppleAvailable, setIsAppleAvailable] = useState(false)

  // Añadir estas líneas después de la declaración de estados
  const fadeInAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  // Añadir una nueva referencia de animación después de las existentes
  const formFadeAnim = useRef(new Animated.Value(0)).current
  // Añadir una nueva referencia de animación después de las existentes
  const footerFadeAnim = useRef(new Animated.Value(0)).current

  // Añadir este useEffect after the states
  useEffect(() => {
    // Iniciar animación con un pequeño retraso después del logo
    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 800,
        delay: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formFadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(footerFadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 1600,
        useNativeDriver: true,
      }),
    ]).start()

    // Verificar si Apple Sign In está disponible
    const checkAppleSignIn = async () => {
      const available = await profileAuthService.isAppleSignInAvailable()
      setIsAppleAvailable(available)
    }

    checkAppleSignIn()
  }, [fadeInAnim, slideAnim, formFadeAnim, footerFadeAnim])

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña")
      return
    }

    try {
      setLoading(true)
      setError("")
      await profileAuthService.signInWithEmailAndPassword(email, password, profileType)
      navigation.replace("Main")
    } catch (err) {
      console.error("Error en inicio de sesión:", err)
      setError("Credenciales incorrectas. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      setError("")
      const success = await profileAuthService.signInWithGoogle(profileType)

      if (success) {
        navigation.replace("Main")
      } else {
        setError("No se pudo iniciar sesión con Google. Intenta de nuevo.")
      }
    } catch (err) {
      console.error("Error en inicio de sesión con Google:", err)
      setError("Error al iniciar sesión con Google. Por favor intenta de nuevo.")
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true)
      setError("")
      const success = await profileAuthService.signInWithApple(profileType)

      if (success) {
        navigation.replace("Main")
      } else {
        setError("No se pudo iniciar sesión con Apple. Intenta de nuevo.")
      }
    } catch (err) {
      console.error("Error en inicio de sesión con Apple:", err)
      setError("Error al iniciar sesión con Apple. Por favor intenta de nuevo.")
    } finally {
      setAppleLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        {/* Reemplazar el bloque del logo container con esta versión animada */}
        <View style={styles.logoContainer}>
          <AnimatedLogo size="large" animation="scale" duration={1500} />
          <Animated.Text
            style={[
              styles.appName,
              {
                opacity: fadeInAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            VokaFlow
          </Animated.Text>
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: fadeInAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            Comunicación sin barreras
          </Animated.Text>
        </View>

        {/* Reemplazar <View style={styles.formContainer}> con la versión animada */}
        <Animated.View style={[styles.formContainer, { opacity: formFadeAnim }]}>
          <View style={styles.profileTypeSelector}>
            <TouchableOpacity
              style={[styles.profileTypeButton, profileType === "personal" && styles.activeProfileType]}
              onPress={() => setProfileType("personal")}
            >
              <Text style={[styles.profileTypeText, profileType === "personal" && styles.activeProfileTypeText]}>
                Personal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.profileTypeButton, profileType === "professional" && styles.activeProfileType]}
              onPress={() => setProfileType("professional")}
            >
              <Text style={[styles.profileTypeText, profileType === "professional" && styles.activeProfileTypeText]}>
                Profesional
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Iniciar Sesión</Text>}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.divider} />
          </View>

          <GoogleSignInButton onPress={handleGoogleSignIn} loading={googleLoading} text="Continuar con Google" />

          {isAppleAvailable && (
            <AppleSignInButton onPress={handleAppleSignIn} loading={appleLoading} text="Continuar con Apple" />
          )}

          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Reemplazar <View style={styles.footer}> con la versión animada */}
        <Animated.View style={[styles.footer, { opacity: footerFadeAnim }]}>
          <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
          <TouchableOpacity>
            <Text style={styles.signupText}>Regístrate</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  formContainer: {
    width: "100%",
  },
  profileTypeSelector: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  profileTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeProfileType: {
    backgroundColor: theme.colors.primary,
  },
  profileTypeText: {
    color: theme.colors.text,
    fontWeight: "500",
  },
  activeProfileTypeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: theme.colors.text,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 15,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    paddingHorizontal: 10,
  },
  forgotPasswordButton: {
    alignItems: "center",
    marginTop: 15,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  footerText: {
    color: theme.colors.textSecondary,
    marginRight: 5,
  },
  signupText: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
})
