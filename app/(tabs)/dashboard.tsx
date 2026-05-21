import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLearning } from '../../context/LearningContext';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedGradient } from '../../components/AnimatedGradient';
import { ProgressionEngine } from '../../services/progression';
import { Flame, Award, Zap, Clock, ShieldCheck, Star, Brain, ArrowUpRight, TrendingUp, Settings2, Check } from 'lucide-react-native';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=256&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
];

const BADGE_DETAILS: Record<string, { title: string; desc: string; icon: any; color: string }> = {
  Pioneer: { title: 'Neural Pioneer', desc: 'Welcome to the Micro Skill network', icon: Brain, color: '#00f2fe' },
  Scholar: { title: 'Cognitive Scholar', desc: 'Pass 1,500 total XP system threshold', icon: Award, color: '#7f00ff' },
  Grandmaster: { title: 'Grandmaster Architect', desc: 'Pass 5,000 total XP system threshold', icon: ShieldCheck, color: '#ff007f' },
  Consistent: { title: 'Consistent Learner', desc: 'Pass 3-day active streak threshold', icon: Flame, color: '#ff7700' },
  Unstoppable: { title: 'Unstoppable Momentum', desc: 'Pass 7-day active streak threshold', icon: Zap, color: '#10b981' },
  'First Step': { title: 'First Steps', desc: 'Initialize neural configurations', icon: Star, color: '#f59e0b' }
};

