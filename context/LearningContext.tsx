import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { FirestoreDB, isMockFirebase } from '../services/firebase';
import { MicroLesson, SkillPath, UserProgress } from '../services/types';

interface LearningContextType {
  lessons: MicroLesson[];
  paths: SkillPath[];
  savedLessonIds: string[];
  downloadedLessonIds: string[];
  completedLessonIds: string[];
  weeklyActivity: Record<string, number>;
  toggleSaveLesson: (id: string) => Promise<void>;
  toggleDownloadLesson: (id: string) => Promise<void>;
  completeLesson: (id: string) => Promise<void>;
  addCustomLesson: (lesson: MicroLesson) => Promise<void>;
  activePath: string | null;
  setActivePath: (pathId: string | null) => void;
  updatePathProgress: (pathId: string, progress: number) => void;
  loading: boolean;
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
1. **R (Role)**: Tell the AI who it is. (e.g. *"You are a principal software architect..."*)
2. **C (Context)**: Provide the details of what you need. (e.g. *"We are building a glassmorphic dashboard in React Native..."*)
3. **O (Output Format)**: Direct the format precisely. (e.g. *"Output only standard TSX code with zero explanations."*)

Avoid ambiguous terms like "be creative" or "make it quick". Give precise parameters!`,
    quiz: {
      question: 'What does the "R" in the R-C-O Prompt formula represent?',
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
  const { user, updateUserXp } = useAuth();
  const [lessons, setLessons] = useState<MicroLesson[]>([]);
  const [paths, setPaths] = useState<SkillPath[]>([]);
  const [savedLessonIds, setSavedLessonIds] = useState<string[]>([]);
  const [downloadedLessonIds, setDownloadedLessonIds] = useState<string[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<Record<string, number>>({});
  const [activePath, setActivePathState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Load initial collection seeds
  useEffect(() => {
    const initializeLessonsAndPaths = async () => {
      setLoading(true);
      try {
        if (isMockFirebase) {
          setLessons(SEEDED_LESSONS);
          setPaths(SEEDED_PATHS);

          const [saved, downloaded, active, completed] = await Promise.all([
            AsyncStorage.getItem('saved_lessons'),
            AsyncStorage.getItem('downloaded_lessons'),
            AsyncStorage.getItem('active_path_id'),
            AsyncStorage.getItem('completed_lessons')
          ]);

          if (saved) setSavedLessonIds(JSON.parse(saved));
          if (downloaded) setDownloadedLessonIds(JSON.parse(downloaded));
          if (active) setActivePathState(active);
          if (completed) setCompletedLessonIds(JSON.parse(completed));
        } else {
          // Real Firebase integration loading
          let remoteLessons = await FirestoreDB.getCollection<MicroLesson>('lessons');
          if (remoteLessons.length === 0) {
            console.log('[Learning] Auto-seeding Firestore lessons collection...');
            await Promise.all(
              SEEDED_LESSONS.map(l => FirestoreDB.setDocument('lessons', l.id, l))
            );
            remoteLessons = SEEDED_LESSONS;
          }
          setLessons(remoteLessons);

          let remotePaths = await FirestoreDB.getCollection<SkillPath>('paths');
          if (remotePaths.length === 0) {
            console.log('[Learning] Auto-seeding Firestore paths collection...');
            await Promise.all(
              SEEDED_PATHS.map(p => FirestoreDB.setDocument('paths', p.id, p))
            );
            remotePaths = SEEDED_PATHS;
          }
          setPaths(remotePaths);
        }
      } catch (err) {
        console.error('[Learning] Collection seed failed:', err);
      } finally {
        setLoading(false);
      }
    };
    initializeLessonsAndPaths();
  }, [isMockFirebase]);

  // 2. Hydrate user-specific states when user changes
  useEffect(() => {
    const hydrateUserProgress = async () => {
      if (!user) {
        setSavedLessonIds([]);
        setDownloadedLessonIds([]);
        setCompletedLessonIds([]);
        setWeeklyActivity({});
        setActivePathState(null);
        return;
      }

      try {
        if (isMockFirebase) {
          const [saved, downloaded, completed, weekly] = await Promise.all([
            AsyncStorage.getItem(`saved_lessons_${user.uid}`),
            AsyncStorage.getItem(`downloaded_lessons_${user.uid}`),
            AsyncStorage.getItem(`completed_lessons_${user.uid}`),
            AsyncStorage.getItem(`weekly_activity_${user.uid}`)
          ]);

          if (saved) setSavedLessonIds(JSON.parse(saved));
          if (downloaded) setDownloadedLessonIds(JSON.parse(downloaded));
          if (completed) setCompletedLessonIds(JSON.parse(completed));
          if (weekly) setWeeklyActivity(JSON.parse(weekly));
        } else {
          const progressDoc = await FirestoreDB.getDocument<UserProgress>('progress', user.uid);
          if (progressDoc) {
            setSavedLessonIds(progressDoc.savedLessonIds || []);
            setDownloadedLessonIds(progressDoc.downloadedLessonIds || []);
            setCompletedLessonIds(progressDoc.completedLessonIds || []);
            setWeeklyActivity(progressDoc.weeklyActivity || {});

            if (progressDoc.pathProgress) {
              setPaths(prev => prev.map(p => ({
                ...p,
                progress: progressDoc.pathProgress[p.id] !== undefined ? progressDoc.pathProgress[p.id] : p.progress
              })));
            }
          } else {
            const defaultProgress: UserProgress = {
              userId: user.uid,
              completedLessonIds: [],
              pathProgress: {},
              savedLessonIds: [],
              downloadedLessonIds: [],
              streakCount: user.streak,
              weeklyActivity: {},
              updatedAt: new Date().toISOString()
            };
            await FirestoreDB.setDocument('progress', user.uid, defaultProgress);
          }
        }
      } catch (err) {
        console.error('[Learning] Failed to hydrate user progress:', err);
      }
    };
    hydrateUserProgress();
  }, [user, isMockFirebase]);

  const toggleSaveLesson = async (id: string) => {
    let nextSaved = [...savedLessonIds];
    if (nextSaved.includes(id)) {
      nextSaved = nextSaved.filter(x => x !== id);
    } else {
      nextSaved.push(id);
    }
    setSavedLessonIds(nextSaved);

    try {
      if (isMockFirebase) {
        if (user) await AsyncStorage.setItem(`saved_lessons_${user.uid}`, JSON.stringify(nextSaved));
        await AsyncStorage.setItem('saved_lessons', JSON.stringify(nextSaved));
      } else if (user) {
        await FirestoreDB.updateDocument('progress', user.uid, {
          savedLessonIds: nextSaved,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[Learning] Save bookmark error:', err);
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
      if (isMockFirebase) {
        if (user) await AsyncStorage.setItem(`downloaded_lessons_${user.uid}`, JSON.stringify(nextDown));
        await AsyncStorage.setItem('downloaded_lessons', JSON.stringify(nextDown));
      } else if (user) {
        await FirestoreDB.updateDocument('progress', user.uid, {
          downloadedLessonIds: nextDown,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[Learning] Save downloaded error:', err);
    }
  };

  const addCustomLesson = async (newLesson: MicroLesson) => {
    setLessons(prev => [newLesson, ...prev]);
    try {
      if (!isMockFirebase) {
        await FirestoreDB.setDocument('lessons', newLesson.id, newLesson);
      }
    } catch (err) {
      console.error('[Learning] Add custom lesson error:', err);
    }
  };

  const completeLesson = async (id: string) => {
    if (completedLessonIds.includes(id)) return;

    const nextCompleted = [...completedLessonIds, id];
    setCompletedLessonIds(nextCompleted);

    // Dynamic XP multiplier triggers inside AuthContext
    await updateUserXp(100);

    let pathId = '';
    let newProgress = 0;
    if (id === 'lesson_1') {
      pathId = 'path_ai';
      newProgress = 28;
    } else if (id === 'lesson_2') {
      pathId = 'path_comm';
      newProgress = 20;
    }

    if (pathId) {
      updatePathProgress(pathId, newProgress);
    }

    // Set daily heatmap activity
    const today = new Date().toISOString().split('T')[0];
    const nextWeekly = { ...weeklyActivity };
    nextWeekly[today] = (nextWeekly[today] || 0) + 100;
    setWeeklyActivity(nextWeekly);

    try {
      if (isMockFirebase) {
        if (user) {
          await Promise.all([
            AsyncStorage.setItem(`completed_lessons_${user.uid}`, JSON.stringify(nextCompleted)),
            AsyncStorage.setItem(`weekly_activity_${user.uid}`, JSON.stringify(nextWeekly))
          ]);
        }
        await AsyncStorage.setItem('completed_lessons', JSON.stringify(nextCompleted));
      } else if (user) {
        const progressDoc = await FirestoreDB.getDocument<UserProgress>('progress', user.uid);
        const currentPathProgress = progressDoc?.pathProgress || {};
        if (pathId) {
          currentPathProgress[pathId] = newProgress;
        }

        await FirestoreDB.updateDocument('progress', user.uid, {
          completedLessonIds: nextCompleted,
          pathProgress: currentPathProgress,
          weeklyActivity: nextWeekly,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[Learning] Complete lesson error:', err);
    }
  };

  const setActivePath = async (pathId: string | null) => {
    setActivePathState(pathId);
    try {
      await AsyncStorage.setItem('active_path_id', pathId || '');
    } catch (err) {
      console.error('[Learning] Set active path error:', err);
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
      completedLessonIds,
      weeklyActivity,
      toggleSaveLesson,
      toggleDownloadLesson,
      completeLesson,
      addCustomLesson,
      activePath,
      setActivePath,
      updatePathProgress,
      loading
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
