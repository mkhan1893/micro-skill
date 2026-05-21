import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatar: string;
  isPremium: boolean;
  isCreator: boolean;
  xp: number;
  streak: number;
  coins: number;
  level: number;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isOnboarded: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (preferences: string[]) => Promise<void>;
  updateUserXp: (amount: number) => Promise<void>;
  toggleCreatorMode: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
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
    const loadSession = async () => {
      try {
        const [savedUser, savedOnboarding] = await Promise.all([
          AsyncStorage.getItem('user_session'),
          AsyncStorage.getItem('is_onboarded'),
        ]);

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        if (savedOnboarding === 'true') {
          setIsOnboarded(true);
        }
      } catch (err) {
        console.error('Session loading failed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
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
      };
      await AsyncStorage.setItem('user_session', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (err) {
      console.error('AsyncStorage error in login:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
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
      };
      await AsyncStorage.setItem('user_session', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (err) {
      console.error('AsyncStorage error in signup:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user_session');
    } catch (err) {
      console.error('AsyncStorage error in logout:', err);
    } finally {
      setUser(null);
    }
  };

  const completeOnboarding = async (preferences: string[]) => {
    try {
      setIsOnboarded(true);
      await AsyncStorage.setItem('is_onboarded', 'true');
      await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
    } catch (err) {
      console.error('AsyncStorage error in completeOnboarding:', err);
    }
  };

  const updateUserXp = async (amount: number) => {
    if (!user) return;
    const nextXp = user.xp + amount;
    const nextLevel = Math.floor(nextXp / 500) + 1;
    const nextCoins = user.coins + (nextLevel > user.level ? 50 : 2);
    
    const updatedUser = {
      ...user,
      xp: nextXp,
      level: nextLevel,
      coins: nextCoins,
      streak: user.streak + (amount > 50 ? 1 : 0),
    };
    try {
      await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('AsyncStorage error in updateUserXp:', err);
    } finally {
      setUser(updatedUser);
    }
  };

  const toggleCreatorMode = async () => {
    if (!user) return;
    const updatedUser = { ...user, isCreator: !user.isCreator };
    try {
      await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('AsyncStorage error in toggleCreatorMode:', err);
    } finally {
      setUser(updatedUser);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) return;
    const updatedUser = { ...user, isPremium: true };
    try {
      await AsyncStorage.setItem('user_session', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('AsyncStorage error in upgradeToPremium:', err);
    } finally {
      setUser(updatedUser);
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
      upgradeToPremium
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
