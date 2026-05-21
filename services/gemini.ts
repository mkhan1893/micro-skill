import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MicroLesson } from './types';
import { AICacheService } from './aiCache';

// Gemini API integration for live generation
// Supports API Key configuration in app or via env
const DEFAULT_GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const getApiKey = async (): Promise<string> => {
  try {
    const savedKey = await AsyncStorage.getItem('user_gemini_key');
    return savedKey || DEFAULT_GEMINI_KEY;
  } catch {
    return DEFAULT_GEMINI_KEY;
  }
};

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// RPG Personalization Compiler
export const PersonalizationPromptBuilder = {
  buildSystemInstruction: (profile: UserProfile | null, mode: 'lesson' | 'tutor' | 'quiz'): string => {
    const interests = profile?.interests && profile.interests.length > 0 
      ? profile.interests.join(', ') 
      : 'AI & Machine Learning, Public Speaking, Finance, Productivity Hacks, Entrepreneurship';
    const skillLevel = profile?.skillLevel || 'Intermediate';
    const streak = profile?.streak || 1;
    const level = profile?.level || 1;

    if (mode === 'tutor') {
      return `You are the MICRO SKILL AI Tutor. A futuristic, ultra-intelligent, friendly personal coach.
The student is currently at level ${level} with an active learning streak of ${streak} days.
Their chosen interests are: ${interests}.
Their current cognitive and technical skill level is: ${skillLevel}.

CRITICAL STYLE RULES:
1. Keep explanations highly cinematic, extremely concise (maximum 3 short paragraphs), and beautifully structured in standard Markdown.
2. Adapt vocabulary, metaphor choice, and technical depth perfectly for a ${skillLevel} level student. 
   - For Beginners: Use simple real-world analogies, high-impact metaphors, and explain technical terms from scratch.
   - For Intermediate: Use brief explanations of concepts, practical applications, and slightly advanced tips.
   - For Advanced: Skip basic definitions. Use precise technical jargon, provide syntactically dense insights, and discuss trade-offs or high-performance mechanics.
3. Keep the tone highly motivational, acknowledging their streak (${streak} days) and encouraging continuous growth.
4. Always end your message with a direct, high-value practice question or an active conceptual challenge. Use markdown lists where appropriate.`;
    } else if (mode === 'lesson') {
      return `You are the MICRO SKILL AI Lesson Compiler. You generate premium, high-value, highly addictive cinematic micro-lessons.
The student's chosen interests are: ${interests}.
Tailor the explanation perfectly for a ${skillLevel} student.

CRITICAL CONTENT & FORMATTING RULES:
1. Structure the lesson content perfectly for a mobile vertical swipe card screen.
2. Limit the markdown text to a maximum of 3 highly-focused paragraphs or bullet sections. Use bold terms to highlight core technical terms or concepts.
3. Avoid generalities. Provide high-impact, actionable mental models, frameworks, or code snippets.
4. Scale explanations based on the student's skill level (${skillLevel}):
   - Beginner: Focus on high-metaphor, simplified, zero-dependency explanations.
   - Intermediate: Focus on typical real-world workflows, intermediate tips, and core tools.
   - Advanced: Focus on high-performance trade-offs, advanced syntax, and underlying mechanisms.
5. Create a brilliant, challenging multiple-choice quiz question related to the lesson. Ensure it tests conceptual understanding, not trivial recall.
6. Provide a concise glassmorphic revision flashcard (front and back) that summarizes the core lesson takeaway in one sentence.
7. Output strictly a single JSON object. Ensure correct double-quoting and structural integrity. Do NOT wrap in markdown block wrappers like \`\`\`json.`;
    } else {
      return `You are the MICRO SKILL AI Quiz Generator. You create high-value, conceptually challenging multiple-choice questions.
The student's interests: ${interests}.
Target student level: ${skillLevel}.

Generate a quiz question that matches their skill level (${skillLevel}). Beginners should get foundational concepts with clear clues. Advanced students should get challenging conceptual scenarios with convincing distractors.
Output strictly a single JSON object. Ensure correct double-quoting. Do NOT wrap in markdown block wrappers.`;
    }
  }
};

