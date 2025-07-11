import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, List, Filter, Plus, Star, ChevronLeft, ChevronRight, Clock, Utensils, Calendar, Calendar as CalendarIcon, ListFilter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api'; // Import the api instance

interface CompletedMeal {
  id: number;
  entryId?: number;
  name: string;
  meal_time: string;
  recipe_id: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
  ingredients: number;
  prep_time: string;
}

interface CompletedMealsByDate {
  [date: string]: CompletedMeal[];
}

const MealsPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [completedMeals, setCompletedMeals] = useState<CompletedMealsByDate>({});
  const [allMeals, setAllMeals] = useState<Array<{date: string, meal: CompletedMeal}>>([]);
  
  // Developer message
  console.log("MEALS PAGE: This page shows all food entries, same as Progress Tracker");
  
  // Set today as the current date instead of hardcoded March 17, 2025
  const today = new Date(); // Get the actual current date
  
  // Fix: Create today string without timezone issues
  const getTodayString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // Get today string using the current date
  const todayString = getTodayString(today);
  
  // Initialize selected date, year, month and day to today
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [calendarDays, setCalendarDays] = useState<Array<{date: string, isCurrentMonth: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Function to generate calendar days for a given month
  const generateCalendarDays = (year: number, month: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    const days = [];
    
    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: getTodayString(date),
        isCurrentMonth: false
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date: getTodayString(date),
        isCurrentMonth: true
      });
    }
    
    // Add next month's days to fill the grid (6 rows of 7 days)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date: getTodayString(date),
        isCurrentMonth: false
      });
    }
    
    setCalendarDays(days);
  };

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigate to previous or next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedYear(selectedYear - 1);
        setSelectedMonth(11);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedYear(selectedYear + 1);
        setSelectedMonth(0);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Update selected date when day, month or year changes
  useEffect(() => {
    console.log(`Date components changed: Year=${selectedYear}, Month=${selectedMonth}, Day=${selectedDay}`);
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    // Adjust if the day doesn't exist in the selected month
    if (newDate.getMonth() !== selectedMonth) {
      // Set to the last day of the month
      newDate.setDate(0);
      setSelectedDay(newDate.getDate());
    }
    
    // Fix: Create date string without timezone issues
    const dateString = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
    console.log(`Setting selectedDate to: ${dateString}`);
    setSelectedDate(dateString);
  }, [selectedDay, selectedMonth, selectedYear]);

  useEffect(() => {
    // Generate calendar days when month or year changes
    generateCalendarDays(selectedYear, selectedMonth);
  }, [selectedMonth, selectedYear]);

  // Date selection effect
  useEffect(() => {
    console.log(`Selected date changed to: ${selectedDate}`);
    // When date changes, make sure we're showing correct meals for that date
    setShowCalendarPopup(false);
    
    // Reload data when date changes
    loadCompletedMeals();
  }, [selectedDate]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendarPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to get authentication token
  const getAuthToken = (): string | null => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No authentication token found");
      // Redirect to login if needed
      // navigate('/login');
    }
    return token;
  };

  useEffect(() => {
    // Load completed meals from API
    loadCompletedMeals();

    // Listen for meal completion/uncompletion events
    const handleMealCompleted = (event: CustomEvent) => {
      console.log("MealsPage: Meal completed event detected, reloading data");
      loadCompletedMeals(); // Reload data when a meal is completed
    };

    const handleMealUncompleted = (event: CustomEvent) => {
      console.log("MealsPage: Meal uncompleted event detected, reloading data");
      loadCompletedMeals(); // Reload data when a meal is uncompleted
    };
    
    // Also listen for food entry events from other components
    const handleFoodEntryAdded = () => {
      console.log("MealsPage: Detected foodEntryAdded event, reloading data");
      loadCompletedMeals();
    };
    
    const handleFoodEntryUpdated = () => {
      console.log("MealsPage: Detected foodEntryUpdated event, reloading data");
      loadCompletedMeals();
    };

    // Set up polling to match Progress Tracker behavior
    const intervalId = setInterval(() => {
      console.log("MealsPage: Polling for updated meal data");
      loadCompletedMeals();
    }, 30000); // Poll every 30 seconds

    window.addEventListener('mealCompleted', handleMealCompleted as EventListener);
    window.addEventListener('mealUncompleted', handleMealUncompleted as EventListener);
    window.addEventListener('foodEntryAdded', handleFoodEntryAdded as EventListener);
    window.addEventListener('foodEntryUpdated', handleFoodEntryUpdated as EventListener);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('mealCompleted', handleMealCompleted as EventListener);
      window.removeEventListener('mealUncompleted', handleMealUncompleted as EventListener);
      window.removeEventListener('foodEntryAdded', handleFoodEntryAdded as EventListener);
      window.removeEventListener('foodEntryUpdated', handleFoodEntryUpdated as EventListener);
    };
  }, []);

  // Format date for API calls in the same way Progress.tsx does
  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Load completed meals from API only, using the same approach as Progress.tsx
  const loadCompletedMeals = async () => {
    setIsLoading(true);
    try {
      // Verify auth token (same as in Progress.tsx)
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No authentication token found. Please log in.");
        setIsLoading(false);
        setCompletedMeals({});
        setAllMeals([]);
        return;
      }
      
      // Define date range for meals history - last 30 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startDateStr = formatDateForAPI(startDate);
      
      console.log(`Fetching nutrition logs from API starting from ${startDateStr}`);
      
      // Use the same API endpoint as Progress.tsx
      const entriesResponse = await api.get(`/nutrition/log?start_date=${startDateStr}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log(`API response status: ${entriesResponse.status}`);
      
      if (entriesResponse.status === 200) {
        const entriesData = entriesResponse.data;
        console.log(`Received ${entriesData.length} entries from API`);
        
        if (entriesData.length === 0) {
          console.log("No entries returned from API");
          setCompletedMeals({});
          setAllMeals([]);
          setIsLoading(false);
          return;
        }
        
        // Organize by date just like Progress.tsx organizes by meal time
        const apiMealsByDate: CompletedMealsByDate = {};
        
        for (const entry of entriesData) {
          // Get date from the entry
          let entryDate = entry.date || (entry.timestamp ? entry.timestamp.split('T')[0] : null);
          
          if (!entryDate) {
            console.log(`Entry ${entry.name} has no date, using today's date`);
            entryDate = todayString;
          }
          
          // Initialize array for this date if it doesn't exist
          if (!apiMealsByDate[entryDate]) {
            apiMealsByDate[entryDate] = [];
          }
          
          // Map API entry to our CompletedMeal format
          const completedMeal: CompletedMeal = {
            id: entry.id || Math.random() * 100000,
            entryId: entry.id,
            name: entry.name || "Unknown Food",
            meal_time: entry.meal_time || "snack",
            recipe_id: entry.recipe_id || 0,
            calories: Number(entry.calories) || 0,
            protein: Number(entry.protein) || 0,
            carbs: Number(entry.carbs) || 0,
            fat: Number(entry.fat) || 0,
            image: entry.recipe_id ? `/api/recipes/${entry.recipe_id}/image` : '/placeholder-food.jpg',
            ingredients: entry.ingredients || 0,
            prep_time: entry.prep_time || '0 mins'
          };
          
          apiMealsByDate[entryDate].push(completedMeal);
        }
        
        console.log('API data organized by date:', Object.keys(apiMealsByDate));
        
        // Update state with the organized data
        setCompletedMeals(apiMealsByDate);
        
        // Also create a flat array for the list view
        const allMealsArray: Array<{date: string, meal: CompletedMeal}> = [];
        Object.entries(apiMealsByDate).forEach(([date, meals]: [string, CompletedMeal[]]) => {
          meals.forEach((meal: CompletedMeal) => {
            allMealsArray.push({ date, meal });
          });
        });
        
        // Sort by date (newest first)
        allMealsArray.sort((a, b) => {
          return b.date.localeCompare(a.date);
        });
        
        setAllMeals(allMealsArray);
      } else {
        console.error('API returned non-200 status:', entriesResponse.status);
        setCompletedMeals({});
        setAllMeals([]);
      }
    } catch (error: any) {
      console.error('Error fetching from API:', error);
      setCompletedMeals({});
      setAllMeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display - fixed to avoid timezone issues
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num));
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create date object without timezone issues by using separate components
    const date = new Date(year, month - 1, day, 12); // Set hour to noon to avoid any day boundary issues
    
    const weekday = weekdays[date.getDay()];
    const monthName = months[month - 1]; // Convert from 1-indexed to 0-indexed
    
    return `${weekday}, ${monthName} ${day}, ${year}`;
  };

  // Navigate to recipe details
  const navigateToRecipe = (recipeId: number) => {
    navigate(`/recipes/${recipeId}`);
  };

  // Select day from calendar
  const selectDay = (dateString: string) => {
    console.log(`User selected date: ${dateString}`);
    const dateParts = dateString.split('-').map(part => parseInt(part));
    console.log(`Parsed date parts: Year=${dateParts[0]}, Month=${dateParts[1]}, Day=${dateParts[2]}`);
    
    setSelectedYear(dateParts[0]);
    setSelectedMonth(dateParts[1] - 1); // Adjust month back to 0-indexed
    setSelectedDay(dateParts[2]);
    
    // Set the selected date directly, which will trigger the useEffect above
    setSelectedDate(dateString);
  };

  // Render compact date selector
  const renderDateSelector = () => {
  return (
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Day selector */}
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            className="p-2 border rounded-md text-sm font-medium w-16"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1)
              .filter(day => {
                // Only show valid days for the selected month
                const date = new Date(selectedYear, selectedMonth, day);
                return date.getMonth() === selectedMonth;
              })
              .map(day => (
                <option key={day} value={day}>{day}</option>
              ))
            }
          </select>
          
          {/* Month selector */}
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="p-2 border rounded-md text-sm font-medium w-32"
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          
          {/* Year selector */}
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 border rounded-md text-sm font-medium w-24"
          >
            {Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i)
              .map(year => (
                <option key={year} value={year}>{year}</option>
              ))
            }
          </select>
        </div>
        
        {/* View mode buttons */}
        <div className="flex items-center space-x-2">
          <button 
            className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => {
              setViewMode('calendar');
              setShowCalendarPopup(true); // Show calendar popup when switching to calendar view
            }}
            title="Calendar View"
          >
            <CalendarIcon size={20} />
          </button>
          <button 
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => {
              setViewMode('list');
              setShowCalendarPopup(false); // Hide calendar popup when switching to list view
            }}
            title="List View (All Meals)"
          >
            <List size={20} />
          </button>
        </div>
      </div>
    );
  };

  // Render calendar popup
  const renderCalendarPopup = () => {
    if (!showCalendarPopup) return null;
    
    return (
      <div 
        ref={calendarRef}
        className="absolute right-8 top-32 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-80"
      >
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="font-medium">
            {monthNames[selectedMonth]} {selectedYear}
          </div>
          
          <button 
            onClick={() => navigateMonth('next')}
            className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <ChevronRight size={16} />
          </button>
          
          <button 
            onClick={() => setShowCalendarPopup(false)}
            className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 ml-2"
          >
            <X size={16} />
          </button>
      </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            // Parse date parts without timezone issues
            const [dateYear, dateMonth, dateDay] = day.date.split('-').map(part => parseInt(part));
            
            const isToday = day.date === todayString;
            const isSelected = day.date === selectedDate;
            const hasMeals = completedMeals[day.date] && completedMeals[day.date].length > 0;
            
            return (
              <div 
                key={index}
                onClick={() => selectDay(day.date)}
                className={`
                  w-9 h-9 flex items-center justify-center cursor-pointer text-sm rounded-full transition-colors
                  ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                  ${isSelected ? 'bg-orange-500 text-white' : 
                    isToday ? 'bg-orange-100 text-orange-600' : 
                    hasMeals && day.isCurrentMonth ? 'border border-orange-300' : 
                    day.isCurrentMonth ? 'hover:bg-gray-100' : ''}
                `}
              >
                {dateDay}
                {hasMeals && day.isCurrentMonth && !isSelected && (
                  <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-orange-500"></div>
                )}
            </div>
            );
          })}
            </div>
          </div>
    );
  };

  // Render calendar view with meals for selected date
  const renderCalendarView = () => {
    console.log(`Rendering calendar view for date: ${selectedDate}`);
    
    // Check if we have any meals for the selected date
    if (!completedMeals[selectedDate] || completedMeals[selectedDate].length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-gray-400 mb-3">
            <CalendarIcon size={48} className="mx-auto mb-2" />
            <p className="text-lg">No meals logged for {formatDate(selectedDate)}</p>
            <p className="text-sm text-gray-500 mt-2">
              Log meals from your meal plan or add foods manually to see them here.
            </p>
          </div>
          <button 
            onClick={() => navigate('/personal')} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Meal Plan
          </button>
        </div>
      );
    }

    // Group entries by meal type, similar to Progress.tsx
    const mealsByType = completedMeals[selectedDate].reduce((groups: Record<string, CompletedMeal[]>, meal) => {
      const mealTime = meal.meal_time || 'Other';
      if (!groups[mealTime]) groups[mealTime] = [];
      groups[mealTime].push(meal);
      return groups;
    }, {});

    // Calculate nutrition summary for the day
    const summary = completedMeals[selectedDate].reduce((sum, meal) => ({
      total_calories: sum.total_calories + (meal.calories || 0),
      total_protein: sum.total_protein + (meal.protein || 0),
      total_carbs: sum.total_carbs + (meal.carbs || 0),
      total_fat: sum.total_fat + (meal.fat || 0),
      entries_count: sum.entries_count + 1
    }), { 
      total_calories: 0, 
      total_protein: 0, 
      total_carbs: 0, 
      total_fat: 0, 
      entries_count: 0 
    });

    return (
      <div className="space-y-6">
        {/* Nutrition Summary Card - similar to Progress.tsx */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Nutrition Summary</h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-500">
                {summary.total_calories.toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">Calories</div>
      </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {summary.total_protein.toFixed(1)}g
              </div>
              <div className="text-sm text-gray-500">Protein</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {summary.total_carbs.toFixed(1)}g
              </div>
              <div className="text-sm text-gray-500">Carbs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {summary.total_fat.toFixed(1)}g
              </div>
              <div className="text-sm text-gray-500">Fat</div>
            </div>
          </div>
        </div>

        {/* Food Entries - organized by meal type similar to Progress.tsx */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedDate === todayString ? "Today's Entries" : `Entries for ${formatDate(selectedDate)}`}
          </h2>
          <div className="space-y-6">
            {Object.entries(mealsByType).map(([mealTime, meals]) => (
              <div key={mealTime} className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-2 capitalize flex items-center">
                  {mealTime === 'breakfast' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
                  )}
                  {mealTime === 'lunch' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  )}
                  {mealTime === 'dinner' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  )}
                  {mealTime === 'snack' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
                  )}
                  {mealTime}
                </h3>
                <div className="space-y-3">
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => meal.recipe_id > 0 ? navigateToRecipe(meal.recipe_id) : null}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                          <img 
                            src={meal.recipe_id > 0 ? meal.image : '/placeholder-food.jpg'} 
                            alt={meal.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-food.jpg';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-xs text-gray-500">
                            {meal.recipe_id > 0 ? `${meal.ingredients} ingredients • ${meal.prep_time}` : 'Manually added food entry'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{meal.calories} calories</div>
                        <div className="text-xs text-gray-500">
                          P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                        </div>
              </div>
                </div>
                  ))}
                </div>
              </div>
            ))}
            </div>
        </div>
      </div>
    );
  };

  // Render list view with all meals regardless of date
  const renderListView = () => {
    console.log(`Rendering list view`);
    
    if (allMeals.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-gray-400 mb-3">
            <List size={48} className="mx-auto mb-2" />
            <p className="text-lg">No meals logged yet</p>
            <p className="text-sm text-gray-500 mt-2">
              When you log meals from your meal plan or add foods manually, they'll appear here.
            </p>
                </div>
          <button 
            onClick={() => navigate('/personal')} 
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Meal Plan
                    </button>
                  </div>
      );
    }

    // Group meals by date
    const mealsByDate: Record<string, {date: string, meals: CompletedMeal[]}> = {};
    allMeals.forEach(({date, meal}) => {
      if (!mealsByDate[date]) {
        mealsByDate[date] = {
          date,
          meals: []
        };
      }
      mealsByDate[date].meals.push(meal);
    });

    // Sort dates in reverse chronological order (newest first)
    const sortedDates = Object.keys(mealsByDate).sort((a, b) => b.localeCompare(a));

    return (
      <div className="space-y-6">
        {sortedDates.map(date => {
          const meals = mealsByDate[date].meals;
          
          // Calculate daily summary for each date
          const dailySummary = meals.reduce((sum, meal) => ({
            total_calories: sum.total_calories + (meal.calories || 0),
            total_protein: sum.total_protein + (meal.protein || 0),
            total_carbs: sum.total_carbs + (meal.carbs || 0),
            total_fat: sum.total_fat + (meal.fat || 0),
            entries_count: sum.entries_count + 1
          }), { 
            total_calories: 0, 
            total_protein: 0, 
            total_carbs: 0, 
            total_fat: 0, 
            entries_count: 0 
          });
          
          // Group by meal time within each date
          const mealsByType = meals.reduce((groups: Record<string, CompletedMeal[]>, meal) => {
            const mealTime = meal.meal_time || 'Other';
            if (!groups[mealTime]) groups[mealTime] = [];
            groups[mealTime].push(meal);
            return groups;
          }, {});
          
          return (
            <div key={date} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">{formatDate(date)}</h3>
                  <div className="text-sm text-gray-500">
                    {dailySummary.entries_count} {dailySummary.entries_count === 1 ? 'entry' : 'entries'}
                  </div>
                </div>
                
                {/* Summary nutrition info for the day */}
                <div className="flex space-x-4 text-sm text-gray-600">
                  <div>{Math.round(dailySummary.total_calories)} cal</div>
                  <div>•</div>
                  <div>P: {dailySummary.total_protein.toFixed(1)}g</div>
                  <div>•</div>
                  <div>C: {dailySummary.total_carbs.toFixed(1)}g</div>
                  <div>•</div>
                  <div>F: {dailySummary.total_fat.toFixed(1)}g</div>
                </div>
              </div>
              
              <div className="p-4 space-y-6">
                {Object.entries(mealsByType).map(([mealTime, mealEntries]) => (
                  <div key={mealTime} className="space-y-3">
                    <h3 className="text-md font-medium text-gray-700 capitalize flex items-center">
                      {mealTime === 'breakfast' && (
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
                      )}
                      {mealTime === 'lunch' && (
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      )}
                      {mealTime === 'dinner' && (
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                      )}
                      {mealTime === 'snack' && (
                        <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
                      )}
                      {mealTime}
                    </h3>
                    
                    <div className="space-y-2">
                      {mealEntries.map(meal => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => meal.recipe_id > 0 ? navigateToRecipe(meal.recipe_id) : null}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                              <img 
                                src={meal.recipe_id > 0 ? meal.image : '/placeholder-food.jpg'} 
                                alt={meal.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-food.jpg';
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{meal.name}</div>
                              <div className="text-xs text-gray-500">
                                {meal.recipe_id > 0 ? `${meal.ingredients} ingredients • ${meal.prep_time}` : 'Manually added food entry'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{meal.calories} cal</div>
                            <div className="text-xs text-gray-500">
                              P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Meals History</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          {renderDateSelector()}
          {renderCalendarPopup()}
          
          {viewMode === 'calendar' && renderCalendarView()}
          {viewMode === 'list' && renderListView()}
        </>
      )}
    </div>
  );
};

export default MealsPage; 