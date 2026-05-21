import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLearning } from '../../context/LearningContext';
import { SkillPath } from '../../services/types';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedGradient } from '../../components/AnimatedGradient';
import { Search, Mic, TrendingUp, Sparkles, BookOpen, ChevronRight, Trophy, Bookmark } from 'lucide-react-native';

const TRENDING_SKILLS = [
  { id: 't_1', title: 'GPT-4 Fine-Tuning basics', count: '4.8k learners', color: '#00f2fe' },
  { id: 't_2', title: 'Vocal projection mechanisms', count: '3.2k learners', color: '#7f00ff' },
  { id: 't_3', title: 'DeFi yield leverage structures', count: '2.1k learners', color: '#ff007f' },
];

export default function Discover() {
  const { colors } = useTheme();
  const { paths, setActivePath, activePath, savedLessonIds, lessons } = useLearning();
  const [searchVal, setSearchVal] = useState('');

  const savedLessons = lessons.filter(l => savedLessonIds.includes(l.id));

  const handleSelectPath = (path: SkillPath) => {
    if (activePath === path.id) {
      setActivePath(null);
    } else {
      setActivePath(path.id);
    }
  };

  return (
    <AnimatedGradient>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Search Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Discover Skills</Text>
          <Text style={[styles.subText, { color: colors.textMuted }]}>Unlock human potential in 30 seconds.</Text>
        </View>

        {/* Smart Inputs search */}
        <GlassCard style={styles.searchBar} intensity={25}>
          <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={searchVal}
            onChangeText={setSearchVal}
            placeholder="Search prompt templates, Excel formulas, codings..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
          <TouchableOpacity style={styles.micBtn}>
            <Mic size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </GlassCard>

        {/* Structured Path Journeys */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>ACTIVE LEARNING PATHS</Text>
          </View>

          <View style={styles.pathsCol}>
            {paths.map(path => {
              const isActive = activePath === path.id;

              return (
                <TouchableOpacity
                  key={path.id}
                  onPress={() => handleSelectPath(path)}
                  activeOpacity={0.8}
                >
                  <GlassCard
                    intensity={25}
                    borderColor={isActive ? path.color : 'rgba(255,255,255,0.06)'}
                    style={[
                      styles.pathCard,
                      isActive && { backgroundColor: 'rgba(255,255,255,0.02)' }
                    ]}
                  >
                    <View style={styles.pathHeader}>
                      <View style={[styles.pathIndicator, { backgroundColor: path.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.pathTitle, { color: colors.text }]}>{path.title}</Text>
                        <Text style={[styles.pathDesc, { color: colors.textMuted }]}>{path.description}</Text>
                      </View>
                    </View>

                    <View style={styles.pathFooter}>
                      <View style={styles.progressTrackWrapper}>
                        <View style={styles.progressLabelRow}>
                          <Text style={[styles.progressLabel, { color: colors.textMuted }]}>Path Progress</Text>
                          <Text style={[styles.progressVal, { color: colors.text }]}>{path.progress}%</Text>
                        </View>
                        <View style={styles.progressTrack}>
                          <View style={[styles.progressBar, { width: `${path.progress}%`, backgroundColor: path.color }]} />
                        </View>
                      </View>

                      <View style={styles.rewardBox}>
                        <Trophy size={14} color={path.color} style={{ marginRight: 4 }} />
                        <Text style={[styles.rewardText, { color: path.color }]}>+{path.xpReward} XP</Text>
                      </View>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bookmarked/Saved Lessons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bookmark size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>BOOKMARKED MICRO SKILLS</Text>
          </View>

          {savedLessons.length > 0 ? (
            <View style={styles.trendingList}>
              {savedLessons.map((lesson) => (
                <GlassCard key={lesson.id} style={styles.trendItem} intensity={15}>
                  <View style={styles.trendRow}>
                    <View style={[styles.numberBox, { borderColor: 'rgba(255,255,255,0.08)' }]}>
                      <Bookmark size={16} color={colors.primary} fill={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.trendTitle, { color: colors.text }]}>{lesson.title}</Text>
                      <Text style={[styles.trendCount, { color: colors.textMuted }]}>{lesson.category} • {lesson.duration}</Text>
                    </View>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>
                </GlassCard>
              ))}
            </View>
          ) : (
            <GlassCard style={styles.emptyCard} intensity={10}>
              <Bookmark size={20} color={colors.textMuted} style={{ marginBottom: 6, opacity: 0.5 }} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Your database is empty. Bookmark lessons in the feed to save them here.
              </Text>
            </GlassCard>
          )}
        </View>

        {/* Trending Column */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={16} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>TRENDING MICRO SKILLS</Text>
          </View>

          <View style={styles.trendingList}>
            {TRENDING_SKILLS.map((skill, index) => (
              <GlassCard key={skill.id} style={styles.trendItem} intensity={15}>
                <View style={styles.trendRow}>
                  <View style={[styles.numberBox, { borderColor: 'rgba(255,255,255,0.08)' }]}>
                    <Text style={[styles.numberLabel, { color: skill.color }]}>0{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.trendTitle, { color: colors.text }]}>{skill.title}</Text>
                    <Text style={[styles.trendCount, { color: colors.textMuted }]}>{skill.count}</Text>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </View>
              </GlassCard>
            ))}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 13,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  micBtn: {
    padding: 6,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  pathsCol: {
    gap: 12,
  },
  pathCard: {
    padding: 16,
  },
  pathHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pathIndicator: {
    width: 6,
    height: 48,
    borderRadius: 3,
  },
  pathTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  pathDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 15,
  },
  pathFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
  },
  progressTrackWrapper: {
    flex: 1,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressVal: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  rewardText: {
    fontSize: 10,
    fontWeight: '800',
  },
  trendingList: {
    gap: 10,
  },
  trendItem: {
    padding: 12,
    borderRadius: 18,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  trendTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  trendCount: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyCard: {
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: '80%',
    marginTop: 4,
  }
});
