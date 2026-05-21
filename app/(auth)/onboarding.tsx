import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AnimatedGradient } from '../../components/AnimatedGradient';
import { GlassCard } from '../../components/GlassCard';
import { Check, Target, Brain, Briefcase, Code, MessageCircle, DollarSign, PenTool } from 'lucide-react-native';

const CATEGORIES = [
  { name: 'AI & Machine Learning', icon: Brain },
  { name: 'Software Coding', icon: Code },
  { name: 'Public Speaking', icon: MessageCircle },
  { name: 'Business Fundamentals', icon: Briefcase },
  { name: 'Personal Finance', icon: DollarSign },
  { name: 'Digital Design', icon: PenTool },
];

export default function Onboarding() {
  const { colors } = useTheme();
  const { completeOnboarding } = useAuth();
  const router = useRouter();

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  const toggleSelect = (name: string) => {
    if (selectedCats.includes(name)) {
      setSelectedCats(prev => prev.filter(x => x !== name));
    } else {
      setSelectedCats(prev => [...prev, name]);
    }
  };

  const handleFinish = async () => {
    await completeOnboarding(selectedCats);
    router.replace('/(auth)/login');
  };

  return (
    <AnimatedGradient>
      <View style={styles.container}>
        {/* Onboarding step indicator */}
        <View style={styles.header}>
          <View style={styles.stepTrack}>
            <View style={[styles.stepBar, { width: step === 0 ? '50%' : '100%', backgroundColor: colors.primary }]} />
          </View>
        </View>

        {step === 0 ? (
          <View style={styles.slide}>
            <View style={styles.iconCircle}>
              <Target size={44} color={colors.primary} />
            </View>
            <Text style={[styles.slideTitle, { color: colors.text }]}>
              Learn Anything in <Text style={{ color: colors.primary }}>Minutes</Text>
            </Text>
            <Text style={[styles.slideDesc, { color: colors.textMuted }]}>
              Master high-value concepts in 30 seconds to 5 minutes through swipeable feed reels, active micro-quizzes, and interactive modules.
            </Text>

            <TouchableOpacity
              onPress={() => setStep(1)}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.btnText}>Configure Neural Path</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.slide}>
            <Text style={[styles.slideTitle, { color: colors.text, marginBottom: 12 }]}>
              Select Your Interests
            </Text>
            <Text style={[styles.slideDesc, { color: colors.textMuted, marginBottom: 30 }]}>
              Our AI engine compiles customized feed lessons based on your cognitive selections.
            </Text>

            {/* Interest categories cards grid */}
            <View style={styles.grid}>
              {CATEGORIES.map(cat => {
                const isSelected = selectedCats.includes(cat.name);
                const Icon = cat.icon;

                return (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => toggleSelect(cat.name)}
                    activeOpacity={0.8}
                    style={styles.gridItem}
                  >
                    <GlassCard
                      intensity={25}
                      borderColor={isSelected ? colors.primary : 'rgba(255,255,255,0.06)'}
                      style={[
                        styles.catCard,
                        isSelected && { backgroundColor: 'rgba(0, 242, 254, 0.05)' }
                      ]}
                    >
                      <View style={styles.catRow}>
                        <View style={[styles.catIconWrapper, { backgroundColor: isSelected ? colors.primary : 'rgba(255,255,255,0.05)' }]}>
                          <Icon size={20} color={isSelected ? '#03001e' : colors.textMuted} />
                        </View>
                        <Text style={[styles.catText, { color: isSelected ? colors.text : colors.textMuted }]}>
                          {cat.name}
                        </Text>
                        {isSelected && (
                          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                            <Check size={12} color="#03001e" strokeWidth={3} />
                          </View>
                        )}
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleFinish}
              disabled={selectedCats.length === 0}
              style={[
                styles.actionBtn,
                { backgroundColor: colors.primary },
                selectedCats.length === 0 && { opacity: 0.5 }
              ]}
            >
              <Text style={styles.btnText}>Initialize Feed</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AnimatedGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 24,
    right: 24,
  },
  stepTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  stepBar: {
    height: '100%',
    borderRadius: 2,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
  },
  slideDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 44,
  },
  actionBtn: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  btnText: {
    color: '#03001e',
    fontSize: 16,
    fontWeight: '800',
  },
  grid: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  gridItem: {
    width: '100%',
  },
  catCard: {
    padding: 16,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  catText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