export const GeminiService = {
  // Chat Tutor Session
  sendTutorMessage: async (
    history: ChatMessage[],
    messageText: string,
    profile: UserProfile | null = null
  ): Promise<string> => {
    // 1. Check Cache first
    const cachedReply = await AICacheService.getCachedTutorResponse(messageText);
    if (cachedReply) {
      console.log("[GeminiService] Cache hit for AI Tutor response.");
      return cachedReply;
    }

    const key = await getApiKey();
    if (!key) {
      console.log("[GeminiService] No API key, triggering high-fidelity simulator.");
      return simulateTutorResponse(messageText, profile);
    }

    const systemText = PersonalizationPromptBuilder.buildSystemInstruction(profile, 'tutor');

    try {
      const contents = history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));
      contents.push({
        role: 'user',
        parts: [{ text: messageText }]
      });

      const responseText = await AICacheService.runWithRetry(async () => {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800
            },
            systemInstruction: {
              parts: [{ text: systemText }]
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API Tutor request failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      });

      if (responseText) {
        // Cache successful response
        await AICacheService.cacheTutorResponse(messageText, responseText);
        return responseText;
      }
      return "I was unable to retrieve a response. Please verify your connection.";
    } catch (err) {
      console.error("Gemini API call failed, falling back to simulator", err);
      return simulateTutorResponse(messageText, profile);
    }
  },

  // AI Quiz Generator
  generateQuiz: async (
    topic: string,
    profile: UserProfile | null = null
  ): Promise<{
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }> => {
    const key = await getApiKey();
    const systemText = PersonalizationPromptBuilder.buildSystemInstruction(profile, 'quiz');
    const prompt = `Generate a highly engaging, multiple-choice quiz question about: "${topic}".
    Tailor this quiz specifically for a "${profile?.skillLevel || 'Intermediate'}" student.
    Format the response strictly as a JSON object, without markdown blocks.
    JSON structure:
    {
      "question": "Clear, engaging question text matching their level",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0, // 0-indexed correct option index
      "explanation": "Brief, brilliant explanation of the answer"
    }`;

    if (!key) {
      return simulateQuizResponse(topic, profile);
    }

    try {
      const resultText = await AICacheService.runWithRetry(async () => {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
            systemInstruction: {
              parts: [{ text: systemText }]
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API Quiz request failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text;
      });

      return JSON.parse(resultText);
    } catch (err) {
      console.error("Quiz gen failed, falling back to mock", err);
      return simulateQuizResponse(topic, profile);
    }
  },

  // AI Micro Lesson Generator
  generateLesson: async (
    topic: string,
    profile: UserProfile | null = null
  ): Promise<MicroLesson> => {
    // 1. Check Caches first (Local-first then global central cache)
    const cachedLesson = await AICacheService.getCachedLesson(topic);
    if (cachedLesson) {
      console.log(`[GeminiService] Cache hit for lesson: ${topic}`);
      return cachedLesson;
    }

    const key = await getApiKey();
    const systemText = PersonalizationPromptBuilder.buildSystemInstruction(profile, 'lesson');
    
    const prompt = `Create a premium, high-value, cinematic micro-lesson about: "${topic}".
    Tailor this lesson specifically for a "${profile?.skillLevel || 'Intermediate'}" student.
    Format your response strictly as a JSON object, without markdown blocks.
    JSON structure:
    {
      "title": "Inspiring Lesson Title",
      "description": "Short 1-sentence hook explaining why this matters",
      "duration": "1m",
      "difficulty": "${profile?.skillLevel || 'Intermediate'}",
      "tags": ["Tech", "Concepts"],
      "xpReward": 100,
      "summary": "1-3 concise bullet points summarizing the lesson",
      "contentMarkdown": "### [Bold Header]\\n\\n[Paragraph 1 with bold terms]\\n\\n* **[Bullet Point 1]**: [Detail]\\n* **[Bullet Point 2]**: [Detail]\\n\\n[Paragraph 2 closing]",
      "flashcard": {
        "front": "Short question or prompt summarizing the core concept (e.g. 'What is the R-C-O Prompt formula?')",
        "back": "High-value, concise answer or explanation"
      },
      "quiz": {
        "question": "One simple challenge question related to this lesson",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answerIndex": 0,
        "explanation": "Why this answer is correct and why the others are false"
      }
    }`;

    if (!key) {
      console.log("[GeminiService] No API key, generating simulator lesson.");
      const mockLesson = simulateLessonResponse(topic, profile);
      await AICacheService.cacheLesson(topic, mockLesson);
      return mockLesson;
    }

    try {
      const resultText = await AICacheService.runWithRetry(async () => {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
            systemInstruction: {
              parts: [{ text: systemText }]
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Gemini API Lesson request failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text;
      });

      const parsed = JSON.parse(resultText);
      const generatedLesson: MicroLesson = {
        id: `lesson_ai_${Date.now()}`,
        title: parsed.title || `Master ${topic}`,
        category: profile?.interests?.[0] || 'AI & Tech',
        description: parsed.description || `A 30-second AI-generated deep dive.`,
        duration: parsed.duration || '1m',
        creatorName: 'AI Engine',
        creatorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=128&auto=format&fit=crop',
        imageBg: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=512&auto=format&fit=crop',
        contentMarkdown: parsed.contentMarkdown || 'Content compiled successfully.',
        likes: Math.floor(Math.random() * 200) + 50,
        commentsCount: Math.floor(Math.random() * 30) + 5,
        difficulty: parsed.difficulty || (profile?.skillLevel as any) || 'Intermediate',
        tags: parsed.tags || [topic, 'AI Compiled'],
        xpReward: parsed.xpReward || 100,
        weakPointsAddressed: [],
        summary: parsed.summary || 'Summary compiled successfully.',
        flashcard: parsed.flashcard || {
          front: `What is the core concept of ${topic}?`,
          back: `The primary framework surrounding ${topic}.`
        },
        quiz: parsed.quiz || {
          question: `Which of the following is core to ${topic}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          answerIndex: 0,
          explanation: 'Standard foundational choice matches expectations.'
        },
        createdAt: new Date().toISOString()
      };

      // Cache globally and locally
      await AICacheService.cacheLesson(topic, generatedLesson);
      return generatedLesson;
    } catch (err) {
      console.error("Lesson generation failed, falling back to simulator", err);
      const fallbackLesson = simulateLessonResponse(topic, profile);
      // Cache the fallback so we don't spam the failing endpoint
      await AICacheService.cacheLesson(topic, fallbackLesson);
      return fallbackLesson;
    }
  }
};

// SIMULATORS FOR INSTANT RUNTIME
function simulateTutorResponse(msg: string, profile: UserProfile | null): string {
  const query = msg.toLowerCase();
  const skill = profile?.skillLevel || 'Intermediate';
  const streak = profile?.streak || 1;

  let header = `### 🧠 AI Tutor Session (${skill} Level)\n*Current Streak: ${streak} Days! Keep it up!* \n\n`;

  if (query.includes('ai') || query.includes('neural') || query.includes('machine learning')) {
    if (skill === 'Beginner') {
      return header + `Neural networks are like virtual sorting machines in our computer:
1. **Inputs (Eyes)**: We feed the computer images of apples.
2. **Hidden Layers (Brain cells)**: The computer looks at shapes (roundness, colors).
3. **Outputs (Decisions)**: The computer shouts "It's an apple!"

*Practice question: What would a neural network look for first to identify a banana?*`;
    } else if (skill === 'Advanced') {
      return header + `Neural network training scales via optimization loops:
1. **Weights & Biases**: Parameters modulated inside linear layers ($y = Wx + b$).
2. **Backpropagation**: Auto-diff engines computing partial derivatives ($\partial L / \partial W$) backwards via chain rules.
3. **Adam Optimizer**: Combines momentum and adaptive gradients to avoid saddle points.

*Practice challenge: How do we mitigate vanishing gradient bottlenecks in deep recurrent layers?*`;
    } else {
      return header + `Neural networks function via feedforward connections:
1. **Inputs & weights**: Values multiplied by weights representing connection strength.
2. **Activations (ReLU)**: Calculates $f(x) = \max(0, x)$ to model non-linear boundaries.
3. **Loss minimization**: Calculates deviation and updates values to correct errors.

*Practice question: Why do we need non-linear activations like ReLU instead of only linear equations?*`;
    }
  }

  if (query.includes('code') || query.includes('react') || query.includes('expo') || query.includes('web')) {
    if (skill === 'Beginner') {
      return header + `Coding is just writing super clear recipes for your phone:
* **HTML/JSX**: The ingredients list (text, buttons, images).
* **CSS/Styling**: Making the plate look beautiful (colors, spacing, glassmorphic filters).
* **Javascript/Logic**: What happens when a user clicks the button.

*Quick challenge: Which component lists the items on screen: text, button, or input?*`;
    } else if (skill === 'Advanced') {
      return header + `Expo Router resolves navigation in a Hermetic React Native run-time:
* **File-based Routing**: Root folders map to layout routers using Expo's standard configuration.
* **Hook Stability**: Ensure \`useEffect\` runs only inside safe navigation events to prevent memory leaks.
* **Thread decoupling**: Offload massive lists or canvas calculations to custom native components using \`useAnimatedStyle\`.

*Advanced question: How do you prevent layout re-render loops in nested stack navigators?*`;
    } else {
      return header + `Expo Router makes dynamic screen links super clean:
* ` + "`app/_layout.tsx`" + `: Defines our navigation drawer or tab headers.
* ` + "`app/(tabs)/index.tsx`" + `: The active landing layout file.
* ` + "`useLocalSearchParams`" + `: Extracts query variables from URL paths.

*Practice question: Which directory holds the global layouts: /app or /assets?*`;
    }
  }

  return header + `Welcome, Pioneer! 🚀
I am your **MICRO SKILL AI Tutor**. I customize complex topics instantly depending on your interests.

Tell me what topic you want to learn:
* \"Explain Blockchain consensus algorithms\"
* \"Teach me Public Speaking body language\"
* \"Give me a coding deep-dive\"`;
}

function simulateQuizResponse(topic: string, profile: UserProfile | null): any {
  const skill = profile?.skillLevel || 'Intermediate';
  
  if (skill === 'Beginner') {
    return {
      question: `What is the primary function of ${topic || 'decentralized tech'}?`,
      options: [
        'To safely store and share digital records without a single leader',
        'To speed up standard computer internet connections',
        'To make computer games load faster',
        'To send emails with secure passwords'
      ],
      answerIndex: 0,
      explanation: 'Decentralized systems allow safe coordination and record-keeping without needing a central manager like a bank.'
    };
  } else if (skill === 'Advanced') {
    return {
      question: `Under extreme network latency, which consensus trade-off governs ${topic || 'distributed state machines'}?`,
      options: [
        'CAP Theorem: Consistency vs Availability under Partition toleration',
        'Symmetric cryptography encryption overhead expansion',
        'Memory stack leaks in virtual machines during compilation',
        'Bandwidth limit scaling under local state compression'
      ],
      answerIndex: 0,
      explanation: 'The CAP Theorem dictates that a distributed system cannot simultaneously guarantee absolute consistency and availability when partitions happen.'
    };
  } else {
    return {
      question: `What is a primary benefit of using ${topic || 'decentralized structures'}?`,
      options: [
        'Eliminating central failure points and increasing censorship resistance',
        'Reducing physical power and cooling costs',
        'Guaranteeing instant transaction speeds globally',
        'Providing free server space for all connected devices'
      ],
      answerIndex: 0,
      explanation: 'Decentralization removes central failure nodes, making it nearly impossible for a single point of failure to take down the entire network.'
    };
  }
}

function simulateLessonResponse(topic: string, profile: UserProfile | null): MicroLesson {
  const skill = profile?.skillLevel || 'Intermediate';
  const interests = profile?.interests?.[0] || 'AI & Machine Learning';

  let title = `Master ${topic || 'Liquid Staking'}`;
  let desc = `Learn the underlying mechanics of ${topic || 'DeFi yield compounding'} in 30 seconds.`;
  let bullets: string[] = [];
  let summary = '';
  let flashcard = { front: '', back: '' };
  let quiz = { question: '', options: [] as string[], answerIndex: 0, explanation: '' };

  if (skill === 'Beginner') {
    bullets = [
      `**Digital Renting**: Instead of locking your tokens away like money in a vault, liquid staking lets you wrap them so they stay active.`,
      `**Double Rewards**: You earn interest from staking AND you can use the new wrapped tokens to trade or play elsewhere.`,
      `**Safety first**: Staking helps secure the network, but if the main validator node makes mistakes, you can lose a tiny fraction.`
    ];
    summary = `Liquid staking lets you earn secure interest on your tokens while keeping them unlocked and usable for trading.`;
    flashcard = {
      front: `What is liquid staking in simple terms?`,
      back: `Earning interest on tokens while keeping them unlocked as wrapped tradable tokens.`
    };
    quiz = {
      question: `What does liquid staking let you do with staked tokens?`,
      options: [
        'Keep them unlocked and tradable as wrapped assets',
        'Lock them permanently for 10 years',
        'Delete them from the network to save space',
        'Convert them into physical paper coupons'
      ],
      answerIndex: 0,
      explanation: 'Liquid staking gives you a wrapped token (like stETH) representing your staked funds so you can still trade it.'
    };
  } else if (skill === 'Advanced') {
    bullets = [
      `**Derivative Capital Efficiency**: Liquid protocols mint tokenized derivative notes (e.g. stETH) peg-linked to staked native collateral ($ETH$).`,
      `**Lending Loop Arbitrage**: Compound yields by depositing yield-bearing stETH into credit pools (Aave) to borrow native stablecoins.`,
      `**Slashing & Correlation Risks**: Severe penalty risks occur when network validators misbehave, creating correlation downgrades on wrapped pegs.`
    ];
    summary = `Advanced liquid staking compound yields using leveraged credit loops but carries severe slashing correlation peg risks.`;
    flashcard = {
      front: `What is the primary risk of leveraged liquid staking credit loops?`,
      back: `Slashing events that trigger liquidation cascades in secondary pools due to peg correlation breaks.`
    };
    quiz = {
      question: `Which architectural issue is most critical in highly leveraged liquid staking derivative loops?`,
      options: [
        'Correlation peg break cascades during slashing events',
        'Basic database transaction speed delays',
        'Standard wallet connection timeouts',
        'Simple block size memory constraints'
      ],
      answerIndex: 0,
      explanation: 'If a validator gets slashed, the derivative peg breaks, triggering massive liquidation cascades in lending pools.'
    };
  } else {
    bullets = [
      `**Wrapped Assets**: Mint wrapped tokens (e.g. stETH) representing locked capital to keep funds liquid.`,
      `**Yield Stacking**: Earn baseline staking yields while investing the wrapped assets in other decentralized systems.`,
      `**Slashing Risks**: If validators commit consensus errors, your underlying capital gets docked.`
    ];
    summary = `Liquid staking mints wrapped assets to earn compound yields on locked tokens, subject to validator slashing risks.`;
    flashcard = {
      front: `What is a liquid staking wrapped token?`,
      back: `A token representing staked capital that remains fully tradable and liquid.`
    };
    quiz = {
      question: `What does a wrapped staking token represent?`,
      options: [
        'A locked vault key',
        'A tradable token representing staked capital',
        'An energy grid validator license',
        'A basic computer database table entry'
      ],
      answerIndex: 1,
      explanation: 'Wrapped tokens give you a tradable asset that represents and tracks your staked funds on the main network.'
    };
  }

  const contentMarkdown = `### 📈 Liquid Staking Protocol

Instead of locked capital, liquid protocols mint wrapped assets to represent stakes:

1. ${bullets[0]}
2. ${bullets[1]}
3. ${bullets[2]}`;

  return {
    id: `lesson_sim_${Date.now()}`,
    title,
    category: interests,
    description: desc,
    duration: '1m',
    creatorName: 'AI Engine',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&auto=format&fit=crop',
    imageBg: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=512&auto=format&fit=crop',
    contentMarkdown,
    likes: 312,
    commentsCount: 22,
    difficulty: skill as any,
    tags: [topic || 'Staking', 'Crypto', skill],
    xpReward: 100,
    summary,
    flashcard,
    quiz,
    createdAt: new Date().toISOString()
  };
}
