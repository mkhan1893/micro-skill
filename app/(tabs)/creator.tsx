import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLearning } from '../../context/LearningContext';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedGradient } from '../../components/AnimatedGradient';
import { GeminiService } from '../../services/gemini';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sparkles, Settings, LogOut, Sun, Moon, Key, HelpCircle, PlusCircle, CheckCircle } from 'lucide-react-native';

export default function CreatorStudio() {
  const { colors, theme, toggleTheme } = useTheme();
  const { user, toggleCreatorMode, logout, upgradeToPremium } = useAuth();
  const { addCustomLesson } = useLearning();

  const [topicInput, setTopicInput] = useState('');
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileSuccess, setCompileSuccess] = useState(false);
  const [saveStatusMsg, setSaveStatusMsg] = useState('');

  const activeUser = user || {
    displayName: 'Aria Sterling',
    email: 'aria@future.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    isPremium: false,
    isCreator: true
  };

  const handleSaveKey = async () => {
    try {
      await AsyncStorage.setItem('user_gemini_key', geminiKeyInput);
      setSaveStatusMsg('Custom API key registered!');
      setTimeout(() => setSaveStatusMsg(''), 3000);
    } catch {
      setSaveStatusMsg('Key registration failed.');
    }
  };

  const handleCompileLesson = async () => {
    if (!topicInput.trim()) return;
    setIsCompiling(true);
    setCompileSuccess(false);

    try {
      // Dynamic lesson compile using Gemini
      const lessonResult = await GeminiService.generateLesson(topicInput);
      
      const newLesson = {
        id: 'user_lesson_' + Math.random().toString(36).substring(2, 9),
        title: lessonResult.title,
        category: 'AI Generated Spec',
        description: lessonResult.description,
        duration: lessonResult.duration || '1m',
        creatorName: activeUser.displayName,
        creatorAvatar: activeUser.avatar,
        imageBg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=512&auto=format&fit=crop',
        contentMarkdown: lessonResult.contentMarkdown,
        quiz: lessonResult.quiz,
        likes: 0,
        commentsCount: 0
      };

      // Append compiled lesson to memory
      addCustomLesson(newLesson);
      
      setCompileSuccess(true);
      setTopicInput('');
    } catch (err) {
      alert("Lesson compilation encountered an error. Check credentials.");
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <AnimatedGradient>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Profile Card Summary */}
        <GlassCard style={styles.profileHeaderCard} intensity={25} glow>
          <View style={styles.profileRow}>
            <Image source={{ uri: activeUser.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{activeUser.displayName}</Text>
              <Text style={[styles.email, { color: colors.textMuted }]}>{activeUser.email}</Text>
              
              <TouchableOpacity onPress={upgradeToPremium} style={styles.upgradeBtn} activeOpacity={0.8}>
                <Text style={styles.upgradeBtnText}>
                  {activeUser.isPremium ? 'PRO MEMBER' : 'UPGRADE TO PREMIUM'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        {/* Dynamic Creator Studio Core Mode */}
        {activeUser.isCreator ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <PlusCircle size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>AI MICRO LESSON COMPILER</Text>
            </View>

            <GlassCard style={styles.creatorCard} intensity={25}>
              <Text style={[styles.boxLabel, { color: colors.textMuted }]}>COGNITIVE LESSON SUBJECT / TOPIC</Text>
              <TextInput
                value={topicInput}
                onChangeText={setTopicInput}
                placeholder="e.g. DeFi Lending Loops, Rust Pointer safety, Storytelling loops..."
                placeholderTextColor={colors.textMuted}
                style={[styles.topicInput, { color: colors.text }]}
              />

              <TouchableOpacity
                onPress={handleCompileLesson}
                disabled={isCompiling}
                style={[styles.compileBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                {isCompiling ? (
                  <ActivityIndicator size="small" color="#03001e" />
                ) : (
                  <>
                    <Sparkles size={16} color="#03001e" style={{ marginRight: 8 }} />
                    <Text style={styles.compileText}>Compile Micro Lesson</Text>
                  </>
                )}
              </TouchableOpacity>

              {compileSuccess && (
                <View style={styles.successRow}>
                  <CheckCircle size={16} color={colors.success} style={{ marginRight: 6 }} />
                  <Text style={[styles.successText, { color: colors.success }]}>
                    Lesson compiled successfully! Swipe to the Feed to view it!
                  </Text>
                </View>
              )}
            </GlassCard>
          </View>
        ) : null}

        {/* Global Settings & Integrations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>SYSTEM SETTINGS & APIS</Text>
          </View>

          <GlassCard style={styles.settingsCard} intensity={20}>
            {/* Custom Gemini Key Input */}
            <View style={styles.settingItemCol}>
              <View style={styles.settingLabelRow}>
                <Key size={14} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>GEMINI CUSTOM API KEY</Text>
              </View>
              <Text style={styles.settingDesc}>Use your own key to run unlimited dynamic lesson compiles and stream chats.</Text>
              
              <View style={styles.keyInputRow}>
                <TextInput
                  value={geminiKeyInput}
                  onChangeText={setGeminiKeyInput}
                  placeholder="AIzaSy..."
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  style={[styles.keyInput, { color: colors.text }]}
                />
                <TouchableOpacity onPress={handleSaveKey} style={[styles.saveKeyBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.saveKeyText}>Save</Text>
                </TouchableOpacity>
              </View>
              {saveStatusMsg ? <Text style={[styles.statusMsg, { color: colors.primary }]}>{saveStatusMsg}</Text> : null}
            </View>

            {/* Toggle Theme */}
            <TouchableOpacity onPress={toggleTheme} style={styles.settingRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {theme === 'dark' ? <Moon size={16} color={colors.textMuted} style={{ marginRight: 10 }} /> : <Sun size={16} color={colors.textMuted} style={{ marginRight: 10 }} />}
                <Text style={[styles.settingText, { color: colors.text }]}>Switch Interface Mode</Text>
              </View>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
                {theme === 'dark' ? 'DARK' : 'LIGHT'}
              </Text>
            </TouchableOpacity>

            {/* Toggle Creator Studio Mode */}
            <TouchableOpacity onPress={toggleCreatorMode} style={styles.settingRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles size={16} color={colors.textMuted} style={{ marginRight: 10 }} />
                <Text style={[styles.settingText, { color: colors.text }]}>Creator Studio View</Text>
              </View>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
                {activeUser.isCreator ? 'ACTIVE' : 'DEACTIVE'}
              </Text>
            </TouchableOpacity>

            {/* Log Out */}
            <TouchableOpacity onPress={logout} style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LogOut size={16} color={colors.error} style={{ marginRight: 10 }} />
                <Text style={[styles.settingText, { color: colors.error, fontWeight: '700' }]}>Sign Out Profile</Text>
              </View>
            </TouchableOpacity>
          </GlassCard>
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
  profileHeaderCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  upgradeBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    alignSelf: 'flex-start',
  },
  upgradeBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00f2fe',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 28,
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
  creatorCard: {
    padding: 20,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  topicInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
  },
  compileBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  compileText: {
    color: '#03001e',
    fontWeight: '800',
    fontSize: 14,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 10,
  },
  successText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  settingsCard: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingItemCol: {
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  settingLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  settingDesc: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 10,
  },
  keyInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keyInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 12,
    fontSize: 12,
  },
  saveKeyBtn: {
    width: 60,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveKeyText: {
    color: '#03001e',
    fontWeight: '800',
    fontSize: 12,
  },
  statusMsg: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  }
});
