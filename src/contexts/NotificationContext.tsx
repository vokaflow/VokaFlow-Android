"use client"

import type React from "react"
import { createContext, useContext, useReducer, useRef, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

// Tipos de notificaciones
export type NotificationType = "success" | "error" | "warning" | "info"

// Posiciones de notificaciones
export type NotificationPosition = "top" | "bottom"

// Animaciones de notificaciones
export type NotificationAnimation = "slide" | "fade" | "bounce" | "zoom" | "flip" | "pulse" | "shake"

// Interfaz de notificación
export interface Notification {
  id: string
  message: string
  type: NotificationType
  title?: string
  duration?: number
  position?: NotificationPosition
  animation?: NotificationAnimation
  action?: {
    label: string
    onPress: () => void
  }
  onClose?: () => void
  icon?: string
  showProgress?: boolean
  progress?: number
  autoClose?: boolean
}

// Estado del contexto
interface NotificationState {
  notifications: Notification[]
}

// Acciones del reducer
type NotificationAction =
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "REMOVE_NOTIFICATION"; payload: { id: string } }
  | { type: "UPDATE_NOTIFICATION"; payload: { id: string; notification: Partial<Notification> } }
  | { type: "CLEAR_NOTIFICATIONS" }

// Reducer para gestionar el estado
const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      }
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.id !== action.payload.id),
      }
    case "UPDATE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload.id ? { ...notification, ...action.payload.notification } : notification,
        ),
      }
    case "CLEAR_NOTIFICATIONS":
      return {
        ...state,
        notifications: [],
      }
    default:
      return state
  }
}

// Interfaz del contexto
interface NotificationContextType {
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, "id">) => string
  updateNotification: (id: string, notification: Partial<Notification>) => void
  hideNotification: (id: string) => void
  clearNotifications: () => void
}

// Crear el contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Proveedor del contexto
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] })
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  // Mostrar una notificación
  const showNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = uuidv4()
    const newNotification: Notification = {
      id,
      type: "info",
      duration: 3000,
      position: "top",
      animation: "slide",
      autoClose: true,
      ...notification,
    }

    dispatch({ type: "ADD_NOTIFICATION", payload: newNotification })

    // Si la notificación debe cerrarse automáticamente, configurar un temporizador
    if (newNotification.autoClose && newNotification.duration) {
      timeoutsRef.current[id] = setTimeout(() => {
        hideNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  // Actualizar una notificación
  const updateNotification = useCallback((id: string, notification: Partial<Notification>) => {
    dispatch({ type: "UPDATE_NOTIFICATION", payload: { id, notification } })

    // Si se actualiza la duración y hay un temporizador existente, actualizarlo
    if (notification.duration && timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id])
      timeoutsRef.current[id] = setTimeout(() => {
        hideNotification(id)
      }, notification.duration)
    }
  }, [])

  // Ocultar una notificación
  const hideNotification = useCallback(
    (id: string) => {
      // Limpiar el temporizador si existe
      if (timeoutsRef.current[id]) {
        clearTimeout(timeoutsRef.current[id])
        delete timeoutsRef.current[id]
      }

      // Ejecutar la función onClose si existe
      const notification = state.notifications.find((n) => n.id === id)
      if (notification && notification.onClose) {
        notification.onClose()
      }

      dispatch({ type: "REMOVE_NOTIFICATION", payload: { id } })
    },
    [state.notifications],
  )

  // Limpiar todas las notificaciones
  const clearNotifications = useCallback(() => {
    // Limpiar todos los temporizadores
    Object.keys(timeoutsRef.current).forEach((id) => {
      clearTimeout(timeoutsRef.current[id])
    })
    timeoutsRef.current = {}

    dispatch({ type: "CLEAR_NOTIFICATIONS" })
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        showNotification,
        updateNotification,
        hideNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// Hook para usar el contexto
export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
