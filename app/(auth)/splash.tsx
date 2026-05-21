import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';

export default function SplashScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of high-fidelity animations
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: Platform.OS !== 'web'
        })
      ])
    ]);

    anim.start();

    return () => {
      anim.stop();
    };
  }, []);

  const handleNext = () => {
    router.push('/(auth)/onboarding');
  };

  const dynamicGlow = glowOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.4]
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Aurora Ambient Background */}
      <LinearGradient
        colors={['#03001e', '#120736', '#03001e']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View
        style={[
          styles.glowCircle,
          {
            backgroundColor: colors.primary,
            opacity: dynamicGlow,
          },
          Platform.OS === 'web' ? { filter: 'blur(100px)' } as any : {}
        ]}
      />

      <View style={styles.centerContainer}>
        {/* Animated Brand Emblem */}
        <Animated.View
          style={[
            styles.emblemWrapper,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
              borderColor: colors.primary,
              shadowColor: colors.primary,
            }
          ]}
        >
          <Sparkles size={48} color={colors.primary} strokeWidth={2} />
        </Animated.View>

        {/* Animated Brand Name */}
        <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
          <Text style={[styles.brandTitle, { color: colors.text }]}>
            MICRO <Text style={{ color: colors.primary }}>SKILL</Text>
          </Text>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            “Learn Anything in Minutes.”
          </Text>
        </Animated.View>
      </View>

      {/* Cinematic Proceed button */}
      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.btn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Enter the Future</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  emblemWrapper: {
    width: 100,
    height: 100,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 28,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
    letterSpacing: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    width: '80%',
    zIndex: 10,
  },
  btn: {
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  btnText: {
    color: '#03001e',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  }
});
