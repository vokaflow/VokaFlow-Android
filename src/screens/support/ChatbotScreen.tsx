"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useChatbot } from "../../hooks/useChatbot"
import { ChatMessage } from "../../components/support/ChatMessage"
import { SuggestedQuestion } from "../../components/support/SuggestedQuestion"
import { CategorySelector } from "../../components/support/CategorySelector"
import { colors } from "../../theme"
import { Send, Trash2, ArrowLeft } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import { ListItemTransition } from "../../components/navigation/ListItemTransition"
import { ScreenTransition } from "../../components/navigation/ScreenTransition"

export const ChatbotScreen: React.FC = () => {
  const { messages, isLoading, suggestedQuestions, categories, sendMessage, clearConversation } = useChatbot()

  const [inputText, setInputText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const flatListRef = useRef<FlatList>(null)
  const navigation = useNavigation()

  // Animación para el botón de enviar
  const sendButtonScale = useRef(new Animated.Value(1)).current

  // Efecto para animar el botón de enviar cuando cambia el texto
  useEffect(() => {
    if (inputText.trim()) {
      Animated.sequence([
        Animated.timing(sendButtonScale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(sendButtonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [inputText])

  const handleSend = () => {
    if (inputText.trim() === "") return

    sendMessage(inputText)
    setInputText("")
  }

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question)
  }

  // Renderizar cada mensaje con animación
  const renderMessage = ({ item, index }) => (
    <ListItemTransition index={index} type="slide-up" duration={300}>
      <ChatMessage message={item} />
    </ListItemTransition>
  )

  // Renderizar cada pregunta sugerida con animación
  const renderSuggestedQuestion = (question, index) => (
    <ListItemTransition index={index} type="fade-scale" duration={400} delay={100}>
      <SuggestedQuestion key={question} question={question} onPress={handleSuggestedQuestion} />
    </ListItemTransition>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenTransition type="slide-up">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Asistente de VokaFlow</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearConversation}>
            <Trash2 color={colors.text.primary} size={20} />
          </TouchableOpacity>
        </View>

        <ListItemTransition index={0} type="fade" duration={300}>
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </ListItemTransition>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {suggestedQuestions.length > 0 && messages.length < 3 && (
          <View style={styles.suggestedContainer}>
            <Text style={styles.suggestedTitle}>Preguntas frecuentes</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedScroll}
            >
              {suggestedQuestions.map((question, index) => renderSuggestedQuestion(question, index))}
            </ScrollView>
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={100}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor={colors.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.disabledButton]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              <Send color="#fff" size={20} />
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </ScreenTransition>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  clearButton: {
    padding: 8,
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  suggestedContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  suggestedScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.neon.blue,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: colors.background.tertiary,
    opacity: 0.7,
  },
})
