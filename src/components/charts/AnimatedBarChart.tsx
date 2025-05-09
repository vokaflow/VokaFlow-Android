"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from "react-native"
import { useAccessibility } from "../../hooks/useAccessibility"
import { useTheme } from "../../hooks/useTheme"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface BarData {
  value: number
  label: string
  color?: string
}

interface AnimatedBarChartProps {
  data: BarData[]
  height?: number
  width?: number
  title?: string
  maxValue?: number
  showValues?: boolean
  showLabels?: boolean
  barWidth?: number
  spacing?: number
  animationDuration?: number
  onPress?: (item: BarData, index: number) => void
}

export const AnimatedBarChart: React.FC<AnimatedBarChartProps> = ({
  data,
  height = 200,
  width = SCREEN_WIDTH - 40,
  title,
  maxValue: propMaxValue,
  showValues = true,
  showLabels = true,
  barWidth = 20,
  spacing = 10,
  animationDuration = 1000,
  onPress,
}) => {
  const { colors } = useTheme()
  const { areAnimationsEnabled, getAnimationDuration } = useAccessibility()
  const [maxValue, setMaxValue] = useState(0)
  const animatedValues = useRef<Animated.Value[]>([]).current
  const [chartReady, setChartReady] = useState(false)

  // Calcular el valor máximo si no se proporciona
  useEffect(() => {
    if (propMaxValue) {
      setMaxValue(propMaxValue)
    } else {
      const calculatedMax = Math.max(...data.map((item) => item.value))
      setMaxValue(calculatedMax > 0 ? calculatedMax : 100)
    }
  }, [data, propMaxValue])

  // Inicializar valores animados
  useEffect(() => {
    // Limpiar valores animados anteriores
    animatedValues.length = 0

    // Crear nuevos valores animados
    data.forEach(() => {
      animatedValues.push(new Animated.Value(0))
    })

    setChartReady(true)
  }, [data])

  // Animar las barras cuando el componente se monta o los datos cambian
  useEffect(() => {
    if (!chartReady) return

    const animations = animatedValues.map((value) => {
      return Animated.timing(value, {
        toValue: 1,
        duration: areAnimationsEnabled() ? getAnimationDuration(animationDuration) : 0,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    })

    // Si las animaciones están desactivadas, establecer directamente los valores finales
    if (!areAnimationsEnabled()) {
      animatedValues.forEach((value) => value.setValue(1))
      return
    }

    // Animar en secuencia o en paralelo según la complejidad
    const staggerDelay = 50
    Animated.stagger(staggerDelay, animations).start()

    return () => {
      animations.forEach((anim) => anim.stop())
    }
  }, [chartReady, data, areAnimationsEnabled, getAnimationDuration, animationDuration])

  if (!chartReady || maxValue === 0) {
    return (
      <View style={[styles.container, { height, width }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando gráfico...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { height, width, backgroundColor: colors.cardBackground }]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}

      <View style={styles.chartContainer}>
        {/* Eje Y (valores) */}
        <View style={styles.yAxis}>
          <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>{maxValue}</Text>
          <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>{Math.round(maxValue / 2)}</Text>
          <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>0</Text>
        </View>

        {/* Contenedor de barras */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const barColor = item.color || colors.primary
            const barHeight = (height - 60) * (item.value / maxValue)

            return (
              <View
                key={`bar-${index}`}
                style={[styles.barWrapper, { width: barWidth, marginHorizontal: spacing / 2 }]}
              >
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: barColor,
                      width: barWidth,
                      height: barHeight,
                      transform: [
                        {
                          scaleY: animatedValues[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                          }),
                        },
                      ],
                      opacity: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ]}
                />
                {showValues && (
                  <Animated.Text
                    style={[
                      styles.barValue,
                      { color: colors.text },
                      {
                        opacity: animatedValues[index].interpolate({
                          inputRange: [0, 0.7, 1],
                          outputRange: [0, 0, 1],
                        }),
                      },
                    ]}
                  >
                    {item.value}
                  </Animated.Text>
                )}
                {showLabels && (
                  <Text
                    style={[styles.barLabel, { color: colors.textSecondary }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.label}
                  </Text>
                )}
              </View>
            )
          })}
        </View>
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
    flex: 1,
    flexDirection: "row",
  },
  yAxis: {
    width: 30,
    height: "100%",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 5,
    paddingVertical: 10,
  },
  axisLabel: {
    fontSize: 10,
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: 20,
  },
  barWrapper: {
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 8,
    textAlign: "center",
    width: 50,
  },
})
