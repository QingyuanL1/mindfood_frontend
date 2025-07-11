import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Clock, Heart, Share2, Users } from "lucide-react";
import { api } from "../api";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface NutritionNutrient {
  nutrient_name: string;
  value: string;
  daily_pct: string;
}

interface Recipe {
  id: number;
  title: string;
  description: string | null;
  prep_time: string;
  cook_time: string;
  total_time: string;
  servings: string;
  nutrition_servings_per_recipe: number;
  nutrition_calories: number;
  rating: number;
  ratings_count: number;
  ingredients: string[];
  steps: Array<{
    step_number: number;
    instruction: string;
  }>;
  nutrition_nutrients: NutritionNutrient[];
  cuisines: string[];
  allergens: string[];
  eating_styles: string[];
  health_concerns: string[];
  tags: string[];
}

interface FractionMap {
  [key: string]: number;
}

const fractionMap: FractionMap = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 0.333,
  "⅔": 0.667,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

const decimalToFraction = (decimal: number): string => {
  for (const [char, value] of Object.entries(fractionMap)) {
    if (Math.abs(decimal - value) < 0.01) {
      return char;
    }
  }
  return decimal.toFixed(2).replace(/\.?0+$/, "");
};

const adjustQuantity = (ingredient: string, multiplier: number): string => {
  const match = ingredient.match(/^([\d./¼½¾⅓⅔⅛⅜⅝⅞]+)\s*(.*)$/);
  if (!match) return ingredient;

  let [_, amount, rest] = match;
  let numericAmount: number;

  if (Object.keys(fractionMap).some((char) => amount.includes(char))) {
    numericAmount = 0;
    const mixedMatch = amount.match(/(\d+)?([¼½¾⅓⅔⅛⅜⅝⅞])/);
    if (mixedMatch) {
      const [_, wholeNum, fraction] = mixedMatch;
      numericAmount =
        (wholeNum ? parseInt(wholeNum) : 0) + fractionMap[fraction];
    } else {
      numericAmount = fractionMap[amount];
    }
  } else if (amount.includes("/")) {
    const [num, denom] = amount.split("/");
    numericAmount = Number(num) / Number(denom);
  } else {
    numericAmount = Number(amount);
  }

  const adjustedAmount = numericAmount * multiplier;

  let formattedAmount: string;
  if (adjustedAmount < 1 && adjustedAmount > 0) {
    const fraction = decimalToFraction(adjustedAmount);
    formattedAmount = fraction;
  } else {
    formattedAmount =
      adjustedAmount % 1 === 0
        ? adjustedAmount.toString()
        : adjustedAmount.toFixed(2).replace(/\.?0+$/, "");
  }

  return `${formattedAmount} ${rest}`;
};

const RecipeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await api.get(`/api/recipes/${id}`);
        setRecipe(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch recipe");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 pl-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 pl-48 flex items-center justify-center text-red-500">
          {error || "Recipe not found"}
        </div>
      </div>
    );
  }

  const handleRateRecipe = async (rating: number) => {
    try {
      await api.post(`/api/recipes/${id}/rate?rating=${rating}`);
      const response = await api.get(`/api/recipes/${id}`);
      setRecipe(response.data);
    } catch (err) {
      console.error("Error rating recipe:", err);
    }
  };

  // Helper function to filter out "(None)" values
  const filterNoneValues = (arr: string[]) => {
    return arr.filter(
      (item) => item !== "(None)" && item.toLowerCase() !== "none"
    );
  };

  const prepareMacronutrientData = (nutrients: NutritionNutrient[]) => {
    const macros = nutrients
      .filter((n) =>
        ["Total Fat", "Total Carbohydrate", "Protein"].includes(n.nutrient_name)
      )
      .map((n) => ({
        name: n.nutrient_name,
        value: parseInt(n.value),
        dailyPct: parseInt(n.daily_pct || "0"),
      }));

    // Calculate calories from macronutrients
    const totalCalories = macros.reduce((acc, curr) => {
      const multiplier = curr.name === "Total Fat" ? 9 : 4; // Fat has 9 cal/g, protein and carbs have 4 cal/g
      return acc + curr.value * multiplier;
    }, 0);

    return macros.map((macro) => ({
      ...macro,
      percentage:
        ((macro.value * (macro.name === "Total Fat" ? 9 : 4)) / totalCalories) *
        100,
    }));
  };

  const prepareNutrientData = (nutrients: NutritionNutrient[]) => {
    return nutrients
      .filter((n) => n.daily_pct && n.daily_pct !== "")
      .map((n) => ({
        name: n.nutrient_name,
        value: parseInt(n.daily_pct || "0"),
      }));
  };

  const MACRO_COLORS = ["#FF9F43", "#10B981", "#6366F1"];

  return (
    <div className="flex flex-col p-2 sm:p-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Recipes</span>
              <span className="inline sm:hidden">Back</span>
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 ${
                  isLiked ? "text-orange-500" : "text-gray-600"
                } hover:text-orange-500`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main content column */}
          <div className="lg:col-span-8">
            <h1 className="text-xl sm:text-2xl font-semibold mb-4">
              {recipe.title}
            </h1>

            {/* Image with placeholder */}
            <div className="relative w-full h-[250px] sm:h-[400px] mb-6 sm:mb-8 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={`/api/recipes/${recipe.id}/image`}
                alt={recipe.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.fallbackLoaded) {
                    target.dataset.fallbackLoaded = "true";
                    target.src = `https://dummyimage.com/800x600/f5f5f5/aaa&text=${encodeURIComponent(
                      recipe.title.split(" ")[0]
                    )}`;
                  }
                }}
              />
            </div>

            {/* Recipe info - stacked on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 mb-6 sm:mb-8">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  Total: {recipe.total_time}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  {recipe.servings} servings
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Prep: {recipe.prep_time}</span>
              </div>
              {/* Difficulty indicator */}
              <div className="flex items-center space-x-2 sm:ml-auto">
                {(() => {
                  const prepTimeMinutes = parseInt(recipe.prep_time);
                  const stepsCount = recipe.steps.length;
                  let difficulty;

                  if (prepTimeMinutes <= 15 && stepsCount <= 5) {
                    difficulty = {
                      text: "Super Easy",
                      color: "text-green-500 bg-green-50",
                    };
                  } else if (prepTimeMinutes <= 30 && stepsCount <= 8) {
                    difficulty = {
                      text: "Easy",
                      color: "text-blue-500 bg-blue-50",
                    };
                  } else if (prepTimeMinutes <= 60 && stepsCount <= 12) {
                    difficulty = {
                      text: "Moderate",
                      color: "text-orange-500 bg-orange-50",
                    };
                  } else {
                    difficulty = {
                      text: "Complex",
                      color: "text-red-500 bg-red-50",
                    };
                  }

                  return (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${difficulty.color}`}
                    >
                      {difficulty.text}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Description */}
            {recipe.description && (
              <p className="text-gray-600 mb-6 sm:mb-8">{recipe.description}</p>
            )}

            {/* Tags */}
            {(filterNoneValues(recipe.cuisines).length > 0 ||
              filterNoneValues(recipe.eating_styles).length > 0) && (
              <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                {filterNoneValues(recipe.cuisines).map((cuisine) => (
                  <span
                    key={cuisine}
                    className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm"
                  >
                    {cuisine}
                  </span>
                ))}
                {filterNoneValues(recipe.eating_styles).map((style) => (
                  <span
                    key={style}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm"
                  >
                    {style}
                  </span>
                ))}
              </div>
            )}

            {/* Mobile Only: Ingredients Card */}
            <div className="lg:hidden bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Ingredients
              </h2>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">
                  {recipe.nutrition_servings_per_recipe * servingMultiplier}{" "}
                  servings
                </span>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={servingMultiplier}
                  onChange={(e) => setServingMultiplier(Number(e.target.value))}
                  className="w-32 accent-orange-500"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                <div className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-gray-600">
                        {adjustQuantity(ingredient, servingMultiplier)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Only: Nutrition Card - Simplified for mobile */}
            <div className="lg:hidden mb-6">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  Nutrition
                </h2>

                {/* Simplified Nutrition Info */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-500 mb-1">Calories</div>
                    <div className="text-orange-500 font-semibold">
                      {recipe.nutrition_calories}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-500 mb-1">Protein</div>
                    <div className="text-green-500 font-semibold">
                      {recipe.nutrition_nutrients.find(
                        (n) => n.nutrient_name === "Protein"
                      )?.value || "0g"}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-500 mb-1">Carbs</div>
                    <div className="text-blue-500 font-semibold">
                      {recipe.nutrition_nutrients.find(
                        (n) => n.nutrient_name === "Total Carbohydrate"
                      )?.value || "0g"}
                    </div>
                  </div>
                </div>

                {/* Top 5 nutrients */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Key Nutrients
                  </h3>
                  {recipe.nutrition_nutrients
                    .filter((n) => n.daily_pct && n.daily_pct !== "")
                    .slice(0, 5)
                    .map((nutrient, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {nutrient.nutrient_name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{nutrient.value}</span>
                          <span className="text-gray-400 text-xs">•</span>
                          <span className="text-gray-400 text-xs">
                            {nutrient.daily_pct}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Mobile Only: Allergens Warning */}
            {filterNoneValues(recipe.allergens).length > 0 && (
              <div className="lg:hidden mb-6">
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <h3 className="text-red-600 font-medium mb-2">
                    Allergen Warning
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {filterNoneValues(recipe.allergens).map((allergen) => (
                      <span
                        key={allergen}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded-md text-sm"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Directions */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Directions
              </h2>
              <div className="max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                <div className="space-y-6">
                  {recipe.steps.map((step) => (
                    <div key={step.step_number} className="flex space-x-4">
                      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-medium text-sm sm:text-base">
                        {step.step_number}
                      </div>
                      <p className="text-gray-600 flex-1 text-sm sm:text-base">
                        {step.instruction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar column - hidden on mobile */}
          <div className="hidden lg:block lg:col-span-4">
            {/* Nutrition Card */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Nutrition</h2>

              {/* Macronutrient Distribution Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">
                  Macronutrient Distribution
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          recipe
                            ? prepareMacronutrientData(
                                recipe.nutrition_nutrients
                              )
                            : []
                        }
                        dataKey="percentage"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percentage }) =>
                          `${name} ${percentage.toFixed(1)}%`
                        }
                      >
                        {recipe &&
                          prepareMacronutrientData(
                            recipe.nutrition_nutrients
                          ).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={MACRO_COLORS[index]}
                            />
                          ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Daily Value Radar Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">% Daily Values</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={
                        recipe
                          ? prepareNutrientData(recipe.nutrition_nutrients)
                          : []
                      }
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="% Daily Value"
                        dataKey="value"
                        stroke="#FF6B6B"
                        fill="#FF6B6B"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Nutrition Information */}
              <div className="max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                <div className="space-y-4">
                  {recipe.nutrition_nutrients.map((nutrient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-600">
                        {nutrient.nutrient_name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{nutrient.value}</span>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-400">
                          {nutrient.daily_pct}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingredients Card - Desktop version */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">
                  {recipe.nutrition_servings_per_recipe * servingMultiplier}{" "}
                  servings
                </span>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={servingMultiplier}
                  onChange={(e) => setServingMultiplier(Number(e.target.value))}
                  className="w-32 accent-orange-500"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                <div className="space-y-4">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-gray-600">
                        {adjustQuantity(ingredient, servingMultiplier)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Allergens Warning */}
            {filterNoneValues(recipe.allergens).length > 0 && (
              <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
                <h3 className="text-red-600 font-medium mb-2">
                  Allergen Warning
                </h3>
                <div className="flex flex-wrap gap-2">
                  {filterNoneValues(recipe.allergens).map((allergen) => (
                    <span
                      key={allergen}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded-md text-sm"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #E2E8F0 transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E2E8F0;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default RecipeDetail;
