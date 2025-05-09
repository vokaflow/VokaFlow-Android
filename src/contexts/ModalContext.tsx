"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Modal, type ModalTransition } from "../components/modal/Modal"
import type { StyleProp, ViewStyle } from "react-native"

// Tipos para las opciones del modal
interface ModalOptions {
  transition?: ModalTransition
  duration?: number
  backdropOpacity?: number
  backdropColor?: string
  position?: "center" | "top" | "bottom"
  width?: number | string
  height?: number | string
  style?: StyleProp<ViewStyle>
  avoidKeyboard?: boolean
  closeOnBackdropPress?: boolean
  closeOnBackButton?: boolean
  backdropTransition?: ModalTransition
  useHaptics?: boolean
  hapticType?: "light" | "medium" | "heavy" | "success" | "warning" | "error"
}

// Interfaz para el contexto
interface ModalContextType {
  showModal: (content: ReactNode, options?: ModalOptions) => void
  hideModal: () => void
  updateModal: (content: ReactNode, options?: ModalOptions) => void
}

// Crear el contexto
const ModalContext = createContext<ModalContextType | undefined>(undefined)

// Proveedor del contexto
export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false)
  const [content, setContent] = useState<ReactNode | null>(null)
  const [options, setOptions] = useState<ModalOptions>({})

  // Mostrar un modal
  const showModal = useCallback((newContent: ReactNode, newOptions: ModalOptions = {}) => {
    setContent(newContent)
    setOptions(newOptions)
    setVisible(true)
  }, [])

  // Ocultar el modal
  const hideModal = useCallback(() => {
    setVisible(false)
    // Limpiar el contenido después de que la animación de cierre haya terminado
    setTimeout(() => {
      setContent(null)
    }, options.duration || 300)
  }, [options.duration])

  // Actualizar el contenido y las opciones del modal
  const updateModal = useCallback((newContent: ReactNode, newOptions: ModalOptions = {}) => {
    setContent(newContent)
    setOptions((prevOptions) => ({ ...prevOptions, ...newOptions }))
  }, [])

  return (
    <ModalContext.Provider value={{ showModal, hideModal, updateModal }}>
      {children}
      <Modal visible={visible} onClose={hideModal} {...options}>
        {content}
      </Modal>
    </ModalContext.Provider>
  )
}

// Hook para usar el contexto
export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}
