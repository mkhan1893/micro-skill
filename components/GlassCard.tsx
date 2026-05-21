import React from 'react';
import { StyleSheet, View, ViewProps, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  glow?: boolean;
  borderColor?: string;
  glowColor?: string;
  borderRadius?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 45,
  glow = false,
  borderColor,
  glowColor,
  borderRadius = 24,
  ...props
}) => {
  const { theme, colors } = useTheme();

  const dynamicStyles = {
    borderRadius,
    borderColor: borderColor || colors.cardBorder,
    backgroundColor: Platform.select({
      web: colors.cardBg, // Standard RGBA fallback with backdrop filter in CSS
      default: colors.cardBg
    }),
    shadowColor: glowColor || colors.primary,
    shadowOpacity: glow ? 0.15 : 0,
    shadowRadius: glow ? 16 : 0,
    shadowOffset: { width: 0, height: 4 },
  };

  // On native iOS and Android, utilize Expo BlurView for true hardware acceleration
  if (Platform.OS !== 'web') {
    return (
      <BlurView
        intensity={intensity}
        tint={theme === 'dark' ? 'dark' : 'light'}
        style={[styles.container, dynamicStyles, style]}
        {...props}
      >
        {children}
      </BlurView>
    );
  }

  // On Web, use standard CSS Backdrop Filter for premium blur
  return (
    <View
      style={[
        styles.container,
        dynamicStyles,
        Platform.OS === 'web' ? {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any : {},
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  }
});
export default GlassCard;
