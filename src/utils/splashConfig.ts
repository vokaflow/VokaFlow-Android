// Configuración para la pantalla de splash nativa
// Esta configuración se puede usar con react-native-splash-screen o similar
// para una integración más profunda con el sistema operativo

export const splashConfig = {
  // Colores
  backgroundColor: "#121212", // Debe coincidir con theme.colors.background
  primaryColor: "#FF00FF", // Debe coincidir con theme.colors.primary

  // Configuración del logo
  logoSize: {
    width: 200,
    height: 200,
  },

  // Textos
  appName: "VokaFlow",
  tagline: "Comunicación sin barreras",
  version: "1.0.0",

  // Tiempos
  minDisplayTime: 2500, // Tiempo mínimo de visualización en ms
  fadeOutDuration: 500, // Duración de la animación de salida en ms
}
