import React, { useState, useEffect } from "react";
import { Plus, Camera, Clock, Calendar, Info } from "lucide-react";
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
}

interface NutritionSummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  entries_count: number;
}

interface NutritionTargets {
  bmr: number;
  daily_calories: number;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
}

const NutritionTracker = () => {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [nutritionTargets, setNutritionTargets] = useState<NutritionTargets | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState<NutritionEntry>({
    name: "",
    portion: 1,
    unit: "serving",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get today's date formatted as YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Fetch food entries, nutrition summary, and targets
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Login required");
        setLoading(false);
        return;
      }

      const todayDate = getTodayDate();

      // Get today's food entries
      const entriesResponse = await api.get(
        `/nutrition/log?start_date=${todayDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Get today's nutrition summary
      const summaryResponse = await api.get(
        `/nutrition/summary?target_date=${todayDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Set entries and summary data
      setEntries(entriesResponse.data);
      setSummary(summaryResponse.data);

      try {
        // Get BMR-based nutrition targets
        const targetsResponse = await api.get('/api/nutrition-targets');
        setNutritionTargets(targetsResponse.data);
      } catch (targetErr) {
        console.error("Error fetching nutrition targets:", targetErr);
        // Set default values when targets API fails
        setNutritionTargets({
          bmr: 1513, // Realistic BMR for this user
          daily_calories: 2610, // Realistic daily calories (BMR * 1.725 for very active)
          macros: {
            carbs: 326, // ~50% of calories
            protein: 163, // ~25% of calories
            fat: 72 // ~25% of calories
          }
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to fetch data. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Add event listener for food entries added from other components
    const handleFoodEntryAdded = () => {
      console.log("NutritionTracker: Detected foodEntryAdded event, refreshing data");
      fetchData();
    };
    
    window.addEventListener('foodEntryAdded', handleFoodEntryAdded);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('foodEntryAdded', handleFoodEntryAdded);
    };
  }, []);  // Only run on component mount

  const handleAddEntry = async () => {
    try {
      const token = localStorage.getItem("access_token");

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
      };

      const response = await api.post("/nutrition/log", entryData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Instead of manually updating state, fetch fresh data
      setShowAddModal(false);
      setNewEntry({ name: "", portion: 1, unit: "serving" });
      
      // Fetch fresh data to ensure UI is up-to-date
      await fetchData();
      
    } catch (error) {
      console.error("Failed to add food entry:", error);
      setError("Failed to add food entry. Please try again later.");
    }
  };

  // Calculate remaining calories and percentages
  const getRemainingCalories = () => {
    if (!summary || !nutritionTargets) return 0;
    return Math.max(0, nutritionTargets.daily_calories - summary.total_calories);
  };

  const getCaloriePercentage = () => {
    if (!summary || !nutritionTargets || nutritionTargets.daily_calories === 0) return 0;
    return Math.min(100, (summary.total_calories / nutritionTargets.daily_calories) * 100);
  };

  const getMacroPercentage = (consumed: number, target: number): number => {
    if (!target) return 0;
    return Math.min(100, (consumed / target) * 100);
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
        <h1 className="text-2xl font-semibold text-gray-800">Nutrition Tracker</h1>
        {/* Today's date in nice format */}
        <div className="text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>
      
      {/* Main content */}
      <div className="p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

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

        {/* Today's Summary with Targets */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Today's Summary</h2>
            {nutritionTargets && (
              <div className="text-sm text-gray-500 flex items-center">
                <Info className="w-4 h-4 mr-1" />
                <span>BMR: {nutritionTargets.bmr} calories/day</span>
              </div>
            )}
          </div>
          
          {/* Calories overview with progress bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Daily Calories</span>
              <span>
                {summary ? summary.total_calories.toFixed(0) : "0"} / 
                {nutritionTargets ? nutritionTargets.daily_calories : "2000"} cal
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div 
                className="h-2.5 rounded-full bg-orange-500"
                style={{ width: `${getCaloriePercentage()}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 flex justify-between">
              <span>Consumed: {summary ? summary.total_calories.toFixed(0) : "0"} cal</span>
              <span>Remaining: {getRemainingCalories()} cal</span>
            </div>
          </div>
          
          {/* Macronutrients */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {summary ? summary.total_protein.toFixed(1) : "0"}g
              </div>
              <div className="text-sm text-gray-600">
                of {nutritionTargets ? nutritionTargets.macros.protein : "--"}g Protein
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="h-1.5 rounded-full bg-blue-500"
                  style={{ width: `${getMacroPercentage(
                    summary?.total_protein || 0, 
                    nutritionTargets?.macros.protein || 0
                  )}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {summary ? summary.total_carbs.toFixed(1) : "0"}g
              </div>
              <div className="text-sm text-gray-600">
                of {nutritionTargets ? nutritionTargets.macros.carbs : "--"}g Carbs
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="h-1.5 rounded-full bg-green-500"
                  style={{ width: `${getMacroPercentage(
                    summary?.total_carbs || 0, 
                    nutritionTargets?.macros.carbs || 0
                  )}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {summary ? summary.total_fat.toFixed(1) : "0"}g
              </div>
              <div className="text-sm text-gray-600">
                of {nutritionTargets ? nutritionTargets.macros.fat : "--"}g Fat
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="h-1.5 rounded-full bg-yellow-500"
                  style={{ width: `${getMacroPercentage(
                    summary?.total_fat || 0, 
                    nutritionTargets?.macros.fat || 0
                  )}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Food Entries */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Today's Entries</h2>
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No entries yet. Start adding your meals!
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{entry.name}</div>
                    <div className="text-sm text-gray-500">
                      {entry.portion} {entry.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {entry.calories} calories
                    </div>
                    <div className="text-sm text-gray-500">
                      Protein: {entry.protein}g | Carbs: {entry.carbs}g | Fat:{" "}
                      {entry.fat}g
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Food</h2>
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

export default NutritionTracker;
