"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Easing, type ViewStyle, type TextStyle } from "react-native"
import { useAccessibility } from "../../hooks/useAccessibility"
import { useTheme } from "../../hooks/useTheme"
import Svg, { Circle, G, Text as SvgText } from "react-native-svg"

interface AnimatedProgressChartProps {
  progress: number // 0 a 1
  size?: number
  strokeWidth?: number
  title?: string
  subtitle?: string
  showPercentage?: boolean
  color?: string
  backgroundColor?: string
  animationDuration?: number
  style?: ViewStyle
  titleStyle?: TextStyle
  subtitleStyle?: TextStyle
}

export const AnimatedProgressChart: React.FC<AnimatedProgressChartProps> = ({
  progress,
  size = 150,
  strokeWidth = 10,
  title,
  subtitle,
  showPercentage = true,
  color,
  backgroundColor,
  animationDuration = 1000,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const { colors } = useTheme()
  const { areAnimationsEnabled, getAnimationDuration } = useAccessibility()
  const progressAnimation = useRef(new Animated.Value(0)).current
  const scaleAnimation = useRef(new Animated.Value(0.8)).current
  const opacityAnimation = useRef(new Animated.Value(0)).current

  const chartColor = color || colors.primary
  const chartBgColor = backgroundColor || colors.border

  // Calcular propiedades del círculo
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const center = size / 2

  // Animar el progreso cuando cambia
  useEffect(() => {
    // Resetear animaciones
    progressAnimation.setValue(0)
    scaleAnimation.setValue(0.8)
    opacityAnimation.setValue(0)

    // Si las animaciones están desactivadas, establecer directamente los valores finales
    if (!areAnimationsEnabled()) {
      progressAnimation.setValue(progress)
      scaleAnimation.setValue(1)
      opacityAnimation.setValue(1)
      return
    }

    const duration = getAnimationDuration(animationDuration)

    // Animar el progreso
    Animated.parallel([
      Animated.timing(progressAnimation, {
        toValue: progress,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // No podemos usar native driver para animar el strokeDashoffset
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: duration * 0.7,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: duration * 0.5,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start()

    return () => {
      progressAnimation.stopAnimation()
      scaleAnimation.stopAnimation()
      opacityAnimation.stopAnimation()
    }
  }, [progress, areAnimationsEnabled, getAnimationDuration, animationDuration])

  // Crear componentes animados
  const AnimatedCircle = Animated.createAnimatedComponent(Circle)
  const AnimatedG = Animated.createAnimatedComponent(G)

  // Calcular el valor del strokeDashoffset basado en el progreso
  const strokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  })

  // Calcular el porcentaje para mostrar
  const percentageText = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
    // Formatear como entero con %
    extrapolate: "clamp",
  })

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={[styles.title, { color: colors.text }, titleStyle]}>{title}</Text>}

      <Animated.View
        style={[
          styles.chartContainer,
          {
            opacity: opacityAnimation,
            transform: [{ scale: scaleAnimation }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Círculo de fondo */}
          <Circle cx={center} cy={center} r={radius} strokeWidth={strokeWidth} stroke={chartBgColor} fill="none" />

          {/* Círculo de progreso animado */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={chartColor}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            // Rotar para que el progreso comience desde arriba
            transform={`rotate(-90, ${center}, ${center})`}
          />

          {/* Texto de porcentaje */}
          {showPercentage && (
            <AnimatedG>
              <SvgText
                x={center}
                y={center}
                fontSize={size / 5}
                fontWeight="bold"
                fill={colors.text}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {Math.round(progress * 100)}%
              </SvgText>
            </AnimatedG>
          )}
        </Svg>
      </Animated.View>

      {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }, subtitleStyle]}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  chartContainer: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
})
