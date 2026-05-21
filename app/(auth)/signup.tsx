import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AnimatedGradient } from '../../components/AnimatedGradient';
import { GlassCard } from '../../components/GlassCard';
import { Sparkles, Mail, Lock, User } from 'lucide-react-native';

export default function Signup() {
  const { colors } = useTheme();
  const { signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !password) {
      setErrorMsg('Please populate all inputs.');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await signup(email, password, name);
      router.replace('/(tabs)');
    } catch (err) {
      setErrorMsg('Failed to create account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedGradient>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.emblem, { backgroundColor: 'rgba(0, 242, 254, 0.08)', borderColor: colors.primary }]}>
            <Sparkles size={24} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Begin Journey</Text>
          <Text style={[styles.desc, { color: colors.textMuted }]}>
            Create your unique neural learning profile.
          </Text>
        </View>

        <GlassCard style={styles.formCard} intensity={25}>
          {errorMsg ? (
            <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: colors.error }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>YOUR NAME</Text>
            <View style={[styles.inputWrapper, { borderColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <User size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ada Lovelace"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>EMAIL ADDRESS</Text>
            <View style={[styles.inputWrapper, { borderColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ada@computing.ai"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>SECURE KEY (PASSWORD)</Text>
            <View style={[styles.inputWrapper, { borderColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••••••"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#03001e" />
            ) : (
              <Text style={styles.submitText}>Initiate Core Engine</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Already registered?{' '}
            <Text onPress={() => router.push('/(auth)/login')} style={{ color: colors.primary, fontWeight: '700' }}>
              Sign In
            </Text>
          </Text>
        </View>
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
    alignItems: 'center',
    marginBottom: 36,
  },
  emblem: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: 14,
    marginTop: 6,
  },
  formCard: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  submitBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  submitText: {
    color: '#03001e',
    fontWeight: '800',
    fontSize: 15,
  },
  errorBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  }
});
