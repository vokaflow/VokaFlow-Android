import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigationContainer } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { Animated } from "react-native"

// Pantallas existentes
import { LoginScreen } from "../screens/auth/LoginScreen"
import { ChatsScreen } from "../screens/main/ChatsScreen"
import { SettingsScreen } from "../screens/main/SettingsScreen"
import { ChatScreen } from "../screens/chat/ChatScreen"
import { SecureChatScreen } from "../screens/chat/SecureChatScreen"
import { ARTranslateScreen } from "../screens/translation/ARTranslateScreen"
import { NotificationSettingsScreen } from "../screens/settings/NotificationSettingsScreen"
import { OfflineSettingsScreen } from "../screens/settings/OfflineSettingsScreen"
import { ChatSettingsScreen } from "../screens/settings/ChatSettingsScreen"
import { LanguageSettingsScreen } from "../screens/settings/LanguageSettingsScreen"
import { MediaSettingsScreen } from "../screens/settings/MediaSettingsScreen"
import { StorageSettingsScreen } from "../screens/settings/StorageSettingsScreen"
import { StorageFilesScreen } from "../screens/storage/StorageFilesScreen"
import { StorageManagementScreen } from "../screens/settings/StorageManagementScreen"
import { SyncSettingsScreen } from "../screens/settings/SyncSettingsScreen"
import { NetworkStatusScreen } from "../screens/settings/NetworkStatusScreen"
import { ProfileManagementScreen } from "../screens/settings/ProfileManagementScreen"
import { DashboardScreen } from "../screens/dashboard/DashboardScreen"
import { AppearanceSettingsScreen } from "../screens/settings/AppearanceSettingsScreen"
import { NotificationCustomizationScreen } from "../screens/settings/NotificationCustomizationScreen"
import { PrivacySecurityScreen } from "../screens/settings/PrivacySecurityScreen"
import { ChatbotScreen } from "../screens/support/ChatbotScreen"
import { AccessibilitySettingsScreen } from "../screens/settings/AccessibilitySettingsScreen"

// Nuevas pantallas de recompensas
import { RewardsScreen } from "../screens/rewards/RewardsScreen"
import { AchievementsScreen } from "../screens/rewards/AchievementsScreen"
import { RewardDetailsScreen } from "../screens/rewards/RewardDetailsScreen"
import { DailyMissionsScreen } from "../screens/rewards/DailyMissionsScreen"
import { SpecialRewardsScreen } from "../screens/rewards/SpecialRewardsScreen"

// Componentes
import { ProfileSelector } from "../components/profile/ProfileSelector"
import { theme } from "../theme"

// Importar utilidades de transición
import {
  transitionConfig,
  getTransitionForRoute,
  horizontalSlide,
  verticalSlide,
  modalSlide,
  zoom,
} from "../utils/navigationTransitions"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Configuración de transición para el Tab Navigator
const tabTransitionConfig = {
  animation: "spring",
  config: {
    stiffness: 1000,
    damping: 50,
    mass: 3,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
}

// Componente para animar la transición de tabs
const TabBarFade = ({ current, descriptors, navigation, position, state }) => {
  return (
    <Animated.View style={{ flexDirection: "row", backgroundColor: theme.colors.background }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label = options.tabBarLabel || options.title || route.name

        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        const inputRange = state.routes.map((_, i) => i)
        const opacity = position.interpolate({
          inputRange,
          outputRange: inputRange.map((i) => (i === index ? 1 : 0.5)),
        })

        const scale = position.interpolate({
          inputRange,
          outputRange: inputRange.map((i) => (i === index ? 1 : 0.9)),
        })

        return (
          <Animated.View
            key={index}
            style={{
              flex: 1,
              alignItems: "center",
              padding: 10,
              opacity,
              transform: [{ scale }],
            }}
          >
            <Ionicons
              name={options.tabBarIcon({ focused: isFocused, color: "", size: 0 }).props.name}
              size={24}
              color={isFocused ? theme.colors.primary : "gray"}
            />
            <Animated.Text
              style={{
                color: isFocused ? theme.colors.primary : "gray",
                marginTop: 4,
                fontSize: 12,
              }}
            >
              {label}
            </Animated.Text>
          </Animated.View>
        )
      })}
    </Animated.View>
  )
}

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Chats") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline"
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline"
          } else if (route.name === "Dashboard") {
            iconName = focused ? "stats-chart" : "stats-chart-outline"
          } else if (route.name === "Rewards") {
            iconName = focused ? "trophy" : "trophy-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: "rgba(255, 255, 255, 0.1)",
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: theme.colors.text,
        // Añadir animación a la transición de tabs
        tabBarAnimation: "spring",
      })}
      // Añadir configuración de transición para tabs
      tabBarOptions={{
        animationEnabled: true,
      }}
      // Añadir animación personalizada para tabs
      tabBar={(props) => <TabBarFade {...props} />}
    >
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          headerTitle: () => <ProfileSelector />,
        }}
      />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: theme.colors.background,
            shadowColor: "transparent",
            elevation: 0,
          },
          headerTintColor: theme.colors.text,
          cardStyle: { backgroundColor: theme.colors.background },
          // Configurar transiciones personalizadas
          cardStyleInterpolator: getTransitionForRoute(route.name),
          // Configurar tiempos de transición
          transitionSpec: {
            open: transitionConfig,
            close: transitionConfig,
          },
          // Habilitar gestos para volver atrás
          gestureEnabled: true,
          gestureDirection: route.name === "Chatbot" ? "vertical" : "horizontal",
          // Añadir sombra durante la transición
          cardShadowEnabled: true,
          // Añadir opacidad al fondo durante la transición
          cardOverlayEnabled: true,
        })}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="SecureChat"
          component={SecureChatScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="ARTranslate"
          component={ARTranslateScreen}
          options={{
            cardStyleInterpolator: zoom,
          }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="OfflineSettings"
          component={OfflineSettingsScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="ChatSettings"
          component={ChatSettingsScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="LanguageSettings"
          component={LanguageSettingsScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="MediaSettings"
          component={MediaSettingsScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="StorageSettings"
          component={StorageSettingsScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="StorageFiles"
          component={StorageFilesScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="StorageManagement"
          component={StorageManagementScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="SyncSettings"
          component={SyncSettingsScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="NetworkStatus"
          component={NetworkStatusScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="ProfileManagement"
          component={ProfileManagementScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="AppearanceSettings"
          component={AppearanceSettingsScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="NotificationCustomization"
          component={NotificationCustomizationScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="PrivacySecurity"
          component={PrivacySecurityScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="AccessibilitySettings"
          component={AccessibilitySettingsScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="Chatbot"
          component={ChatbotScreen}
          options={{
            headerShown: false,
            cardStyleInterpolator: modalSlide,
            gestureDirection: "vertical",
          }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
        <Stack.Screen
          name="RewardDetails"
          component={RewardDetailsScreen}
          options={{
            cardStyleInterpolator: zoom,
          }}
        />
        <Stack.Screen
          name="DailyMissions"
          component={DailyMissionsScreen}
          options={{
            cardStyleInterpolator: verticalSlide,
          }}
        />
        <Stack.Screen
          name="SpecialRewards"
          component={SpecialRewardsScreen}
          options={{
            cardStyleInterpolator: horizontalSlide,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
