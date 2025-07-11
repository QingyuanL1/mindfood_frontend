export interface LoginResponse {
    access_token: string;
    token_type: string;
  }
  
  export interface SurveyQuestionResponse {
    step: number;
    question_text: string;
  }
  
  export interface DashboardResponse {
    message: string;
    user: string;
  }
  