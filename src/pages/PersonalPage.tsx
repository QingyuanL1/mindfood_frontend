import React, { useState, useEffect } from "react";
import {
  Star,
  Utensils,
  Clock,
  Square,
  CheckSquare,
  ChevronDown,
  User,
  Egg,
  Leaf,
  Drumstick,
  Camera,
  Trash2,
  AlertCircle,
  Info,
  Heart,
  Menu as MenuIcon,
  X,
  Home,
  Settings,
  LogOut,
  LineChart,
  Search,
  Image,
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { api, API_BASE_URL, deleteRequest } from "../api";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BloodSugarImpact from "../components/BloodSugarImpact";
import { toast } from "react-toastify";

// Register chart elements for Chart.js
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Define the meal type
interface Meal {
  name: string;
  time: string;
  ingredients: string;
  image: string;
  healthScore: number;
}

// Define the meal plans type
interface Recipe {
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

interface MealPlan {
  id: number;
  meal_type: string;
  recipe: Recipe;
  time: string;
  completed: boolean;
}

interface MealPlans {
  breakfast: MealPlan[];
  lunch: MealPlan[];
  snack: MealPlan[];
  dinner: MealPlan[];
}

interface NutritionTargets {
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

// BMR calculation functions for validation
const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: string
): number => {
  if (gender.toLowerCase() === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
};

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const validateBMR = (enteredBMR: number, calculatedBMR: number): boolean => {
  return Math.abs(enteredBMR - calculatedBMR) <= 300;
};

// 血糖影响计算函数
const calculateBloodSugarProfile = (
  meal: {
    carbs: number;
    protein: number;
    fat: number;
    fiber?: number;
    solubleFiber?: number;
    insolubleFiber?: number;
    GI?: number;
  },
  fastingGlucose: number = 90
): number[] => {
  // 设置默认值
  const solubleFiber = meal.solubleFiber || (meal.fiber ? meal.fiber * 0.3 : 0);
  const insolubleFiber =
    meal.insolubleFiber || (meal.fiber ? meal.fiber * 0.7 : 0);
  const GI = meal.GI || 55;

  // 计算有效碳水化合物
  const effectiveCarbs = Math.max(
    0,
    meal.carbs - (solubleFiber * 1.5 + insolubleFiber)
  );

  // 计算脂肪减缓因子
  const fatSlowdown = (meal.fat / 10) * 0.05;

  // 计算0-2小时血糖变化
  const deltaGlucose0_2h =
    effectiveCarbs * (GI / 100) * (1 - fatSlowdown) * 0.5;

  // 计算蛋白质等效碳水和脂肪转化糖分
  const proteinEquivCarbs = meal.protein * 0.5;
  const fatConvertedSugar = meal.fat * 0.1;

  // 计算2-4小时血糖变化
  const deltaGlucose2_4h = (proteinEquivCarbs + fatConvertedSugar) * 0.3;

  // 计算不同时间点的血糖
  return [
    fastingGlucose, // 空腹状态
    fastingGlucose + deltaGlucose0_2h * 0.7, // 用餐后1小时（早期上升）
    fastingGlucose + deltaGlucose0_2h + deltaGlucose2_4h * 0.3, // 用餐后2小时（峰值）
    fastingGlucose + deltaGlucose0_2h * 0.5 + deltaGlucose2_4h * 0.6, // 下一餐前（下降中）
  ];
};

// Add this helper function right after the calculateBloodSugarProfile function
const extractNutrientValue = (nutrients: any[], names: string[]): number => {
  if (!nutrients || !Array.isArray(nutrients)) return 0;

  // Try each possible name in order
  for (const name of names) {
    const nutrient = nutrients.find((n) => n.nutrient_name === name);
    if (nutrient && nutrient.value) {
      return parseFloat(nutrient.value);
    }
  }

  return 0;
};

// Define a temporary type for recipes fetched with their intended meal type
interface FetchedRecipe extends Recipe {
  intendedMealType?: keyof MealPlans;
}

const PersonalPage = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] =
    useState<keyof MealPlans>("breakfast");
  const [completedMeals, setCompletedMeals] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // --- Restaurant menu scan state ---
  const [fileBlob, setFileBlob] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [menuItems, setMenuItems] = useState<Array<{
    name: string;
    healthScore: number; // 0-100分
    isHealthy: boolean;
    recommendation: string;
  }>>([]);
  const [nutritionTargets, setNutritionTargets] =
    useState<NutritionTargets | null>(null);
  const [consumedNutrition, setConsumedNutrition] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [calculatedBMR, setCalculatedBMR] = useState<number | null>(null);
  const [bmrWarning, setBmrWarning] = useState<boolean>(false);
  const [currentMealIndex, setCurrentMealIndex] = useState<{
    [key: string]: number;
  }>({});
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlanData, setMealPlanData] = useState<MealPlans>({
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: [],
  });
  const [loading, setLoading] = useState(true);
  const [likedMeals, setLikedMeals] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();

  // 加载喜欢的食谱数据
  useEffect(() => {
    // 从localStorage加载喜欢的食谱
    const storedLikedMeals = localStorage.getItem("likedMeals");
    let initialLikedMeals: Record<number, boolean> = {};
    
    if (storedLikedMeals) {
      try {
        initialLikedMeals = JSON.parse(storedLikedMeals);
      } catch (e) {
        console.error("Error parsing likedMeals from localStorage:", e);
      }
    }
    
    // 从API加载喜欢的食谱
    api.get("/api/liked-recipes")
      .then(response => {
        if (response.data && response.data.liked_recipes) {
          // 合并API和localStorage数据
          const apiLikedMeals = response.data.liked_recipes;
          Object.keys(apiLikedMeals).forEach(id => {
            initialLikedMeals[Number(id)] = true;
          });
          
          // 更新状态和localStorage
          setLikedMeals(initialLikedMeals);
          localStorage.setItem("likedMeals", JSON.stringify(initialLikedMeals));
        }
      })
      .catch(error => {
        console.error("Error fetching liked recipes:", error);
        // 如果API调用失败，仍然使用localStorage数据
        setLikedMeals(initialLikedMeals);
      });
  }, []);

  useEffect(() => {
    const fetchTodaysFoodEntries = async () => {
      try {
        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const token = localStorage.getItem("access_token");
        if (!token) {
          return;
        }

        try {
          // 获取营养摄入总量数据
          const response = await api.get(
            `/nutrition/log?start_date=${todayString}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data && Array.isArray(response.data)) {
            const totals = response.data.reduce(
              (acc: any, entry: any) => ({
                calories: acc.calories + (Number(entry.calories) || 0),
                protein: acc.protein + (Number(entry.protein) || 0),
                carbs: acc.carbs + (Number(entry.carbs) || 0),
                fat: acc.fat + (Number(entry.fat) || 0),
              }),
              { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );

            setConsumedNutrition({
              calories: Math.round(totals.calories),
              protein: Math.round(totals.protein),
              carbs: Math.round(totals.carbs),
              fat: Math.round(totals.fat),
            });
          } else {
            setConsumedNutrition({
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            });
          }

          // 获取已完成餐食信息
          try {
            const summaryResponse = await api.get(
              `/nutrition/summary?target_date=${todayString}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            // 处理API返回的已完成餐食列表
            if (summaryResponse.data && summaryResponse.data.completed_meals) {
              const completedMealsMap: { [key: string]: boolean } = {};

              summaryResponse.data.completed_meals.forEach((entry: any) => {
                const mealKey = `${entry.name}_${entry.meal_time}`;
                completedMealsMap[mealKey] = true;
                completedMealsMap[entry.name] = true;
              });

              setCompletedMeals(completedMealsMap);
            }
          } catch (summaryError) {
            console.error("Error fetching nutrition summary:", summaryError);
          }
        } catch (apiError: any) {
          console.error("Error fetching nutrition log:", apiError);
        }
      } catch (err: any) {
        console.error("Error fetching today's food entries:", err);
      }
    };

    fetchTodaysFoodEntries();

    // When a food entry is added, fetch all data again to keep it in sync
    const handleFoodEntryAdded = () => {
      // console.log("Food entry added, refreshing nutrition data");
      fetchTodaysFoodEntries();
    };

    window.addEventListener(
      "foodEntryAdded",
      handleFoodEntryAdded as EventListener
    );

    return () => {
      window.removeEventListener(
        "foodEntryAdded",
        handleFoodEntryAdded as EventListener
      );
    };
  }, []);

  useEffect(() => {
    const fetchNutritionTargets = async () => {
      try {
        setIsLoading(true);

        setNutritionTargets({
          bmr: 1522,
          daily_calories: 2359,
          macros: {
            carbs: 295,
            protein: 148,
            fat: 65,
          },
        });

        try {
          const response = await api.get("/api/nutrition-targets");

          if (response.data && typeof response.data === "object") {
            if (response.data.bmr < 500) {
              try {
                const profileResponse = await api.get("/api/user/profile");
                // console.log("User profile fetched (low BMR):", profileResponse.data);  
                setUserProfile(profileResponse.data);

                if (
                  profileResponse.data.weight &&
                  profileResponse.data.height &&
                  profileResponse.data.date_of_birth &&
                  profileResponse.data.gender
                ) {
                  const age = calculateAge(profileResponse.data.date_of_birth);
                  const calculatedValue = Math.round(
                    calculateBMR(
                      profileResponse.data.weight,
                      profileResponse.data.height,
                      age,
                      profileResponse.data.gender
                    )
                  );

                  setCalculatedBMR(calculatedValue);
                  setBmrWarning(true);

                  setNutritionTargets({
                    ...response.data,
                    bmr: calculatedValue,
                    daily_calories: Math.round(calculatedValue * 1.55),
                  });
                }
              } catch (profileError) {
                console.error("Error fetching user profile:", profileError);
              }
            } else {
              setNutritionTargets(response.data);

              if (response.data.bmr_validation) {
                if (!response.data.bmr_validation.is_valid) {
                  setBmrWarning(true);
                  if (response.data.bmr_validation.calculated_value) {
                    setCalculatedBMR(
                      response.data.bmr_validation.calculated_value
                    );
                  }
                }
              } else {
                try {
                  const profileResponse = await api.get("/api/user/profile");
                  // console.log("User profile fetched (no BMR validation):", profileResponse.data);
                  setUserProfile(profileResponse.data);

                  if (
                    profileResponse.data.weight &&
                    profileResponse.data.height &&
                    profileResponse.data.date_of_birth &&
                    profileResponse.data.gender
                  ) {
                    const age = calculateAge(
                      profileResponse.data.date_of_birth
                    );
                    const calculatedValue = Math.round(
                      calculateBMR(
                        profileResponse.data.weight,
                        profileResponse.data.height,
                        age,
                        profileResponse.data.gender
                      )
                    );

                    setCalculatedBMR(calculatedValue);

                    if (
                      response.data.bmr &&
                      !validateBMR(response.data.bmr, calculatedValue)
                    ) {
                      setBmrWarning(true);
                    }
                  }
                } catch (profileError) {
                  console.error(
                    "Error fetching user profile data:",
                    profileError
                  );
                }
              }
            }
          }
        } catch (apiError) {
          console.error("API Error fetching nutrition targets:", apiError);
        }
      } catch (err: any) {
        console.error("Error in fetchNutritionTargets:", err);
        setError(
          err.response?.data?.detail || "Error fetching nutrition targets"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNutritionTargets();
  }, []);

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors

        const today = new Date().toISOString().split("T")[0];
        const todayString = `${today.split("-")[0]}-${today.split("-")[1]}-${
          today.split("-")[2]
        }`;

        let completedMealRecipeIds: number[] = [];
        let completedMealsMap: { [key: string]: boolean } = {};
        let completedMealDetails: { [key: string]: any } = {};

        const token = localStorage.getItem("access_token");
        if (token) {
          try {
            // 1. Fetch summary first to get completed meal IDs and status
            try {
              const summaryResponse = await api.get(
                `/nutrition/summary?target_date=${todayString}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (summaryResponse.data) {
                completedMealRecipeIds =
                  summaryResponse.data.completed_recipe_ids || [];
                // console.log(
                //   "Fetched completed recipe IDs:",
                //   completedMealRecipeIds
                // );

                if (summaryResponse.data.completed_meals) {
                  summaryResponse.data.completed_meals.forEach((entry: any) => {
                    const mealKey = `${entry.name}_${entry.meal_time}`;
                    completedMealsMap[mealKey] = true;
                    completedMealsMap[entry.name] = true;

                    if (!completedMealDetails[entry.meal_time]) {
                      completedMealDetails[entry.meal_time] = [];
                    }
                    completedMealDetails[entry.meal_time].push({
                      recipe_id: entry.recipe_id,
                      name: entry.name,
                      meal_time: entry.meal_time,
                      completed: true,
                    });
                  });
                }
                // console.log("Updated completed meals map:", completedMealsMap);
                setCompletedMeals(completedMealsMap);
              }
            } catch (error: any) {
              console.error("获取已完成餐食失败:", error);
              if (error.response?.status === 401) {
                toast.error("会话已过期，请重新登录。");
                handleLogout();
                return;
              }
              // Continue even if summary fetch fails, but meal completion might be inaccurate
            }

            // Clear local storage cache
            localStorage.removeItem("mealPlan");
            localStorage.removeItem("mealPlanDate");

            // 2. Fetch recipes for all meal types in parallel
            const fetchRecipesForMealType = async (
              mealType: keyof MealPlans,
              count: number
            ): Promise<FetchedRecipe[]> => {
              const params = new URLSearchParams({
                limit: count.toString(),
                page_size: count.toString(),
                meal_type: mealType,
                date: today,
              });

              if (completedMealRecipeIds.length > 0) {
                params.append(
                  "completed_recipe_ids",
                  completedMealRecipeIds.join(",")
                );
              }

              try {
                const response = await api.get(
                  `/api/recipes?${params.toString()}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                return (response.data.items || []).map((recipe: Recipe) => ({
                  ...recipe,
                  intendedMealType: mealType
                }));
              } catch (error: any) {
                console.error(`Error fetching recipes for ${mealType}:`, error);
                if (error.response?.status === 401) {
                  toast.error("Session expired. Please log in again.");
                  handleLogout();
                }
                return [];
              }
            };

            const recipesToFetchPerType = 3;
            const mealTypesToFetch: Array<keyof MealPlans> = [
              "breakfast",
              "lunch",
              "snack",
              "dinner",
            ];
            const recipePromises = mealTypesToFetch.map((mealType) =>
              fetchRecipesForMealType(mealType, recipesToFetchPerType)
            );

            const results = await Promise.all(recipePromises);
            const allFetchedRecipes: FetchedRecipe[] = results.flat();

            const categorizedMeals: MealPlans = {
              breakfast: [],
              lunch: [],
              snack: [],
              dinner: [],
            };
            const assignedRecipeIds = new Set<number>();
            const recipesPerMeal = 2;

            for (const mealType of mealTypesToFetch) {
              let assignedCount = 0;
              for (const recipe of allFetchedRecipes) {
                if (assignedCount >= recipesPerMeal) break;
                if (recipe.intendedMealType === mealType && !assignedRecipeIds.has(recipe.id)) {
                  categorizedMeals[mealType].push({
                    id: Math.random() * 1000000,
                    meal_type: mealType,
                    recipe: recipe,
                    time: recipe.prep_time || "30 mins",
                    completed: completedMealRecipeIds.includes(recipe.id),
                  });
                  assignedRecipeIds.add(recipe.id);
                  assignedCount++;
                }
              }

              if (assignedCount < recipesPerMeal) {
                for (const recipe of allFetchedRecipes) {
                    if (assignedCount >= recipesPerMeal) break;
                    if (!assignedRecipeIds.has(recipe.id)) {
                        categorizedMeals[mealType].push({
                            id: Math.random() * 1000000,
                            meal_type: mealType,
                            recipe: recipe,
                            time: recipe.prep_time || "30 mins",
                            completed: completedMealRecipeIds.includes(recipe.id),
                        });
                        assignedRecipeIds.add(recipe.id);
                        assignedCount++;
                    }
                }
              }
              
              categorizedMeals[mealType].sort((a, b) => a.recipe.id - b.recipe.id);
            }

            // console.log("Final categorized meals after uniqueness filter:", categorizedMeals);

            setMealPlanData(categorizedMeals);
            setCompletedMeals(completedMealsMap);

            localStorage.setItem("mealPlan", JSON.stringify(categorizedMeals));
            localStorage.setItem("mealPlanDate", today);
          } catch (err: any) {
            console.error("Error in fetchMealPlans:", err);
            if (!error && !loading) {
              setError("Failed to fetch meal plan data.");
            }
          } finally {
            setLoading(false);
          }
        } else {
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Error in fetchMealPlans outer try:", error);
        if (!error && !loading) {
          setError("Failed to fetch meal plan data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlans();
  }, [navigate]); // Added navigate dependency

  // Function to generate a numeric seed from a date string (YYYY-MM-DD)
  // This will produce a different number for each day
  const generateDateSeed = (dateString: string): number => {
    // Remove dashes from the date string and convert to a number
    const numericDate = parseInt(dateString.replace(/-/g, ""));
    // Add a prime number to create more variability
    return numericDate * 31;
  };

  // Add a useEffect hook to load liked meals from localStorage on component mount
  useEffect(() => {
    // Load liked meals from localStorage
    const storedLikedMeals = localStorage.getItem("likedMeals");
    if (storedLikedMeals) {
      try {
        const parsedLikedMeals = JSON.parse(storedLikedMeals);
        setLikedMeals(parsedLikedMeals);
      } catch (e) {
        console.error("Error parsing stored liked meals:", e);
      }
    }
  }, []);

  // Add useEffect for fetching username
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("/api/user/profile");
        // console.log("User profile fetched for username:", response.data);
        if (response.data && response.data.name) {
          setUsername(response.data.name);
        } else {
          const storedUsername = localStorage.getItem("username");
          setUsername(response.data.email || storedUsername || "User");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        const storedUsername = localStorage.getItem("username");
        setUsername(storedUsername || "User");
        if ((error as any).response?.status === 401) {
          toast.error("会话已过期，请重新登录。");
          handleLogout();
        }
      }
    };

    fetchUsername();
  }, [navigate]);

  const totalCalories = nutritionTargets?.daily_calories || 2000;
  const consumedCalories = consumedNutrition.calories;
  const dailyCalories =
    calculatedBMR && nutritionTargets?.bmr && nutritionTargets.bmr < 500
      ? Math.round(calculatedBMR * 1.55)
      : nutritionTargets?.daily_calories || 2359;
  const userWeight = userProfile?.weight || 70;

  const proteinGrams = Math.round(userWeight * 1.6);
  const proteinCalories = proteinGrams * 4;

  const fatCalories = Math.round(dailyCalories * 0.3);
  const fatGrams = Math.round(fatCalories / 9);

  const carbsCalories = dailyCalories - proteinCalories - fatCalories;
  const carbsGrams = Math.round(carbsCalories / 4);

  const defaultMacros = {
    protein: proteinGrams,
    fat: fatGrams,
    carbs: carbsGrams,
  };

  const calorieData = {
    labels: ["Consumed", "Remaining"],
    datasets: [
      {
        data: [
          consumedCalories,
          consumedCalories >= totalCalories
            ? 0
            : totalCalories - consumedCalories,
        ],
        backgroundColor: ["#FF9466", "#ECEFF1"],
        hoverBackgroundColor: ["#FF7A45", "#CFD8DC"],
      },
    ],
  };

  const proteinPercentage = Math.round((proteinCalories / dailyCalories) * 100);
  const fatPercentage = Math.round((fatCalories / dailyCalories) * 100);
  const carbsPercentage = Math.round((carbsCalories / dailyCalories) * 100);

  // 切换餐食完成状态
  const toggleMealCompletion = async (mealId: number, recipeName: string) => {
    try {
      // 获取当前餐食和类型
      let foundMeal: MealPlan | undefined;
      let mealType: keyof MealPlans | undefined;

      for (const type of ["breakfast", "lunch", "snack", "dinner"] as Array<
        keyof MealPlans
      >) {
        const found = mealPlanData[type].find((meal) => meal.id === mealId);
        if (found) {
          foundMeal = found;
          mealType = type;
          break;
        }
      }

      if (!foundMeal || !mealType) {
        console.error("未找到指定餐食:", mealId);
        return;
      }

      // 检查认证令牌
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("用户未登录");
        toast.error("请先登录再操作");
        return;
      }

      // 获取当前日期
      const today = new Date().toISOString().split("T")[0];

      // 检查餐食当前状态 - 修改这里的判断逻辑
      const mealKey = `${recipeName}_${mealType}`;
      const currentlyCompleted =
        completedMeals[mealKey] || completedMeals[recipeName];
      const isCompleted = !currentlyCompleted;

      const recipe = foundMeal.recipe;
      if (!recipe) {
        console.error("餐食没有关联的食谱:", mealId);
        return;
      }

      // 创建新的餐食计划状态，将完成状态更新
      const updatedMealPlanData = { ...mealPlanData };
      updatedMealPlanData[mealType] = updatedMealPlanData[mealType].map(
        (meal) => {
          if (meal.id === mealId) {
            return { ...meal, completed: isCompleted };
          }
          return meal;
        }
      );

      if (isCompleted) {
        // 添加餐食到营养日志
        try {
          // 提取营养素信息
          const nutrients = recipe.nutrition_nutrients || [];
          const calories = recipe.nutrition_calories || 0;
          const protein = extractNutrientValue(nutrients, [
            "Protein",
            "protein",
          ]);
          const carbs = extractNutrientValue(nutrients, [
            "Carbohydrates",
            "carbohydrates",
            "carbs",
            "Total Carbohydrate",
          ]);
          const fat = extractNutrientValue(nutrients, [
            "Fat",
            "fat",
            "total fat",
            "Total Fat",
          ]);

          // 构建请求体
          const mealLogData = {
            name: recipe.title,
            meal_time: mealType,
            portion: 1,
            unit: "serving",
            calories: Math.round(calories),
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fat: Math.round(fat),
            meal_date: today,
            recipe_id: recipe.id, // 保存recipe_id用于将来识别该餐食
          };

          // 发送请求
          const response = await api.post("/nutrition/log", mealLogData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.status >= 200 && response.status < 300) {
            // 更新UI状态
            setMealPlanData(updatedMealPlanData);

            // 更新completedMeals状态
            setCompletedMeals((prev) => ({
              ...prev,
              [mealKey]: true,
              [recipeName]: true,
            }));

            toast.success(`${recipeName} 已标记为已完成!`);

            // 触发UI更新事件
            window.dispatchEvent(new CustomEvent("foodEntryAdded"));
          } else {
            toast.error("保存完成状态失败");
          }
        } catch (error) {
          console.error("保存完成状态失败:", error);
          toast.error("保存完成状态失败");
        }
      } else {
        // 取消完成状态，使用专用的API
        try {
          // 更新UI状态
          setMealPlanData(updatedMealPlanData);

          // 更新completedMeals状态
          setCompletedMeals((prev) => {
            const updated = { ...prev };
            delete updated[mealKey];
            delete updated[recipeName];
            return updated;
          });

          // 使用/meal/complete/cancel API取消餐食完成状态
          const cancelData = {
            meal_name: recipeName,
            meal_time: mealType,
            recipe_id: recipe.id,
          };

          await api.post("/nutrition/meal/complete/cancel", cancelData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          toast.info(`已取消${recipeName}的完成状态`);

          // 触发UI更新
          window.dispatchEvent(new CustomEvent("foodEntryAdded"));
        } catch (error) {
          console.error("取消餐食完成状态失败:", error);
          toast.error("取消餐食完成状态失败");
          // 即使API调用失败，仍然保持UI状态更新
        }
      }
    } catch (error) {
      console.error("餐食完成状态更新失败:", error);
      toast.error("更新餐食状态失败");
    }
  };

  // Restaurant menu scan handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileBlob(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const previewImage = e.target?.result as string;
        setSelectedImage(previewImage);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMenu = async () => {
    if (!fileBlob) {
      toast.error("Please upload a menu image first");
      return;
    }

    setIsAnalyzing(true);
    setMenuItems([]);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("image", fileBlob);

    try {
      // 调用后端分析接口
      const response = await fetch("http://localhost:8000/api/analyze-menu", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Fail to analyze menu");
      }

      const data = await response.json();
      
      if (data.menu_items && Array.isArray(data.menu_items)) {
        setMenuItems(data.menu_items);
      }
      
      if (data.summary) {
        setAnalysisResult(data.summary);
      }
      
      toast.success("Successfully analyzed menu!!");
    } catch (error) {
      console.error("Error analyzing menu:", error);
      setAnalysisResult("⚠️Fail to analyze menu. Please try later.");
      toast.error("Fail to analyze menu");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
    setFileBlob(null);
    setAnalysisResult(null);
    setMenuItems([]);
  };

  const renderNutritionGoals = () => {
    // Instead of returning null, let's use default values if nutritionTargets isn't available
    const targets = nutritionTargets || {
      bmr: 1522,
      daily_calories: 2359,
      macros: {
        carbs: 295,
        protein: 148,
        fat: 65,
      },
    };

    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              Today's Nutrition Goals
            </h3>
            <button className="text-orange-500 text-sm font-medium">
              Details
            </button>
          </div>

          {bmrWarning && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
              <AlertCircle className="text-yellow-500 w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700">
                  {targets.bmr && targets.bmr < 500 ? (
                    <>
                      Your stored BMR value (24 kcal) is too low to be correct.
                      We've calculated your BMR to be {calculatedBMR || 1522}{" "}
                      kcal based on your profile data.
                    </>
                  ) : (
                    <>
                      Your BMR value ({targets.bmr} kcal) may need updating.
                      Based on your profile data, your estimated BMR is{" "}
                      {calculatedBMR} kcal.
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Accurate BMR is essential for personalized nutrition
                  recommendations.
                </p>
                <button
                  className="text-xs font-medium text-orange-600 mt-2 hover:text-orange-700"
                  onClick={() => (window.location.href = "/profile")}
                >
                  Update BMR in Profile
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">
                  Daily Calorie Needs
                </span>
                <span className="text-sm font-medium">
                  {consumedCalories} / {targets.daily_calories || 2359} kcal
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (consumedCalories / (targets.daily_calories || 2359)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1 justify-between">
                <span>
                  BMR:{" "}
                  {targets.bmr && targets.bmr < 500
                    ? calculatedBMR || 1522
                    : targets.bmr || 1522}{" "}
                  kcal
                </span>
                <span className="text-xs text-gray-500">
                  (Based on Mifflin-St Jeor formula)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleAlternativeMeal = async (
    mealType: keyof MealPlans,
    mealId: number
  ) => {
    try {
      const targetMeal = mealPlanData[mealType].find(
        (meal) => meal.id === mealId
      );

      // 使用completedMeals状态检查目标餐食是否已完成
      const targetMealKey = targetMeal
        ? `${targetMeal.recipe.title}_${mealType}`
        : "";
      const isTargetCompleted =
        targetMeal &&
        (completedMeals[targetMealKey] ||
          completedMeals[targetMeal.recipe.title]);

      if (isTargetCompleted) {
        // console.log("该餐食已完成，无需替换:", targetMeal?.recipe.title);
        toast.info(`${targetMeal?.recipe.title} 已完成，无法替换。`);
        return;
      }

      // 获取当前日期
      const today = new Date().toISOString().split("T")[0];
      const todayString = `${today.split("-")[0]}-${today.split("-")[1]}-${
        today.split("-")[2]
      }`;

      // 收集所有已完成餐食的recipe_id
      let completedMealRecipeIds: number[] = [];

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          toast.error("请先登录再操作");
          navigate("/login");
          return;
        }

        // 直接从后端获取最新的已完成餐食信息
        const summaryResponse = await api.get(
          `/nutrition/summary?target_date=${todayString}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (summaryResponse.data) {
          // 从API响应中获取已完成的食谱ID列表
          if (summaryResponse.data.completed_recipe_ids) {
            completedMealRecipeIds = summaryResponse.data.completed_recipe_ids;
            // console.log("从API获取已完成食谱IDs:", completedMealRecipeIds);
          }

          // 更新completedMeals状态
          const newCompletedMeals: { [key: string]: boolean } = {};

          if (summaryResponse.data.completed_meals) {
            summaryResponse.data.completed_meals.forEach((entry: any) => {
              const mealKey = `${entry.name}_${entry.meal_time}`;
              newCompletedMeals[mealKey] = true;
              newCompletedMeals[entry.name] = true;
            });

            // 更新完成状态
            setCompletedMeals((prev) => ({ ...prev, ...newCompletedMeals }));
          }
        }

        // 获取当前餐食计划中所有食谱ID，用于后端过滤
        const currentMealIds = mealPlanData[mealType]
          .map((meal) => meal.recipe.id)
          .filter((id) => id !== undefined);

        // console.log("当前餐食计划中已有的食谱IDs:", currentMealIds);

        // 构建API请求参数
        const params = new URLSearchParams({
          limit: "5", // 获取多个选项，以防一些选项不符合条件
          meal_type: mealType,
          date: today,
          random: "true", // 添加随机参数
        });

        // 添加已完成餐食的ID作为参数
        if (completedMealRecipeIds.length > 0) {
          // console.log("传递已完成的食谱IDs:", completedMealRecipeIds);
          params.append(
            "completed_recipe_ids",
            completedMealRecipeIds.join(",")
          );
        }

        // 添加需要排除的ID作为参数
        if (currentMealIds.length > 0) {
          // console.log("传递需要排除的食谱IDs:", currentMealIds);
          params.append("exclude_ids", currentMealIds.join(","));
        }

        // console.log("API请求参数:", params.toString());

        // 发起API请求获取替代食谱
        const response = await api.get(`/api/recipes?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (
          response.data &&
          response.data.items &&
          response.data.items.length > 0
        ) {
          // console.log("API返回的食谱数量:", response.data.items.length);

          // 直接使用第一个食谱，因为后端已经处理了排除和排序逻辑
          const newRecipe = response.data.items[0];
          // console.log("选择的新食谱:", newRecipe.title, newRecipe.id);

          // 更新餐食计划，替换指定ID的餐食
          setMealPlanData((prev) => {
            const updatedMealPlan = { ...prev };

            updatedMealPlan[mealType] = prev[mealType].map((meal) => {
              if (meal.id === mealId) {
                return {
                  id: Math.random() * 1000000,
                  meal_type: mealType,
                  recipe: newRecipe,
                  time: newRecipe.prep_time || "30 mins",
                  completed: false, // 新餐食是未完成的
                };
              }
              return meal;
            });

            return updatedMealPlan;
          });

          toast.success(`已更新为: ${newRecipe.title}`);

          // 触发UI更新事件
          window.dispatchEvent(new CustomEvent("foodEntryAdded"));
        } else {
          // console.log("API没有返回有效的食谱数据");
          toast.info("没有找到合适的替代餐食");
        }
      } catch (error) {
        console.error("获取替代餐食失败:", error);
        toast.error("无法获取替代餐食");
        if ((error as any).response?.status === 401) {
          toast.error("会话已过期，请重新登录。");
          handleLogout();
        }
      }
    } catch (error) {
      console.error("替换餐食选项时出错:", error);
      toast.error("替换餐食选项失败");
      if ((error as any).response?.status === 401) {
        toast.error("会话已过期，请重新登录。");
        handleLogout();
      }
    }
  };

  // Add a function to toggle the liked status of a meal
  const toggleLikedMeal = (recipeId: number) => {
    setLikedMeals((prev) => {
      const newLikedStatus = !prev[recipeId];
      const newLikedMeals = {
        ...prev,
        [recipeId]: newLikedStatus,
      };

      // Store in localStorage for persistence
      localStorage.setItem("likedMeals", JSON.stringify(newLikedMeals));

      // Save to database
      if (newLikedStatus) {
        // Like the recipe
        api
          .post(`/api/liked-recipes/${recipeId}`)
          .then((response) => {
            // console.log("Recipe liked:", response.data);
          })
          .catch((error) => {
            console.error("Error liking recipe:", error);
          });
      } else {
        // Unlike the recipe
        api
          .delete(`/api/liked-recipes/${recipeId}`)
          .then((response) => {
            // console.log("Recipe unliked:", response.data);
          })
          .catch((error) => {
            console.error("Error unliking recipe:", error);
          });
      }

      return newLikedMeals;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // Effect to run on component mount
  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const expTime = tokenData.exp * 1000;
      const currentTime = Date.now();

      if (currentTime > expTime) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
    } catch (e) {
      console.error("Error checking token expiration:", e);
    }
  }, [navigate]);

  // Function to calculate the blood sugar impact profiles for a day
  const generateBloodSugarProfiles = () => {
    // Fixed past diet blood sugar profile - this should remain unchanged
    const pastDayProfile = [90, 95, 140, 120, 95, 145, 125, 100, 150, 130];

    // Default current diet values (will be overridden by completed meals)
    let currentBreakfast = {
      carbs: 30,
      protein: 15,
      fat: 10,
      fiber: 3,
      GI: 50,
    };

    let currentLunch = {
      carbs: 45,
      protein: 25,
      fat: 15,
      fiber: 5,
      GI: 55,
    };

    let currentDinner = {
      carbs: 40,
      protein: 30,
      fat: 18,
      fiber: 6,
      GI: 45,
    };

    // Get all meal data
    const breakfastMeals = mealPlanData.breakfast || [];
    const lunchMeals = mealPlanData.lunch || [];
    const dinnerMeals = mealPlanData.dinner || [];

    // Helper function to get nutrition value safely
    const getNutritionValue = (
      nutrients: any[] | undefined,
      name: string
    ): number => {
      if (!nutrients) return 0;
      const nutrient = nutrients.find((n) => n.nutrient_name === name);
      return nutrient && nutrient.value ? parseFloat(nutrient.value) : 0;
    };

    // Process breakfast meals - either selected meal or completed meal
    if (selectedMeal === "breakfast" && breakfastMeals.length > 0) {
      // Use the current selected breakfast meal
      const selectedBreakfastMeal =
        breakfastMeals[currentMealIndex.breakfast || 0];
      if (selectedBreakfastMeal && selectedBreakfastMeal.recipe) {
        const nutrients = selectedBreakfastMeal.recipe.nutrition_nutrients;
        currentBreakfast = {
          carbs: getNutritionValue(nutrients, "Carbohydrates") || 30,
          protein: getNutritionValue(nutrients, "Protein") || 15,
          fat: getNutritionValue(nutrients, "Fat") || 10,
          fiber: getNutritionValue(nutrients, "Fiber") || 3,
          GI: 50,
        };
        // console.log(
        //   "Using selected breakfast:",
        //   selectedBreakfastMeal.recipe.title,
        //   currentBreakfast
        // );
      }
    } else {
      // Not viewing breakfast tab, use completed breakfast meals if available
      for (const meal of breakfastMeals) {
        const mealKey = `${meal.recipe.title}_breakfast`;
        if (completedMeals[mealKey] || completedMeals[meal.recipe.title]) {
          const nutrients = meal.recipe.nutrition_nutrients;
          currentBreakfast = {
            carbs: getNutritionValue(nutrients, "Carbohydrates") || 30,
            protein: getNutritionValue(nutrients, "Protein") || 15,
            fat: getNutritionValue(nutrients, "Fat") || 10,
            fiber: getNutritionValue(nutrients, "Fiber") || 3,
            GI: 50,
          };
          // console.log(
          //   "Using completed breakfast:",
          //   meal.recipe.title,
          //   currentBreakfast
          // );
          break;
        }
      }
    }

    // Process lunch meals - either selected meal or completed meal
    if (selectedMeal === "lunch" && lunchMeals.length > 0) {
      // Use the current selected lunch meal
      const selectedLunchMeal = lunchMeals[currentMealIndex.lunch || 0];
      if (selectedLunchMeal && selectedLunchMeal.recipe) {
        const nutrients = selectedLunchMeal.recipe.nutrition_nutrients;
        currentLunch = {
          carbs: getNutritionValue(nutrients, "Carbohydrates") || 45,
          protein: getNutritionValue(nutrients, "Protein") || 25,
          fat: getNutritionValue(nutrients, "Fat") || 15,
          fiber: getNutritionValue(nutrients, "Fiber") || 5,
          GI: 55,
        };
        // console.log(
        //   "Using selected lunch:",
        //   selectedLunchMeal.recipe.title,
        //   currentLunch
        // );
      }
    } else {
      // Not viewing lunch tab, use completed lunch meals if available
      for (const meal of lunchMeals) {
        const mealKey = `${meal.recipe.title}_lunch`;
        if (completedMeals[mealKey] || completedMeals[meal.recipe.title]) {
          const nutrients = meal.recipe.nutrition_nutrients;
          currentLunch = {
            carbs: getNutritionValue(nutrients, "Carbohydrates") || 45,
            protein: getNutritionValue(nutrients, "Protein") || 25,
            fat: getNutritionValue(nutrients, "Fat") || 15,
            fiber: getNutritionValue(nutrients, "Fiber") || 5,
            GI: 55,
          };
          // console.log(
          //   "Using completed lunch:",
          //   meal.recipe.title,
          //   currentLunch
          // );
          break;
        }
      }
    }

    // Process dinner meals - either selected meal or completed meal
    if (selectedMeal === "dinner" && dinnerMeals.length > 0) {
      // Use the current selected dinner meal
      const selectedDinnerMeal = dinnerMeals[currentMealIndex.dinner || 0];
      if (selectedDinnerMeal && selectedDinnerMeal.recipe) {
        const nutrients = selectedDinnerMeal.recipe.nutrition_nutrients;
        currentDinner = {
          carbs: getNutritionValue(nutrients, "Carbohydrates") || 40,
          protein: getNutritionValue(nutrients, "Protein") || 30,
          fat: getNutritionValue(nutrients, "Fat") || 18,
          fiber: getNutritionValue(nutrients, "Fiber") || 6,
          GI: 45,
        };
        // console.log(
        //   "Using selected dinner:",
        //   selectedDinnerMeal.recipe.title,
        //   currentDinner
        // );
      }
    } else {
      // Not viewing dinner tab, use completed dinner meals if available
      for (const meal of dinnerMeals) {
        const mealKey = `${meal.recipe.title}_dinner`;
        if (completedMeals[mealKey] || completedMeals[meal.recipe.title]) {
          const nutrients = meal.recipe.nutrition_nutrients;
          currentDinner = {
            carbs: getNutritionValue(nutrients, "Carbohydrates") || 40,
            protein: getNutritionValue(nutrients, "Protein") || 30,
            fat: getNutritionValue(nutrients, "Fat") || 18,
            fiber: getNutritionValue(nutrients, "Fiber") || 6,
            GI: 45,
          };
          // console.log(
          //   "Using completed dinner:",
          //   meal.recipe.title,
          //   currentDinner
          // );
          break;
        }
      }
    }

    // Calculate blood sugar profiles based on meal data
    const fastingGlucose = 90;

    // Current diet blood sugar profile
    const currentBreakfastProfile = calculateBloodSugarProfile(
      currentBreakfast,
      fastingGlucose
    );
    const currentLunchProfile = calculateBloodSugarProfile(
      currentLunch,
      currentBreakfastProfile[3]
    );
    const currentDinnerProfile = calculateBloodSugarProfile(
      currentDinner,
      currentLunchProfile[3]
    );

    // Combine profiles into a full day
    const currentDayProfile = [
      ...currentBreakfastProfile,
      ...currentLunchProfile.slice(1),
      ...currentDinnerProfile.slice(1),
      // Add pre-sleep blood sugar (assuming it's heading back to fasting)
      fastingGlucose + 5,
    ];

    return {
      currentDayProfile: currentDayProfile.map((value) => Math.round(value)),
      pastDayProfile: pastDayProfile,
    };
  };

  // Add state for blood sugar profiles
  const [bloodSugarProfiles, setBloodSugarProfiles] = useState(() =>
    generateBloodSugarProfiles()
  );

  // Add useEffect to recalculate blood sugar impact when meals are completed or the selected meal changes
  useEffect(() => {
    // This will trigger regeneration of blood sugar profiles when completedMeals or selectedMeal changes
    const profiles = generateBloodSugarProfiles();
    setBloodSugarProfiles(profiles);
  }, [completedMeals, selectedMeal]);

  // Find the part where meals are rendered and update the isCompleted check
  // Search for a function that renders meals or a JSX section that displays meals
  const renderMeal = (meal: any) => {
    const recipeName = meal.recipe.name;

    // Check for completion using the combined key first, then fall back to just the name
    const mealKey = `${recipeName}_${selectedMeal}`;
    const isCompleted =
      completedMeals[mealKey] || completedMeals[recipeName] || false;

    return (
      <div
        key={meal.id}
        className="bg-white rounded-xl shadow-sm overflow-hidden mb-4"
      >
        <div className="relative">
          <img
            src={`/api/recipes/${meal.recipe.id}/image`}
            alt={recipeName}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h3 className="text-xl font-bold">{recipeName}</h3>
            <div className="flex items-center mt-1">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {meal.recipe.prep_time || "30 mins"}
              </span>
              <span className="mx-2">•</span>
              <Utensils className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {meal.recipe.ingredients.length} ingredients
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Calories
                </span>
                <span className="text-lg font-bold">
                  {meal.recipe.nutrition_calories}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Protein
                </span>
                <span className="text-lg font-bold">
                  {extractNutrientValue(meal.recipe.nutrition_nutrients, [
                    "Protein",
                  ])}
                  g
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Carbs
                </span>
                <span className="text-lg font-bold">
                  {extractNutrientValue(meal.recipe.nutrition_nutrients, [
                    "Total Carbohydrate",
                    "Carbohydrates",
                  ])}
                  g
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">
                  Fat
                </span>
                <span className="text-lg font-bold">
                  {extractNutrientValue(meal.recipe.nutrition_nutrients, [
                    "Total Fat",
                    "Fat",
                  ])}
                  g
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/recipes/${meal.recipe.id}`)}
              className="flex-1 py-2 px-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              View Recipe
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleMealCompletion(meal.id, recipeName);
              }}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                isCompleted
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {isCompleted ? "Completed" : "Mark as Complete"}
            </button>
            <button
              onClick={() => handleAlternativeMeal(selectedMeal, meal.id)}
              className="py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Another Option
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content - Update the margin top for mobile */}
      <div className="p-2 md:p-6 lg:p-8 mt-16 md:mt-0">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Nutrition Summary */}
            <div className="p-3 md:p-6">
              <h2 className="text-lg font-semibold mb-2 md:mb-4">
                Today's Nutrition
              </h2>

              {isLoading ? (
                <div className="flex items-center justify-center h-56">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9466]"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : (
                <>
                  {/* Calorie Doughnut Chart */}
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto mb-4 md:mb-6">
                    <Doughnut
                      data={calorieData}
                      options={{
                        cutout: "80%",
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }}
                    />

                    {/* Centered text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                        You've eaten
                      </h2>
                      <span
                        className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
                          consumedCalories > totalCalories
                            ? "text-red-500"
                            : "text-gray-900"
                        }`}
                      >
                        {consumedCalories}
                      </span>
                      <p className="text-[10px] sm:text-xs text-gray-600 text-center px-2">
                        {calculatedBMR &&
                        nutritionTargets?.bmr &&
                        nutritionTargets.bmr < 500
                          ? Math.round(calculatedBMR * 1.55)
                          : nutritionTargets?.daily_calories || 2359}{" "}
                        kcal each day
                      </p>
                      {consumedCalories > totalCalories && (
                        <div className="text-[10px] text-red-500 mt-0.5 px-1 py-0.5 bg-red-50 rounded-full flex items-center">
                          <span className="whitespace-nowrap">
                            +{consumedCalories - totalCalories} kcal
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nutrition Goals Component - Only visible on mobile */}
                  <div className="md:hidden">{renderNutritionGoals()}</div>

                  {/* Macronutrients Progress Bars */}
                  <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                    {/* Protein */}
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mt-1">
                        <Egg className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F594A]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <span className="text-xs sm:text-sm font-medium">
                              Protein
                            </span>
                            {consumedNutrition.protein >
                              defaultMacros.protein && (
                              <AlertCircle className="ml-1 w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                            )}
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {consumedNutrition.protein}/{defaultMacros.protein}g
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                          <div
                            className={`h-2 sm:h-2.5 rounded-full ${
                              consumedNutrition.protein > defaultMacros.protein
                                ? "bg-red-400"
                                : "bg-[#0F594A]"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (consumedNutrition.protein /
                                  defaultMacros.protein) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Carbs */}
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mt-1">
                        <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-[#3A9B67]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <span className="text-xs sm:text-sm font-medium">
                              Carbs
                            </span>
                            {consumedNutrition.carbs > defaultMacros.carbs && (
                              <AlertCircle className="ml-1 w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                            )}
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {consumedNutrition.carbs}/{defaultMacros.carbs}g
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                          <div
                            className={`h-2 sm:h-2.5 rounded-full ${
                              consumedNutrition.carbs > defaultMacros.carbs
                                ? "bg-red-400"
                                : "bg-[#3A9B67]"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (consumedNutrition.carbs /
                                  defaultMacros.carbs) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Fat */}
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mt-1">
                        <Drumstick className="w-5 h-5 sm:w-6 sm:h-6 text-[#D83A56]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <span className="text-xs sm:text-sm font-medium">
                              Fat
                            </span>
                            {consumedNutrition.fat > defaultMacros.fat && (
                              <AlertCircle className="ml-1 w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                            )}
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {consumedNutrition.fat}/{defaultMacros.fat}g
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                          <div
                            className={`h-2 sm:h-2.5 rounded-full ${
                              consumedNutrition.fat > defaultMacros.fat
                                ? "bg-red-400"
                                : "bg-[#D83A56]"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (consumedNutrition.fat / defaultMacros.fat) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Macronutrient Information */}
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="text-[10px] sm:text-xs">
                      <div className="flex items-start mb-1">
                        <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="font-medium text-gray-700">
                          Macro Calculation
                        </span>
                      </div>
                      <ul className="text-gray-600 pl-5 space-y-0.5 list-disc text-[9px] sm:text-[10px]">
                        <li>
                          <span className="font-medium">Protein:</span>{" "}
                          {userWeight}kg × 1.6g = {defaultMacros.protein}g (
                          {proteinPercentage}% cals)
                        </li>
                        <li>
                          <span className="font-medium">Fat:</span>{" "}
                          {dailyCalories} × 30% ÷ 9 = {defaultMacros.fat}g (
                          {fatPercentage}% cals)
                        </li>
                        <li>
                          <span className="font-medium">Carbs:</span> Remaining
                          calories = {defaultMacros.carbs}g ({carbsPercentage}%
                          cals)
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Meal Plan */}
            <div className="col-span-1 md:col-span-2">
              {/* Combined Meal Plan and Blood Sugar Impact */}
              <div className="border border-gray-300 md:border-2 rounded-lg overflow-hidden">
                {/* Meal Tabs */}
                <div className="p-3 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 md:mb-4">
                    <h2 className="text-lg font-semibold mb-2 sm:mb-0">
                      Meal Plan for Today
                    </h2>

                    {/* Meal Selection Tabs */}
                    <div className="flex bg-gray-100 rounded-xl p-1.5 self-start sm:self-auto shadow-sm">
                      {(
                        Object.keys(mealPlanData) as Array<keyof MealPlans>
                      ).map((meal) => (
                        <button
                          key={meal}
                          onClick={() => setSelectedMeal(meal)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition mx-0.5 ${
                            selectedMeal === meal
                              ? "bg-[#FF9466] text-white shadow-sm"
                              : "text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {meal.charAt(0).toUpperCase() + meal.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Meal Items */}
                  <div className="space-y-4">
                    {mealPlanData[selectedMeal]?.map((meal: MealPlan) => (
                      <div
                        key={meal.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                        onClick={() => navigate(`/recipes/${meal.recipe.id}`)}
                      >
                        <div className="flex p-2">
                          <div className="relative">
                            <img
                              src={`/api/recipes/${meal.recipe.id}/image`}
                              alt={meal.recipe.title}
                              className="w-14 h-14 rounded-lg object-cover"
                            />
                            <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs font-medium ml-0.5">
                                  {meal.recipe.rating}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-3 flex-1 flex flex-col justify-between">
                            <div className="flex justify-between">
                              <h3 className="font-medium">
                                {meal.recipe.title}
                              </h3>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{meal.recipe.prep_time}</span>
                                <span className="mx-2">•</span>
                                <Utensils className="w-4 h-4 mr-1" />
                                <span>
                                  {meal.recipe.ingredients.length} ingredients
                                </span>
                              </div>
                              <div
                                className="flex items-center gap-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleMealCompletion(
                                      meal.id,
                                      meal.recipe.title
                                    );
                                  }}
                                  className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
                                >
                                  {(() => {
                                    // Define mealKey as a combination of recipe title and meal time (list)
                                    const mealKey = `${meal.recipe.title}_${selectedMeal}`;
                                    return completedMeals[mealKey] ||
                                      completedMeals[meal.recipe.title] ? (
                                      <CheckSquare className="w-5 h-5 text-green-500" />
                                    ) : (
                                      <Square className="w-5 h-5" />
                                    );
                                  })()}
                                  <span className="text-sm">Completed</span>
                                </button>

                                {/* Heart button for liking meals */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLikedMeal(meal.recipe.id);
                                  }}
                                  className="text-gray-500 hover:text-gray-700"
                                  title={
                                    likedMeals[meal.recipe.id]
                                      ? "Remove from favorites"
                                      : "Add to favorites"
                                  }
                                >
                                  <Heart
                                    className={`w-5 h-5 ${
                                      likedMeals[meal.recipe.id]
                                        ? "text-red-500 fill-red-500"
                                        : ""
                                    }`}
                                  />
                                </button>

                                {/* Always show "Another option" button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAlternativeMeal(
                                      selectedMeal,
                                      meal.id
                                    );
                                  }}
                                  className="text-sm px-3 py-1 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                                >
                                  Another option
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blood Sugar Impact Component */}
                <BloodSugarImpact
                  mealPlanData={mealPlanData}
                  selectedMeal={selectedMeal}
                  completedMeals={completedMeals}
                  currentMealIndex={currentMealIndex}
                />
              </div>
            </div>
          </div>

          {/* Eat in a Restaurant - Full Width Section */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Utensils className="w-6 h-6 md:w-7 md:h-7 text-[#0F594A]" />
              <h3 className="text-xl md:text-2xl font-semibold text-[#0F594A]">
                Eat in a Restaurant
              </h3>
            </div>
            <div className="border border-dotted md:border-2 border-[#0F594A] rounded-lg p-4 md:p-6 flex flex-col items-center">
              <div className="w-full max-w-2xl">
                {!selectedImage ? (
                  <div className="text-center mb-6">
                    <Camera 
                      className="w-16 h-16 text-[#0F594A] mx-auto mb-4 cursor-pointer hover:text-[#0D4D40] transition-colors" 
                      onClick={() => document.getElementById('menu-file-input')?.click()}
                    />
                    <p className="text-lg text-[#0F594A] font-medium">
                      Take a photo of the menu for what to order
                    </p>
                    <p className="text-gray-500 my-2">or</p>
                    <div className="flex justify-center mt-4">
                      <button 
                        className="px-4 py-2 bg-[#FFF3E0] rounded-lg hover:bg-[#FFE0B2] transition-colors flex items-center justify-center gap-2"
                        onClick={() => document.getElementById('menu-file-input')?.click()}
                      >
                        <Image className="w-5 h-5 text-[#0F594A]" />
                        <span className="text-[#0F594A] font-medium">Choose from album</span>
                      </button>
                    </div>
                    <input
                      id="menu-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-full">
                      <img
                        src={selectedImage}
                        alt="Menu Image"
                        className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
                      />
                    </div>
                    
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={handleDeleteImage}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                      <button 
                        onClick={analyzeMenu}
                        disabled={isAnalyzing}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          isAnalyzing 
                            ? "bg-gray-200 text-gray-500" 
                            : "bg-[#0F594A] text-white hover:bg-[#0D4D40] transition-colors"
                        }`}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>Analyze the Menu</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* 分析结果区域 */}
                    {analysisResult && (
                      <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-lg w-full">
                        <h4 className="text-lg font-semibold mb-2 text-[#0F594A]">Result:</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{analysisResult}</p>
                        
                        {menuItems.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Menu Analysis:</h5>
                            <div className="space-y-3 mt-3">
                              {menuItems.map((item, idx) => (
                                <div key={idx} className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{item.name}</span>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium 
                                      ${item.isHealthy 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-red-100 text-red-800"}`}
                                    >
                                      {item.isHealthy ? "Recommended ✓" : "Don't recommend ✗"}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className={`h-1.5 rounded-full ${
                                          item.healthScore > 70 ? "bg-green-500" : 
                                          item.healthScore > 40 ? "bg-yellow-500" : "bg-red-500"
                                        }`}
                                        style={{ width: `${item.healthScore}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs ml-2 w-8">{item.healthScore}/100</span>
                                  </div>
                                  
                                  {item.recommendation && (
                                    <p className="text-xs text-gray-600 mt-2">{item.recommendation}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalPage;