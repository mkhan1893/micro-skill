import AsyncStorage from '@react-native-async-storage/async-storage';

// Gemini API integration for live generation
// Supports API Key configuration in app or via env

const DEFAULT_GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const getApiKey = async () => {
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

export const GeminiService = {
  // Chat Tutor Session
  sendTutorMessage: async (history: ChatMessage[], messageText: string): Promise<string> => {
    const key = await getApiKey();
    if (!key) {
      // Return beautiful, smart simulator response
      return simulateTutorResponse(messageText);
    }

    try {
      const contents = history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }));
      contents.push({
        role: 'user',
        parts: [{ text: messageText }]
      });

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
            parts: [{ text: "You are the MICRO SKILL AI Tutor. A futuristic, ultra-intelligent, friendly personal coach. Keep your explanations cinematic, concise, highly structured in markdown, and emotionally encouraging. Always end your message with a direct, high-value practice question or a quick challenge chip suggestion." }]
          }
        })
      });

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to retrieve a response. Please verify your connection.";
    } catch (err) {
      console.error("Gemini API call failed, falling back to simulator", err);
      return simulateTutorResponse(messageText);
    }
  },

  // AI Quiz Generator
  generateQuiz: async (topic: string): Promise<{
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }> => {
    const key = await getApiKey();
    const prompt = `Generate a highly engaging, multiple-choice quiz question about: "${topic}". 
    Format the response strictly as a JSON object, without markdown blocks.
    JSON structure:
    {
      "question": "Clear, engaging question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0, // 0-indexed number of the correct option
      "explanation": "Brief, brilliant explanation of the answer"
    }`;

    if (!key) {
      return simulateQuizResponse(topic);
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(text);
    } catch (err) {
      console.error("Quiz gen failed, falling back to mock", err);
      return simulateQuizResponse(topic);
    }
  },

  // AI Micro Lesson Generator
  generateLesson: async (topic: string): Promise<{
    title: string;
    description: string;
    duration: string;
    contentMarkdown: string;
    quiz: {
      question: string;
      options: string[];
      answerIndex: number;
      explanation: string;
    }
  }> => {
    const key = await getApiKey();
    const prompt = `Create a premium, high-value, cinematic micro-lesson about: "${topic}". 
    Structure it perfectly for a mobile card screen in 3 paragraphs maximum with bold headers.
    Format your response strictly as a JSON object with this shape:
    {
      "title": "Inspiring Lesson Title",
      "description": "Short 1-sentence hook",
      "duration": "1m",
      "contentMarkdown": "### Markdown text with bullets, bold terms",
      "quiz": {
        "question": "One simple challenge question",
        "options": ["A", "B", "C", "D"],
        "answerIndex": 0,
        "explanation": "Why this answer is correct"
      }
    }`;

    if (!key) {
      return simulateLessonResponse(topic);
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(text);
    } catch (err) {
      console.error("Lesson generation failed, falling back to simulator", err);
      return simulateLessonResponse(topic);
    }
  }
};

// SIMULATORS FOR INSTANT RUNTIME
function simulateTutorResponse(msg: string): string {
  const query = msg.toLowerCase();
  
  if (query.includes('ai') || query.includes('neural')) {
    return `### 🧠 Neural Architectures Explained

Neural networks are mathematical approximations of brain structures. They function via:
1. **Inputs (Weights & Biases)**: Values multiplied by connection strengths.
2. **Activation Functions (ReLU / Sigmoid)**: Threshold calculations determining if a node "fires".
3. **Backpropagation**: Gradient descent algorithms that adjust values in reverse to minimize mistakes.

*Would you like to build a quick AI prompt model or run a quiz?*`;
  }

  if (query.includes('code') || query.includes('react') || query.includes('expo')) {
    return `### ⚡ High Performance Expo Routing

Expo Router uses your file hierarchy to build your stack routes dynamically:
* \`app/_layout.tsx\`: The root context anchor.
* \`app/(tabs)/index.tsx\`: Tab screen index.
* \`app/screens/settings.tsx\`: Deep nested slide.

*Challenge: How do you declare a dynamic slug route in Expo Router? Try typing it in.*`;
  }

  return `### Hello Pioneer! 🚀

I am your **MICRO SKILL Copilot**. I can explain coding, public speaking, finance, or neural networks in 30 seconds!

What skill are we going to master today?
* \"Teach me the basics of Blockchain\"
* \"Give me a Public Speaking tips card\"
* \"Generate a Coding lesson\"`;
}

function simulateQuizResponse(topic: string): any {
  return {
    question: `What is the primary scaling bottleneck in modern block networks like ${topic || 'decentralized tech'}?`,
    options: ['Latency consensus delay', 'Cryptography complexity', 'Storage capacity overflow', 'Network electrical power'],
    answerIndex: 0,
    explanation: 'Consensus delays from verifying transactions globally limit speed before network capacity hits thresholds.'
  };
}

function simulateLessonResponse(topic: string): any {
  return {
    title: `Master ${topic || 'DeFi Yield Optimization'}`,
    description: `A 30-second breakdown of advanced concepts.`,
    duration: '1m',
    contentMarkdown: `### 📈 Liquid Staking Protocol

Instead of locked capital, liquid protocols mint wrapped assets (e.g. stETH) to represent stakes:
1. **Capital Utility**: Earn block yield while trading assets.
2. **Leverage Loop**: Supply liquid assets to lend-borrow pools for compounded yields.
3. **Validator Slashing Risk**: If the validator makes mistakes, your underlying asset gets docked.`,
    quiz: {
      question: 'What is a liquid staking token?',
      options: [
        'A locked vault key',
        'A tradable wrapped token representing staked capital',
        'An energy grid credit token',
        'A smart contract validator'
      ],
      answerIndex: 1,
      explanation: 'Liquid tokens let users leverage their staked value in secondary financial markets.'
    }
  };
}
