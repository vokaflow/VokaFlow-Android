import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import type { ChatMessage as ChatMessageType } from "../../services/support/chatbotService"
import { colors } from "../../theme"
import { ActivityIndicator } from "react-native"

interface ChatMessageProps {
  message: ChatMessageType
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === "user"

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      {message.isTyping ? (
        <ActivityIndicator color={colors.neon.blue} size="small" />
      ) : (
        <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>{message.text}</Text>
      )}
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userContainer: {
    alignSelf: "flex-end",
    backgroundColor: colors.neon.blue,
    borderBottomRightRadius: 4,
  },
  botContainer: {
    alignSelf: "flex-start",
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: "#fff",
  },
  botText: {
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
    opacity: 0.7,
    color: colors.text.secondary,
  },
})
