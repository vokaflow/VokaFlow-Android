"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from "react-native"
import { useAccessibility } from "../../hooks/useAccessibility"
import { useTheme } from "../../hooks/useTheme"
import Svg, { Path, Circle, Line, G, Text as SvgText } from "react-native-svg"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface DataPoint {
  value: number
  label: string
}

interface AnimatedLineChartProps {
  data: DataPoint[]
  height?: number
  width?: number
  title?: string
  color?: string
  backgroundColor?: string
  showDots?: boolean
  showLabels?: boolean
  showGrid?: boolean
  animationDuration?: number
  onPointPress?: (point: DataPoint, index: number) => void
}

export const AnimatedLineChart: React.FC<AnimatedLineChartProps> = ({
  data,
  height = 200,
  width = SCREEN_WIDTH - 40,
  title,
  color,
  backgroundColor,
  showDots = true,
  showLabels = true,
  showGrid = true,
  animationDuration = 1500,
  onPointPress,
}) => {
  const { colors } = useTheme()
  const { areAnimationsEnabled, getAnimationDuration } = useAccessibility()
  const [maxValue, setMaxValue] = useState(0)
  const [minValue, setMinValue] = useState(0)
  const pathAnimation = useRef(new Animated.Value(0)).current
  const opacityAnimation = useRef(new Animated.Value(0)).current
  const dotsAnimation = useRef(new Animated.Value(0)).current
  const [chartReady, setChartReady] = useState(false)

  const chartColor = color || colors.primary
  const chartBgColor = backgroundColor || colors.cardBackground

  // Calcular valores mínimos y máximos
  useEffect(() => {
    if (data.length === 0) return

    const values = data.map((item) => item.value)
    const max = Math.max(...values)
    const min = Math.min(...values)

    // Añadir un poco de espacio en la parte superior e inferior
    setMaxValue(max + (max - min) * 0.1)
    setMinValue(min > 0 ? min * 0.9 : min * 1.1)

    setChartReady(true)
  }, [data])

  // Animar el gráfico cuando el componente se monta o los datos cambian
  useEffect(() => {
    if (!chartReady) return

    // Resetear animaciones
    pathAnimation.setValue(0)
    opacityAnimation.setValue(0)
    dotsAnimation.setValue(0)

    // Si las animaciones están desactivadas, establecer directamente los valores finales
    if (!areAnimationsEnabled()) {
      pathAnimation.setValue(1)
      opacityAnimation.setValue(1)
      dotsAnimation.setValue(1)
      return
    }

    const duration = getAnimationDuration(animationDuration)

    // Animar la línea
    Animated.sequence([
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: duration * 0.3,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(pathAnimation, {
        toValue: 1,
        duration: duration * 0.5,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(dotsAnimation, {
        toValue: 1,
        duration: duration * 0.2,
        useNativeDriver: true,
        easing: Easing.elastic(1),
      }),
    ]).start()

    return () => {
      pathAnimation.stopAnimation()
      opacityAnimation.stopAnimation()
      dotsAnimation.stopAnimation()
    }
  }, [chartReady, data, areAnimationsEnabled, getAnimationDuration, animationDuration])

  // Preparar puntos para el gráfico
  const getPoints = () => {
    if (data.length === 0) return []

    const chartWidth = width - 60 // Espacio para ejes
    const chartHeight = height - 60 // Espacio para título y etiquetas
    const valueRange = maxValue - minValue

    return data.map((point, index) => {
      const x = 40 + (index / (data.length - 1)) * chartWidth
      const y = 20 + chartHeight - ((point.value - minValue) / valueRange) * chartHeight
      return { x, y, ...point }
    })
  }

  const points = getPoints()

  // Crear path para la línea
  const createPath = () => {
    if (points.length === 0) return ""

    return points.reduce((path, point, index) => {
      const command = index === 0 ? "M" : "L"
      return path + `${command}${point.x},${point.y} `
    }, "")
  }

  const linePath = createPath()

  // Crear path animado
  const AnimatedPath = Animated.createAnimatedComponent(Path)
  const AnimatedCircle = Animated.createAnimatedComponent(Circle)
  const AnimatedSvgText = Animated.createAnimatedComponent(SvgText)

  if (!chartReady || data.length === 0) {
    return (
      <View style={[styles.container, { height, width, backgroundColor: chartBgColor }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando gráfico...</Text>
      </View>
    )
  }

  // Crear líneas de cuadrícula
  const gridLines = () => {
    if (!showGrid) return null

    const chartHeight = height - 60
    const steps = 5
    const stepHeight = chartHeight / steps

    return Array.from({ length: steps + 1 }).map((_, i) => {
      const y = 20 + i * stepHeight
      return (
        <Line
          key={`grid-${i}`}
          x1={40}
          y1={y}
          x2={width - 20}
          y2={y}
          stroke={colors.border}
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />
      )
    })
  }

  // Crear etiquetas del eje Y
  const yAxisLabels = () => {
    const chartHeight = height - 60
    const steps = 5
    const stepHeight = chartHeight / steps
    const valueStep = (maxValue - minValue) / steps

    return Array.from({ length: steps + 1 }).map((_, i) => {
      const y = 20 + i * stepHeight
      const value = maxValue - i * valueStep
      return (
        <SvgText key={`y-label-${i}`} x={35} y={y + 4} fontSize={10} textAnchor="end" fill={colors.textSecondary}>
          {Math.round(value)}
        </SvgText>
      )
    })
  }

  // Crear etiquetas del eje X
  const xAxisLabels = () => {
    if (!showLabels) return null

    const chartWidth = width - 60
    const labelCount = Math.min(data.length, 5) // Limitar a 5 etiquetas para evitar solapamiento
    const step = Math.max(1, Math.floor(data.length / labelCount))

    return data
      .filter((_, i) => i % step === 0 || i === data.length - 1)
      .map((point, i) => {
        const index = data.indexOf(point)
        const x = 40 + (index / (data.length - 1)) * chartWidth
        return (
          <AnimatedSvgText
            key={`x-label-${i}`}
            x={x}
            y={height - 20}
            fontSize={10}
            textAnchor="middle"
            fill={colors.textSecondary}
            opacity={opacityAnimation}
          >
            {point.label}
          </AnimatedSvgText>
        )
      })
  }

  return (
    <View style={[styles.container, { height, width, backgroundColor: chartBgColor }]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}

      <Svg width={width} height={height - (title ? 30 : 0)}>
        {/* Cuadrícula */}
        {gridLines()}

        {/* Etiquetas del eje Y */}
        {yAxisLabels()}

        {/* Etiquetas del eje X */}
        {xAxisLabels()}

        {/* Línea animada */}
        <AnimatedPath
          d={linePath}
          stroke={chartColor}
          strokeWidth={2}
          fill="none"
          strokeDasharray={linePath.length}
          strokeDashoffset={pathAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [linePath.length, 0],
          })}
          opacity={opacityAnimation}
        />

        {/* Puntos */}
        {showDots &&
          points.map((point, index) => (
            <G key={`point-${index}`}>
              <AnimatedCircle
                cx={point.x}
                cy={point.y}
                r={6}
                fill={chartBgColor}
                stroke={chartColor}
                strokeWidth={2}
                opacity={dotsAnimation}
                scale={dotsAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                })}
              />
              {onPointPress && (
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={15}
                  fill="transparent"
                  onPress={() => onPointPress(point, index)}
                />
              )}
            </G>
          ))}
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    overflow: "hidden",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
  },
})
