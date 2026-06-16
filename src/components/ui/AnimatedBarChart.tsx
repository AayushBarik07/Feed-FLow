import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

interface AnimatedBarChartProps {
  data: number[];
  labels: string[];
  color: string;
  height?: number;
  textColor?: string;
  gridColor?: string;
}

export default function AnimatedBarChart({ 
  data, 
  labels, 
  color, 
  height = 200,
  textColor = '#9CA3AF',
  gridColor = '#374151'
}: AnimatedBarChartProps) {
  const animatedValues = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = data.map((_, index) => {
      return Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 800,
        delay: index * 100, // Staggered animation
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // Height animation doesn't support native driver
      });
    });

    Animated.stagger(100, animations).start();
  }, [data]);

  // Max value to scale bars relative to 100%
  const maxValue = 100;

  return (
    <View style={{ height, flexDirection: 'row', paddingTop: 20 }}>
      {/* Y-Axis Labels & Grid Lines */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 30, justifyContent: 'space-between' }}>
        {[100, 75, 50, 25, 0].map((val, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <Text style={{ color: textColor, fontSize: 10, width: 35, fontFamily: 'Inter_500Medium' }}>{val}%</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: gridColor, opacity: 0.3 }} />
          </View>
        ))}
      </View>

      {/* Bars Container */}
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: 30, paddingLeft: 35 }}>
        {data.map((value, index) => {
          // Scale to max height
          const heightInterpolation = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', `${(value / maxValue) * 100}%`],
          });

          return (
            <View key={index} style={{ alignItems: 'center', width: '15%' }}>
              <View style={{ height: '100%', width: '100%', justifyContent: 'flex-end', paddingHorizontal: '10%' }}>
                <Animated.View
                  style={{
                    width: '100%',
                    height: heightInterpolation,
                    backgroundColor: color,
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                  }}
                />
              </View>
              {/* X-Axis Label */}
              <Text 
                style={{ 
                  color: textColor, 
                  fontSize: 11, 
                  marginTop: 10, 
                  fontFamily: 'Inter_500Medium',
                  position: 'absolute',
                  bottom: -25
                }}
              >
                {labels[index]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
