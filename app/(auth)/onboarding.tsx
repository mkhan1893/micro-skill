import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AnimatedGradient } from '../../components/AnimatedGradient';
import { GlassCard } from '../../components/GlassCard';
import { Check, Target, Brain, Briefcase, Code, MessageCircle, DollarSign, PenTool, BarChart, Clock } from 'lucide-react-native';

const CATEGORIES = [
  { name: 'AI & Machine Learning', icon: Brain },
  { name: 'Software Coding', icon: Code },
  { name: 'Public Speaking', icon: MessageCircle },
  { name: 'Business Fundamentals', icon: Briefcase },
  { name: 'Personal Finance', icon: DollarSign },
  { name: 'Digital Design', icon: PenTool },
];

const SKILL_LEVELS = [
  { level: 'Beginner', desc: 'No prior background. Starting from fundamentals.', val: 'Beginner' },
  { level: 'Intermediate', desc: 'Some knowledge. Looking for fast optimization.', val: 'Intermediate' },
  { level: 'Advanced', desc: 'Experienced practitioner. Deep-dive mechanics.', val: 'Advanced' }
];

const DAILY_GOALS = [
  { label: '2 Minutes', desc: 'Quick Sprint - For ultra-busy schedules', val: 2 },
  { label: '5 Minutes', desc: 'Power Study - Compounded growth (Recommended)', val: 5 },
  { label: '10 Minutes', desc: 'Deep Immersion - Accelerated cognitive master', val: 10 }
];

export default function Onboarding() {
  const { colors } = useTheme();
  const { completeOnboarding } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [dailyGoal, setDailyGoal] = useState(5);

  const toggleSelectCat = (name: string) => {
    if (selectedCats.includes(name)) {
      setSelectedCats(prev => prev.filter(x => x !== name));
    } else {
      setSelectedCats(prev => [...prev, name]);
    }
  };

  const handleFinish = async () => {
    await completeOnboarding(selectedCats, skillLevel, dailyGoal);
    router.replace('/(auth)/login');
  };

  const getStepProgressWidth = () => {
    if (step === 0) return '25%';
    if (step === 1) return '50%';
    if (step === 2) return '75%';
    return '100%';
  };

  return (
    <AnimatedGradient>
      <View style={styles.container}>
        {/* Onboarding step progress indicator */}
        <View style={styles.header}>
          <View style={styles.stepTrack}>
            <View style={[styles.stepBar, { width: getStepProgressWidth(), backgroundColor: colors.primary }]} />
          </View>
        </View>

        {step === 0 && (
          <View style={styles.slide}>
            <View style={styles.iconCircle}>
              <Target size={44} color={colors.primary} />
            </View>
            <Text style={[styles.slideTitle, { color: colors.text }]}>
              Learn Anything in <Text style={{ color: colors.primary }}>Minutes</Text>
            </Text>
            <Text style={[styles.slideDesc, { color: colors.textMuted }]}>
              Master complex tech, speaking, design and finance in 30 seconds to 5 minutes through swipeable feeds, active micro-quizzes, and custom tutors.
            </Text>

            <TouchableOpacity
              onPress={() => setStep(1)}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.btnText}>Configure Neural Path</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.slide}>
            <Text style={[styles.slideTitle, { color: colors.text, marginBottom: 8 }]}>
              Select Your Interests
            </Text>
            <Text style={[styles.slideDesc, { color: colors.textMuted, marginBottom: 20 }]}>
              Our AI engine compiles custom micro lessons depending on your selections.
            </Text>

            <View style={styles.grid}>
              {CATEGORIES.map(cat => {
                const isSelected = selectedCats.includes(cat.name);
                const Icon = cat.icon;

                return (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => toggleSelectCat(cat.name)}
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
                          <Icon size={18} color={isSelected ? '#03001e' : colors.textMuted} />
                        </View>
                        <Text style={[styles.catText, { color: isSelected ? colors.text : colors.textMuted }]}>
                          {cat.name}
                        </Text>
                        {isSelected && (
                          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                            <Check size={10} color="#03001e" strokeWidth={3} />
                          </View>
                        )}
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setStep(2)}
              disabled={selectedCats.length === 0}
              style={[
                styles.actionBtn,
                { backgroundColor: colors.primary },
                selectedCats.length === 0 && { opacity: 0.5 }
              ]}
            >
              <Text style={styles.btnText}>Next: Skill Level</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.slide}>
            <Text style={[styles.slideTitle, { color: colors.text, marginBottom: 8 }]}>
              Define Your Skill Level
            </Text>
            <Text style={[styles.slideDesc, { color: colors.textMuted, marginBottom: 20 }]}>
              Customize the syntactic density and complexity of generated explanations.
            </Text>

            <View style={styles.grid}>
              {SKILL_LEVELS.map(lvl => {
                const isSelected = skillLevel === lvl.val;

                return (
                  <TouchableOpacity
                    key={lvl.level}
                    onPress={() => setSkillLevel(lvl.val)}
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
                          <BarChart size={18} color={isSelected ? '#03001e' : colors.textMuted} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.catText, { color: isSelected ? colors.text : colors.textMuted, marginBottom: 2 }]}>
                            {lvl.level}
                          </Text>
                          <Text style={{ fontSize: 11, color: colors.textMuted }}>{lvl.desc}</Text>
                        </View>
                        {isSelected && (
                          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                            <Check size={10} color="#03001e" strokeWidth={3} />
                          </View>
                        )}
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setStep(3)}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.btnText}>Next: Learning Goal</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.slide}>
            <Text style={[styles.slideTitle, { color: colors.text, marginBottom: 8 }]}>
              Daily Practice Goal
            </Text>
            <Text style={[styles.slideDesc, { color: colors.textMuted, marginBottom: 20 }]}>
              Streaks grow when you achieve your target daily learning commitments.
            </Text>

            <View style={styles.grid}>
              {DAILY_GOALS.map(goal => {
                const isSelected = dailyGoal === goal.val;

                return (
                  <TouchableOpacity
                    key={goal.val}
                    onPress={() => setDailyGoal(goal.val)}
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
                          <Clock size={18} color={isSelected ? '#03001e' : colors.textMuted} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.catText, { color: isSelected ? colors.text : colors.textMuted, marginBottom: 2 }]}>
                            {goal.label}
                          </Text>
                          <Text style={{ fontSize: 11, color: colors.textMuted }}>{goal.desc}</Text>
                        </View>
                        {isSelected && (
                          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                            <Check size={10} color="#03001e" strokeWidth={3} />
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
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.btnText}>Initialize Terminal Feed</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AnimatedGradient>
  );
}

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
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  slideDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
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
    fontSize: 15,
    fontWeight: '800',
  },
  grid: {
    width: '100%',
    gap: 10,
    marginBottom: 30,
  },
  gridItem: {
    width: '100%',
  },
  catCard: {
    padding: 14,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  catText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
