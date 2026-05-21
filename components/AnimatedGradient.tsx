import React, { useEffect } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export const AnimatedGradient: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { colors, theme } = useTheme();
  
  // Use Animated API to animate floating aurora orbs in the background
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 10000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        })
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [pulseAnim]);

  const orb1Y = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 40]
  });

  const orb2X = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [120, -40]
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Immersive Deep Purple & Cyan Linear Gradient base */}
      <LinearGradient
        colors={
          theme === 'dark'
            ? [colors.auroraStart, '#0a0524', '#150630']
            : [colors.auroraStart, '#eef2ff', '#fae8ff']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Glowing Aurora Orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          {
            backgroundColor: theme === 'dark' ? colors.primary : 'rgba(0,242,254,0.3)',
            transform: [{ translateY: orb1Y }]
          },
          Platform.OS === 'web' ? { filter: 'blur(80px)' } as any : {}
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          {
            backgroundColor: theme === 'dark' ? colors.secondary : 'rgba(127,0,255,0.25)',
            transform: [{ translateX: orb2X }]
          },
          Platform.OS === 'web' ? { filter: 'blur(80px)' } as any : {}
        ]}
      />

      {/* Overlay to soften the blobs */}
      <View style={[
        styles.blurOverlay,
        {
          backgroundColor: theme === 'dark'
            ? 'rgba(3, 0, 30, 0.4)'
            : 'rgba(248, 250, 252, 0.2)'
        },
        Platform.OS === 'web' ? {
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
        } as any : {}
      ]} />

      {/* Children content (Screen view) */}
      <View style={StyleSheet.absoluteFill}>
        {children}
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.35,
  },
  orb1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -50,
    left: -50,
  },
  orb2: {
    width: width * 0.9,
    height: width * 0.9,
    bottom: -100,
    right: -80,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  }
});
export default AnimatedGradient;