export default function Dashboard() {
  const { colors } = useTheme();
  const { user, updateProfileDetails } = useAuth();
  const { weeklyActivity, completedLessonIds } = useLearning();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editBio, setEditBio] = useState(user?.bio || 'Curious learner exploring new frontiers of knowledge.');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || DEFAULT_AVATARS[0]);
  const [saving, setSaving] = useState(false);

  const activeUser = user || {
    displayName: 'Pioneer',
    email: '',
    avatar: DEFAULT_AVATARS[0],
    xp: 0,
    streak: 1,
    coins: 10,
    level: 1,
    isPremium: false,
    isCreator: false,
    bio: 'Curious learner exploring new frontiers of knowledge.',
    badges: ['Pioneer'],
    achievements: ['First Step']
  };

  const xpStats = ProgressionEngine.getXpProgressForLevel(activeUser.xp);
  const learningTimeMin = completedLessonIds.length * 2; // Average of 2 minutes per micro-lesson

  // Calculate dynamic 5-week heatmap ended on today
  const constructHeatmap = () => {
    const daysGrid: number[][] = [];
    const today = new Date();
    
    // Create 5 columns (weeks)
    for (let w = 0; w < 5; w++) {
      const week: number[] = [];
      // Create 7 rows (days)
      for (let d = 0; d < 7; d++) {
        // Calculate offset back from today
        const offset = (4 - w) * 7 + (6 - d);
        const targetDate = new Date();
        targetDate.setDate(today.getDate() - offset);
        const dateStr = targetDate.toISOString().split('T')[0];
        
        const xpEarned = weeklyActivity[dateStr] || 0;
        let intensity = 0;
        if (xpEarned > 0) {
          if (xpEarned < 100) intensity = 1;
          else if (xpEarned < 200) intensity = 2;
          else if (xpEarned < 300) intensity = 3;
          else if (xpEarned < 400) intensity = 4;
          else intensity = 5;
        }
        week.push(intensity);
      }
      daysGrid.push(week);
    }
    return daysGrid;
  };

  const dynamicHeatmap = constructHeatmap();

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return 'rgba(255,255,255,0.03)';
    if (intensity === 1) return 'rgba(0, 242, 254, 0.15)';
    if (intensity === 2) return 'rgba(0, 242, 254, 0.35)';
    if (intensity === 3) return 'rgba(127, 0, 255, 0.45)';
    if (intensity === 4) return 'rgba(127, 0, 255, 0.7)';
    return colors.primary; // Max intensity
  };

  const handleOpenEdit = () => {
    setEditName(activeUser.displayName);
    setEditBio(activeUser.bio || 'Curious learner exploring new frontiers of knowledge.');
    setEditAvatar(activeUser.avatar);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateProfileDetails(editName.trim(), editBio.trim(), editAvatar);
      setIsEditing(false);
    } catch (e) {
      console.error('[Dashboard] Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatedGradient>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Profile Card Header */}
        <View style={styles.header}>
          <View style={styles.headerProfileRow}>
            <Image source={{ uri: activeUser.avatar }} style={styles.avatarImage} />
            <View>
              <Text style={[styles.welcome, { color: colors.textMuted }]}>COGNITIVE TERMINAL</Text>
              <Text style={[styles.name, { color: colors.text }]}>{activeUser.displayName.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleOpenEdit} style={styles.settingsBtn}>
              <Settings2 size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <GlassCard style={styles.streakBadge} intensity={25} borderColor="rgba(255, 0, 127, 0.2)">
              <Flame size={14} color={colors.accent} fill={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.streakText, { color: colors.accent }]}>{activeUser.streak} D STREAK</Text>
            </GlassCard>
          </View>
        </View>

        {/* Dynamic Glassmorphic Profile Settings Editor */}
        {isEditing && (
          <GlassCard style={styles.editCard} intensity={35} glow>
            <Text style={[styles.editTitle, { color: colors.text }]}>EDIT COGNITIVE TERMINAL</Text>
            
            {/* Avatar Select Carousel */}
            <View style={styles.editGroup}>
              <Text style={[styles.editLabel, { color: colors.textMuted }]}>SELECT AVATAR IDENTITY</Text>
              <View style={styles.avatarCarousel}>
                {DEFAULT_AVATARS.map((av, idx) => {
                  const isSelected = av === editAvatar;
                  return (
                    <TouchableOpacity key={idx} onPress={() => setEditAvatar(av)} style={styles.avatarSelBtn}>
                      <Image source={{ uri: av }} style={[styles.avatarSelImg, isSelected && { borderColor: colors.primary, borderWidth: 2 }]} />
                      {isSelected && (
                        <View style={[styles.avatarCheck, { backgroundColor: colors.primary }]}>
                          <Check size={10} color="#03001e" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.editGroup}>
              <Text style={[styles.editLabel, { color: colors.textMuted }]}>DISPLAY IDENTIFIER</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Aria"
                placeholderTextColor={colors.textMuted}
                style={[styles.editInput, { color: colors.text, borderColor: 'rgba(255,255,255,0.08)' }]}
              />
            </View>

            <View style={styles.editGroup}>
              <Text style={[styles.editLabel, { color: colors.textMuted }]}>COGNITIVE BIOGRAPHY</Text>
              <TextInput
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Write a brief bio..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                style={[styles.editInput, styles.editInputBio, { color: colors.text, borderColor: 'rgba(255,255,255,0.08)' }]}
              />
            </View>

            <View style={styles.editActionRow}>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.editBtnCancel, { borderColor: 'rgba(255,255,255,0.1)' }]}>
                <Text style={[styles.editBtnText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSaveProfile} disabled={saving} style={[styles.editBtnSave, { backgroundColor: colors.primary }]}>
                {saving ? (
                  <ActivityIndicator size="small" color="#03001e" />
                ) : (
                  <Text style={[styles.editBtnText, { color: '#03001e', fontWeight: '800' }]}>Save Settings</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}

        {/* User Bio View */}
        {activeUser.bio && !isEditing && (
          <GlassCard style={styles.bioCard} intensity={15}>
            <Text style={[styles.bioText, { color: colors.textMuted }]}>"{activeUser.bio}"</Text>
          </GlassCard>
        )}

        {/* Global Progress Dial Card */}
        <GlassCard style={styles.progressDialCard} intensity={25} glow>
          <View style={styles.dialRow}>
            <View style={styles.dialLeft}>
              <Text style={[styles.dialLevelLabel, { color: colors.primary }]}>SYSTEM LEVEL {activeUser.level}</Text>
              <Text style={[styles.dialXpLabel, { color: colors.text }]}>
                {xpStats.currentLevelXp} <Text style={{ color: colors.textMuted, fontSize: 13 }}>/ {xpStats.nextLevelXp} XP</Text>
              </Text>
              
              <View style={styles.xpTrack}>
                <View style={[styles.xpBar, { width: `${xpStats.percent}%`, backgroundColor: colors.primary }]} />
              </View>
              
              <Text style={[styles.dialTip, { color: colors.textMuted }]}>
                Next level unlock: <Text style={{ color: colors.primary }}>Custom AI Tutor Synthesizer</Text>
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
            <Text style={[styles.boxVal, { color: colors.text }]}>{learningTimeMin}m</Text>
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
              {dynamicHeatmap.map((week, wIdx) => (
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
            {activeUser.badges && activeUser.badges.length > 0 ? (
              activeUser.badges.map((badgeName, idx) => {
                const spec = BADGE_DETAILS[badgeName] || {
                  title: badgeName,
                  desc: 'Earned through skill optimization',
                  icon: Award,
                  color: '#00f2fe'
                };
                const BadgeIcon = spec.icon;

                return (
                  <GlassCard key={idx} style={styles.badgeCard} intensity={15}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badgeIconOuter, { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: spec.color }]}>
                        <BadgeIcon size={20} color={spec.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.badgeTitle, { color: colors.text }]}>{spec.title}</Text>
                        <Text style={[styles.badgeDesc, { color: colors.textMuted }]}>{spec.desc}</Text>
                      </View>
                      <Star size={16} color={colors.warning} fill={colors.warning} />
                    </View>
                  </GlassCard>
                );
              })
            ) : (
              <GlassCard style={styles.badgeCard} intensity={10}>
                <Text style={[styles.badgeDesc, { color: colors.textMuted, textAlign: 'center' }]}>No badges unlocked yet. Keep studying!</Text>
              </GlassCard>
            )}
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
    marginBottom: 16,
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
  },
  welcome: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,0,127,0.05)',
  },
  streakText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bioCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 18,
  },
  bioText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  editCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
  },
  editGroup: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  avatarCarousel: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarSelBtn: {
    position: 'relative',
  },
  avatarSelImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 16,
    fontSize: 13,
  },
  editInputBio: {
    height: 60,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  editBtnCancel: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnSave: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
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
