import React, { useEffect } from 'react';
import { StyleSheet, Animated, Easing, Platform, DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 12,
  style
}) => {
  const { colors } = useTheme();
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        })
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.45]
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.textMuted,
          opacity
        },
        style
      ]}
    />
  );
};

const styles = StyleSheet.create({
  shimmer: {
    overflow: 'hidden',
  }
});
export default SkeletonLoader;
