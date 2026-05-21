import React from 'react';
import { StyleSheet, View, Text, Platform, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LearningProvider } from '../context/LearningContext';
import { BlurView } from 'expo-blur';
import { Smartphone, RefreshCw, Moon, Sun, ArrowLeft } from 'lucide-react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';

function RootLayoutContent() {
  const { user, loading, isOnboarded } = useAuth();
  const { colors, theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // --- EMBED GORGEOUS WEB PREVIEW SIMULATOR IF IN DESKTOP BROWSER ---
  const isWeb = Platform.OS === 'web';
  const [windowWidth, setWindowWidth] = React.useState(isWeb && typeof window !== 'undefined' ? window.innerWidth : 500);

  React.useEffect(() => {
    if (!isWeb) return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (loading) return;

    // Smart routing based on state
    if (!isOnboarded) {
      router.replace('/(auth)/onboarding');
    } else if (!user) {
      router.replace('/(auth)/login');
    } else if (pathname.includes('(auth)')) {
      router.replace('/(tabs)');
    }
  }, [user, loading, isOnboarded]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Initializing Intelligence System...</Text>
      </View>
    );
  }

  const showSimulatedFrame = isWeb && windowWidth > 768;

  if (showSimulatedFrame) {
    return (
      <View
        style={[
          styles.webDesktopBackground,
          Platform.OS === 'web' ? {
            width: '100vw',
            height: '100vh',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          } as any : {}
        ]}
      >
        {/* Neon Ambient Aurora Base behind the phone */}
        <View style={[styles.ambientGlowPink, Platform.OS === 'web' ? { filter: 'blur(120px)' } as any : {}]} />
        <View style={[styles.ambientGlowBlue, Platform.OS === 'web' ? { filter: 'blur(120px)' } as any : {}]} />

        {/* Sidebar Info Panel */}
        <View style={styles.leftDashboardPanel}>
          <Text style={styles.brandingHeader}>MICRO SKILL</Text>
          <Text style={styles.brandingTagline}>“Learn Anything in Minutes.”</Text>
          
          <View style={[styles.specCard, Platform.OS === 'web' ? { backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } as any : {}]}>
            <Text style={styles.specTitle}>System Specifications</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>AI Engine:</Text>
              <Text style={styles.specVal}>Gemini 1.5 Flash</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Architecture:</Text>
              <Text style={styles.specVal}>React Native Expo Router</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Style Standard:</Text>
              <Text style={styles.specVal}>Apple Glassmorphism</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Status:</Text>
              <Text style={styles.specValOnline}>Active Pipeline</Text>
            </View>
          </View>

          <View style={styles.featuresNotes}>
            <Text style={styles.notesHeader}>💡 Live Simulation Controls</Text>
            <Text style={styles.noteItem}>• Vertical swipe the Home Feed (Reels).</Text>
            <Text style={styles.noteItem}>• Chat with the streaming AI Copilot.</Text>
            <Text style={styles.noteItem}>• Practice with dynamic micro quizzes.</Text>
            <Text style={styles.noteItem}>• Track streaks & heatmaps on Dashboard.</Text>
            <Text style={styles.noteItem}>• Switch themes with the controls below.</Text>
          </View>

          {/* Quick controls */}
          <View style={styles.simulatorControlsRow}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.controlBtn, Platform.OS === 'web' ? { transition: 'all 0.2s' } as any : {}]}
            >
              {theme === 'dark' ? <Sun size={18} color="#fff" /> : <Moon size={18} color="#fff" />}
              <Text style={styles.controlBtnText}>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              style={[styles.controlBtn, Platform.OS === 'web' ? { transition: 'all 0.2s' } as any : {}]}
            >
              <RefreshCw size={16} color="#fff" />
              <Text style={styles.controlBtnText}>Reload App</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* iPhone 15 Pro Max Simulated Frame */}
        <View style={styles.phoneDeviceOuter}>
          <View style={styles.phoneDeviceBezel}>
            {/* Dynamic Island Screen Hole */}
            <View style={styles.dynamicIsland}>
              <View style={styles.dynamicIslandCamera} />
            </View>

            {/* App viewport wrapper */}
            <View style={styles.phoneScreenContent}>
              <ErrorBoundary>
                <Slot />
              </ErrorBoundary>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Fallback to normal layout for authentic mobile sizes / physical device
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ErrorBoundary>
        <Slot />
      </ErrorBoundary>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LearningProvider>
          <RootLayoutContent />
        </LearningProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  webDesktopBackground: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050314',
    overflow: 'hidden',
    position: 'relative',
  },
  ambientGlowPink: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: '#ec38bc',
    opacity: 0.1,
    top: '-10%',
    left: '10%',
  },
  ambientGlowBlue: {
    position: 'absolute',
    width: 700,
    height: 700,
    borderRadius: 350,
    backgroundColor: '#00f2fe',
    opacity: 0.1,
    bottom: '-15%',
    right: '10%',
  },
  leftDashboardPanel: {
    width: 360,
    marginRight: 80,
    padding: 32,
    zIndex: 10,
  },
  brandingHeader: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 242, 254, 0.4)',
    textShadowRadius: 8,
  },
  brandingTagline: {
    fontSize: 18,
    color: '#00f2fe',
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 36,
  },
  specCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  specTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  specLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  specVal: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  specValOnline: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowRadius: 4,
  },
  featuresNotes: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  notesHeader: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 10,
  },
  noteItem: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  simulatorControlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  controlBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  phoneDeviceOuter: {
    width: 412,
    height: 840,
    backgroundColor: '#1c1936',
    borderRadius: 56,
    borderWidth: 8,
    borderColor: '#2e2a4f',
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    zIndex: 10,
  },
  phoneDeviceBezel: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 44,
    borderWidth: 4,
    borderColor: '#0a0a0f',
    overflow: 'hidden',
    position: 'relative',
  },
  dynamicIsland: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    width: 110,
    height: 28,
    backgroundColor: '#000',
    borderRadius: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  dynamicIslandCamera: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0a0b2b',
    borderWidth: 1,
    borderColor: '#1f2042',
  },
  phoneScreenContent: {
    flex: 1,
    borderRadius: 36,
    overflow: 'hidden',
  }
});
