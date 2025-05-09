import { StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { HelpCircle } from "lucide-react-native"
import { colors } from "../../theme"
import { FloatingActionButton } from "../accessibility/FloatingActionButton"
import { HapticType } from "../../services/feedback/hapticFeedback"

export const ChatbotButton = () => {
  const navigation = useNavigation()

  return (
    <FloatingActionButton
      icon={<HelpCircle size={24} color="#fff" />}
      label="Ayuda"
      accessibilityLabel="Abrir asistente de ayuda"
      hint="Abre el chatbot para obtener ayuda"
      onPress={() => navigation.navigate("Chatbot")}
      position="bottomRight"
      size="medium"
      hapticType={HapticType.MEDIUM}
      showLabel={true}
      style={{ backgroundColor: colors.neon.blue }}
    />
  )
}

const styles = StyleSheet.create({
  // Estilos eliminados ya que ahora usamos FloatingActionButton
})
