"use client"

import { useEffect, useState } from "react"
import { StatusBar, LogBox } from "react-native"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { NavigationContainer } from "@react-navigation/native"
import { store, persistor } from "./src/store"
import { Navigation } from "./src/navigation"
import { database } from "./src/services/database"
import { authService } from "./src/services/auth"
import { syncService } from "./src/services/sync"
import { notificationService } from "./src/services/notifications"
import { languageService } from "./src/services/language"
import { connectivityService } from "./src/services/connectivity"
import { storageService } from "./src/services/storage"
import { profileService } from "./src/services/profile"
import { statsService } from "./src/services/stats"
import { rewardsService } from "./src/services/rewards"
import { configService } from "./src/services/config"
import { securityService } from "./src/services/security"
import { errorService } from "./src/services/error"
import { permissionsService } from "./src/services/permissions"
import { sessionService } from "./src/services/session"
import { navigationService } from "./src/services/navigation"
import { theme } from "./src/theme"
import { RewardAction } from "./src/types"
import { SplashScreen } from "./src/screens/splash/SplashScreen"
import { NotificationProvider } from "./src/contexts/NotificationContext"
import { NotificationContainer } from "./src/components/notifications/NotificationContainer"
import { configureGoogleSignIn } from "./src/services/auth/googleAuth"
import { ErrorUtils } from "react-native"

// Ignorar advertencias específicas
LogBox.ignoreLogs([
  "Animated: `useNativeDriver`",
  "componentWillReceiveProps",
  "componentWillMount",
  "ViewPropTypes will be removed",
  "ColorPropType will be removed",
])

// Configurar manejo global de errores
if (!__DEV__) {
  // Capturar errores no manejados en producción
  const originalErrorHandler = ErrorUtils.getGlobalHandler()

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    // Registrar el error
    errorService.captureError(error)

    // Llamar al manejador original
    originalErrorHandler(error, isFatal)
  })
}

export default function App() {
  const [isReady, setIsReady] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [initError, setInitError] = useState<Error | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Iniciando la aplicación...")

        // Inicializar servicios fundamentales primero
        await configService.initialize()
        await securityService.initialize()
        await errorService.initialize()

        // Configurar Google Sign-In
        configureGoogleSignIn()

        // Inicializar la base de datos
        await database.initialize()
        console.log("Base de datos inicializada")

        // Inicializar el servicio de permisos
        await permissionsService.initialize()

        // Inicializar el servicio de perfiles
        const activeProfile = await profileService.getActiveProfile()
        console.log("Perfil activo verificado")

        // Si no hay un perfil activo, crear uno por defecto
        if (!activeProfile) {
          await profileService.createProfile({
            name: "Personal",
            type: "personal",
            theme: "default",
          })
          console.log("Perfil por defecto creado")
        }

        // Inicializar servicios con el perfil activo
        await authService.initialize()
        await sessionService.initialize()
        await syncService.initialize()
        await notificationService.initialize()
        await languageService.initialize()
        await connectivityService.initialize()
        await storageService.initialize()
        await rewardsService.initialize()
        console.log("Servicios principales inicializados")

        // Inicializar estadísticas
        await statsService.updateStats()
        console.log("Estadísticas actualizadas")

        // Registrar tiempo activo para estadísticas
        const trackActiveTime = () => {
          // Registrar 1 minuto de tiempo activo cada minuto
          statsService.logActiveTime(1)

          // Actualizar actividad de sesión
          sessionService.updateActivity()
        }

        // Iniciar seguimiento de tiempo activo
        const activeTimeInterval = setInterval(trackActiveTime, 60000)

        // Registrar inicio de sesión diario
        await rewardsService.trackAction(RewardAction.DAILY_LOGIN)
        console.log("Inicio de sesión diario registrado")

        // Indicar que la app está lista
        setIsReady(true)
        console.log("Aplicación inicializada correctamente")

        // Limpiar intervalo al desmontar
        return () => clearInterval(activeTimeInterval)
      } catch (error) {
        console.error("Error initializing app:", error)
        setInitError(error instanceof Error ? error : new Error("Error desconocido al inicializar la aplicación"))
        // Incluso en caso de error, marcar como listo para mostrar alguna pantalla
        setIsReady(true)
      }
    }

    initializeApp()
  }, [])

  // Función para manejar cuando la animación de splash termina
  const handleSplashFinish = () => {
    setShowSplash(false)
  }

  // Mostrar la pantalla de splash mientras la app se inicializa
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} error={initError} />
  }

  // Si la app no está lista, no mostrar nada (la pantalla de splash ya se está mostrando)
  if (!isReady) {
    return null
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NotificationProvider>
          <NavigationContainer
            ref={navigationService.navigationRef}
            onStateChange={(state) => {
              const currentRouteName = navigationService.navigationRef.current?.getCurrentRoute()?.name
              navigationService.onRouteChange(currentRouteName)
            }}
          >
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
            <Navigation />
            <NotificationContainer />
          </NavigationContainer>
        </NotificationProvider>
      </PersistGate>
    </Provider>
  )
}
