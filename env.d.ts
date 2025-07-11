// For login response
export interface LoginResponse {
    access_token: string;
    token_type: string;
  }
  
  // For current survey question response
  export interface SurveyQuestionResponse {
    step: number;
    question_text: string;
  }
  
  // For dashboard response
  export interface DashboardResponse {
    message: string;
    user: string;
  }
  