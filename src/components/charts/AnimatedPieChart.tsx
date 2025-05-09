"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from "react-native"
import { useAccessibility } from "../../hooks/useAccessibility"
import { useTheme } from "../../hooks/useTheme"
import Svg, { G, Path, Text as SvgText } from "react-native-svg"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface PieChartData {
  value: number
  label: string
  color?: string
}

interface AnimatedPieChartProps {
  data: PieChartData[]
  height?: number
  width?: number
  title?: string
  radius?: number
  innerRadius?: number
  showLabels?: boolean
  showValues?: boolean
  showLegend?: boolean
  animationDuration?: number
  onSlicePress?: (item: PieChartData, index: number) => void
}

export const AnimatedPieChart: React.FC<AnimatedPieChartProps> = ({
  data,
  height = 250,
  width = SCREEN_WIDTH - 40,
  title,
  radius = 80,
  innerRadius = 0, // 0 para gráfico circular completo, > 0 para donut
  showLabels = true,
  showValues = true,
  showLegend = true,
  animationDuration = 1000,
  onSlicePress,
}) => {
  const { colors } = useTheme()
  const { areAnimationsEnabled, getAnimationDuration } = useAccessibility()
  const [total, setTotal] = useState(0)
  const [chartReady, setChartReady] = useState(false)
  const rotationAnimation = useRef(new Animated.Value(0)).current
  const scaleAnimation = useRef(new Animated.Value(0)).current
  const opacityAnimation = useRef(new Animated.Value(0)).current
  const sliceAnimations = useRef<Animated.Value[]>([]).current

  // Calcular el total
  useEffect(() => {
    if (data.length === 0) return

    const sum = data.reduce((acc, item) => acc + item.value, 0)
    setTotal(sum)

    // Inicializar animaciones para cada slice
    sliceAnimations.length = 0
    data.forEach(() => {
      sliceAnimations.push(new Animated.Value(0))
    })

    setChartReady(true)
  }, [data])

  // Animar el gráfico cuando el componente se monta o los datos cambian
  useEffect(() => {
    if (!chartReady) return

    // Resetear animaciones
    rotationAnimation.setValue(0)
    scaleAnimation.setValue(0)
    opacityAnimation.setValue(0)
    sliceAnimations.forEach((anim) => anim.setValue(0))

    // Si las animaciones están desactivadas, establecer directamente los valores finales
    if (!areAnimationsEnabled()) {
      rotationAnimation.setValue(1)
      scaleAnimation.setValue(1)
      opacityAnimation.setValue(1)
      sliceAnimations.forEach((anim) => anim.setValue(1))
      return
    }

    const duration = getAnimationDuration(animationDuration)

    // Animar la entrada del gráfico
    Animated.parallel([
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: duration * 0.5,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: duration * 0.3,
        useNativeDriver: true,
      }),
      Animated.timing(rotationAnimation, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }),
    ]).start()

    // Animar cada slice secuencialmente
    const sliceAnimationDuration = duration / data.length
    sliceAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: sliceAnimationDuration,
        delay: index * (sliceAnimationDuration / 2),
        useNativeDriver: false, // No podemos usar native driver para animar paths SVG
        easing: Easing.out(Easing.cubic),
      }).start()
    })

    return () => {
      rotationAnimation.stopAnimation()
      scaleAnimation.stopAnimation()
      opacityAnimation.stopAnimation()
      sliceAnimations.forEach((anim) => anim.stopAnimation())
    }
  }, [chartReady, data, areAnimationsEnabled, getAnimationDuration, animationDuration])

  // Crear slices para el gráfico
  const createSlices = () => {
    if (data.length === 0 || total === 0) return []

    const centerX = width / 2
    const centerY = height / 2 - (showLegend ? 30 : 0)

    let startAngle = 0

    return data.map((item, index) => {
      const percentage = item.value / total
      const angle = percentage * 360
      const endAngle = startAngle + angle

      // Convertir ángulos a radianes
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      // Calcular puntos para el arco
      const x1 = centerX + radius * Math.cos(startRad)
      const y1 = centerY + radius * Math.sin(startRad)
      const x2 = centerX + radius * Math.cos(endRad)
      const y2 = centerY + radius * Math.sin(endRad)

      // Determinar si el arco es mayor que 180 grados
      const largeArcFlag = angle > 180 ? 1 : 0

      // Crear path para el slice
      let path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

      // Si hay un radio interno, crear un donut
      if (innerRadius > 0) {
        const innerX1 = centerX + innerRadius * Math.cos(startRad)
        const innerY1 = centerY + innerRadius * Math.sin(startRad)
        const innerX2 = centerX + innerRadius * Math.cos(endRad)
        const innerY2 = centerY + innerRadius * Math.sin(endRad)

        path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1} Z`
      }

      // Calcular posición para la etiqueta
      const labelAngle = startAngle + angle / 2
      const labelRad = (labelAngle * Math.PI) / 180
      const labelRadius = radius * 0.7
      const labelX = centerX + labelRadius * Math.cos(labelRad)
      const labelY = centerY + labelRadius * Math.sin(labelRad)

      // Calcular color
      const color = item.color || getColorForIndex(index)

      // Guardar ángulo de inicio para el siguiente slice
      startAngle = endAngle

      return {
        path,
        color,
        percentage,
        labelX,
        labelY,
        centerAngle: labelRad,
        item,
        index,
      }
    })
  }

  const slices = createSlices()

  // Función para obtener un color basado en el índice
  const getColorForIndex = (index: number) => {
    const baseColors = [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.error,
      "#9C27B0", // Púrpura
      "#3F51B5", // Índigo
      "#009688", // Verde azulado
      "#FF5722", // Naranja profundo
      "#607D8B", // Azul grisáceo
    ]

    return baseColors[index % baseColors.length]
  }

  const AnimatedG = Animated.createAnimatedComponent(G)
  const AnimatedPath = Animated.createAnimatedComponent(Path)

  if (!chartReady || data.length === 0) {
    return (
      <View style={[styles.container, { height, width, backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando gráfico...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { height, width, backgroundColor: colors.cardBackground }]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}

      <View style={styles.chartContainer}>
        <Svg width={width} height={height - (title ? 30 : 0) - (showLegend ? 80 : 0)}>
          <AnimatedG
            origin={`${width / 2}, ${height / 2 - (showLegend ? 30 : 0)}`}
            rotation={rotationAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ["0", "360"],
            })}
            scale={scaleAnimation}
            opacity={opacityAnimation}
          >
            {slices.map((slice, index) => (
              <G key={`slice-${index}`}>
                <AnimatedPath
                  d={sliceAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      `M ${width / 2} ${height / 2 - (showLegend ? 30 : 0)} L ${width / 2} ${
                        height / 2 - (showLegend ? 30 : 0)
                      } Z`,
                      slice.path,
                    ],
                  })}
                  fill={slice.color}
                  onPress={() => onSlicePress && onSlicePress(slice.item, slice.index)}
                />
                {showLabels && slice.percentage > 0.05 && (
                  <SvgText
                    x={slice.labelX}
                    y={slice.labelY}
                    fontSize={12}
                    fontWeight="bold"
                    fill="white"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {showValues ? `${Math.round(slice.percentage * 100)}%` : slice.item.label}
                  </SvgText>
                )}
              </G>
            ))}
          </AnimatedG>
        </Svg>

        {/* Leyenda */}
        {showLegend && (
          <View style={styles.legendContainer}>
            {data.map((item, index) => (
              <View key={`legend-${index}`} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color || getColorForIndex(index) }]} />
                <Text style={[styles.legendLabel, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                  {item.label}
                </Text>
                <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
                  {item.value} ({Math.round((item.value / total) * 100)}%)
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
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
  chartContainer: {
    alignItems: "center",
  },
  legendContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 12,
    marginRight: 4,
    maxWidth: 100,
  },
  legendValue: {
    fontSize: 12,
  },
})
