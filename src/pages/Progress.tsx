import React, { useState, useEffect } from "react";
import {
  Plus,
  Camera,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "../api";

// Define types for our state
interface NutritionEntry {
  id?: string;
  name: string;
  portion: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  meal_time?: string; // Add meal_time field for breakfast, lunch, dinner classification
  recipe_id?: number; // Store recipe ID if this entry came from a meal plan
  entry_id?: string; // 添加entry_id字段用于取消操作
}

interface NutritionSummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  entries_count: number;
  completed_meals?: NutritionEntry[]; // 添加completed_meals字段
}

const Progress = () => {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState<NutritionEntry>({
    name: "",
    portion: 1,
    unit: "serving",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date selection state for calendar
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Use actual current date instead of hardcoded date
  const today = new Date();

  // Format the date consistently
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Current selected date as a Date object
  const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);

  // Current selected date formatted for display
  const formattedSelectedDate = formatDate(selectedDate);

  // Month names for dropdown
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Generate calendar days for the selected month and year
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Day of week for the first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    // Convert to Monday-first format (0 = Monday, ..., 6 = Sunday)
    const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    const days = [];

    // Add days from the current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday:
          i === selectedDay &&
          selectedMonth === today.getMonth() &&
          selectedYear === today.getFullYear(),
        isSelected: i === selectedDay,
        // Mock active days for demonstration
        isActive: i >= 15 && i <= 19 && i !== 17,
      });
    }

    // Add empty slots for the first week
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.unshift({
        day: 0,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isActive: false,
      });
    }

    // Fill the remainder of the last week if needed
    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let i = 0; i < remainingSlots; i++) {
      days.push({
        day: 0,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isActive: false,
      });
    }

    return days;
  };

  // Change month handler
  const handleMonthChange = (increment: number) => {
    let newMonth = selectedMonth + increment;
    let newYear = selectedYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  // Handle day selection
  const handleDaySelect = (day: number, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      setSelectedDay(day);
      setShowCalendar(false); // Hide calendar after selection

      // Fetch data for the selected date
      fetchData(new Date(selectedYear, selectedMonth, day));
    }
  };

  // Get date formatted as YYYY-MM-DD without timezone issues
  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 because getMonth() returns 0-11
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 获取并跟踪已完成的餐食
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>(
    {}
  );
  const [completedRecipeIds, setCompletedRecipeIds] = useState<number[]>([]);

  // Fetch food entries and nutrition summary
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Login required to use the progress tracker. Please log in first.");
      setLoading(false);
      return;
    }

    // Log the token for debugging (masked for security)
    console.log(
      "Using auth token (first 10 chars):",
      token.substring(0, 10) + "..."
    );

    // 立即获取初始数据
    fetchData(selectedDate);

    // 当有餐食被标记为完成时，刷新数据
    const handleFoodEntryAdded = (event: any) => {
      console.log("Food entry added/completed event detected, refreshing data...");
      console.log("Event detail:", event.detail);

      // 如果事件包含recipe_id，立即将其添加到completedRecipeIds
      if (event.detail && event.detail.recipe_id) {
        setCompletedRecipeIds((prev) => {
          if (!prev.includes(event.detail.recipe_id)) {
            console.log(
              `Immediately adding Recipe ID: ${event.detail.recipe_id} to completed list`
            );
            return [...prev, event.detail.recipe_id];
          }
          return prev;
        });

        // 更新餐食名称到映射表
        if (event.detail.name) {
          setCompletedMeals((prev) => ({
            ...prev,
            [event.detail.name]: true,
            [`${event.detail.name}_${event.detail.meal_time || "breakfast"}`]:
              true,
          }));
        }
      }

      // 获取最新数据
      fetchData(selectedDate);
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

  // Add effect to refresh data when date selection changes through dropdowns
  useEffect(() => {
    // Skip the initial render
    if (!loading) {
      console.log("Date changed via dropdowns, fetching new data...");
      const newDate = new Date(selectedYear, selectedMonth, selectedDay);
      fetchData(newDate);
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  const fetchData = async (date: Date = selectedDate) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Login required");
        setLoading(false);
        return;
      }

      const targetDate = formatDateForAPI(date);
      console.log("Fetching data for date:", targetDate);

      // 获取已完成餐食信息
      const completedMealsMap: Record<string, boolean> = {};
      const recipeIds: number[] = [];

      // Get food entries for the selected date
      try {
        const entriesResponse = await api.get(
          `/nutrition/log?start_date=${targetDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Nutrition log response:", entriesResponse.data);

        // 标准化条目数据，确保每个条目都有id或entry_id
        let normalizedEntries = [];
        if (Array.isArray(entriesResponse.data)) {
          normalizedEntries = entriesResponse.data.map((entry) => {
            // 确保每个条目都有一个唯一ID
            if (!entry.id && !entry.entry_id) {
              entry.entry_id = `temp_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 9)}`;
            }
            return entry;
          });

          // 提取recipe_id信息
          normalizedEntries.forEach((entry) => {
            if (entry.recipe_id) {
              recipeIds.push(entry.recipe_id);
              // 同时创建完成餐食映射表
              const key = `${entry.name}_${entry.meal_time}`;
              completedMealsMap[key] = true;
              completedMealsMap[entry.name] = true;

              console.log(
                `Meal "${entry.name}" (ID: ${entry.recipe_id}) marked as completed`
              );
            }
          });
        }

        setCompletedRecipeIds(recipeIds);
        setCompletedMeals(completedMealsMap);
        setEntries(normalizedEntries);

        console.log("Completed meal IDs:", recipeIds);
        console.log("Completed meal map:", completedMealsMap);
      } catch (entriesError: any) {
        console.error("Error fetching entries:", entriesError);
        if (entriesError.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
          localStorage.removeItem("access_token");
        }
      }

      // Get nutrition summary for the selected date
      try {
        const summaryResponse = await api.get(
          `/nutrition/summary?target_date=${targetDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Summary response:", summaryResponse.data);
        setSummary(summaryResponse.data);

        // 如果summary中包含completed_meals，也处理这些信息
        if (summaryResponse.data && summaryResponse.data.completed_meals) {
          const existingMealsMap = { ...completedMealsMap };
          const existingRecipeIds = [...recipeIds];

          // 标准化完成餐食数据，确保每个条目都有id或entry_id
          const completedMeals = summaryResponse.data.completed_meals.map(
            (meal: any) => {
              if (!meal.id && !meal.entry_id) {
                meal.entry_id = `temp_${Date.now()}_${Math.random()
                  .toString(36)
                  .substring(2, 9)}`;
              }
              return meal;
            }
          );

          // 更新summary对象中的completed_meals
          summaryResponse.data.completed_meals = completedMeals;

          completedMeals.forEach((entry: any) => {
            if (
              entry.recipe_id &&
              !existingRecipeIds.includes(entry.recipe_id)
            ) {
              existingRecipeIds.push(entry.recipe_id);

              // 更新mapping
              const key = `${entry.name}_${entry.meal_time}`;
              existingMealsMap[key] = true;
              existingMealsMap[entry.name] = true;

              console.log(
                `Adding meal "${entry.name}" (ID: ${entry.recipe_id}) from summary as completed`
              );
            }
          });

          setCompletedRecipeIds(existingRecipeIds);
          setCompletedMeals(existingMealsMap);
        }
      } catch (summaryError) {
        console.error("Error fetching summary:", summaryError);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to fetch data. Please try again later.");
      setLoading(false);
    }
  };

  // Function to check if the token is valid
  const checkTokenValidity = (token: string) => {
    try {
      // JWT tokens have three parts separated by dots
      const parts = token.split(".");
      if (parts.length !== 3) {
        return { valid: false, error: "Not a valid JWT format" };
      }

      // Try to decode the payload (middle part)
      const payload = JSON.parse(atob(parts[1]));

      // Check if token is expired
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);

      if (exp && exp < now) {
        return {
          valid: false,
          error: "Token expired",
          expiry: new Date(exp * 1000).toLocaleString(),
          payload,
        };
      }

      return { valid: true, payload };
    } catch (e) {
      return { valid: false, error: "Failed to parse token" };
    }
  };

  const handleAddEntry = async () => {
    try {
      // Basic form validation
      if (!newEntry.name.trim()) {
        setError("Food name is required");
        return;
      }

      if (newEntry.portion <= 0) {
        setError("Portion must be greater than 0");
        return;
      }

      // Validate meal type is selected
      if (!newEntry.meal_time) {
        setError(
          "Please select a meal type (breakfast, lunch, dinner, or snack)"
        );
        return;
      }

      const token = localStorage.getItem("access_token");
      console.log(
        "Token available:",
        token ? "Yes (length: " + token.length + ")" : "No"
      );

      // Check token validity
      if (token) {
        const tokenCheck = checkTokenValidity(token);
        console.log("Token check:", tokenCheck);

        if (!tokenCheck.valid) {
          setError(`Invalid token: ${tokenCheck.error}. Please log in again.`);
          return;
        }
      }

      if (!token) {
        setError("Login required");
        return;
      }

      // Add nutrition and calorie fields
      const entryData = {
        ...newEntry,
        calories: newEntry.calories || 0,
        protein: newEntry.protein || 0,
        carbs: newEntry.carbs || 0,
        fat: newEntry.fat || 0,
        meal_time: newEntry.meal_time || "Other", // Ensure meal_time is included
        meal_date: formatDateForAPI(selectedDate), // 将date改为meal_date
      };

      console.log("Adding meal entry:", entryData);
      console.log("API URL:", "/nutrition/log");

      try {
        // First try with Axios
        const response = await api.post("/nutrition/log", entryData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        });

        console.log("Meal entry response:", response.data);
        console.log("Response status:", response.status);

        // 将新添加的条目添加到状态中
        const newEntry = response.data;

        // 如果条目有recipe_id，添加到completedRecipeIds
        if (newEntry.recipe_id) {
          setCompletedRecipeIds((prev) => {
            if (!prev.includes(newEntry.recipe_id)) {
              return [...prev, newEntry.recipe_id];
            }
            return prev;
          });
        }

        // 添加到completedMeals
        const entryName = newEntry.name;
        const entryMealTime = newEntry.meal_time || "Other";
        const entryKey = `${entryName}_${entryMealTime}`;

        setCompletedMeals((prev) => ({
          ...prev,
          [entryName]: true,
          [entryKey]: true,
        }));

        // 添加到列表中
        setEntries((prev) => [...prev, newEntry]);

        // 更新摘要数据
        if (summary) {
          const newCalories = newEntry.calories || 0;
          const newProtein = newEntry.protein || 0;
          const newCarbs = newEntry.carbs || 0;
          const newFat = newEntry.fat || 0;

          setSummary({
            total_calories: summary.total_calories + newCalories,
            total_protein: summary.total_protein + newProtein,
            total_carbs: summary.total_carbs + newCarbs,
            total_fat: summary.total_fat + newFat,
            entries_count: summary.entries_count + 1,
            completed_meals: summary.completed_meals
              ? [...summary.completed_meals, newEntry]
              : [newEntry],
          });
        }

        // 派发事件以便其他组件刷新
        window.dispatchEvent(
          new CustomEvent("foodEntryAdded", {
            detail: response.data,
          })
        );

        setShowAddModal(false);
        setNewEntry({ name: "", portion: 1, unit: "serving", meal_time: "" });

        // 显示成功信息
        setError(null);
      } catch (apiError: any) {
        console.error("Axios request failed:", apiError);

        // Try with fetch API as fallback
        try {
          console.log("Attempting direct fetch as fallback...");
          const fetchResponse = await fetch(
            "http://localhost:8000/nutrition/log",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(entryData),
            }
          );

          console.log("Fetch response status:", fetchResponse.status);
          const responseText = await fetchResponse.text();
          console.log("Fetch response text:", responseText);

          if (fetchResponse.ok) {
            // Try to parse the response as JSON
            let fetchResult;
            try {
              fetchResult = JSON.parse(responseText);
            } catch (parseError) {
              console.error("Error parsing response as JSON:", parseError);
              setError(
                `Server returned invalid data: ${responseText.substring(
                  0,
                  100
                )}...`
              );
              return;
            }

            console.log("Fetch API response (parsed):", fetchResult);

            // 将新添加的条目添加到状态中
            const newEntry = fetchResult;

            // 如果条目有recipe_id，添加到completedRecipeIds
            if (newEntry.recipe_id) {
              setCompletedRecipeIds((prev) => {
                if (!prev.includes(newEntry.recipe_id)) {
                  return [...prev, newEntry.recipe_id];
                }
                return prev;
              });
            }

            // 添加到completedMeals
            const entryName = newEntry.name;
            const entryMealTime = newEntry.meal_time || "Other";
            const entryKey = `${entryName}_${entryMealTime}`;

            setCompletedMeals((prev) => ({
              ...prev,
              [entryName]: true,
              [entryKey]: true,
            }));

            // 添加到列表中
            setEntries((prev) => [...prev, newEntry]);

            // 更新摘要数据
            if (summary) {
              const newCalories = newEntry.calories || 0;
              const newProtein = newEntry.protein || 0;
              const newCarbs = newEntry.carbs || 0;
              const newFat = newEntry.fat || 0;

              setSummary({
                total_calories: summary.total_calories + newCalories,
                total_protein: summary.total_protein + newProtein,
                total_carbs: summary.total_carbs + newCarbs,
                total_fat: summary.total_fat + newFat,
                entries_count: summary.entries_count + 1,
                completed_meals: summary.completed_meals
                  ? [...summary.completed_meals, newEntry]
                  : [newEntry],
              });
            }

            // 派发事件以便其他组件刷新
            window.dispatchEvent(
              new CustomEvent("foodEntryAdded", {
                detail: fetchResult,
              })
            );

            setShowAddModal(false);
            setNewEntry({
              name: "",
              portion: 1,
              unit: "serving",
              meal_time: "",
            });

            // 显示成功信息
            setError(null);
          } else {
            throw new Error(
              `HTTP error! status: ${fetchResponse.status}, message: ${responseText}`
            );
          }
        } catch (fetchError: any) {
          console.error("Fetch API also failed:", fetchError);

          // Create a detailed error message for the user
          let errorMessage = "Failed to add food entry: ";

          if (fetchError.message) {
            errorMessage += fetchError.message;
          } else if (apiError.response) {
            // The request was made and the server responded with an error status
            console.error("Error data:", apiError.response.data);
            console.error("Error status:", apiError.response.status);

            if (apiError.response.status === 401) {
              errorMessage = "Authentication error. Please log in again.";
            } else if (apiError.response.status === 400) {
              errorMessage = `Invalid data: ${
                apiError.response.data.detail || "Please check your entry"
              }`;
            } else if (apiError.response.status === 500) {
              errorMessage = `Server error: ${
                apiError.response.data.detail || "Internal server error"
              }`;
            } else {
              errorMessage = `Server error (${apiError.response.status}): ${
                apiError.response.data.detail || "Please try again later"
              }`;
            }
          } else if (apiError.request) {
            // The request was made but no response was received
            console.error("No response received from server");
            errorMessage =
              "No response from server. This could be due to a CORS issue, network connectivity problem, or the server may be down.";
          } else {
            // Something happened in setting up the request
            errorMessage = `Error creating request: ${apiError.message}`;
          }

          setError(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  // 为entries列表添加渲染逻辑，显示recipe_id和完成状态
  const renderEntryItem = (entry: NutritionEntry) => {
    // 检查是否为已完成餐食
    const isCompletedRecipe =
      entry.recipe_id && completedRecipeIds.includes(entry.recipe_id);
    const mealKey = `${entry.name}_${entry.meal_time}`;
    const isCompletedByName =
      completedMeals[mealKey] || completedMeals[entry.name];
    const isCompleted = isCompletedRecipe || isCompletedByName;

    return (
      <div
        key={entry.id}
        className={`flex items-center justify-between p-4 border rounded-lg ${
          isCompleted ? "bg-green-50 border-green-200" : ""
        }`}
      >
        <div>
          <div className="font-medium flex items-center">
            {entry.name}
            {entry.recipe_id && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2">
                Recipe ID: {entry.recipe_id}
              </span>
            )}
            {isCompleted && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">
                Completed
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {entry.portion} {entry.unit}
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-right mr-4">
            <div className="font-medium">{entry.calories} calories</div>
            <div className="text-sm text-gray-500">
              Protein: {entry.protein}g | Carbs: {entry.carbs}g | Fat:{" "}
              {entry.fat}g
            </div>
          </div>
          {/* Always show the Cancel button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering potential parent onClick handlers
              handleCancelMeal(entry);
            }}
            className="text-xs bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 rounded ml-4" // Added ml-4 for spacing
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // 检查配方是否已完成的辅助函数
  const isRecipeCompleted = (recipeId: number | undefined | null): boolean => {
    if (!recipeId) return false;
    return completedRecipeIds.includes(recipeId);
  };

  // 检查餐食名称是否已完成的辅助函数
  const isMealNameCompleted = (name: string, mealTime?: string): boolean => {
    if (!name) return false;

    if (mealTime) {
      const key = `${name}_${mealTime}`;
      if (completedMeals[key]) return true;
    }

    return !!completedMeals[name];
  };

  // 添加取消已完成餐食的功能
  const handleCancelMeal = async (entry: NutritionEntry) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Login required");
        return;
      }

      // 确保有entry_id或id
      const entryId = entry.entry_id || entry.id;
      if (!entryId) {
        setError("Cannot cancel this meal, missing ID information");
        return;
      }

      console.log(`Cancelling meal: ${entry.name} (ID: ${entryId})`);

      // 调用API删除条目
      const response = await api.delete(`/nutrition/log/${entryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Cancel meal response:", response.data);

      // 从completedRecipeIds中移除
      if (entry.recipe_id) {
        setCompletedRecipeIds((prev) =>
          prev.filter((id) => id !== entry.recipe_id)
        );
      }

      // 从completedMeals中移除
      setCompletedMeals((prev) => {
        const newMap = { ...prev };
        delete newMap[entry.name];
        delete newMap[`${entry.name}_${entry.meal_time || "breakfast"}`];
        return newMap;
      });

      // 从entries中移除
      setEntries((prev) =>
        prev.filter((item) => item.id !== entryId && item.entry_id !== entryId)
      );

      // 更新摘要数据
      if (summary) {
        const entryCalories = entry.calories || 0;
        const entryProtein = entry.protein || 0;
        const entryCarbs = entry.carbs || 0;
        const entryFat = entry.fat || 0;

        setSummary({
          total_calories: Math.max(0, summary.total_calories - entryCalories),
          total_protein: Math.max(0, summary.total_protein - entryProtein),
          total_carbs: Math.max(0, summary.total_carbs - entryCarbs),
          total_fat: Math.max(0, summary.total_fat - entryFat),
          entries_count: Math.max(0, summary.entries_count - 1),
          completed_meals: summary.completed_meals
            ? summary.completed_meals.filter(
                (item) => item.id !== entryId && item.entry_id !== entryId
              )
            : [],
        });
      }

      // 派发事件以便其他组件刷新
      window.dispatchEvent(
        new CustomEvent("foodEntryRemoved", {
          detail: entry,
        })
      );

      setError(null);
    } catch (error) {
      console.error("Cancel meal failed:", error);
      setError("Failed to cancel meal, please try again later");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 pl-48">
          <div className="p-8 flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Progress Tracker
        </h1>

        {/* Date selection with calendar dropdown */}
        <div className="relative flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {/* Day selector */}
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              className="p-2 border rounded-md text-sm font-medium w-16"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1)
                .filter((day) => {
                  // Only show valid days for the selected month
                  const date = new Date(selectedYear, selectedMonth, day);
                  return date.getMonth() === selectedMonth;
                })
                .map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
            </select>

            {/* Month selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="p-2 border rounded-md text-sm font-medium w-32"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>

            {/* Year selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="p-2 border rounded-md text-sm font-medium w-24"
            >
              {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Calendar button on the right */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Calendar className="h-5 w-5" />
          </button>

          {/* Calendar dropdown */}
          {showCalendar && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg z-20 w-80">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => handleMonthChange(-1)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="font-medium">
                    {monthNames[selectedMonth]} {selectedYear}
                  </div>
                  <button
                    onClick={() => handleMonthChange(1)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
                    <div
                      key={day}
                      className="text-xs text-gray-400 font-medium"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {generateCalendarDays().map((day, i) => (
                    <div
                      key={i}
                      className={`
                        flex items-center justify-center text-xs py-2 rounded-full
                        ${
                          !day.isCurrentMonth
                            ? "invisible"
                            : day.isSelected
                            ? "bg-orange-500 text-white"
                            : day.isActive
                            ? "bg-orange-100 text-gray-600"
                            : "text-gray-600"
                        }
                        ${
                          day.isCurrentMonth
                            ? "cursor-pointer hover:bg-orange-50 transition-colors"
                            : ""
                        }
                      `}
                      onClick={() =>
                        day.isCurrentMonth &&
                        handleDaySelect(day.day, day.isCurrentMonth)
                      }
                    >
                      {day.isCurrentMonth ? day.day : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="p-8">
        {/* Header - Only show when there's an error */}
        {error && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <p className="text-red-500 mt-2">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-5 h-5 text-orange-500 mr-2" />
            <span>Add Manually</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            <Camera className="w-5 h-5 text-orange-500 mr-2" />
            <span>Add by Photo</span>
          </button>
        </div>

        {/* Only show Summary and Entries if it's today or if there are entries for the selected date */}
        {
          // Show for today's date regardless of entries
          ((selectedDay === today.getDate() &&
            selectedMonth === today.getMonth() &&
            selectedYear === today.getFullYear()) ||
            // Or show if there are entries for the selected date
            (entries && entries.length > 0)) && (
            <>
              {/* Today's Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">
                  {selectedDay === today.getDate() &&
                  selectedMonth === today.getMonth() &&
                  selectedYear === today.getFullYear()
                    ? "Today's Summary"
                    : `Summary for ${monthNames[selectedMonth]} ${selectedDay}, ${selectedYear}`}
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {summary ? summary.total_calories.toFixed(0) : "0"}
                    </div>
                    <div className="text-sm text-gray-500">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {summary ? summary.total_protein.toFixed(1) : "0"}g
                    </div>
                    <div className="text-sm text-gray-500">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {summary ? summary.total_carbs.toFixed(1) : "0"}g
                    </div>
                    <div className="text-sm text-gray-500">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {summary ? summary.total_fat.toFixed(1) : "0"}g
                    </div>
                    <div className="text-sm text-gray-500">Fat</div>
                  </div>
                </div>
              </div>

              {/* Food Entries */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {selectedDay === today.getDate() &&
                  selectedMonth === today.getMonth() &&
                  selectedYear === today.getFullYear()
                    ? "Today's Entries"
                    : `Entries for ${monthNames[selectedMonth]} ${selectedDay}, ${selectedYear}`}
                </h2>
                <div className="space-y-4">
                  {entries.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No entries for this date. Start adding your meals!
                    </div>
                  ) : (
                    // Group entries by meal type
                    Object.entries(
                      entries.reduce((groups, entry) => {
                        const mealTime = entry.meal_time || "Other";
                        if (!groups[mealTime]) groups[mealTime] = [];
                        groups[mealTime].push(entry);
                        return groups;
                      }, {} as Record<string, NutritionEntry[]>)
                    ).map(([mealTime, mealEntries]) => (
                      <div key={mealTime} className="mb-6">
                        <h3 className="text-md font-medium text-gray-700 mb-2 capitalize flex items-center">
                          {mealTime === "breakfast" && (
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
                          )}
                          {mealTime === "lunch" && (
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          )}
                          {mealTime === "dinner" && (
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                          )}
                          {mealTime === "snack" && (
                            <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
                          )}
                          {mealTime}
                        </h3>
                        <div className="space-y-3">
                          {mealEntries.map((entry) => renderEntryItem(entry))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )
        }

        {/* Show message when no entries for selected date (unless it's today) */}
        {!(
          selectedDay === today.getDate() &&
          selectedMonth === today.getMonth() &&
          selectedYear === today.getFullYear()
        ) &&
          (!entries || entries.length === 0) && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500 mb-4">
                No nutrition data available for {monthNames[selectedMonth]}{" "}
                {selectedDay}, {selectedYear}.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Entry for This Date
              </button>
            </div>
          )}
      </div>

      {/* Add Food Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Food</h2>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
                <button
                  className="float-right text-red-700 hover:text-red-900"
                  onClick={() => setError(null)}
                >
                  ×
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  value={newEntry.name}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter food name"
                />
              </div>

              {/* Add Meal Type selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Type
                </label>
                <select
                  value={newEntry.meal_time || ""}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, meal_time: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a meal type</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snack">Snack</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portion
                  </label>
                  <input
                    type="number"
                    value={newEntry.portion}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        portion: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={newEntry.unit}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="serving">serving</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="piece">piece</option>
                    <option value="bowl">bowl</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={newEntry.calories || ""}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        calories: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    placeholder="Calories"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={newEntry.protein || ""}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        protein: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    step="0.1"
                    placeholder="Protein"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={newEntry.carbs || ""}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        carbs: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    step="0.1"
                    placeholder="Carbs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={newEntry.fat || ""}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        fat: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    step="0.1"
                    placeholder="Fat"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg"
                disabled={!newEntry.name}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
