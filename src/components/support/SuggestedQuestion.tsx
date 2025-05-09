import type React from "react"
import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { colors } from "../../theme"

interface SuggestedQuestionProps {
  question: string
  onPress: (question: string) => void
}

export const SuggestedQuestion: React.FC<SuggestedQuestionProps> = ({ question, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(question)}>
      <Text style={styles.text}>{question}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.neon.blue + "40", // 40 = 25% opacity
  },
  text: {
    color: colors.text.primary,
    fontSize: 14,
  },
})
