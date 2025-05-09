"use client"

import type React from "react"
import { useRef, useState } from "react"
import {
  View,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
  type ScrollViewProps,
  type ViewStyle,
  type StyleProp,
} from "react-native"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

interface ParallaxLayer {
  component: React.ReactNode
  speed?: number
  style?: StyleProp<ViewStyle>
  staticPosition?: boolean
}

interface ParallaxScrollViewProps extends ScrollViewProps {
  layers: ParallaxLayer[]
  backgroundImage?: React.ReactNode
  backgroundSpeed?: number
  headerComponent?: React.ReactNode
  headerHeight?: number
  headerParallaxAmount?: number
  contentContainerStyle?: StyleProp<ViewStyle>
  onScroll?: (event: any) => void
}

export const ParallaxScrollView: React.FC<ParallaxScrollViewProps> = ({
  layers,
  backgroundImage,
  backgroundSpeed = 0.5,
  headerComponent,
  headerHeight = 200,
  headerParallaxAmount = 0.5,
  contentContainerStyle,
  children,
  onScroll,
  ...scrollViewProps
}) => {
  const scrollY = useRef(new Animated.Value(0)).current
  const [contentHeight, setContentHeight] = useState(0)

  // Calcular la altura total del contenido para asegurar que el parallax funcione correctamente
  const handleContentSizeChange = (width: number, height: number) => {
    setContentHeight(height)
    scrollViewProps.onContentSizeChange && scrollViewProps.onContentSizeChange(width, height)
  }

  // Manejar el evento de scroll
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (event) => {
      onScroll && onScroll(event)
    },
  })

  return (
    <View style={styles.container}>
      {/* Fondo con parallax */}
      {backgroundImage && (
        <Animated.View
          style={[
            styles.backgroundContainer,
            {
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [-SCREEN_HEIGHT, 0, contentHeight],
                    outputRange: [SCREEN_HEIGHT * backgroundSpeed, 0, -contentHeight * backgroundSpeed],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        >
          {backgroundImage}
        </Animated.View>
      )}

      {/* Capas de parallax estáticas (que no se desplazan con el contenido) */}
      {layers
        .filter((layer) => layer.staticPosition)
        .map((layer, index) => {
          const speed = layer.speed || 0.5
          return (
            <Animated.View
              key={`static-layer-${index}`}
              style={[
                styles.layerContainer,
                layer.style,
                {
                  transform: [
                    {
                      translateY: scrollY.interpolate({
                        inputRange: [-SCREEN_HEIGHT, 0, contentHeight],
                        outputRange: [SCREEN_HEIGHT * speed, 0, -contentHeight * speed],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                },
              ]}
            >
              {layer.component}
            </Animated.View>
          )
        })}

      <ScrollView
        {...scrollViewProps}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
      >
        {/* Header con parallax */}
        {headerComponent && (
          <Animated.View
            style={[
              styles.headerContainer,
              {
                height: headerHeight,
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [-headerHeight, 0, headerHeight],
                      outputRange: [-headerHeight * headerParallaxAmount, 0, headerHeight * headerParallaxAmount],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            {headerComponent}
          </Animated.View>
        )}

        {/* Capas de parallax que se desplazan con el contenido */}
        {layers
          .filter((layer) => !layer.staticPosition)
          .map((layer, index) => {
            const speed = layer.speed || 0.5
            return (
              <Animated.View
                key={`layer-${index}`}
                style={[
                  styles.layerContainer,
                  layer.style,
                  {
                    transform: [
                      {
                        translateY: scrollY.interpolate({
                          inputRange: [-SCREEN_HEIGHT, 0, contentHeight],
                          outputRange: [SCREEN_HEIGHT * speed, 0, -contentHeight * speed],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                  },
                ]}
              >
                {layer.component}
              </Animated.View>
            )
          })}

        {/* Contenido principal */}
        <View style={contentContainerStyle}>{children}</View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 2, // Más alto para permitir el efecto parallax
    overflow: "hidden",
  },
  headerContainer: {
    overflow: "hidden",
  },
  layerContainer: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: "hidden",
  },
})
