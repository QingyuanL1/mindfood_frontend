import { UserProfileData } from './userProfileService';
import { formatDatabaseValue } from './databaseService';
import { api } from '../api';

// Check if we're in development mode
const isDevelopment = (): boolean => {
  // Use the window object to determine if we're in development
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

/**
 * Extracts and processes all profile data for the current user
 * Uses the same approach as Dashboard and Sidebar components
 */
export const extractCurrentUserProfileData = async (): Promise<UserProfileData> => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.log("No authentication token found");
      if (isDevelopment()) {
        console.warn('Using mock user data as fallback');
        return getMockUserData();
      }
      throw new Error("Authentication required");
    }

    // 使用统一的 api 实例发送请求
    const profileResponse = await api.get("/api/user/profile");

    if (!profileResponse.data) {
      throw new Error("Failed to fetch profile data");
    }

    console.log("User profile data retrieved:", profileResponse.data);
    
    // Process the data to ensure all fields are properly formatted
    return processUserData(profileResponse.data);
  } catch (error) {
    console.error('Error extracting current user profile data:', error);
    // If we fail to fetch from API, use mock data in development
    if (isDevelopment()) {
      console.warn('Using mock user data as fallback');
      return getMockUserData();
    }
    throw new Error('Failed to extract user profile data');
  }
};

/**
 * Provides mock user data for development environment
 */
const getMockUserData = (): UserProfileData => {
  return {
    id: 1,
    name: "Max",
    email: "themaxkern@gmail.com",
    date_of_birth: "2006-04-12",
    height: 170.0,
    weight: 70.0,
    gender: "Female",
    ethnicity: "White",
    typical_diet: "Other (please specify)",
    food_allergies: ["None"],
    dietary_preferences: ["None"],
    meals_per_day: 3,
    cooking_frequency: "ONCE_DAILY",
    favorite_cuisines: ["Asian"],
    favorite_foods: "Chicken",
    disliked_foods: "Fish",
    bmr_measured: false,
    bmr_value: null,
    has_diabetes: false,
    diabetes_diagnosis: "None",
    takes_medication: true,
    medications: "",
    is_pregnant_or_nursing: false,
    physical_activity_level: "LIGHTLY_ACTIVE",
    other_health_concerns: "",
    blood_sugar_goals: ["Reduce the frequency of hyperglycemic or hypoglycemic episodes"],
    specific_goals: "",
    current_survey_step: 26,
    survey_completed: true
  };
};

/**
 * Process and format all user data fields
 */
const processUserData = (userData: any): UserProfileData => {
  // For fields that might not be in the response, provide defaults
  const processedData: UserProfileData = {
    id: userData.id || 0,
    name: userData.name || '',
    email: userData.email || '',
    date_of_birth: userData.date_of_birth || null,
    height: userData.height || null,
    weight: userData.weight || null,
    gender: userData.gender || null,
    ethnicity: userData.ethnicity || null,
    typical_diet: userData.typical_diet || null,
    food_allergies: userData.food_allergies ? 
      (Array.isArray(userData.food_allergies) ? userData.food_allergies : JSON.parse(userData.food_allergies || '[]')) : null,
    dietary_preferences: userData.dietary_preferences ?
      (Array.isArray(userData.dietary_preferences) ? userData.dietary_preferences : JSON.parse(userData.dietary_preferences || '[]')) : null,
    meals_per_day: userData.meals_per_day || null,
    cooking_frequency: userData.cooking_frequency || null,
    favorite_cuisines: userData.favorite_cuisines ?
      (Array.isArray(userData.favorite_cuisines) ? userData.favorite_cuisines : JSON.parse(userData.favorite_cuisines || '[]')) : null,
    favorite_foods: userData.favorite_foods || null,
    disliked_foods: userData.disliked_foods || null,
    bmr_measured: userData.bmr_measured !== undefined ? userData.bmr_measured : null,
    bmr_value: userData.bmr_value || null,
    has_diabetes: userData.has_diabetes !== undefined ? userData.has_diabetes : null,
    diabetes_diagnosis: userData.diabetes_diagnosis || null,
    takes_medication: userData.takes_medication !== undefined ? userData.takes_medication : null,
    medications: userData.medications || null,
    is_pregnant_or_nursing: userData.is_pregnant_or_nursing !== undefined ? userData.is_pregnant_or_nursing : null,
    physical_activity_level: userData.physical_activity_level || null,
    other_health_concerns: userData.other_health_concerns || null,
    blood_sugar_goals: userData.blood_sugar_goals ?
      (Array.isArray(userData.blood_sugar_goals) ? userData.blood_sugar_goals : JSON.parse(userData.blood_sugar_goals || '[]')) : null,
    specific_goals: userData.specific_goals || null,
    current_survey_step: userData.current_survey_step || null,
    survey_completed: userData.survey_completed !== undefined ? userData.survey_completed : null
  };
  
  return processedData;
};

/**
 * Get value for a specific selection field (like diet, allergy, etc.)
 * Normalizes values for use in form selects
 */
export const getSelectionValue = (value: string | null | undefined): string => {
  if (!value) return '';
  
  // Convert to lowercase, replace spaces with underscores, remove non-alphanumeric chars
  return value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

/**
 * For fields that might require "other" handling
 */
export const isOtherValue = (options: string[], value: string | null | undefined): boolean => {
  if (!value) return false;
  
  // Convert the value to the normalized form for comparison
  const normalizedValue = getSelectionValue(value);
  
  // Check if the normalized value matches any of the normalized options
  return !options.some(option => getSelectionValue(option) === normalizedValue);
}; 