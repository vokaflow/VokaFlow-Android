import type { MMKV } from "react-native-mmkv"
import type FAQService from "./faqService"

// Definir tipos para los mensajes
export type MessageType = "user" | "bot"

export interface ChatMessage {
  id: string
  text: string
  type: MessageType
  timestamp: number
  isTyping?: boolean
}

class ChatbotService {
  private storage: MMKV
  private faqService: FAQService

  constructor(storage: MMKV, faqService: FAQService) {
    this.storage = storage
    this.faqService = faqService
  }

  // Obtener historial de conversación
  getConversationHistory(): ChatMessage[] {
    const history = this.storage.getString("chatbot_history")
    return history ? JSON.parse(history) : []
  }

  // Guardar historial de conversación
  saveConversationHistory(messages: ChatMessage[]) {
    this.storage.set("chatbot_history", JSON.stringify(messages))
  }

  // Limpiar historial de conversación
  clearConversationHistory() {
    this.storage.delete("chatbot_history")
  }

  // Procesar mensaje del usuario y generar respuesta
  async processUserMessage(message: string): Promise<ChatMessage> {
    // Generar ID único para el mensaje
    const id = Date.now().toString()

    // Si el mensaje está vacío, responder con mensaje de bienvenida
    if (!message || message.trim() === "") {
      return {
        id,
        text: "¡Hola! Soy el asistente de VokaFlow. ¿En qué puedo ayudarte hoy?",
        type: "bot",
        timestamp: Date.now(),
      }
    }

    // Buscar respuestas relevantes en las FAQs
    const results = await this.faqService.searchFAQs(message)

    if (results.length > 0) {
      // Devolver la respuesta más relevante
      return {
        id,
        text: results[0].answer,
        type: "bot",
        timestamp: Date.now(),
      }
    } else {
      // Respuesta por defecto si no se encuentra nada
      return {
        id,
        text: "Lo siento, no tengo información sobre eso. ¿Podrías reformular tu pregunta o explorar las categorías de ayuda disponibles?",
        type: "bot",
        timestamp: Date.now(),
      }
    }
  }

  // Sugerir preguntas populares
  async getSuggestedQuestions(): Promise<string[]> {
    const popularFAQs = await this.faqService.getPopularFAQs()
    return popularFAQs.map((faq) => faq.question)
  }

  // Obtener categorías disponibles
  async getCategories(): Promise<string[]> {
    const allFAQs = await this.faqService.getAllFAQs()
    const categories = new Set<string>()

    allFAQs.forEach((faq) => {
      categories.add(faq.category)
    })

    return Array.from(categories)
  }
}

export default ChatbotService
