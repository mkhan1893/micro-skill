import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isMockFirebase, FirestoreDB } from '../services/firebase';
import { UserProfile } from '../services/types';
import { ProgressionEngine } from '../services/progression';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isOnboarded: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (interests: string[], skillLevel?: string, dailyGoal?: number) => Promise<void>;
  updateUserXp: (amount: number) => Promise<void>;
  toggleCreatorMode: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  updateProfileDetails: (displayName: string, bio: string, avatar: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=256&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

  useEffect(() => {
    // 1. Sync Onboarding Status
    const loadOnboarding = async () => {
      try {
        const savedOnboarding = await AsyncStorage.getItem('is_onboarded');
        if (savedOnboarding === 'true') {
          setIsOnboarded(true);
        }
      } catch (err) {
        console.error('[Auth] AsyncStorage error in onboarding check:', err);
      }
    };
    loadOnboarding();

    // 2. Real-time persistent Session listener (real Firebase or AsyncStorage fallback)
    if (isMockFirebase) {
      const loadMockSession = async () => {
        try {
          const savedUser = await AsyncStorage.getItem('user_session');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        } catch (err) {
          console.error('[Auth Mock] Session loading failed:', err);
        } finally {
          setLoading(false);
        }
      };
      loadMockSession();
    } else {
      // Listen to real Firebase state changes
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          try {
            // Fetch profile data from Firestore users collection
            const userProfile = await FirestoreDB.getDocument<UserProfile>('users', firebaseUser.uid);
            if (userProfile) {
              setUser(userProfile);
            } else {
              // Create default profile in Firestore if document doesn't exist yet
              // Pull onboarding preferences from AsyncStorage if they exist
              const [interestsStr, skillLevel, dailyGoalStr] = await Promise.all([
                AsyncStorage.getItem('user_interests'),
                AsyncStorage.getItem('user_skill_level'),
                AsyncStorage.getItem('user_daily_goal')
              ]);

              const interests = interestsStr ? JSON.parse(interestsStr) : [];
              const dailyGoal = dailyGoalStr ? parseInt(dailyGoalStr, 10) : 5;

              const defaultProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Explorer',
                avatar: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
                isPremium: false,
                isCreator: false,
                xp: 0,
                streak: 1,
                coins: 10,
                level: 1,
                bio: 'Curious learner exploring new frontiers of knowledge.',
                badges: ['Pioneer'],
                achievements: ['First Step'],
                interests,
                skillLevel: skillLevel || 'Intermediate',
                dailyGoal,
                createdAt: new Date().toISOString()
              };
              await FirestoreDB.setDocument('users', firebaseUser.uid, defaultProfile);
              setUser(defaultProfile);
            }
          } catch (err) {
            console.error('[Auth] Failed to fetch/sync Firestore user profile:', err);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (isMockFirebase) {
        const mockUser: UserProfile = {
          uid: 'user_' + Math.random().toString(36).substring(2, 9),
          email: email,
          displayName: email.split('@')[0],
          avatar: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
          isPremium: false,
          isCreator: false,
          xp: 150,
          streak: 3,
          coins: 40,
          level: 1,
          bio: 'Curious learner exploring new frontiers of knowledge.',
          badges: ['Pioneer'],
          achievements: ['First Step'],
          interests: ['AI & Machine Learning'],
          skillLevel: 'Intermediate',
          dailyGoal: 5,
          createdAt: new Date().toISOString()
        };
        await AsyncStorage.setItem('user_session', JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
        // Profile state will update automatically via the onAuthStateChanged listener!
      }
    } catch (err) {
      console.error('[Auth] Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      // Pull onboarding preferences from AsyncStorage if they exist
      const [interestsStr, skillLevel, dailyGoalStr] = await Promise.all([
        AsyncStorage.getItem('user_interests'),
        AsyncStorage.getItem('user_skill_level'),
        AsyncStorage.getItem('user_daily_goal')
      ]);

      const interests = interestsStr ? JSON.parse(interestsStr) : [];
      const dailyGoal = dailyGoalStr ? parseInt(dailyGoalStr, 10) : 5;

      if (isMockFirebase) {
        const mockUser: UserProfile = {
          uid: 'user_' + Math.random().toString(36).substring(2, 9),
          email: email,
          displayName: name || email.split('@')[0],
          avatar: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
          isPremium: false,
          isCreator: false,
          xp: 0,
          streak: 1,
          coins: 10,
          level: 1,
          bio: 'Curious learner exploring new frontiers of knowledge.',
          badges: ['Pioneer'],
          achievements: ['First Step'],
          interests,
          skillLevel: skillLevel || 'Intermediate',
          dailyGoal,
          createdAt: new Date().toISOString()
        };
        await AsyncStorage.setItem('user_session', JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        // Real Firebase Auth Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;
        
        // Prepare initial Firestore document to preserve progress stats in production database
        const defaultProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || email,
          displayName: name || email.split('@')[0],
          avatar: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
          isPremium: false,
          isCreator: false,
          xp: 0,
          streak: 1,
          coins: 10,
          level: 1,
          bio: 'Curious learner exploring new frontiers of knowledge.',
          badges: ['Pioneer'],
          achievements: ['First Step'],
          interests,
          skillLevel: skillLevel || 'Intermediate',
          dailyGoal,
          createdAt: new Date().toISOString()
        };
        await FirestoreDB.setDocument('users', firebaseUser.uid, defaultProfile);
      }
    } catch (err) {
      console.error('[Auth] Signup error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isMockFirebase) {
        await AsyncStorage.removeItem('user_session');
      } else {
        await signOut(auth);
      }
      setUser(null);
    } catch (err) {
      console.error('[Auth] Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (interests: string[], skillLevel: string = 'Intermediate', dailyGoal: number = 5) => {
    try {
      setIsOnboarded(true);
      await Promise.all([
        AsyncStorage.setItem('is_onboarded', 'true'),
        AsyncStorage.setItem('user_interests', JSON.stringify(interests)),
        AsyncStorage.setItem('user_skill_level', skillLevel),
        AsyncStorage.setItem('user_daily_goal', dailyGoal.toString())
      ]);

      if (user) {
        const updatedUser: UserProfile = {
          ...user,
          interests,
          skillLevel,
          dailyGoal
        };

        if (isMockFirebase) {
          await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
        } else {
          await FirestoreDB.updateDocument('users', user.uid, {
            interests,
            skillLevel,
            dailyGoal
          });
        }
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('[Auth] Error in completeOnboarding:', err);
    }
  };

  const updateUserXp = async (amount: number) => {
    if (!user) return;

    // Apply streak + premium calculation
    const xpGained = ProgressionEngine.calculateXpGain(amount, user.streak, user.isPremium);
    const nextXp = user.xp + xpGained;
    const nextLevel = ProgressionEngine.getLevelFromXp(nextXp);

    let nextCoins = user.coins + 10;
    if (nextLevel > user.level) {
      nextCoins += ProgressionEngine.calculateLevelUpCoins(nextLevel);
    }

    // Load total completed lessons count for badge verification
    let completedCount = 0;
    try {
      const completedList = await AsyncStorage.getItem('completed_lessons');
      if (completedList) {
        completedCount = JSON.parse(completedList).length;
      }
    } catch (e) {
      console.warn('[Auth] Failed to load completed count:', e);
    }

    const nextBadges = ProgressionEngine.checkMilestones(nextXp, user.streak, completedCount);

    const updatedUser = {
      ...user,
      xp: nextXp,
      level: nextLevel,
      coins: nextCoins,
      badges: nextBadges,
    };
    
    try {
      if (isMockFirebase) {
        await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
      } else {
        await FirestoreDB.updateDocument('users', user.uid, {
          xp: nextXp,
          level: nextLevel,
          coins: nextCoins,
          badges: nextBadges
        });
      }
      setUser(updatedUser);
    } catch (err) {
      console.error('[Auth] Firestore/AsyncStorage error in updateUserXp:', err);
    }
  };

  const toggleCreatorMode = async () => {
    if (!user) return;
    const updatedUser = { ...user, isCreator: !user.isCreator };
    try {
      if (isMockFirebase) {
        await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
      } else {
        await FirestoreDB.updateDocument('users', user.uid, {
          isCreator: updatedUser.isCreator
        });
      }
      setUser(updatedUser);
    } catch (err) {
      console.error('[Auth] error in toggleCreatorMode:', err);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) return;
    const updatedUser = { ...user, isPremium: true };
    try {
      if (isMockFirebase) {
        await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
      } else {
        await FirestoreDB.updateDocument('users', user.uid, {
          isPremium: true
        });
      }
      setUser(updatedUser);
    } catch (err) {
      console.error('[Auth] error in upgradeToPremium:', err);
    }
  };

  const updateProfileDetails = async (displayName: string, bio: string, avatar: string) => {
    if (!user) return;
    const updatedUser = { ...user, displayName, bio, avatar };
    try {
      if (isMockFirebase) {
        await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
      } else {
        await FirestoreDB.updateDocument('users', user.uid, {
          displayName,
          bio,
          avatar
        });
      }
      setUser(updatedUser);
    } catch (err) {
      console.error('[Auth] error in updateProfileDetails:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isOnboarded,
      login,
      signup,
      logout,
      completeOnboarding,
      updateUserXp,
      toggleCreatorMode,
      upgradeToPremium,
      updateProfileDetails
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
