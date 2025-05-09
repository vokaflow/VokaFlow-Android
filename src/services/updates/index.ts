import { Platform, Linking } from "react-native"
import { mmkvStorage } from "../storage/mmkv"
import { errorService, ErrorType } from "../error"

// Interfaz para la información de versión
interface VersionInfo {
  version: string
  buildNumber: string
  minRequiredVersion: string
  latestVersion: string
  updateUrl: string
  releaseNotes: string
  forceUpdate: boolean
}

class UpdatesService {
  private readonly lastCheckKey = "last_update_check"
  private readonly versionInfoKey = "version_info"
  private readonly checkInterval = 24 * 60 * 60 * 1000 // 24 horas

  /**
   * Verifica si hay actualizaciones disponibles
   */
  async checkForUpdates(force = false): Promise<{
    hasUpdate: boolean
    forceUpdate: boolean
    versionInfo: VersionInfo | null
  }> {
    try {
      // Verificar si ya se ha comprobado recientemente
      if (!force) {
        const lastCheck = mmkvStorage.getString(this.lastCheckKey)

        if (lastCheck) {
          const lastCheckTime = Number.parseInt(lastCheck)
          const now = Date.now()

          if (now - lastCheckTime < this.checkInterval) {
            // Devolver información de versión guardada
            const savedInfo = this.getSavedVersionInfo()

            if (savedInfo) {
              return {
                hasUpdate: this.hasUpdate(savedInfo),
                forceUpdate: savedInfo.forceUpdate,
                versionInfo: savedInfo,
              }
            }
          }
        }
      }

      // Obtener información de versión del servidor
      const versionInfo = await this.fetchVersionInfo()

      // Guardar información de versión
      this.saveVersionInfo(versionInfo)

      // Registrar tiempo de comprobación
      mmkvStorage.set(this.lastCheckKey, Date.now().toString())

      return {
        hasUpdate: this.hasUpdate(versionInfo),
        forceUpdate: versionInfo.forceUpdate,
        versionInfo,
      }
    } catch (error) {
      errorService.captureError(error, ErrorType.NETWORK, {
        method: "check_updates",
      })

      // En caso de error, devolver información guardada
      const savedInfo = this.getSavedVersionInfo()

      return {
        hasUpdate: savedInfo ? this.hasUpdate(savedInfo) : false,
        forceUpdate: savedInfo ? savedInfo.forceUpdate : false,
        versionInfo: savedInfo,
      }
    }
  }

  /**
   * Abre la URL de actualización
   */
  openUpdateUrl(): Promise<boolean> {
    const versionInfo = this.getSavedVersionInfo()

    if (!versionInfo || !versionInfo.updateUrl) {
      return Promise.resolve(false)
    }

    return Linking.canOpenURL(versionInfo.updateUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(versionInfo.updateUrl)
        } else {
          console.warn(`No se puede abrir la URL: ${versionInfo.updateUrl}`)
          return false
        }
      })
      .then(() => true)
      .catch((error) => {
        errorService.captureError(error, ErrorType.UNKNOWN, {
          method: "open_update_url",
        })
        return false
      })
  }

  /**
   * Obtiene la información de versión guardada
   */
  private getSavedVersionInfo(): VersionInfo | null {
    const info = mmkvStorage.getString(this.versionInfoKey)
    return info ? JSON.parse(info) : null
  }

  /**
   * Guarda la información de versión
   */
  private saveVersionInfo(info: VersionInfo): void {
    mmkvStorage.set(this.versionInfoKey, JSON.stringify(info))
  }

  /**
   * Verifica si hay una actualización disponible
   */
  private hasUpdate(versionInfo: VersionInfo): boolean {
    // Obtener versión actual de la aplicación
    const currentVersion = this.getCurrentAppVersion()

    // Comparar con la última versión disponible
    return this.compareVersions(currentVersion, versionInfo.latestVersion) < 0
  }

  /**
   * Obtiene la versión actual de la aplicación
   */
  private getCurrentAppVersion(): string {
    // En una aplicación real, esto vendría de un archivo de configuración o de las constantes de la aplicación
    return "1.0.0" // Versión de ejemplo
  }

  /**
   * Compara dos versiones semánticas
   * @returns -1 si v1 < v2, 0 si v1 = v2, 1 si v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split(".").map(Number)
    const parts2 = v2.split(".").map(Number)

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = i < parts1.length ? parts1[i] : 0
      const part2 = i < parts2.length ? parts2[i] : 0

      if (part1 < part2) return -1
      if (part1 > part2) return 1
    }

    return 0
  }

  /**
   * Obtiene información de versión del servidor
   */
  private async fetchVersionInfo(): Promise<VersionInfo> {
    // En una aplicación real, esto haría una petición a un servidor
    // Por ahora, devolvemos datos de ejemplo
    return {
      version: "1.0.0",
      buildNumber: "1",
      minRequiredVersion: "0.9.0",
      latestVersion: "1.1.0",
      updateUrl:
        Platform.OS === "ios"
          ? "https://apps.apple.com/app/vokaflow/id123456789"
          : "https://play.google.com/store/apps/details?id=com.vokaflow.app",
      releaseNotes: "Nuevas características y corrección de errores",
      forceUpdate: false,
    }
  }
}

export const updatesService = new UpdatesService()
