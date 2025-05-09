import { Easing, Dimensions } from "react-native"
import type { StackCardStyleInterpolator } from "@react-navigation/stack"

const { width, height } = Dimensions.get("window")

// Configuración de tiempos para las transiciones
export const transitionConfig = {
  duration: 350,
  easing: Easing.out(Easing.poly(4)),
}

// Transición de deslizamiento horizontal (por defecto)
export const horizontalSlide: StackCardStyleInterpolator = ({ current, next, layouts }) => {
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.width, 0],
  })

  const nextTranslateX = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -layouts.screen.width / 4],
      })
    : 0

  const opacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  })

  const nextOpacity = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.8],
      })
    : 1

  const scale = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  })

  const nextScale = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.95],
      })
    : 1

  return {
    cardStyle: {
      transform: [{ translateX }, { scale }],
      opacity,
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
    containerStyle: {
      backgroundColor: "transparent",
    },
    nextCardStyle: next
      ? {
          transform: [{ translateX: nextTranslateX }, { scale: nextScale }],
          opacity: nextOpacity,
        }
      : undefined,
  }
}

// Transición de deslizamiento vertical
export const verticalSlide: StackCardStyleInterpolator = ({ current, next, layouts }) => {
  const translateY = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.height, 0],
  })

  const nextTranslateY = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -layouts.screen.height / 8],
      })
    : 0

  const opacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  })

  const nextOpacity = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.8],
      })
    : 1

  return {
    cardStyle: {
      transform: [{ translateY }],
      opacity,
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
    containerStyle: {
      backgroundColor: "transparent",
    },
    nextCardStyle: next
      ? {
          transform: [{ translateY: nextTranslateY }],
          opacity: nextOpacity,
        }
      : undefined,
  }
}

// Transición de desvanecimiento
export const fade: StackCardStyleInterpolator = ({ current, next }) => {
  const opacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  const scale = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  })

  const nextOpacity = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.8],
      })
    : 1

  return {
    cardStyle: {
      opacity,
      transform: [{ scale }],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
    containerStyle: {
      backgroundColor: "transparent",
    },
    nextCardStyle: next
      ? {
          opacity: nextOpacity,
        }
      : undefined,
  }
}

// Transición de modal (desde abajo)
export const modalSlide: StackCardStyleInterpolator = ({ current, layouts }) => {
  const translateY = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.height, 0],
  })

  return {
    cardStyle: {
      transform: [{ translateY }],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
    containerStyle: {
      backgroundColor: "transparent",
    },
  }
}

// Transición de zoom
export const zoom: StackCardStyleInterpolator = ({ current, next }) => {
  const scale = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  })

  const opacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  })

  const nextScale = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.1],
      })
    : 1

  const nextOpacity = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      })
    : 1

  return {
    cardStyle: {
      transform: [{ scale }],
      opacity,
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
    containerStyle: {
      backgroundColor: "transparent",
    },
    nextCardStyle: next
      ? {
          transform: [{ scale: nextScale }],
          opacity: nextOpacity,
        }
      : undefined,
  }
}

// Transición de flip (volteo)
export const flip: StackCardStyleInterpolator = ({ current, next, layouts }) => {
  const rotateY = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["90deg", "0deg"],
  })

  const opacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  })

  const nextRotateY = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "-90deg"],
      })
    : "0deg"

  const nextOpacity = next
    ? next.progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0.5, 0],
      })
    : 1

  return {
    cardStyle: {
      opacity,
      transform: [
        { perspective: 1000 },
        { rotateY },
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width / 2, 0],
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
    containerStyle: {
      backgroundColor: "transparent",
    },
    nextCardStyle: next
      ? {
          opacity: nextOpacity,
          transform: [{ perspective: 1000 }, { rotateY: nextRotateY }],
        }
      : undefined,
  }
}

// Mapa de transiciones para diferentes rutas
export const screenTransitions = {
  // Transiciones específicas para ciertas pantallas
  Login: fade,
  Main: zoom,
  Chat: horizontalSlide,
  SecureChat: horizontalSlide,
  ARTranslate: zoom,
  DailyMissions: verticalSlide,
  SpecialRewards: horizontalSlide,
  RewardDetails: zoom,
  Chatbot: modalSlide,
  ProfileManagement: horizontalSlide,
  // Transición por defecto
  default: horizontalSlide,
}

// Función para obtener la transición adecuada según la ruta
export const getTransitionForRoute = (routeName: string): StackCardStyleInterpolator => {
  return screenTransitions[routeName] || screenTransitions.default
}
