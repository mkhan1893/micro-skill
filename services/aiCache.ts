import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirestoreDB, isMockFirebase } from './firebase';
import { MicroLesson } from './types';

// Topic normalization key for local cache
const getCacheKey = (topic: string): string => {
  return `ai_lesson_cache_${topic.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
};

export const AICacheService = {
  // Save a generated lesson to both AsyncStorage and Firestore (global central cache)
  cacheLesson: async (topic: string, lesson: MicroLesson): Promise<void> => {
    try {
      const cacheKey = getCacheKey(topic);
      // 1. Save locally
      await AsyncStorage.setItem(cacheKey, JSON.stringify(lesson));

      // 2. Save to global central cache on Firestore so other users can discover pre-compiled skills
      if (!isMockFirebase) {
        await FirestoreDB.setDocument('lessons', lesson.id, lesson);
        console.log(`[AICache] Lesson cached globally in Firestore: ${lesson.id}`);
      }
    } catch (err) {
      console.warn('[AICache] Failed to cache lesson:', err);
    }
  },

  // Retrieve a lesson from cache (local-first, then Firestore global search, then null)
  getCachedLesson: async (topic: string): Promise<MicroLesson | null> => {
    try {
      const cacheKey = getCacheKey(topic);
      
      // 1. Check local AsyncStorage first
      const localCached = await AsyncStorage.getItem(cacheKey);
      if (localCached) {
        console.log(`[AICache] Local cache hit for topic: ${topic}`);
        return JSON.parse(localCached);
      }

      // 2. Check global Firestore central cache (search by category or title keywords)
      if (!isMockFirebase) {
        console.log(`[AICache] Local cache miss. Querying global Firestore cache for: ${topic}`);
        const allLessons = await FirestoreDB.getCollection<MicroLesson>('lessons');
        const normalizedTopic = topic.toLowerCase();
        
        // Find best match in pre-existing lessons
        const matched = allLessons.find(lesson => 
          lesson.title.toLowerCase().includes(normalizedTopic) ||
          lesson.category.toLowerCase().includes(normalizedTopic) ||
          lesson.description.toLowerCase().includes(normalizedTopic)
        );

        if (matched) {
          console.log(`[AICache] Firestore central cache hit for: ${topic}`);
          // Save to local cache for next time
          await AsyncStorage.setItem(cacheKey, JSON.stringify(matched));
          return matched;
        }
      }
    } catch (err) {
      console.warn('[AICache] Error checking cached lesson:', err);
    }
    return null;
  },

  // Cache AI Chat Tutor response
  cacheTutorResponse: async (messageText: string, replyText: string): Promise<void> => {
    try {
      const cacheKey = `ai_tutor_reply_${messageText.trim().toLowerCase().slice(0, 50).replace(/[^a-z0-9]/g, '_')}`;
      await AsyncStorage.setItem(cacheKey, replyText);
    } catch (err) {
      console.warn('[AICache] Failed to cache tutor response:', err);
    }
  },

  // Get cached AI Chat Tutor response
  getCachedTutorResponse: async (messageText: string): Promise<string | null> => {
    try {
      const cacheKey = `ai_tutor_reply_${messageText.trim().toLowerCase().slice(0, 50).replace(/[^a-z0-9]/g, '_')}`;
      return await AsyncStorage.getItem(cacheKey);
    } catch {
      return null;
    }
  },

  // Resilient exponential backoff retry runner for API calls
  runWithRetry: async <T>(apiCall: () => Promise<T>, maxRetries = 3, initialDelayMs = 1000): Promise<T> => {
    let delay = initialDelayMs;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (err: any) {
        // If we hit rate limiting (429) or server errors, retry
        const isRateLimit = err?.status === 429 || err?.message?.includes('429') || JSON.stringify(err).includes('429');
        const isNetworkOrServer = !err?.status || err?.status >= 500;
        
        if ((isRateLimit || isNetworkOrServer) && attempt < maxRetries) {
          console.warn(`[AICache Retry] Attempt ${attempt} failed (Rate limited or network issue). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
        } else {
          throw err;
        }
      }
    }
    throw new Error('API call failed after max retries');
  }
};
