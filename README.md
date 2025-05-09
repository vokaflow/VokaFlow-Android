# VokaFlow Android

<p align="center">
  <img src="assets/logo_vokaflow.png" alt="VokaFlow Logo" width="200"/>
</p>

<p align="center">
  <a href="#características">Características</a> •
  <a href="#arquitectura">Arquitectura</a> •
  <a href="#instalación">Instalación</a> •
  <a href="#configuración">Configuración</a> •
  <a href="#seguridad">Seguridad</a> •
  <a href="#rendimiento">Rendimiento</a> •
  <a href="#contribución">Contribución</a> •
  <a href="#licencia">Licencia</a>
</p>

## Descripción

VokaFlow es una aplicación de comunicación en tiempo real para Android que ofrece una experiencia fluida y optimizada. Diseñada con un enfoque en rendimiento, seguridad y accesibilidad, VokaFlow permite a los usuarios comunicarse de manera eficiente mientras disfrutan de una interfaz intuitiva y atractiva.

## Características

### Autenticación y Perfiles
- **Múltiples métodos de autenticación**: Soporte para Google Sign-In y Apple ID
- **Sistema de perfiles**: Permite a los usuarios crear y gestionar múltiples perfiles
- **Seguridad avanzada**: Tokens seguros, renovación automática y detección de sesiones comprometidas

### Interfaz de Usuario
- **Diseño adaptativo**: Optimizado para diferentes tamaños de pantalla y orientaciones
- **Animaciones fluidas**: Transiciones suaves con optimización para dispositivos de gama baja
- **Modo oscuro**: Soporte completo para tema claro y oscuro
- **Splash screen animado**: Experiencia de inicio atractiva con efectos de partículas

### Accesibilidad
- **Compatibilidad con lectores de pantalla**: Etiquetas semánticas para todos los elementos interactivos
- **Ajustes de tamaño de texto**: Soporte para diferentes tamaños de fuente
- **Contraste mejorado**: Opciones para usuarios con dificultades visuales
- **Reducción de animaciones**: Opción para usuarios sensibles al movimiento

### Recompensas y Gamificación
- **Misiones diarias**: Sistema de tareas para mantener a los usuarios comprometidos
- **Recompensas especiales**: Incentivos por logros específicos
- **Sistema de progreso**: Seguimiento visual del avance del usuario

### Soporte y Ayuda
- **Chatbot integrado**: Asistencia automatizada para consultas comunes
- **FAQ dinámico**: Base de conocimiento actualizable
- **Categorías de ayuda**: Organización intuitiva de temas de soporte

### Rendimiento y Optimización
- **Carga diferida**: Optimización de recursos según necesidad
- **Caché inteligente**: Almacenamiento eficiente de datos frecuentes
- **Gestión de memoria**: Liberación proactiva de recursos no utilizados
- **Modo offline**: Funcionalidad básica sin conexión a internet

## Arquitectura

VokaFlow sigue una arquitectura MVVM (Model-View-ViewModel) con Clean Architecture para garantizar la separación de responsabilidades y facilitar el mantenimiento y las pruebas.

### Estructura del Proyecto

\`\`\`
src/
├── components/       # Componentes reutilizables de UI
├── contexts/         # Contextos de React para estado global
├── hooks/            # Hooks personalizados
├── navigation/       # Configuración de navegación
├── screens/          # Pantallas de la aplicación
├── services/         # Servicios y lógica de negocio
│   ├── auth/         # Autenticación (Google, Apple)
│   ├── database/     # Modelos y esquemas
│   ├── security/     # Servicios de seguridad
│   └── ...
├── store/            # Estado global (Redux)
└── utils/            # Utilidades y helpers
\`\`\`

### Patrones Implementados

- **Repository Pattern**: Para acceso a datos
- **Factory Pattern**: Para creación de objetos complejos
- **Observer Pattern**: Para reactividad y eventos
- **Strategy Pattern**: Para comportamientos intercambiables
- **Singleton Pattern**: Para servicios globales

## Instalación

### Requisitos Previos

- Android Studio Arctic Fox (2020.3.1) o superior
- JDK 11 o superior
- Android SDK 30 (Android 11) o superior
- Gradle 7.0.2 o superior

### Pasos de Instalación

1. Clona el repositorio:
   \`\`\`bash
   git clone https://github.com/vokaflow/VokaFlow-Android.git
   \`\`\`

2. Abre el proyecto en Android Studio:
   \`\`\`bash
   cd VokaFlow-Android
   \`\`\`

3. Sincroniza el proyecto con Gradle:
   \`\`\`bash
   ./gradlew build
   \`\`\`

4. Ejecuta la aplicación en un emulador o dispositivo:
   \`\`\`bash
   ./gradlew installDebug
   \`\`\`

## Configuración

### Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Añade una aplicación Android con el paquete `com.vokaflow.app`
3. Descarga el archivo `google-services.json` y colócalo en la carpeta `app/`
4. Habilita Authentication, Firestore y Storage en la consola de Firebase

### Configuración de Autenticación

#### Google Sign-In

1. Configura OAuth 2.0 en [Google Cloud Console](https://console.cloud.google.com/)
2. Añade el SHA-1 de tu proyecto a Firebase
3. Actualiza el archivo `src/services/auth/googleAuth.ts` con tu Web Client ID

#### Apple ID

1. Configura Sign in with Apple en [Apple Developer Portal](https://developer.apple.com/)
2. Genera los certificados necesarios
3. Actualiza el archivo `src/services/auth/appleAuth.ts` con tu Service ID

## Seguridad

VokaFlow implementa múltiples capas de seguridad:

- **Almacenamiento seguro**: Uso de EncryptedSharedPreferences para datos sensibles
- **Validación de entradas**: Sanitización de todas las entradas de usuario
- **Protección contra MITM**: Certificado SSL pinning
- **Detección de root/jailbreak**: Verificación de integridad del dispositivo
- **Protección contra inyección**: Parámetros parametrizados para consultas
- **Tokens JWT**: Autenticación basada en tokens con expiración
- **Renovación segura**: Mecanismo de refresh token para sesiones prolongadas

## Rendimiento

VokaFlow está optimizado para ofrecer un rendimiento excepcional:

- **Tiempo de inicio < 2s**: Optimización de la carga inicial
- **Consumo de memoria < 100MB**: Gestión eficiente de recursos
- **Tamaño de APK < 15MB**: Optimización de assets y código
- **Animaciones a 60fps**: Experiencia visual fluida
- **Carga diferida**: Los recursos pesados se cargan según necesidad
- **Caché adaptativa**: Almacenamiento inteligente basado en patrones de uso

## Contribución

¡Agradecemos las contribuciones a VokaFlow! Para contribuir:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Guía de Estilo

- Seguimos las [convenciones de código de Kotlin](https://kotlinlang.org/docs/coding-conventions.html)
- Usamos [ktlint](https://ktlint.github.io/) para formateo de código
- Documentamos todas las clases y métodos públicos
- Escribimos tests unitarios para la lógica de negocio

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Equipo VokaFlow - info@vokaflow.com

Sitio web: [https://vokaflow.com](https://vokaflow.com)

---

<p align="center">
  Desarrollado con ❤️ por el equipo VokaFlow
</p>
