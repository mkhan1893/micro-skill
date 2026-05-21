import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Home, MessageSquare, Compass, BarChart2, ShieldAlert, Sparkles } from 'lucide-react-native';

export default function TabsLayout() {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: 'Feed', path: '/(tabs)', icon: Home },
    { name: 'AI Tutor', path: '/(tabs)/ai-tutor', icon: Sparkles, glow: true },
    { name: 'Discover', path: '/(tabs)/discover', icon: Compass },
    { name: 'Dashboard', path: '/(tabs)/dashboard', icon: BarChart2 },
    { name: 'Creator', path: '/(tabs)/creator', icon: ShieldAlert },
  ];

  return (
    <View style={styles.container}>
      {/* Active screen content render area */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Floating Translucent Glass Bottom Tab Bar */}
      <View
        style={[
          styles.tabBarWrapper,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
            // @ts-ignore
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }
        ]}
      >
        {tabs.map((tab) => {
          // Check if active path matches tab destination exactly
          const isActive =
            tab.path === '/(tabs)'
              ? pathname === '/(tabs)' || pathname === '/(tabs)/'
              : pathname.startsWith(tab.path);

          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.push(tab.path as any)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isActive && styles.activeIconBg,
                isActive && { shadowColor: colors.primary }
              ]}>
                <IconComponent
                  size={20}
                  color={isActive ? colors.primary : colors.textMuted}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.text : colors.textMuted,
                    fontWeight: isActive ? '700' : '500',
                  }
                ]}
              >
                {tab.name}
              </Text>

              {/* Accent dot indicator under active icon */}
              {isActive && (
                <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    paddingBottom: 90, // Avoid content clipping behind floating bar
  },
  tabBarWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 72,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    zIndex: 999,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    position: 'relative',
    paddingTop: 4,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeIconBg: {
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  }
});
