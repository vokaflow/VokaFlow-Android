import { Platform, PermissionsAndroid } from "react-native"
import * as ExpoPermissions from "expo-permissions"
import { mmkvStorage } from "../storage/mmkv"

// Tipos de permisos
export enum PermissionType {
  CAMERA = "camera",
  MICROPHONE = "microphone",
  LOCATION = "location",
  CONTACTS = "contacts",
  STORAGE = "storage",
  NOTIFICATIONS = "notifications",
  CALENDAR = "calendar",
}

// Estado de los permisos
export enum PermissionStatus {
  GRANTED = "granted",
  DENIED = "denied",
  NEVER_ASK = "never_ask",
  UNAVAILABLE = "unavailable",
  UNKNOWN = "unknown",
}

// Interfaz para el resultado de la verificación de permisos
export interface PermissionResult {
  status: PermissionStatus
  canAskAgain: boolean
}

class PermissionsService {
  private readonly permissionsKey = "permissions_status"

  /**
   * Solicita un permiso específico
   */
  async requestPermission(type: PermissionType): Promise<PermissionResult> {
    let result: PermissionResult

    // Verificar si el permiso ya fue denegado permanentemente
    const savedStatus = this.getSavedPermissionStatus(type)
    if (savedStatus === PermissionStatus.NEVER_ASK) {
      return { status: PermissionStatus.NEVER_ASK, canAskAgain: false }
    }

    try {
      if (Platform.OS === "ios") {
        result = await this.requestIOSPermission(type)
      } else {
        result = await this.requestAndroidPermission(type)
      }

      // Guardar el estado del permiso
      this.savePermissionStatus(type, result.status)

      return result
    } catch (error) {
      console.error(`Error requesting permission ${type}:`, error)
      return { status: PermissionStatus.UNKNOWN, canAskAgain: true }
    }
  }

  /**
   * Verifica el estado actual de un permiso
   */
  async checkPermission(type: PermissionType): Promise<PermissionResult> {
    try {
      if (Platform.OS === "ios") {
        return await this.checkIOSPermission(type)
      } else {
        return await this.checkAndroidPermission(type)
      }
    } catch (error) {
      console.error(`Error checking permission ${type}:`, error)
      return { status: PermissionStatus.UNKNOWN, canAskAgain: true }
    }
  }

  /**
   * Verifica si todos los permisos requeridos están concedidos
   */
  async arePermissionsGranted(types: PermissionType[]): Promise<boolean> {
    for (const type of types) {
      const result = await this.checkPermission(type)
      if (result.status !== PermissionStatus.GRANTED) {
        return false
      }
    }
    return true
  }

  /**
   * Solicita múltiples permisos a la vez
   */
  async requestMultiplePermissions(types: PermissionType[]): Promise<Record<PermissionType, PermissionResult>> {
    const results: Record<PermissionType, PermissionResult> = {} as any

    for (const type of types) {
      results[type] = await this.requestPermission(type)
    }

    return results
  }

  /**
   * Obtiene el estado guardado de un permiso
   */
  private getSavedPermissionStatus(type: PermissionType): PermissionStatus | null {
    const permissions = this.getSavedPermissions()
    return permissions[type] || null
  }

  /**
   * Guarda el estado de un permiso
   */
  private savePermissionStatus(type: PermissionType, status: PermissionStatus): void {
    const permissions = this.getSavedPermissions()
    permissions[type] = status
    mmkvStorage.set(this.permissionsKey, JSON.stringify(permissions))
  }

  /**
   * Obtiene todos los estados de permisos guardados
   */
  private getSavedPermissions(): Record<PermissionType, PermissionStatus> {
    const saved = mmkvStorage.getString(this.permissionsKey)
    return saved ? JSON.parse(saved) : {}
  }

  /**
   * Solicita un permiso en iOS
   */
  private async requestIOSPermission(type: PermissionType): Promise<PermissionResult> {
    let permission

    switch (type) {
      case PermissionType.CAMERA:
        permission = await ExpoPermissions.askAsync(ExpoPermissions.CAMERA)
        break
      case PermissionType.MICROPHONE:
        permission = await ExpoPermissions.askAsync(ExpoPermissions.AUDIO_RECORDING)
        break
      case PermissionType.LOCATION:
        permission = await ExpoPermissions.askAsync(ExpoPermissions.LOCATION)
        break
      case PermissionType.CONTACTS:
        permission = await ExpoPermissions.askAsync(ExpoPermissions.CONTACTS)
        break
      case PermissionType.NOTIFICATIONS:
        permission = await ExpoPermissions.askAsync(ExpoPermissions.NOTIFICATIONS)
        break
      case PermissionType.CALENDAR:
        permission = await ExpoPermissions.askAsync(ExpoPermissions.CALENDAR)
        break
      default:
        return { status: PermissionStatus.UNAVAILABLE, canAskAgain: false }
    }

    return {
      status: permission.status === "granted" ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
      canAskAgain: permission.canAskAgain,
    }
  }

