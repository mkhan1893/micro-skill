import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedGradient } from '../../components/AnimatedGradient';
import { GeminiService, ChatMessage } from '../../services/gemini';
import { Send, Sparkles, Mic, MicOff, RefreshCw, ChevronRight } from 'lucide-react-native';

const SUGGESTIONS = [
  'Explain Blockchain in 30s',
  'Secrets of executive speaking presence',
  'How do Neural Networks function?',
  'Interactive Coding quiz'
];

export default function AITutor() {
  const { colors } = useTheme();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "### Greetings, Pioneer! 🚀\n\nI am your **MICRO SKILL AI Copilot**. I can condense complex topics into immediate 30-second tutorials.\n\nChoose an inquiry chip below or ask any concept to begin." }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [waveHeight, setWaveHeight] = useState(new Array(8).fill(10));

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  // Voice waves animation loop
  useEffect(() => {
    if (!voiceActive) return;
    const interval = setInterval(() => {
      setWaveHeight(prev => prev.map(() => Math.floor(Math.random() * 40) + 8));
    }, 120);
    return () => clearInterval(interval);
  }, [voiceActive]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await GeminiService.sendTutorMessage(messages, text);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Failed to query the intelligence matrix. Please verify connections." }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    setVoiceActive(!voiceActive);
    if (!voiceActive && Platform.OS === 'web' && typeof window !== 'undefined') {
      // Simulate speech to text trigger
      const speech = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (speech) {
        const rec = new speech();
        rec.lang = 'en-US';
        rec.onresult = (e: any) => {
          const val = e.results[0][0].transcript;
          setInputText(val);
          setVoiceActive(false);
          handleSend(val);
        };
        rec.start();
      }
    }
  };

  return (
    <AnimatedGradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Sparkles size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI SKILL COPILOT</Text>
          </View>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Gemini Powered Super Tutor</Text>
        </View>

        {/* Chat History View */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <View
                key={i}
                style={[
                  styles.msgRow,
                  isUser ? styles.msgRowUser : styles.msgRowModel
                ]}
              >
                <GlassCard
                  intensity={isUser ? 15 : 25}
                  borderColor={isUser ? 'rgba(255,255,255,0.05)' : colors.cardBorder}
                  style={[
                    styles.msgBubble,
                    isUser
                      ? { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderTopRightRadius: 4 }
                      : { backgroundColor: colors.cardBg, borderTopLeftRadius: 4 }
                  ]}
                >
                  <Text style={[styles.msgText, { color: colors.text }]}>
                    {msg.content.replace(/###/g, '').trim()}
                  </Text>
                </GlassCard>
              </View>
            );
          })}

          {/* Glowing Animated Loading Typing Indicator */}
          {loading && (
            <View style={[styles.msgRow, styles.msgRowModel]}>
              <GlassCard style={styles.msgBubbleLoading} intensity={15}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingLabel, { color: colors.textMuted }]}>AI computing concepts...</Text>
              </GlassCard>
            </View>
          )}
        </ScrollView>

        {/* Dynamic Voice Recording Wave overlay */}
        {voiceActive && (
          <GlassCard style={styles.voiceWavePanel} intensity={50}>
            <Text style={styles.voiceWaveTitle}>Listening to Voice Prompt...</Text>
            <View style={styles.wavesContainer}>
              {waveHeight.map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    { height: h, backgroundColor: colors.primary }
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity onPress={toggleVoice} style={[styles.micActiveBtn, { backgroundColor: colors.accent }]}>
              <MicOff size={22} color="#fff" />
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Suggestions chips wrapper */}
        <View style={styles.suggestionsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionScroll}>
            {SUGGESTIONS.map(chip => (
              <TouchableOpacity
                key={chip}
                onPress={() => handleSend(chip)}
                activeOpacity={0.8}
              >
                <GlassCard style={styles.chipCard} intensity={20}>
                  <Text style={[styles.chipText, { color: colors.textMuted }]}>{chip}</Text>
                  <ChevronRight size={12} color={colors.primary} style={{ marginLeft: 4 }} />
                </GlassCard>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Futuristic Chat Inputs Bar */}
        <View style={styles.inputArea}>
          <GlassCard style={styles.inputBar} intensity={25}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask anything..."
              placeholderTextColor={colors.textMuted}
              style={[styles.textInput, { color: colors.text }]}
              onSubmitEditing={() => handleSend(inputText)}
            />
            
            <TouchableOpacity onPress={toggleVoice} style={styles.micBtn} activeOpacity={0.8}>
              <Mic size={20} color={voiceActive ? colors.accent : colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSend(inputText)}
              disabled={!inputText.trim()}
              style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.primary : 'rgba(255,255,255,0.03)' }]}
            >
              <Send size={16} color={inputText.trim() ? '#03001e' : colors.textMuted} />
            </TouchableOpacity>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </AnimatedGradient>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    gap: 16,
  },
  msgRow: {
    flexDirection: 'row',
    width: '100%',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowModel: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    padding: 16,
    maxWidth: '82%',
    borderRadius: 20,
  },
  msgBubbleLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 10,
  },
  loadingLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  suggestionsRow: {
    paddingVertical: 12,
    backgroundColor: 'rgba(3,0,30,0.4)',
  },
  suggestionScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputArea: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: 'rgba(3,0,30,0.5)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingLeft: 16,
    borderRadius: 20,
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    fontWeight: '500',
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceWavePanel: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    padding: 24,
    borderRadius: 28,
    alignItems: 'center',
    zIndex: 9999,
  },
  voiceWaveTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 16,
  },
  wavesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    gap: 4,
    marginBottom: 20,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
  },
  micActiveBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
