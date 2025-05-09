"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from "react-native"
import { useAccessibility } from "../../hooks/useAccessibility"
import { useTheme } from "../../hooks/useTheme"
import Svg, { Polygon, Circle, Line, G, Text as SvgText } from "react-native-svg"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface RadarData {
  label: string
  value: number
  maxValue?: number
}

interface AnimatedRadarChartProps {
  data: RadarData[]
  height?: number
  width?: number
  title?: string
  color?: string
  backgroundColor?: string
  showLabels?: boolean
  showAxis?: boolean
  showPoints?: boolean
  rings?: number
  animationDuration?: number
}

export const AnimatedRadarChart: React.FC<AnimatedRadarChartProps> = ({
  data,
  height = 300,
  width = SCREEN_WIDTH - 40,
  title,
  color,
  backgroundColor,
  showLabels = true,
  showAxis = true,
  showPoints = true,
  rings = 4,
  animationDuration = 1500,
}) => {
  const { colors } = useTheme()
  const { areAnimationsEnabled, getAnimationDuration } = useAccessibility()
  const [chartReady, setChartReady] = useState(false)
  const scaleAnimation = useRef(new Animated.Value(0)).current
  const rotateAnimation = useRef(new Animated.Value(0)).current
  const opacityAnimation = useRef(new Animated.Value(0)).current

  const chartColor = color || colors.primary
  const chartBgColor = backgroundColor || colors.cardBackground

  // Preparar el gráfico
  useEffect(() => {
    if (data.length < 3) return // Necesitamos al menos 3 puntos para un radar

    setChartReady(true)
  }, [data])

  // Animar el gráfico cuando el componente se monta o los datos cambian
  useEffect(() => {
    if (!chartReady) return

    // Resetear animaciones
    scaleAnimation.setValue(0)
    rotateAnimation.setValue(0)
    opacityAnimation.setValue(0)

    // Si las animaciones están desactivadas, establecer directamente los valores finales
    if (!areAnimationsEnabled()) {
      scaleAnimation.setValue(1)
      rotateAnimation.setValue(1)
      opacityAnimation.setValue(1)
      return
    }

    const duration = getAnimationDuration(animationDuration)

    // Animar el radar
    Animated.parallel([
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: duration * 0.3,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
        easing: Easing.out(Easing.elastic(1)),
      }),
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: duration * 1.2,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }),
    ]).start()

    return () => {
      scaleAnimation.stopAnimation()
      rotateAnimation.stopAnimation()
      opacityAnimation.stopAnimation()
    }
  }, [chartReady, data, areAnimationsEnabled, getAnimationDuration, animationDuration])

  // Calcular puntos para el radar
  const calculatePoints = () => {
    if (data.length < 3) return { points: [], axisPoints: [], rings: [] }

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) * 0.7

    // Calcular puntos para cada eje
    const axisPoints = data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      return { x, y, angle }
    })

    // Calcular puntos para el polígono de datos
    const points = data.map((item, i) => {
      const maxVal = item.maxValue || 100
      const value = Math.min(Math.max(0, item.value), maxVal)
      const percentage = value / maxVal
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2
      const x = centerX + radius * percentage * Math.cos(angle)
      const y = centerY + radius * percentage * Math.sin(angle)
      return { x, y, value, percentage, label: item.label }
    })

    // Calcular anillos concéntricos
    const ringPoints = Array.from({ length: rings }).map((_, i) => {
      const ringRadius = radius * ((i + 1) / rings)
      const ringPoints = data.map((_, j) => {
        const angle = (Math.PI * 2 * j) / data.length - Math.PI / 2
        const x = centerX + ringRadius * Math.cos(angle)
        const y = centerY + ringRadius * Math.sin(angle)
        return { x, y }
      })
      return ringPoints
    })

    return { points, axisPoints, rings: ringPoints, centerX, centerY, radius }
  }

  const { points, axisPoints, rings: chartRings, centerX, centerY, radius } = calculatePoints()

  // Crear componentes animados
  const AnimatedPolygon = Animated.createAnimatedComponent(Polygon)
  const AnimatedCircle = Animated.createAnimatedComponent(Circle)
  const AnimatedG = Animated.createAnimatedComponent(G)

  if (!chartReady || data.length < 3) {
    return (
      <View style={[styles.container, { height, width, backgroundColor: chartBgColor }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {data.length < 3 ? "Se necesitan al menos 3 puntos para el radar" : "Cargando gráfico..."}
        </Text>
      </View>
    )
  }

  // Crear string de puntos para el polígono
  const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ")

  return (
    <View style={[styles.container, { height, width, backgroundColor: chartBgColor }]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}

      <Svg width={width} height={height - (title ? 30 : 0)}>
        <AnimatedG
          opacity={opacityAnimation}
          origin={`${centerX}, ${centerY}`}
          rotation={rotateAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ["0", "360"],
          })}
        >
          {/* Anillos concéntricos */}
          {chartRings.map((ring, i) => (
            <Polygon
              key={`ring-${i}`}
              points={ring.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={colors.border}
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          ))}

          {/* Ejes */}
          {showAxis &&
            axisPoints.map((point, i) => (
              <Line
                key={`axis-${i}`}
                x1={centerX}
                y1={centerY}
                x2={point.x}
                y2={point.y}
                stroke={colors.border}
                strokeWidth={1}
                strokeOpacity={0.7}
              />
            ))}

          {/* Polígono de datos */}
          <AnimatedPolygon
            points={pointsString}
            fill={chartColor}
            fillOpacity={0.3}
            stroke={chartColor}
            strokeWidth={2}
            scale={scaleAnimation}
            origin={`${centerX}, ${centerY}`}
          />

          {/* Puntos de datos */}
          {showPoints &&
            points.map((point, i) => (
              <AnimatedCircle
                key={`point-${i}`}
                cx={point.x}
                cy={point.y}
                r={5}
                fill={chartColor}
                opacity={scaleAnimation}
                scale={scaleAnimation}
              />
            ))}

          {/* Etiquetas */}
          {showLabels &&
            axisPoints.map((point, i) => {
              // Calcular posición de la etiqueta fuera del radar
              const labelRadius = radius * 1.1
              const labelX = centerX + labelRadius * Math.cos(point.angle)
              const labelY = centerY + labelRadius * Math.sin(point.angle)

              // Ajustar alineación del texto según la posición
              let textAnchor = "middle"
              if (labelX < centerX - 10) textAnchor = "end"
              if (labelX > centerX + 10) textAnchor = "start"

              return (
                <SvgText
                  key={`label-${i}`}
                  x={labelX}
                  y={labelY}
                  fontSize={10}
                  fill={colors.text}
                  textAnchor={textAnchor}
                  alignmentBaseline="middle"
                >
                  {data[i].label}
                </SvgText>
              )
            })}
        </AnimatedG>
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
