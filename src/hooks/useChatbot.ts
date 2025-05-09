"use client"

import { useState, useEffect, useCallback } from "react"
import ChatbotService, { type ChatMessage } from "../services/support/chatbotService"
import { database } from "../services/database"
import { storage } from "../services/storage/mmkv"
import FAQService from "../services/support/faqService"

// Inicializar servicios
const faqService = new FAQService(database)
const chatbotService = new ChatbotService(storage, faqService)

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])

  // Cargar historial de conversación al iniciar
  useEffect(() => {
    const loadHistory = async () => {
      const history = chatbotService.getConversationHistory()

      if (history.length === 0) {
        // Si no hay historial, añadir mensaje de bienvenida
        const welcomeMessage = await chatbotService.processUserMessage("")
        setMessages([welcomeMessage])
      } else {
        setMessages(history)
      }

      // Cargar preguntas sugeridas
      const questions = await chatbotService.getSuggestedQuestions()
      setSuggestedQuestions(questions)

      // Cargar categorías
      const cats = await chatbotService.getCategories()
      setCategories(cats)
    }

    loadHistory()

    // Asegurarse de que las FAQs predeterminadas estén inicializadas
    faqService.initializeDefaultFAQs()
  }, [])

  // Guardar mensajes cuando cambian
  useEffect(() => {
    if (messages.length > 0) {
      chatbotService.saveConversationHistory(messages)
    }
  }, [messages])

  // Enviar mensaje del usuario
  const sendMessage = useCallback(async (text: string) => {
    if (!text || text.trim() === "") return

    // Añadir mensaje del usuario
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      type: "user",
      timestamp: Date.now(),
    }

    // Añadir mensaje temporal del bot (typing)
    const botTypingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: "",
      type: "bot",
      timestamp: Date.now() + 1,
      isTyping: true,
    }

    setMessages((prev) => [...prev, userMessage, botTypingMessage])
    setIsLoading(true)

    // Procesar respuesta (con pequeño retraso para efecto de typing)
    setTimeout(async () => {
      const botResponse = await chatbotService.processUserMessage(text)

      setMessages((prev) => prev.map((msg) => (msg.id === botTypingMessage.id ? botResponse : msg)))
      setIsLoading(false)
    }, 1000)
  }, [])

  // Limpiar conversación
  const clearConversation = useCallback(async () => {
    chatbotService.clearConversationHistory()
    const welcomeMessage = await chatbotService.processUserMessage("")
    setMessages([welcomeMessage])
  }, [])

  return {
    messages,
    isLoading,
    suggestedQuestions,
    categories,
    sendMessage,
    clearConversation,
  }
}
