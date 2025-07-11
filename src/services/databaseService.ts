import axios from 'axios';
import { UserProfileData } from './userProfileService';

/**
 * Fetch user profile data directly from the database
 * This would be used in development/testing environments 
 */
export const fetchUserFromDatabase = async (userId: number): Promise<UserProfileData> => {
  try {
    const response = await axios.get(`/api/database/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user from database:', error);
    throw new Error('Failed to fetch user data from database');
  }
};

/**
 * Gets the current logged-in user ID
 */
export const getCurrentUserId = async (): Promise<number> => {
  try {
    const response = await axios.get('/api/auth/current');
    return response.data.id;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    throw new Error('Failed to get current user ID');
  }
};

/**
 * Fetch all users from the database
 * This would only be used by admin interfaces
 */
export const fetchAllUsers = async (): Promise<UserProfileData[]> => {
  try {
    const response = await axios.get('/api/database/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch all users');
  }
};

/**
 * Format database values to proper display values
 * For handling database specific formats and conversions
 */
export const formatDatabaseValue = (field: string, value: any): any => {
  // Format values based on field type
  switch (field) {
    case 'date_of_birth':
      return value ? new Date(value).toISOString().split('T')[0] : '';
    
    case 'food_allergies':
    case 'favorite_cuisines':
    case 'dietary_preferences':
    case 'blood_sugar_goals':
      // These are stored as JSON strings in the database
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return [];
        }
      }
      return Array.isArray(value) ? value : [];
    
    case 'bmr_measured':
    case 'has_diabetes':
    case 'takes_medication':
    case 'is_pregnant_or_nursing':
      // Convert numeric boolean (0/1) to actual boolean
      return value === 1 || value === true;
      
    default:
      return value;
  }
}; 