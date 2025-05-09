import { createRef } from "react"
import { type NavigationContainerRef, StackActions } from "@react-navigation/native"

/**
 * Servicio para manejar la navegación de forma centralizada
 */
class NavigationService {
  navigationRef = createRef<NavigationContainerRef<any>>()
  routeNameRef = createRef<string>()

  /**
   * Navega a una pantalla específica
   */
  navigate(name: string, params?: object): void {
    if (this.navigationRef.current) {
      this.navigationRef.current.navigate(name, params)
    } else {
      console.warn("Navigation ref is not set")
    }
  }

  /**
   * Reemplaza la pantalla actual con otra
   */
  replace(name: string, params?: object): void {
    if (this.navigationRef.current) {
      this.navigationRef.current.dispatch(StackActions.replace(name, params))
    }
  }

  /**
   * Regresa a la pantalla anterior
   */
  goBack(): void {
    if (this.navigationRef.current && this.navigationRef.current.canGoBack()) {
      this.navigationRef.current.goBack()
    }
  }

  /**
   * Navega a la raíz de la pila de navegación
   */
  navigateToRoot(stackName: string): void {
    if (this.navigationRef.current) {
      this.navigationRef.current.navigate(stackName, { screen: "Home" })
    }
  }

  /**
   * Obtiene el nombre de la ruta actual
   */
  getCurrentRoute(): string | undefined {
    return this.routeNameRef.current
  }

  /**
   * Registra el cambio de ruta
   */
  onRouteChange(routeName: string | undefined): void {
    this.routeNameRef.current = routeName
  }

  /**
   * Reinicia la pila de navegación
   */
  reset(routes: { name: string; params?: object }[], index = 0): void {
    if (this.navigationRef.current) {
      this.navigationRef.current.reset({
        index,
        routes,
      })
    }
  }
}

export const navigationService = new NavigationService()
