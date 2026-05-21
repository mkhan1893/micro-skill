/**
 * MICRO SKILL Progression & Gamification Engine
 * High-performance, mathematical formulas for levels, XP, and reward streaks.
 */

export const ProgressionEngine = {
  /**
   * Quadratic leveling curve.
   * Total XP threshold for Level L is L * (L - 1) * 250
   * Level 1: 0 XP
   * Level 2: 500 XP
   * Level 3: 1,500 XP
   * Level 4: 3,000 XP
   * Level 5: 5,000 XP
   */
  getLevelFromXp: (xp: number): number => {
    if (xp <= 0) return 1;
    let level = 1;
    while (xp >= level * (level + 1) * 250) {
      level++;
    }
    return level;
  },

  /**
   * Returns the exact total XP required to reach the start of a given level.
   */
  getXpForLevel: (level: number): number => {
    if (level <= 1) return 0;
    return (level - 1) * level * 250;
  },

  /**
   * Calculates current level progress stats, returning relative XP and percentage.
   */
  getXpProgressForLevel: (xp: number): { currentLevelXp: number; nextLevelXp: number; percent: number } => {
    const level = ProgressionEngine.getLevelFromXp(xp);
    const levelStart = ProgressionEngine.getXpForLevel(level);
    const levelEnd = ProgressionEngine.getXpForLevel(level + 1);
    const currentLevelXp = xp - levelStart;
    const nextLevelXp = levelEnd - levelStart;
    const percent = Math.min(100, Math.max(0, Math.floor((currentLevelXp / nextLevelXp) * 100)));
    return { currentLevelXp, nextLevelXp, percent };
  },

  /**
   * XP Gain formula factoring in active streaks and premium subscription status.
   */
  calculateXpGain: (baseXp: number, streak: number, isPremium: boolean): number => {
    // 10% bonus per streak day up to 50% max bonus (at streak >= 6)
    const streakMultiplier = 1 + Math.min(0.5, Math.max(0, streak - 1) * 0.1);
    // Double XP for premium accounts
    const premiumMultiplier = isPremium ? 2.0 : 1.0;
    return Math.round(baseXp * streakMultiplier * premiumMultiplier);
  },

  /**
   * Award coin payouts depending on level up triggers.
   */
  calculateLevelUpCoins: (newLevel: number): number => {
    return newLevel * 50; // Level 2 gets 100, Level 5 gets 250, etc.
  },

  /**
   * Dynamic badges and achievements checking system.
   * Compares current stats against specific micro milestones.
   */
  checkMilestones: (xp: number, streak: number, completedCount: number): string[] => {
    const badges: string[] = [];

    // XP Milestones
    if (xp >= 100) badges.push('Pioneer');
    if (xp >= 1500) badges.push('Scholar');
    if (xp >= 5000) badges.push('Grandmaster');
    if (xp >= 15000) badges.push('Neural Sage');

    // Streak Milestones
    if (streak >= 3) badges.push('Consistent');
    if (streak >= 7) badges.push('Unstoppable');
    if (streak >= 30) badges.push('Hyperfocus');

    // Completions Milestones
    if (completedCount >= 1) badges.push('First Byte');
    if (completedCount >= 5) badges.push('Prodigy');
    if (completedCount >= 15) badges.push('Polymath');
    if (completedCount >= 50) badges.push('Omniscient');

    return badges;
  }
};