  /**
   * Verifica un permiso en iOS
   */
  private async checkIOSPermission(type: PermissionType): Promise<PermissionResult> {
    let permission

    switch (type) {
      case PermissionType.CAMERA:
        permission = await ExpoPermissions.getAsync(ExpoPermissions.CAMERA)
        break
      case PermissionType.MICROPHONE:
        permission = await ExpoPermissions.getAsync(ExpoPermissions.AUDIO_RECORDING)
        break
      case PermissionType.LOCATION:
        permission = await ExpoPermissions.getAsync(ExpoPermissions.LOCATION)
        break
      case PermissionType.CONTACTS:
        permission = await ExpoPermissions.getAsync(ExpoPermissions.CONTACTS)
        break
      case PermissionType.NOTIFICATIONS:
        permission = await ExpoPermissions.getAsync(ExpoPermissions.NOTIFICATIONS)
        break
      case PermissionType.CALENDAR:
        permission = await ExpoPermissions.getAsync(ExpoPermissions.CALENDAR)
        break
      default:
        return { status: PermissionStatus.UNAVAILABLE, canAskAgain: false }
    }

    return {
      status: permission.status === "granted" ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
      canAskAgain: permission.canAskAgain,
    }
  }

  /**
   * Solicita un permiso en Android
   */
  private async requestAndroidPermission(type: PermissionType): Promise<PermissionResult> {
    let permission

    switch (type) {
      case PermissionType.CAMERA:
        permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
        break
      case PermissionType.MICROPHONE:
        permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
        break
      case PermissionType.LOCATION:
        permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        break
      case PermissionType.CONTACTS:
        permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
        break
      case PermissionType.STORAGE:
        permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
        break
      case PermissionType.CALENDAR:
        permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CALENDAR)
        break
      case PermissionType.NOTIFICATIONS:
        // Las notificaciones en Android no requieren permiso explícito
        return { status: PermissionStatus.GRANTED, canAskAgain: true }
      default:
        return { status: PermissionStatus.UNAVAILABLE, canAskAgain: false }
    }

    let status: PermissionStatus
    let canAskAgain = true

    if (permission === PermissionsAndroid.RESULTS.GRANTED) {
      status = PermissionStatus.GRANTED
    } else if (permission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      status = PermissionStatus.NEVER_ASK
      canAskAgain = false
    } else {
      status = PermissionStatus.DENIED
    }

    return { status, canAskAgain }
  }

  /**
   * Verifica un permiso en Android
   */
  private async checkAndroidPermission(type: PermissionType): Promise<PermissionResult> {
    let permission: boolean

    switch (type) {
      case PermissionType.CAMERA:
        permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)
        break
      case PermissionType.MICROPHONE:
        permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
        break
      case PermissionType.LOCATION:
        permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        break
      case PermissionType.CONTACTS:
        permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
        break
      case PermissionType.STORAGE:
        permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
        break
      case PermissionType.CALENDAR:
        permission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CALENDAR)
        break
      case PermissionType.NOTIFICATIONS:
        // Las notificaciones en Android no requieren permiso explícito
        return { status: PermissionStatus.GRANTED, canAskAgain: true }
      default:
        return { status: PermissionStatus.UNAVAILABLE, canAskAgain: false }
    }

    // Si el permiso está concedido, devolver GRANTED
    if (permission) {
      return { status: PermissionStatus.GRANTED, canAskAgain: true }
    }

    // Si no está concedido, verificar si fue denegado permanentemente
    const savedStatus = this.getSavedPermissionStatus(type)
    if (savedStatus === PermissionStatus.NEVER_ASK) {
      return { status: PermissionStatus.NEVER_ASK, canAskAgain: false }
    }

    return { status: PermissionStatus.DENIED, canAskAgain: true }
  }
}

export const permissionsService = new PermissionsService()
