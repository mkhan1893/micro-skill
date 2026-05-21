import React, { createContext, useContext, useState, useEffect } from 'react';
import { Colors, ThemeType } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof Colors.dark;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');

  useEffect(() => {
    // Load theme setting from persistence
    AsyncStorage.getItem('theme_preference')
      .then(savedTheme => {
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setTheme(savedTheme);
        }
      })
      .catch(err => console.error('Failed to load theme preference:', err));
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    AsyncStorage.setItem('theme_preference', nextTheme)
      .catch(err => console.error('Failed to save theme preference:', err));
  };

  const colors = theme === 'dark' ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
