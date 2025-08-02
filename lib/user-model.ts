//lib/user-model.ts
import { getUserById } from '@/db/queries';

import { getGeminiModelForPlan } from './ai-models';

/**
 * Get the appropriate AI model for a user based on their current plan
 * This ensures we always use the latest plan information from the database
 */
export async function getUserAIModel(userId: string): Promise<string> {
  try {
    const user = await getUserById(userId);
    if (!user) {
      console.warn(`User ${userId} not found, defaulting to free model`);
      return getGeminiModelForPlan('free');
    }

    const userPlan = user.plan || 'Free';
    // console.log(`User ${userId} has plan: ${userPlan}`);
    
    return getGeminiModelForPlan(userPlan);
  } catch (error) {
    console.error(`Error getting user model for ${userId}:`, error);
    // Fallback to free model in case of error
    return getGeminiModelForPlan('free');
  }
}

/**
 * Check if user has access to advanced features based on their plan
 */
export async function userHasAdvancedFeatures(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    if (!user) return false;
    
    const plan = (user.plan || 'Free').toLowerCase();
    return plan === 'pro' || plan === 'advanced';
  } catch {
    return false;
  }
}

/**
 * Check if user has access to premium features (Advanced plan only)
 */
export async function userHasPremiumFeatures(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    if (!user) return false;
    
    const plan = (user.plan || 'Free').toLowerCase();
    return plan === 'advanced';
  } catch {
    return false;
  }
}