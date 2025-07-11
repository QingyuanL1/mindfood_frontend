import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { api } from "../api";

interface Recipe {
  id: number;
  title: string;
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

interface BloodSugarImpactProps {
  mealPlanData: MealPlans;
  selectedMeal: keyof MealPlans;
  completedMeals: { [key: string]: boolean };
  currentMealIndex?: { [key: string]: number };
}

interface UserCharacteristics {
  age: number;
  bmi: number;
  hasType2Diabetes: boolean;
  isPregnant: boolean;
  takesInsulin: number;
  takesMetformin: boolean;
  fastingGlucose: number;
}

const extractNutrientValue = (nutrients: any[], names: string[]): number => {
  if (!nutrients || !Array.isArray(nutrients)) return 0;

  for (const name of names) {
    const nutrient = nutrients.find((n) => n.nutrient_name === name);
    if (nutrient && nutrient.value) {
      return parseFloat(nutrient.value);
    }
  }

  return 0;
};

const convertNutritionData = (
  nutrients: any
): {
  totalCarbs: number;
  solubleFiber: number;
  insolubleFiber: number;
  protein: number;
  fat: number;
  GI: number;
} => {
  if (nutrients && typeof nutrients === "object" && "carbs" in nutrients) {
    return {
      totalCarbs: nutrients.carbs || 0,
      solubleFiber:
        typeof nutrients.solubleFiber === "number"
          ? nutrients.solubleFiber
          : nutrients.fiber
          ? nutrients.fiber * 0.33
          : 1,
      insolubleFiber:
        typeof nutrients.insolubleFiber === "number"
          ? nutrients.insolubleFiber
          : nutrients.fiber
          ? nutrients.fiber * 0.67
          : 2,
      protein: nutrients.protein || 0,
      fat: nutrients.fat || 0,
      GI: nutrients.GI || 50,
    };
  }

  if (nutrients && Array.isArray(nutrients)) {
    return {
      totalCarbs:
        extractNutrientValue(nutrients, [
          "Total Carbohydrate",
          "Carbohydrates",
        ]) || 0,
      solubleFiber: extractNutrientValue(nutrients, ["Soluble Fiber"]) || 1,
      insolubleFiber:
        extractNutrientValue(nutrients, ["Insoluble Fiber"]) ||
        extractNutrientValue(nutrients, ["Fiber"]) -
          extractNutrientValue(nutrients, ["Soluble Fiber"]) ||
        2,
      protein: extractNutrientValue(nutrients, ["Protein"]) || 0,
      fat: extractNutrientValue(nutrients, ["Total Fat", "Fat"]) || 0,
      GI: 50,
    };
  }

  return {
    totalCarbs: 0,
    solubleFiber: 1,
    insolubleFiber: 2,
    protein: 0,
    fat: 0,
    GI: 50,
  };
};

const calculateBloodSugarProfile = (
  meal: {
    totalCarbs: number;
    solubleFiber: number;
    insolubleFiber: number;
    protein: number;
    fat: number;
    GI: number;
    cookingMethod?: string;
  },
  userCharacteristics: UserCharacteristics,
  behaviorFactors: {
    postMealExercise: boolean;
    poorSleep: boolean;
    isStressed: boolean;
  } = {
    postMealExercise: false,
    poorSleep: false,
    isStressed: false,
  }
): number[] => {
  const effectiveCarbs = Math.max(
    0,
    meal.totalCarbs - (meal.solubleFiber * 1.5 + meal.insolubleFiber)
  );

  let adjustedGI = meal.GI;
  if (meal.cookingMethod === "fried" || meal.cookingMethod === "gelatinized") {
    adjustedGI = meal.GI * 1.2;
  }

  const fatSlowdownFactor = (meal.fat / 10) * 0.05;

  let proteinConversionRate = 0.5;
  if (meal.protein > 30) {
    proteinConversionRate = 0.6;
  }
  const proteinEquivCarbs = meal.protein * proteinConversionRate;

  let fatConversionRate = 0.1;
  const isLongTermHighFatDiet = false;
  if (isLongTermHighFatDiet) {
    fatConversionRate = 0.15;
  }
  const fatConvertedSugar = meal.fat * fatConversionRate;

  let kShortTerm = 0;
  let kDelayed = 0;
  let kLongTerm = 0;

  if (userCharacteristics.age > 60) {
    kShortTerm += 0.1;
    kLongTerm += 0.05;
  }

  if (userCharacteristics.bmi >= 30) {
    kShortTerm += 0.15;
    kDelayed += 0.1;
    kLongTerm += 0.1;
  }

  if (userCharacteristics.hasType2Diabetes) {
    kShortTerm += 0.2;
    kDelayed += 0.15;
    kLongTerm += 0.15;
  }

  if (userCharacteristics.isPregnant) {
    kShortTerm += 0.25;
    kDelayed += 0.2;
    kLongTerm += 0.2;
  }

  if (userCharacteristics.takesInsulin > 0) {
    kShortTerm -= 0.1 * userCharacteristics.takesInsulin;
  }

  if (userCharacteristics.takesMetformin) {
    kShortTerm -= 0.05;
    kDelayed -= 0.05;
  }

  let immediateActivityModifier = 0;
  let delayedActivityModifier = 0;

  if (behaviorFactors.postMealExercise) {
    immediateActivityModifier -= 0.3;
    delayedActivityModifier -= 0.2;
  }

  if (behaviorFactors.poorSleep) {
    kShortTerm += 0.1;
    kDelayed += 0.05;
  }

  if (behaviorFactors.isStressed) {
    kShortTerm += 0.2;
    kDelayed += 0.1;
  }

  const deltaGlucose0_2h =
    (effectiveCarbs * (adjustedGI / 100) * (1 - fatSlowdownFactor) +
      immediateActivityModifier) *
    0.5 *
    (1 + kShortTerm);

  const deltaGlucose2_4h =
    (proteinEquivCarbs + fatConvertedSugar) *
    0.3 *
    (1 + kDelayed + delayedActivityModifier);

  const totalGL = effectiveCarbs * (adjustedGI / 100);
  const longTermCoefficient = 0.01;
  const deltaGlucoseLongTerm = totalGL * longTermCoefficient * (1 + kLongTerm);

  const fastingGlucose = userCharacteristics.fastingGlucose;

  const glucose1h = fastingGlucose + deltaGlucose0_2h * 0.7;

  const glucose2h =
    fastingGlucose +
    deltaGlucose0_2h +
    deltaGlucose2_4h * 0.3 +
    deltaGlucoseLongTerm * 0.2;

  const glucose3h =
    fastingGlucose +
    deltaGlucose0_2h * 0.3 +
    deltaGlucose2_4h * 0.8 +
    deltaGlucoseLongTerm * 0.5;

  const glucose4h =
    fastingGlucose +
    deltaGlucose0_2h * 0.1 +
    deltaGlucose2_4h * 0.4 +
    deltaGlucoseLongTerm * 0.8;

  return [
    fastingGlucose,
    glucose1h,
    glucose2h,
    glucose3h,
    glucose4h,
  ];
};

const BloodSugarImpact: React.FC<BloodSugarImpactProps> = ({
  mealPlanData,
  selectedMeal,
  completedMeals,
  currentMealIndex = {},
}) => {
  const [bloodSugarProfiles, setBloodSugarProfiles] = useState({
    currentDayProfile: [] as number[],
    pastDayProfile: [] as number[],
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshBloodSugarData = async () => {
    setIsLoading(true);
    try {
      const profiles = await generateBloodSugarProfiles();
      setBloodSugarProfiles(profiles);
    } catch (error) {
      // console.error("Error generating blood sugar profiles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBloodSugarData();
  }, [mealPlanData, selectedMeal, completedMeals, currentMealIndex]);

  useEffect(() => {
    const handleMealCompleted = () => {
      refreshBloodSugarData();
    };

    const handleMealUncompleted = () => {
      refreshBloodSugarData();
    };

    const handleFoodEntryAdded = () => {
      refreshBloodSugarData();
    };

    const handleFoodEntryUpdated = () => {
      refreshBloodSugarData();
    };

    window.addEventListener(
      "mealCompleted",
      handleMealCompleted as EventListener
    );
    window.addEventListener(
      "mealUncompleted",
      handleMealUncompleted as EventListener
    );
    window.addEventListener(
      "foodEntryAdded",
      handleFoodEntryAdded as EventListener
    );
    window.addEventListener(
      "foodEntryUpdated",
      handleFoodEntryUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        "mealCompleted",
        handleMealCompleted as EventListener
      );
      window.removeEventListener(
        "mealUncompleted",
        handleMealUncompleted as EventListener
      );
      window.removeEventListener(
        "foodEntryAdded",
        handleFoodEntryAdded as EventListener
      );
      window.removeEventListener(
        "foodEntryUpdated",
        handleFoodEntryUpdated as EventListener
      );
    };
  }, []);

  const generateBloodSugarProfiles = async () => {
    const userCharacteristics: UserCharacteristics = {
      age: 45,
      bmi: 25,
      hasType2Diabetes: false,
      isPregnant: false,
      takesInsulin: 0,
      takesMetformin: false,
      fastingGlucose: 90,
    };
    const defaultBehaviorFactors = {
      postMealExercise: false,
      poorSleep: false,
      isStressed: false,
    };

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const token = localStorage.getItem("access_token");

    let pastBreakfast = { totalCarbs: 30, solubleFiber: 1, insolubleFiber: 2, protein: 15, fat: 10, GI: 50, cookingMethod: "cooked" };
    let pastLunch = { totalCarbs: 45, solubleFiber: 1.5, insolubleFiber: 3.5, protein: 25, fat: 15, GI: 55, cookingMethod: "cooked" };
    let pastSnack = { totalCarbs: 20, solubleFiber: 1, insolubleFiber: 2, protein: 8, fat: 5, GI: 40, cookingMethod: "cooked" };
    let pastDinner = { totalCarbs: 40, solubleFiber: 2, insolubleFiber: 4, protein: 30, fat: 18, GI: 45, cookingMethod: "cooked" };

      if (token) {
        try {
          const response = await api.get(
            `/nutrition/log?start_date=${yesterdayStr}`,
            { headers: { Authorization: `Bearer ${token}` } }
            );
          const pastDayMeals = response.data || [];

            const pastBreakfastData = pastDayMeals.find((meal: any) => meal?.meal_time === "breakfast");
            if (pastBreakfastData?.recipe_id) {
                try {
                    const recipeResponse = await api.get(`/recipes/${pastBreakfastData.recipe_id}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (recipeResponse.data?.nutrition_nutrients) {
                        pastBreakfast = { ...convertNutritionData(recipeResponse.data.nutrition_nutrients), GI: 50, cookingMethod: "cooked" };
                    }
                } catch (error) { 
                    // console.error("Error fetching past breakfast recipe:", error); 
                }
            } else if (pastBreakfastData) {
                 pastBreakfast = { ...convertNutritionData({ carbs: pastBreakfastData.carbs, protein: pastBreakfastData.protein, fat: pastBreakfastData.fat }), GI: 50, cookingMethod: "cooked" };
            }

            const pastLunchData = pastDayMeals.find((meal: any) => meal?.meal_time === "lunch");
            if (pastLunchData?.recipe_id) {
                try {
                    const recipeResponse = await api.get(`/recipes/${pastLunchData.recipe_id}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (recipeResponse.data?.nutrition_nutrients) {
                         pastLunch = { ...convertNutritionData(recipeResponse.data.nutrition_nutrients), GI: 55, cookingMethod: "cooked" };
                    }
                } catch (error) { 
                    // console.error("Error fetching past lunch recipe:", error); 
                }
            } else if (pastLunchData) {
                 pastLunch = { ...convertNutritionData({ carbs: pastLunchData.carbs, protein: pastLunchData.protein, fat: pastLunchData.fat }), GI: 55, cookingMethod: "cooked" };
            }

            const pastSnackData = pastDayMeals.find((meal: any) => meal?.meal_time === "snack");
            if (pastSnackData?.recipe_id) {
                try {
                    const recipeResponse = await api.get(`/recipes/${pastSnackData.recipe_id}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (recipeResponse.data?.nutrition_nutrients) {
                          pastSnack = { ...convertNutritionData(recipeResponse.data.nutrition_nutrients), GI: 40, cookingMethod: "cooked" };
                    }
                } catch (error) { 
                    // console.error("Error fetching past snack recipe:", error); 
                }
            } else if (pastSnackData) {
                 pastSnack = { ...convertNutritionData({ carbs: pastSnackData.carbs, protein: pastSnackData.protein, fat: pastSnackData.fat }), GI: 40, cookingMethod: "cooked" };
            }

            const pastDinnerData = pastDayMeals.find((meal: any) => meal?.meal_time === "dinner");
            if (pastDinnerData?.recipe_id) {
                try {
                    const recipeResponse = await api.get(`/recipes/${pastDinnerData.recipe_id}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (recipeResponse.data?.nutrition_nutrients) {
                         pastDinner = { ...convertNutritionData(recipeResponse.data.nutrition_nutrients), GI: 45, cookingMethod: "cooked" };
                    }
                } catch (error) { 
                    // console.error("Error fetching past dinner recipe:", error); 
                }
            } else if (pastDinnerData) {
                 pastDinner = { ...convertNutritionData({ carbs: pastDinnerData.carbs, protein: pastDinnerData.protein, fat: pastDinnerData.fat }), GI: 45, cookingMethod: "cooked" };
            }

        } catch (apiError) {
            // console.error("API request failed for past day log, using default meal data:", apiError);
        }
    }

    const pastBreakfastProfile = calculateBloodSugarProfile(pastBreakfast, { ...userCharacteristics, fastingGlucose: 90 }, defaultBehaviorFactors);
    const pastLunchProfile = calculateBloodSugarProfile(pastLunch, { ...userCharacteristics, fastingGlucose: pastBreakfastProfile[4] }, defaultBehaviorFactors);
    const pastSnackProfile = calculateBloodSugarProfile(pastSnack, { ...userCharacteristics, fastingGlucose: pastLunchProfile[4] }, defaultBehaviorFactors);
    const pastDinnerProfile = calculateBloodSugarProfile(pastDinner, { ...userCharacteristics, fastingGlucose: pastSnackProfile[4] }, defaultBehaviorFactors);

    const dynamicPastDayProfile = [
      pastBreakfastProfile[0],
      pastBreakfastProfile[1],
      pastBreakfastProfile[2],
      pastBreakfastProfile[3],
      pastBreakfastProfile[4],
      pastLunchProfile[1],
      pastLunchProfile[2],
      pastLunchProfile[3],
      pastLunchProfile[4],
      pastSnackProfile[1],
      pastSnackProfile[2],
      pastSnackProfile[3],
      pastSnackProfile[4],
      pastDinnerProfile[1],
      pastDinnerProfile[2],
      pastDinnerProfile[3],
      pastBreakfastProfile[0] + 5,
    ].map((value) => Math.round(value));


    const todayStr = today.toISOString().split("T")[0];

    type AggregatedMeal = { totalCarbs: number; solubleFiber: number; insolubleFiber: number; protein: number; fat: number; GI: number; totalWeightForGI: number; count: number; cookingMethod: string; };
    let currentAggregatedMeals: Record<string, AggregatedMeal> = {
        breakfast: { totalCarbs: 0, solubleFiber: 0, insolubleFiber: 0, protein: 0, fat: 0, GI: 0, totalWeightForGI: 0, count: 0, cookingMethod: "cooked" },
        lunch:     { totalCarbs: 0, solubleFiber: 0, insolubleFiber: 0, protein: 0, fat: 0, GI: 0, totalWeightForGI: 0, count: 0, cookingMethod: "cooked" },
        snack:     { totalCarbs: 0, solubleFiber: 0, insolubleFiber: 0, protein: 0, fat: 0, GI: 0, totalWeightForGI: 0, count: 0, cookingMethod: "cooked" },
        dinner:    { totalCarbs: 0, solubleFiber: 0, insolubleFiber: 0, protein: 0, fat: 0, GI: 0, totalWeightForGI: 0, count: 0, cookingMethod: "cooked" },
    };
    const defaultGI: Record<string, number> = { breakfast: 50, lunch: 55, snack: 40, dinner: 45 };

    if (token) {
        try {
            const response = await api.get(`/nutrition/log?start_date=${todayStr}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const todaysEntries = response.data || [];
            // console.log("Today's Logged Entries:", todaysEntries);

            const recipeFetchPromises = [];

            for (const entry of todaysEntries) {
                 const mealType = entry.meal_time as keyof typeof currentAggregatedMeals;
                 if (!mealType || !currentAggregatedMeals[mealType]) continue;

                 if (entry.recipe_id) {
                     recipeFetchPromises.push(
                         api.get(`/recipes/${entry.recipe_id}`, { headers: { Authorization: `Bearer ${token}` } })
                            .then(recipeResponse => ({ entry, nutrition: recipeResponse.data?.nutrition_nutrients }))
                            .catch(error => {
                                // console.error(`Error fetching recipe ${entry.recipe_id} for log entry`, error);
                                return { entry, nutrition: null };
                            })
                     );
            } else {
                     const entryNutrition = convertNutritionData({
                         carbs: entry.carbs || 0,
                         protein: entry.protein || 0,
                         fat: entry.fat || 0,
                         fiber: (entry.solubleFiber || 0) + (entry.insolubleFiber || 0) || undefined,
                         GI: defaultGI[mealType] || 50
                      });

                      const mealAgg = currentAggregatedMeals[mealType];
                      mealAgg.totalCarbs += entryNutrition.totalCarbs;
                      mealAgg.solubleFiber += entryNutrition.solubleFiber;
                      mealAgg.insolubleFiber += entryNutrition.insolubleFiber;
                      mealAgg.protein += entryNutrition.protein;
                      mealAgg.fat += entryNutrition.fat;
                      mealAgg.count += 1;

                      const entryGI = entryNutrition.GI || defaultGI[mealType] || 50;
                      const weight = entryNutrition.totalCarbs;
                      if (weight > 0) {
                          mealAgg.GI = ((mealAgg.GI * mealAgg.totalWeightForGI) + (entryGI * weight)) / (mealAgg.totalWeightForGI + weight);
                          mealAgg.totalWeightForGI += weight;
                      } else if (mealAgg.count === 1) {
                           mealAgg.GI = entryGI;
                      }
                 }
            }

            const recipeResults = await Promise.all(recipeFetchPromises);

            for (const result of recipeResults) {
                const { entry, nutrition } = result;
                const mealType = entry.meal_time as keyof typeof currentAggregatedMeals;
                if (!mealType || !currentAggregatedMeals[mealType]) continue;

                let entryNutrition: ReturnType<typeof convertNutritionData>;
                if (nutrition) {
                    entryNutrition = convertNutritionData(nutrition);
            } else {
                    entryNutrition = convertNutritionData({
                        carbs: entry.carbs || 0,
                        protein: entry.protein || 0,
                        fat: entry.fat || 0,
                        fiber: (entry.solubleFiber || 0) + (entry.insolubleFiber || 0) || undefined,
                        GI: defaultGI[mealType] || 50
                    });
                }

                const mealAgg = currentAggregatedMeals[mealType];
                mealAgg.totalCarbs += entryNutrition.totalCarbs;
                mealAgg.solubleFiber += entryNutrition.solubleFiber;
                mealAgg.insolubleFiber += entryNutrition.insolubleFiber;
                mealAgg.protein += entryNutrition.protein;
                mealAgg.fat += entryNutrition.fat;
                mealAgg.count += 1;

                const entryGI = entryNutrition.GI || defaultGI[mealType] || 50;
                const weight = entryNutrition.totalCarbs;
                if (weight > 0) {
                    mealAgg.GI = ((mealAgg.GI * mealAgg.totalWeightForGI) + (entryGI * weight)) / (mealAgg.totalWeightForGI + weight);
                    mealAgg.totalWeightForGI += weight;
                } else if (mealAgg.count === 1) {
                    mealAgg.GI = entryGI;
                }
            }


        } catch (logError) {
            // console.error("Error fetching today's nutrition log:", logError);
        }
    }

     // console.log("Aggregated Meals for Today:", currentAggregatedMeals);

    const finalCurrentMeals = {
        breakfast: currentAggregatedMeals.breakfast.count > 0 ? currentAggregatedMeals.breakfast : { totalCarbs: 30, solubleFiber: 1, insolubleFiber: 2, protein: 15, fat: 10, GI: 50, cookingMethod: "cooked" },
        lunch:     currentAggregatedMeals.lunch.count > 0     ? currentAggregatedMeals.lunch     : { totalCarbs: 45, solubleFiber: 1.5, insolubleFiber: 3.5, protein: 25, fat: 15, GI: 55, cookingMethod: "cooked" },
        snack:     currentAggregatedMeals.snack.count > 0     ? currentAggregatedMeals.snack     : { totalCarbs: 20, solubleFiber: 1, insolubleFiber: 2, protein: 8, fat: 5, GI: 40, cookingMethod: "cooked" },
        dinner:    currentAggregatedMeals.dinner.count > 0    ? currentAggregatedMeals.dinner    : { totalCarbs: 40, solubleFiber: 2, insolubleFiber: 4, protein: 30, fat: 18, GI: 45, cookingMethod: "cooked" },
    };

    const currentBreakfastProfile = calculateBloodSugarProfile(finalCurrentMeals.breakfast, { ...userCharacteristics, fastingGlucose: 90 }, defaultBehaviorFactors);
    const currentLunchProfile = calculateBloodSugarProfile(finalCurrentMeals.lunch, { ...userCharacteristics, fastingGlucose: currentBreakfastProfile[4] }, defaultBehaviorFactors);
    const currentSnackProfile = calculateBloodSugarProfile(finalCurrentMeals.snack, { ...userCharacteristics, fastingGlucose: currentLunchProfile[4] }, defaultBehaviorFactors);
    const currentDinnerProfile = calculateBloodSugarProfile(finalCurrentMeals.dinner, { ...userCharacteristics, fastingGlucose: currentSnackProfile[4] }, defaultBehaviorFactors);

    const currentDayProfile = [
      currentBreakfastProfile[0],
      currentBreakfastProfile[1],
      currentBreakfastProfile[2],
      currentBreakfastProfile[3],
      currentBreakfastProfile[4],
      currentLunchProfile[1],
      currentLunchProfile[2],
      currentLunchProfile[3],
      currentLunchProfile[4],
      currentSnackProfile[1],
      currentSnackProfile[2],
      currentSnackProfile[3],
      currentSnackProfile[4],
      currentDinnerProfile[1],
      currentDinnerProfile[2],
      currentDinnerProfile[3],
      currentBreakfastProfile[0] + 5,
    ];

    const result = {
      currentDayProfile: currentDayProfile.map((value) => Math.round(value)),
      pastDayProfile: dynamicPastDayProfile,
    };

     // console.log("Generated Blood Sugar Profiles:", result);

    return result;
  };

  return (
    <div className="p-3 md:p-6">
      <h3 className="text-lg font-semibold mb-4">Blood Sugar Impact</h3>

      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="h-[220px] w-full">
          <Line
            data={{
              labels: [
                "Fasting",
                "1h after breakfast",
                "2h after breakfast",
                "3h after breakfast",
                "Before lunch",
                "1h after lunch",
                "2h after lunch",
                "3h after lunch",
                "Before snack",
                "1h after snack",
                "2h after snack",
                "3h after snack",
                "Before dinner",
                "1h after dinner",
                "2h after dinner",
                "3h after dinner",
                "Bedtime",
              ],
              datasets: [
                {
                  label: "Past diet",
                  data: bloodSugarProfiles.pastDayProfile,
                  borderColor: "#006400",
                  borderWidth: 2,
                  tension: 0.4,
                  pointRadius: 2,
                },
                {
                  label: "Current recipe",
                  data: bloodSugarProfiles.currentDayProfile,
                  borderColor: "#FF9466",
                  borderDash: [2, 2],
                  borderWidth: 2,
                  tension: 0.4,
                  pointRadius: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    usePointStyle: false,
                    boxWidth: 40,
                    boxHeight: 1,
                    font: {
                      size: 10,
                    },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      let label = context.dataset.label || "";
                      if (label) {
                        label += ": ";
                      }
                      if (context.parsed.y !== null) {
                        label += Math.round(context.parsed.y) + " mg/dL";
                      }
                      return label;
                    },
                  },
                },
              },
              scales: {
                y: {
                  min: 70,
                  max: 200,
                  title: {
                    display: true,
                    text: "Blood glucose (mg/dL)",
                    font: {
                      size: 10,
                    },
                  },
                  ticks: {
                    stepSize: 20,
                    font: {
                      size: 10,
                    },
                  },
                  grid: {
                    color: (context) => {
                      if (context.tick.value === 140) {
                        return "rgba(255, 0, 0, 0.2)";
                      }
                      if (context.tick.value === 100) {
                        return "rgba(0, 128, 0, 0.2)";
                      }
                      return "rgba(0, 0, 0, 0.1)";
                    },
                    lineWidth: (context) => {
                      if (
                        context.tick.value === 140 ||
                        context.tick.value === 100
                      ) {
                        return 1.5;
                      }
                      return 0.5;
                    },
                  },
                },
                x: {
                  ticks: {
                    font: {
                      size: 7,
                    },
                    maxRotation: 45,
                    minRotation: 45,
                    autoSkip: false,
                    callback: function (value: any, index: number) {
                      const keyLabels = [0, 4, 8, 12, 16];
                      return keyLabels.includes(index)
                        ? this.getLabelForValue(value)
                        : "";
                    },
                  },
                },
              },
            }}
          />
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        <div className="flex items-center">
          <span className="w-4 h-0.5 bg-[#006400] block mr-1"></span>
          <span>
            Past Diet: Blood sugar pattern based on previous day's diet
          </span>
        </div>
        <div className="flex items-center mt-1">
          <span className="w-4 h-0.5 border-t border-[#FF9466] border-dashed block mr-1"></span>
          <span>
            Current Plan: Expected blood sugar trend based on selected recipes
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-400">
          <span>
            Blood Sugar Targets: Below 140 mg/dL after meals, below 100 mg/dL
            when fasting
          </span>
        </div>
      </div>
    </div>
  );
};

export default BloodSugarImpact;
