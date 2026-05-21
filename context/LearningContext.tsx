import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface MicroLesson {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string; // "3m", "30s"
  creatorName: string;
  creatorAvatar: string;
  videoUrl?: string;
  imageBg: string;
  contentMarkdown: string;
  quiz: {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
  likes: number;
  commentsCount: number;
}

export interface SkillPath {
  id: string;
  title: string;
  description: string;
  lessonsCount: number;
  xpReward: number;
  progress: number; // 0 to 100
  unlocked: boolean;
  color: string;
}

interface LearningContextType {
  lessons: MicroLesson[];
  paths: SkillPath[];
  savedLessonIds: string[];
  downloadedLessonIds: string[];
  toggleSaveLesson: (id: string) => Promise<void>;
  toggleDownloadLesson: (id: string) => Promise<void>;
  completeLesson: (id: string) => Promise<void>;
  addCustomLesson: (lesson: MicroLesson) => void;
  activePath: string | null;
  setActivePath: (pathId: string | null) => void;
  updatePathProgress: (pathId: string, progress: number) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

// High-fidelity pre-seeded immersive lessons
const SEEDED_LESSONS: MicroLesson[] = [
  {
    id: 'lesson_1',
    title: 'Harness Neural Networks: Prompt Engineering 101',
    category: 'AI & Machine Learning',
    description: 'Learn how to construct the "Perfect Prompt" using Role-Context-Output structure in 30 seconds.',
    duration: '45s',
    creatorName: 'Aria Sterling',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&auto=format&fit=crop',
    imageBg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=512&auto=format&fit=crop',
    contentMarkdown: `### The Perfect Prompt Blueprint

To get world-class outputs from LLMs, use the **R-C-O Formula**:
1. **R (Role)**: Tell the AI who it is. (e.g. *\"You are a principal software architect...\"*)
2. **C (Context)**: Provide the details of what you need. (e.g. *\"We are building a glassmorphic dashboard in React Native...\"*)
3. **O (Output Format)**: Direct the format precisely. (e.g. *\"Output only standard TSX code with zero explanations.\"*)

Avoid ambiguous terms like \"be creative\" or \"make it quick\". Give precise parameters!`,
    quiz: {
      question: 'What does the \"R\" in the R-C-O Prompt formula represent?',
      options: ['Recurrent', 'Role', 'Reaction', 'Research'],
      answerIndex: 1,
      explanation: 'Role (R) dictates the persona, styling, and baseline context the LLM should adopt.'
    },
    likes: 1243,
    commentsCount: 88,
  },
  {
    id: 'lesson_2',
    title: 'The Secret to Magnetic Public Speaking',
    category: 'Communication',
    description: 'Master the "Box Breath Pause" to instantly demand full attention in any boardroom.',
    duration: '2m',
    creatorName: 'Marcus Aurel',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&auto=format&fit=crop',
    imageBg: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=512&auto=format&fit=crop',
    contentMarkdown: `### The Power of the High-Status Pause

Most speakers run from silence because it triggers social anxiety. But silence is actually your greatest rhetorical asset.

#### The "Box Breath Pause" Technique:
1. When you walk up to a microphone, **do not speak for 4 seconds**.
2. Make solid eye contact with 3 distinct individuals in different areas.
3. Inhale silently, anchor your feet, and deliver your first line on a full exhale.
4. Pausing mid-sentence *immediately before* a key word signals high social standing and absolute control.`,
    quiz: {
      question: 'Why should you pause for 4 seconds before speaking to an audience?',
      options: [
        'To remember your script lines',
        'To look for the slides controls',
        'To establish absolute control and calm your central nervous system',
        'To check if the microphone works'
      ],
      answerIndex: 2,
      explanation: 'Pausing shows confidence, grounds your breathing, and signals command over the room.'
    },
    likes: 852,
    commentsCount: 42,
  },
  {
    id: 'lesson_3',
    title: 'Automate Excel Tasks in 60 Seconds',
    category: 'Productivity Hacks',
    description: 'Stop copy-pasting data. Learn how to unleash high-performance XLOOKUP workflows.',
    duration: '1m',
    creatorName: 'Sarah Jenkins',
    creatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=128&auto=format&fit=crop',
    imageBg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=512&auto=format&fit=crop',
    contentMarkdown: `### The Demise of VLOOKUP: Say Hello to XLOOKUP

\`=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])\`

#### Why VLOOKUP is obsolete:
1. **Direction**: VLOOKUP only searches left-to-right. XLOOKUP searches both left AND right.
2. **Column Insertion**: If you insert a column in a VLOOKUP table, it breaks. XLOOKUP adjusts dynamically.
3. **Exact Match**: VLOOKUP defaults to approximate match. XLOOKUP defaults to exact match.

Use this code today and reclaim your lunch break!`,
    quiz: {
      question: 'What is the default matching mode of the modern XLOOKUP function?',
      options: ['Approximate match', 'Wildcard match', 'Exact match', 'Binary search'],
      answerIndex: 2,
      explanation: 'XLOOKUP defaults to exact match, avoiding a major pitfall of the older VLOOKUP function.'
    },
    likes: 2190,
    commentsCount: 167,
  }
];

const SEEDED_PATHS: SkillPath[] = [
  { id: 'path_ai', title: 'Learn AI in 7 Days', description: 'From prompt wizardry to advanced neural networks and deep-learning integration.', lessonsCount: 7, xpReward: 500, progress: 14, unlocked: true, color: '#00f2fe' },
  { id: 'path_comm', title: 'Magnetic Public Speaker', description: 'Eradicate stage fright, refine vocal tonality, and speak with extreme executive presence.', lessonsCount: 5, xpReward: 400, progress: 0, unlocked: true, color: '#7f00ff' },
  { id: 'path_code', title: 'Master React Native Web', description: 'Assemble lightning-fast cross-platform glassmorphic dashboards using Expo.', lessonsCount: 8, xpReward: 600, progress: 0, unlocked: false, color: '#ff007f' },
];

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateUserXp } = useAuth();
  const [lessons, setLessons] = useState<MicroLesson[]>(SEEDED_LESSONS);
  const [paths, setPaths] = useState<SkillPath[]>(SEEDED_PATHS);
  const [savedLessonIds, setSavedLessonIds] = useState<string[]>([]);
  const [downloadedLessonIds, setDownloadedLessonIds] = useState<string[]>([]);
  const [activePath, setActivePathState] = useState<string | null>(null);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [saved, downloaded, active] = await Promise.all([
          AsyncStorage.getItem('saved_lessons'),
          AsyncStorage.getItem('downloaded_lessons'),
          AsyncStorage.getItem('active_path_id'),
        ]);

        if (saved) setSavedLessonIds(JSON.parse(saved));
        if (downloaded) setDownloadedLessonIds(JSON.parse(downloaded));
        if (active) setActivePathState(active);
      } catch (err) {
        console.error('Failed to load learning assets state:', err);
      }
    };
    loadState();
  }, []);

  const toggleSaveLesson = async (id: string) => {
    let nextSaved = [...savedLessonIds];
    if (nextSaved.includes(id)) {
      nextSaved = nextSaved.filter(x => x !== id);
    } else {
      nextSaved.push(id);
    }
    setSavedLessonIds(nextSaved);
    try {
      await AsyncStorage.setItem('saved_lessons', JSON.stringify(nextSaved));
    } catch (err) {
      console.error('AsyncStorage error in toggleSaveLesson:', err);
    }
  };

  const toggleDownloadLesson = async (id: string) => {
    let nextDown = [...downloadedLessonIds];
    if (nextDown.includes(id)) {
      nextDown = nextDown.filter(x => x !== id);
    } else {
      nextDown.push(id);
    }
    setDownloadedLessonIds(nextDown);
    try {
      await AsyncStorage.setItem('downloaded_lessons', JSON.stringify(nextDown));
    } catch (err) {
      console.error('AsyncStorage error in toggleDownloadLesson:', err);
    }
  };

  const addCustomLesson = (newLesson: MicroLesson) => {
    setLessons(prev => [newLesson, ...prev]);
  };

  const completeLesson = async (id: string) => {
    await updateUserXp(100);
    
    if (id === 'lesson_1') {
      updatePathProgress('path_ai', 28);
    } else if (id === 'lesson_2') {
      updatePathProgress('path_comm', 20);
    }
  };

  const setActivePath = async (pathId: string | null) => {
    setActivePathState(pathId);
    try {
      if (pathId) {
        await AsyncStorage.setItem('active_path_id', pathId);
      } else {
        await AsyncStorage.removeItem('active_path_id');
      }
    } catch (err) {
      console.error('AsyncStorage error in setActivePath:', err);
    }
  };

  const updatePathProgress = (pathId: string, progress: number) => {
    setPaths(prev => prev.map(p => {
      if (p.id === pathId) {
        return { ...p, progress };
      }
      return p;
    }));
  };

  return (
    <LearningContext.Provider value={{
      lessons,
      paths,
      savedLessonIds,
      downloadedLessonIds,
      toggleSaveLesson,
      toggleDownloadLesson,
      completeLesson,
      addCustomLesson,
      activePath,
      setActivePath,
      updatePathProgress
    }}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
