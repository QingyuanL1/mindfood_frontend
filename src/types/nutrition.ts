// 餐饮类型定义
export interface Meal {
  name: string;
  time: string;
  ingredients: string;
  image: string;
  healthScore: number;
}

// 食谱类型定义
export interface Recipe {
  id: number;
  title: string;
  description: string;
  rating: number;
  ratings_count: number;
  prep_time: string;
  cook_time: string;
  total_time: string;
  servings: string;
  nutrition_servings_per_recipe: number;
  nutrition_calories: number;
  cuisines: string[];
  allergens: string[];
  eating_styles: string[];
  health_concerns: string[];
  tags: string[];
  ingredients: string[];
  steps: {
    step_number: number;
    instruction: string;
  }[];
  nutrition_nutrients: {
    nutrient_name: string;
    value: string;
    daily_pct: string;
  }[];
}

// 餐饮计划类型定义
export interface MealPlan {
  id: number;
  meal_type: string;
  recipe: Recipe;
  time: string;
  completed: boolean;
}

// 餐饮计划集合
export interface MealPlans {
  breakfast: MealPlan[];
  lunch: MealPlan[];
  snack: MealPlan[];
  dinner: MealPlan[];
}

// 营养目标类型定义
export interface NutritionTargets {
  bmr: number;
  daily_calories: number;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  bmr_validation?: {
    is_valid: boolean;
    calculated_value: number | null;
    deviation: number | null;
  };
}

// 消耗的营养类型定义
export interface ConsumedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} 