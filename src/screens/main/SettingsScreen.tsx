import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import {
  User,
  Bell,
  Globe,
  MessageSquare,
  Moon,
  Database,
  Wifi,
  HelpCircle,
  Info,
  Shield,
  Image,
} from "lucide-react-native"
import { colors } from "../../theme"

const SettingItem = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingIcon}>{icon}</View>
    <Text style={styles.settingTitle}>{title}</Text>
  </TouchableOpacity>
)

export const SettingsScreen = () => {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <SettingItem
            icon={<User size={22} color={colors.neon.blue} />}
            title="Perfiles"
            onPress={() => navigation.navigate("ProfileManagement")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <SettingItem
            icon={<Moon size={22} color={colors.neon.magenta} />}
            title="Apariencia"
            onPress={() => navigation.navigate("AppearanceSettings")}
          />
          <SettingItem
            icon={<Bell size={22} color={colors.neon.orange} />}
            title="Notificaciones"
            onPress={() => navigation.navigate("NotificationCustomization")}
          />
          <SettingItem
            icon={<Globe size={22} color={colors.neon.green} />}
            title="Idioma"
            onPress={() => navigation.navigate("LanguageSettings")}
          />
          <SettingItem
            icon={<MessageSquare size={22} color={colors.neon.blue} />}
            title="Chat"
            onPress={() => navigation.navigate("ChatSettings")}
          />
          <SettingItem
            icon={<Image size={22} color={colors.neon.purple} />}
            title="Multimedia"
            onPress={() => navigation.navigate("MediaSettings")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidad y Seguridad</Text>
          <SettingItem
            icon={<Shield size={22} color={colors.neon.red} />}
            title="Privacidad y Seguridad"
            onPress={() => navigation.navigate("PrivacySecurity")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos y Almacenamiento</Text>
          <SettingItem
            icon={<Database size={22} color={colors.neon.blue} />}
            title="Almacenamiento"
            onPress={() => navigation.navigate("StorageSettings")}
          />
          <SettingItem
            icon={<Wifi size={22} color={colors.neon.green} />}
            title="Modo Offline"
            onPress={() => navigation.navigate("OfflineSettings")}
          />
          <SettingItem
            icon={<Wifi size={22} color={colors.neon.orange} />}
            title="Estado de Red"
            onPress={() => navigation.navigate("NetworkStatus")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayuda</Text>
          <SettingItem
            icon={<HelpCircle size={22} color={colors.neon.blue} />}
            title="Asistente de VokaFlow"
            onPress={() => navigation.navigate("Chatbot")}
          />
          <SettingItem
            icon={<Info size={22} color={colors.neon.magenta} />}
            title="Acerca de"
            onPress={() => navigation.navigate("About")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.secondary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingIcon: {
    width: 40,
    alignItems: "center",
  },
  settingTitle: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
})
