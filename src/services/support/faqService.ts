import { type Database, Q } from "@nozbe/watermelondb"
import type FAQ from "../database/models/FAQ"

class FAQService {
  constructor(private database: Database) {}

  // Obtener todas las FAQs
  async getAllFAQs() {
    return this.database.get<FAQ>("faqs").query().fetch()
  }

  // Obtener FAQs por categoría
  async getFAQsByCategory(category: string) {
    return this.database.get<FAQ>("faqs").query(Q.where("category", category)).fetch()
  }

  // Buscar FAQs por palabras clave
  async searchFAQs(query: string) {
    if (!query || query.trim() === "") {
      return []
    }

    const keywords = query.toLowerCase().split(" ")
    const allFaqs = await this.getAllFAQs()

    return allFaqs.filter((faq) => {
      const faqText = `${faq.question} ${faq.answer} ${faq.keywords}`.toLowerCase()
      return keywords.some((keyword) => faqText.includes(keyword))
    })
  }

  // Obtener FAQs populares
  async getPopularFAQs() {
    return this.database.get<FAQ>("faqs").query(Q.where("is_popular", true)).fetch()
  }

  // Inicializar la base de datos con FAQs predeterminadas
  async initializeDefaultFAQs() {
    const count = await this.database.get<FAQ>("faqs").query().fetchCount()

    if (count === 0) {
      await this.database.write(async () => {
        const faqCollection = this.database.get<FAQ>("faqs")

        // Funcionalidades básicas
        await faqCollection.create((faq) => {
          faq.question = "¿Cómo iniciar una nueva conversación?"
          faq.answer =
            'Para iniciar una nueva conversación, ve a la pestaña "Chats" y toca el botón "+" en la esquina inferior derecha. Selecciona un contacto de la lista o ingresa un nuevo número para comenzar a chatear.'
          faq.category = "Funcionalidades básicas"
          faq.keywords = "chat conversación mensaje nuevo iniciar comenzar"
          faq.isPopular = true
          faq.createdAt = new Date()
          faq.updatedAt = new Date()
        })

        await faqCollection.create((faq) => {
          faq.question = "¿Cómo traducir mensajes de voz automáticamente?"
          faq.answer =
            "Para traducir mensajes de voz, mantén presionado el botón de micrófono en una conversación y habla. Al soltar, VokaFlow traducirá automáticamente tu mensaje al idioma configurado del destinatario. También puedes configurar la traducción automática en Configuración > Idioma."
          faq.category = "Funcionalidades básicas"
          faq.keywords = "traducir voz audio mensaje automático idioma"
          faq.isPopular = true
          faq.createdAt = new Date()
          faq.updatedAt = new Date()
        })

        // Cuentas y privacidad
        await faqCollection.create((faq) => {
          faq.question = "¿Cómo cambiar entre cuenta personal y profesional?"
          faq.answer =
            "Para cambiar entre tus cuentas personal y profesional, toca tu avatar en la parte superior de la pantalla o ve a Configuración > Perfiles. Allí podrás seleccionar el perfil que deseas utilizar o configurar nuevos perfiles."
          faq.category = "Cuentas y privacidad"
          faq.keywords = "perfil cuenta personal profesional cambiar alternar"
          faq.isPopular = true
          faq.createdAt = new Date()
          faq.updatedAt = new Date()
        })

        await faqCollection.create((faq) => {
          faq.question = "¿Cómo restablecer mi contraseña de acceso?"
          faq.answer =
            'Para restablecer tu contraseña, ve a la pantalla de inicio de sesión y selecciona "¿Olvidaste tu contraseña?". Ingresa tu correo electrónico registrado y sigue las instrucciones enviadas a tu bandeja de entrada para crear una nueva contraseña.'
          faq.category = "Cuentas y privacidad"
          faq.keywords = "contraseña olvidar restablecer recuperar seguridad"
          faq.isPopular = false
          faq.createdAt = new Date()
          faq.updatedAt = new Date()
        })

        // Gestión del almacenamiento
        await faqCollection.create((faq) => {
          faq.question = "¿Cómo liberar espacio utilizado por la aplicación?"
          faq.answer =
            "Para liberar espacio, ve a Configuración > Almacenamiento > Gestión de almacenamiento. Allí podrás ver qué está ocupando espacio y eliminar archivos multimedia antiguos, limpiar la caché o configurar la limpieza automática de archivos."
          faq.category = "Gestión del almacenamiento"
          faq.keywords = "espacio almacenamiento liberar limpiar caché archivos"
          faq.isPopular = true
          faq.createdAt = new Date()
          faq.updatedAt = new Date()
        })

        await faqCollection.create((faq) => {
          faq.question = "¿Cómo configurar la compresión automática de archivos multimedia?"
          faq.answer =
            "Para configurar la compresión automática, ve a Configuración > Multimedia > Compresión. Allí puedes seleccionar diferentes niveles de compresión para imágenes, videos y audios, o configurar la compresión automática basada en tu conexión de red."
          faq.category = "Gestión del almacenamiento"
          faq.keywords = "compresión multimedia imágenes videos calidad almacenamiento"
          faq.isPopular = false
          faq.createdAt = new Date()
          faq.updatedAt = new Date()
        })

        // Sincronización offline
        await faqCollection.create((faq) => {
          faq.question = "¿Qué sucede con mis mensajes enviados cuando estoy offline?"
          faq.answer =
            'Cuando envías mensajes sin conexión, estos se almacenan localmente en tu dispositivo con un indicador de "pendiente". Una vez que recuperes la conexión, VokaFlow sincronizará automáticamente estos mensajes con el servidor y los entregará a sus destinatarios.'
          faq.category = "Sincronización offline"
          faq.keywords = "offline sin conexión mensajes pendientes sincronización"
          faq.isPopular = true
          faq.createdAt = new Date()
          faq.updatedAt = new Date()
        })

        await faqCollection.create((faq) => {
          faq.question = "¿Cómo se sincronizan mis datos cuando recupero conexión?"
          faq.answer =
            "Cuando recuperas la conexión, VokaFlow inicia automáticamente un proceso de sincronización en segundo plano. Primero se envían los mensajes pendientes, luego se descargan los mensajes nuevos, y finalmente se sincronizan otros datos como estados y configuraciones. Puedes ver el progreso en el indicador de sincronización."
          faq.category = "Sincronización offline"
          faq.keywords = "sincronización conexión datos recuperar online"
          faq.isPopular = false
          faq.createdAt = new Date()
          faq.updatedAt = new Date()
        })
      })
    }
  }
}

export default FAQService
