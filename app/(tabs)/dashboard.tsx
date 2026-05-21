import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedGradient } from '../../components/AnimatedGradient';
import { Flame, Award, Zap, Clock, ShieldCheck, Star, Brain, ArrowUpRight, TrendingUp } from 'lucide-react-native';

const HEATMAP_DAYS = [
  [0, 1, 3, 0, 2, 4, 1], // Week 1
  [1, 0, 2, 5, 0, 3, 2], // Week 2
  [2, 3, 0, 1, 4, 2, 0], // Week 3
  [0, 1, 2, 3, 1, 0, 4], // Week 4
  [3, 4, 1, 2, 5, 2, 3], // Week 5 (Current)
];

const ACHIEVEMENTS = [
  { id: 'a_1', title: 'Prompt Architect', desc: 'Craft 5 AI Prompts', icon: Brain, color: '#00f2fe' },
  { id: 'a_2', title: 'Absolute Vocals', desc: 'Pass public speech quiz', icon: Zap, color: '#7f00ff' },
  { id: 'a_3', title: 'Perfect Streak', desc: 'Maintain 3 day log', icon: Flame, color: '#ff007f' },
];

export default function Dashboard() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const activeUser = user || {
    displayName: 'Aria',
    xp: 280,
    streak: 4,
    coins: 46,
    level: 1,
    isPremium: false
  };

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return 'rgba(255,255,255,0.03)';
    if (intensity === 1) return 'rgba(0, 242, 254, 0.15)';
    if (intensity === 2) return 'rgba(0, 242, 254, 0.35)';
    if (intensity === 3) return 'rgba(127, 0, 255, 0.45)';
    if (intensity === 4) return 'rgba(127, 0, 255, 0.7)';
    return colors.primary; // Maximum intensity
  };

  return (
    <AnimatedGradient>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Profile Card Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcome, { color: colors.textMuted }]}>COGNITIVE TERMINAL</Text>
            <Text style={[styles.name, { color: colors.text }]}>{activeUser.displayName.toUpperCase()}</Text>
          </View>
          
          <GlassCard style={styles.streakBadge} intensity={25} borderColor="rgba(255, 0, 127, 0.2)">
            <Flame size={16} color={colors.accent} fill={colors.accent} style={{ marginRight: 6 }} />
            <Text style={[styles.streakText, { color: colors.accent }]}>{activeUser.streak} D STREAK</Text>
          </GlassCard>
        </View>

        {/* Global Progress Dial Card */}
        <GlassCard style={styles.progressDialCard} intensity={25} glow>
          <View style={styles.dialRow}>
            <View style={styles.dialLeft}>
              <Text style={[styles.dialLevelLabel, { color: colors.primary }]}>SYSTEM LEVEL {activeUser.level}</Text>
              <Text style={[styles.dialXpLabel, { color: colors.text }]}>
                {activeUser.xp % 500} <Text style={{ color: colors.textMuted, fontSize: 13 }}>/ 500 XP</Text>
              </Text>
              
              <View style={styles.xpTrack}>
                <View style={[styles.xpBar, { width: `${((activeUser.xp % 500) / 500) * 100}%`, backgroundColor: colors.primary }]} />
              </View>
              
              <Text style={[styles.dialTip, { color: colors.textMuted }]}>
                Next level unlock: <Text style={{ color: colors.primary }}>React Native Web Structures</Text>
              </Text>
            </View>

            <View style={[styles.dialRingWrapper, { borderColor: 'rgba(255,255,255,0.05)' }]}>
              <ShieldCheck size={38} color={colors.primary} />
              <Text style={[styles.ringText, { color: colors.primary }]}>SECURE</Text>
            </View>
          </View>
        </GlassCard>

        {/* Cognitive Analytics Grid */}
        <View style={styles.analyticsGrid}>
          <GlassCard style={styles.gridBox} intensity={20}>
            <Clock size={20} color={colors.primary} style={styles.boxIcon} />
            <Text style={[styles.boxVal, { color: colors.text }]}>12m</Text>
            <Text style={[styles.boxLabel, { color: colors.textMuted }]}>LEARNING TIME</Text>
          </GlassCard>

          <GlassCard style={styles.gridBox} intensity={20}>
            <Zap size={20} color={colors.secondary} style={styles.boxIcon} />
            <Text style={[styles.boxVal, { color: colors.text }]}>{activeUser.coins}</Text>
            <Text style={[styles.boxLabel, { color: colors.textMuted }]}>MINTED COINS</Text>
          </GlassCard>
        </View>

        {/* Weekly Commit Log Heatmap */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>COGNITIVE INTEGRATION LOG (HEATMAP)</Text>
          </View>

          <GlassCard style={styles.heatmapCard} intensity={25}>
            <View style={styles.heatmapGrid}>
              {HEATMAP_DAYS.map((week, wIdx) => (
                <View key={wIdx} style={styles.heatmapCol}>
                  {week.map((day, dIdx) => (
                    <View
                      key={dIdx}
                      style={[
                        styles.heatmapCell,
                        { backgroundColor: getHeatmapColor(day) }
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
            <View style={styles.heatmapLabels}>
              <Text style={styles.heatLabel}>LOW INTENSITY</Text>
              <View style={styles.heatGradientSample}>
                <View style={[styles.sampleCell, { backgroundColor: getHeatmapColor(1) }]} />
                <View style={[styles.sampleCell, { backgroundColor: getHeatmapColor(3) }]} />
                <View style={[styles.sampleCell, { backgroundColor: getHeatmapColor(5) }]} />
              </View>
              <Text style={styles.heatLabel}>MAX CAPACITY</Text>
            </View>
          </GlassCard>
        </View>

        {/* Achievements Shelf */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={16} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>ACHIEVED COGNITIVE BADGES</Text>
          </View>

          <View style={styles.badgeCol}>
            {ACHIEVEMENTS.map(badge => {
              const BadgeIcon = badge.icon;

              return (
                <GlassCard key={badge.id} style={styles.badgeCard} intensity={15}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.badgeIconOuter, { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: badge.color }]}>
                      <BadgeIcon size={20} color={badge.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.badgeTitle, { color: colors.text }]}>{badge.title}</Text>
                      <Text style={[styles.badgeDesc, { color: colors.textMuted }]}>{badge.desc}</Text>
                    </View>
                    <Star size={16} color={colors.warning} fill={colors.warning} />
                  </View>
                </GlassCard>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </AnimatedGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcome: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  name: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,0,127,0.05)',
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressDialCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
  },
  dialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialLeft: {
    flex: 1,
    marginRight: 16,
  },
  dialLevelLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  dialXpLabel: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
    marginBottom: 10,
  },
  xpTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  xpBar: {
    height: '100%',
    borderRadius: 4,
  },
  dialTip: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  dialRingWrapper: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  ringText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  gridBox: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
  },
  boxIcon: {
    marginBottom: 12,
  },
  boxVal: {
    fontSize: 22,
    fontWeight: '900',
  },
  boxLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  section: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heatmapCard: {
    padding: 20,
    borderRadius: 20,
  },
  heatmapGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heatmapCol: {
    gap: 6,
  },
  heatmapCell: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  heatmapLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  heatLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heatGradientSample: {
    flexDirection: 'row',
    gap: 4,
  },
  sampleCell: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  badgeCol: {
    gap: 10,
  },
  badgeCard: {
    padding: 12,
    borderRadius: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeIconOuter: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  badgeDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  }
});
