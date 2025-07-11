import { api } from '../api';

// Interface for user profile data
export interface UserProfileData {
  id: number;
  name: string;
  email: string;
  date_of_birth: string | null;
  height: number | null;
  weight: number | null;
  gender: string | null;
  ethnicity: string | null;
  typical_diet: string | null;
  food_allergies: string[] | null;
  dietary_preferences: string[] | null;
  meals_per_day: number | null;
  cooking_frequency: string | null;
  favorite_cuisines: string[] | null;
  favorite_foods: string | null;
  disliked_foods: string | null;
  bmr_measured: boolean | null;
  bmr_value: number | null;
  has_diabetes: boolean | null;
  diabetes_diagnosis: string | null;
  takes_medication: boolean | null;
  medications: string | null;
  is_pregnant_or_nursing: boolean | null;
  physical_activity_level: string | null;
  other_health_concerns: string | null;
  blood_sugar_goals: string[] | null;
  specific_goals: string | null;
  current_survey_step: number | null;
  survey_completed: boolean | null;
}

/**
 * Get the current logged-in user's profile data
 */
export const getCurrentUserProfile = async (): Promise<UserProfileData> => {
  try {
    const response = await api.get('/api/user/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw new Error('Failed to fetch user profile data');
  }
};

/**
 * Update the current user's profile data
 */
export const updateUserProfile = async (profileData: Partial<UserProfileData>): Promise<UserProfileData> => {
  try {
    const response = await api.put('/api/user/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile data');
  }
};

/**
 * Helper function to parse JSON strings safely
 */
export const safeParseJSON = <T>(jsonString: string | null, defaultValue: T): T => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return defaultValue;
  }
}; 