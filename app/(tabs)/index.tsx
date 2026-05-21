import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity, Image, Share, Platform, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLearning, MicroLesson } from '../../context/LearningContext';
import { GlassCard } from '../../components/GlassCard';
import { Heart, Bookmark, Share2, Volume2, Sparkles, MessageSquare, Check, X, ChevronRight, HelpCircle } from 'lucide-react-native';

export default function Feed() {
  const { colors } = useTheme();
  const { lessons, toggleSaveLesson, savedLessonIds, completeLesson } = useLearning();

  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [lessonId: string]: number }>({});
  const [showExplanation, setShowExplanation] = useState<{ [lessonId: string]: boolean }>({});
  const [isMuted, setIsMuted] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);

  // Likes tracker
  const [likesState, setLikesState] = useState<{ [id: string]: { count: number; active: boolean } }>({
    lesson_1: { count: 1243, active: false },
    lesson_2: { count: 852, active: false },
    lesson_3: { count: 2190, active: false }
  });

  const handleLike = (id: string) => {
    setLikesState(prev => {
      const current = prev[id] || { count: 100, active: false };
      return {
        ...prev,
        [id]: {
          count: current.active ? current.count - 1 : current.count + 1,
          active: !current.active
        }
      };
    });
  };

  const handleSelectAnswer = async (lesson: MicroLesson, optionIdx: number) => {
    if (selectedAnswers[lesson.id] !== undefined) return; // Answered already
    
    setSelectedAnswers(prev => ({ ...prev, [lesson.id]: optionIdx }));
    setShowExplanation(prev => ({ ...prev, [lesson.id]: true }));

    // Complete lesson and grant XP if answered correctly
    if (optionIdx === lesson.quiz.answerIndex) {
      await completeLesson(lesson.id);
    }
  };

  const handleShare = async (lesson: MicroLesson) => {
    try {
      await Share.share({
        message: `Check out this amazing micro skill: "${lesson.title}" on MICRO SKILL app!`,
      });
    } catch (err) {
      console.log('Sharing failed', err);
    }
  };

  const simulateSpeech = (lesson: MicroLesson) => {
    if (Platform.OS === 'web') {
      const synth = window.speechSynthesis;
      if (!synth) {
        alert("Speech engine unavailable.");
        return;
      }
      if (synth.speaking) {
        synth.cancel();
        return;
      }
      // Read the markdown content in a premium audio stream
      const textToRead = `${lesson.title}. Category: ${lesson.category}. Lesson Content: ${lesson.contentMarkdown.replace(/[#*`]/g, '')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Futuristic friendly tone
      synth.speak(utterance);
    } else {
      alert("TTS speaker initialized successfully.");
    }
  };

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const idx = Math.round(yOffset / cardHeight);
    if (idx !== activeIdx && idx >= 0 && idx < lessons.length) {
      setActiveIdx(idx);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFill}
        contentContainerStyle={{ height: cardHeight * lessons.length }}
      >
        {lessons.map((lesson, index) => {
          const isSelected = selectedAnswers[lesson.id] !== undefined;
          const userAns = selectedAnswers[lesson.id];
          const isSaved = savedLessonIds.includes(lesson.id);
          const currentLike = likesState[lesson.id] || { count: lesson.likes, active: false };

          return (
            <View key={lesson.id} style={styles.cardContainer}>
              {/* Cinematic Rich Background Cover Image */}
              <Image source={{ uri: lesson.imageBg }} style={styles.cardBackground} blurRadius={1.5} />
              
              {/* Glass overlay lighting grid */}
              <View style={[styles.overlay, { backgroundColor: 'rgba(3,0,30,0.65)' }]} />

              <View style={styles.cardInner}>
                {/* Topic Metadata & Badge */}
                <View style={styles.metaRow}>
                  <View style={[styles.badge, { backgroundColor: 'rgba(0, 242, 254, 0.15)', borderColor: colors.primary }]}>
                    <Sparkles size={12} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.badgeText, { color: colors.primary }]}>{lesson.category}</Text>
                  </View>
                  <Text style={[styles.durationText, { color: colors.textMuted }]}>{lesson.duration}</Text>
                </View>

                {/* Creator Header */}
                <View style={styles.creatorRow}>
                  <Image source={{ uri: lesson.creatorAvatar }} style={styles.creatorAvatar} />
                  <View>
                    <Text style={[styles.creatorName, { color: colors.text }]}>{lesson.creatorName}</Text>
                    <Text style={[styles.creatorHandle, { color: colors.textMuted }]}>Principal Coach</Text>
                  </View>
                </View>

                {/* Title */}
                <Text style={[styles.lessonTitle, { color: colors.text }]}>{lesson.title}</Text>

                {/* Core Scrollable Content inside translucent Glass Panel */}
                <GlassCard style={styles.contentCard} intensity={25}>
                  <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.contentBody, { color: colors.text }]}>
                      {lesson.contentMarkdown.replace(/###/g, '').trim()}
                    </Text>
                  </ScrollView>
                </GlassCard>

                {/* Interactive Inline Quiz Module */}
                <View style={styles.quizWrapper}>
                  <View style={styles.quizHeaderRow}>
                    <HelpCircle size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.quizLabel, { color: colors.primary }]}>CHALLENGE PRACTICE</Text>
                  </View>
                  <Text style={[styles.quizQuestion, { color: colors.text }]}>{lesson.quiz.question}</Text>

                  <View style={styles.optionsCol}>
                    {lesson.quiz.options.map((opt, optIdx) => {
                      const isCorrectOpt = optIdx === lesson.quiz.answerIndex;
                      const isSelectedOpt = optIdx === userAns;
                      
                      let cardBorder = 'rgba(255,255,255,0.08)';
                      let cardBg = 'rgba(255,255,255,0.02)';
                      let iconColor = colors.textMuted;

                      if (isSelected) {
                        if (isCorrectOpt) {
                          cardBorder = colors.success;
                          cardBg = 'rgba(16, 185, 129, 0.08)';
                          iconColor = colors.success;
                        } else if (isSelectedOpt) {
                          cardBorder = colors.error;
                          cardBg = 'rgba(239, 68, 68, 0.08)';
                          iconColor = colors.error;
                        }
                      }

                      return (
                        <TouchableOpacity
                          key={optIdx}
                          onPress={() => handleSelectAnswer(lesson, optIdx)}
                          activeOpacity={0.8}
                          disabled={isSelected}
                          style={[styles.optBtn, { borderColor: cardBorder, backgroundColor: cardBg }]}
                        >
                          <Text style={[styles.optText, { color: colors.text }]}>{opt}</Text>
                          {isSelected && isCorrectOpt && <Check size={16} color={colors.success} />}
                          {isSelected && isSelectedOpt && !isCorrectOpt && <X size={16} color={colors.error} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Feedback Explanation */}
                  {showExplanation[lesson.id] && (
                    <GlassCard style={styles.explanationBox} intensity={15} borderColor="rgba(255,255,255,0.03)">
                      <Text style={[styles.explanationText, { color: colors.text }]}>
                        <Text style={{ color: colors.primary, fontWeight: '700' }}>Insight: </Text>
                        {lesson.quiz.explanation}
                      </Text>
                    </GlassCard>
                  )}
                </View>
              </View>

              {/* Vertical Side Interaction Menu (TikTok Style Overlay) */}
              <View style={styles.sideActionsMenu}>
                <TouchableOpacity onPress={() => handleLike(lesson.id)} style={styles.actionBtn}>
                  <View style={[styles.actionIconCircle, currentLike.active && { backgroundColor: 'rgba(255, 0, 127, 0.15)' }]}>
                    <Heart size={22} color={currentLike.active ? colors.accent : '#fff'} fill={currentLike.active ? colors.accent : 'none'} />
                  </View>
                  <Text style={styles.actionLabel}>{currentLike.count}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => toggleSaveLesson(lesson.id)} style={styles.actionBtn}>
                  <View style={[styles.actionIconCircle, isSaved && { backgroundColor: 'rgba(0, 242, 254, 0.15)' }]}>
                    <Bookmark size={22} color={isSaved ? colors.primary : '#fff'} fill={isSaved ? colors.primary : 'none'} />
                  </View>
                  <Text style={styles.actionLabel}>{isSaved ? 'Saved' : 'Save'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => simulateSpeech(lesson)} style={styles.actionBtn}>
                  <View style={styles.actionIconCircle}>
                    <Volume2 size={22} color="#fff" />
                  </View>
                  <Text style={styles.actionLabel}>Listen</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleShare(lesson)} style={styles.actionBtn}>
                  <View style={styles.actionIconCircle}>
                    <Share2 size={22} color="#fff" />
                  </View>
                  <Text style={styles.actionLabel}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const cardHeight = 840 - 90; // Fit perfectly inside the simulated frame height minus tabs (or screen height on actual mobile)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  cardContainer: {
    height: cardHeight,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardInner: {
    padding: 20,
    width: '84%',
    height: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    marginRight: 12,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  creatorHandle: {
    fontSize: 11,
    fontWeight: '500',
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
    marginBottom: 14,
  },
  contentCard: {
    padding: 16,
    height: 160,
    marginBottom: 16,
  },
  contentScroll: {
    flex: 1,
  },
  contentBody: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  quizWrapper: {
    marginTop: 4,
  },
  quizHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  quizLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  quizQuestion: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 10,
  },
  optionsCol: {
    gap: 6,
  },
  optBtn: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  optText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  explanationBox: {
    padding: 12,
    marginTop: 8,
    borderRadius: 12,
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  sideActionsMenu: {
    position: 'absolute',
    right: 12,
    bottom: 24,
    gap: 16,
    alignItems: 'center',
    zIndex: 99,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  }
});
