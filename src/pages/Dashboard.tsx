import React, { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  PieChart,
  Camera,
  Utensils,
  Coffee,
  Apple,
  Wheat,
  Trash2,
  Edit,
} from "lucide-react";
import { api } from "../api"; // Import the api object

// Define nutrition data interfaces
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

// Define user data interface
interface UserData {
  name: string;
  date_of_birth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  blood_sugar_goals?: string[];
  typical_diet?: string;
  food_allergies?: string[];
  physical_activity_level?: string;
  avatar?: string;
  avatar_info?: {
    filename: string;
    updated_at: string;
  };
  [key: string]: any;
}

const Dashboard = () => {
  const [activeTab] = useState("dashboard");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAchievementTab, setActiveAchievementTab] = useState("health");
  const [avatar, setAvatar] = useState<string | null>(
    localStorage.getItem("userAvatar")
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  
  // Nutrition state
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary | null>(null);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [nutritionError, setNutritionError] = useState<string | null>(null);
  
  // Date selection state for calendar
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Use actual current date instead of hardcoded date
  const today = new Date(); // Get the actual current date
  
  // Format the date consistently
  const getTodayString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // Format the date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Use the fixed date for display
  const currentDate = formatDate(today);

  // Month names for dropdown
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
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
        isToday: i === selectedDay && selectedMonth === today.getMonth() && selectedYear === today.getFullYear(),
        isSelected: i === selectedDay,
        // Mock active days for demonstration
        isActive: i >= 15 && i <= 19 && i !== 17,
      });
    }
    
    // Add empty slots for the first week
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.unshift({ day: 0, isCurrentMonth: false, isToday: false, isSelected: false, isActive: false });
    }
    
    // Fill the remainder of the last week if needed
    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let i = 0; i < remainingSlots; i++) {
      days.push({ day: 0, isCurrentMonth: false, isToday: false, isSelected: false, isActive: false });
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
    }
  };

  // Set up window resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to fetch nutrition data
  const fetchNutritionData = async () => {
    try {
      setNutritionLoading(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        setNutritionError("Authentication required");
        setNutritionLoading(false);
        return;
      }

      // Use the actual current date instead of the fixed one
      const currentDate = new Date();
      const todayString = getTodayString(currentDate);
      console.log("Fetching nutrition data for current date:", todayString);

      // Get food entries for today
      try {
        const entriesResponse = await api.get(
          `/nutrition/log?start_date=${todayString}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Nutrition entries response:", entriesResponse.data);
        setNutritionEntries(entriesResponse.data);
      } catch (entriesError: any) {
        console.error("Error fetching nutrition entries:", entriesError);
        setNutritionError("Failed to load nutrition entries");
      }

      // Get nutrition summary for today
      try {
        const summaryResponse = await api.get(
          `/nutrition/summary?target_date=${todayString}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Nutrition summary response:", summaryResponse.data);
        setNutritionSummary(summaryResponse.data);
      } catch (summaryError) {
        console.error("Error fetching nutrition summary:", summaryError);
        setNutritionError("Failed to load nutrition summary");
      }

      setNutritionLoading(false);
    } catch (error) {
      console.error("Error in nutrition data fetch:", error);
      setNutritionError("Failed to fetch nutrition data");
      setNutritionLoading(false);
    }
  };

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("Authentication required");
          setIsLoading(false);
          return;
        }

        // Use the api instance instead of fetch with hardcoded URL
        try {
          const profileResponse = await api.get("/api/user/profile");
          const profileData = profileResponse.data;
          console.log("User data retrieved:", profileData);
          setUserData(profileData);
          if (profileData.avatar) {
            setAvatar(profileData.avatar);
            localStorage.setItem("userAvatar", profileData.avatar);
          }
        } catch (apiError: any) {
          console.error("API Error:", apiError);
          throw new Error(apiError.message || "Failed to fetch profile data");
        }

        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load user data");
        setIsLoading(false);
      }
    };

    fetchUserData();
    // Also fetch nutrition data
    fetchNutritionData();
  }, []);

  // Helper function to calculate age
  function calculateAge(birthDateStr: string | undefined): number | null {
    if (!birthDateStr) return null;

    const birthDate = new Date(birthDateStr);
    // Use the actual current date for age calculation
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  const mockGlucoseData = [
    { month: "JAN", withHabit: 50, withoutControl: 45, withMindfood: 38 },
    { month: "APR", withHabit: 75, withoutControl: 65, withMindfood: 68 },
    { month: "JUL", withHabit: 55, withoutControl: 45, withMindfood: 45 },
    { month: "OCT", withHabit: 45, withoutControl: 35, withMindfood: 95 },
  ];

  const handleAvatarClick = (e: React.MouseEvent) => {
    if (avatar) {
      e.stopPropagation();
      setShowAvatarMenu(!showAvatarMenu);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleEditAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
    setShowAvatarMenu(false);
  };

  const handleDeleteAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/user/avatar", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAvatar(null);
        localStorage.removeItem("userAvatar");
      } else {
        console.error("Failed to delete avatar");
      }
    } catch (error) {
      console.error("Error deleting avatar:", error);
    }
    setShowAvatarMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowAvatarMenu(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        try {
          const token = localStorage.getItem("access_token");
          const response = await fetch(
            "http://localhost:8000/api/user/avatar",
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                avatar: result,
                filename: file.name,
              }),
            }
          );

          if (response.ok) {
            setAvatar(result);
            localStorage.setItem("userAvatar", result);
          } else {
            console.error("Failed to update avatar");
          }
        } catch (error) {
          console.error("Error updating avatar:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderProfileCard = () => {
    if (!userData) {
      return (
        <div className="bg-white rounded-xl p-4 h-full min-h-[300px] flex flex-col justify-center items-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <p className="text-gray-500">No profile data available</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      );
    }

    const userDisplayData = {
      name: userData.name,
      joinDate: "Mar 2025",
      age: calculateAge(userData.date_of_birth),
      gender: userData.gender,
      height: userData.height ? `${userData.height} cm` : "Not specified",
      weight: userData.weight ? `${userData.weight} kg` : "Not specified",
      bloodGlucose: "6.1mmol/L",
      target: userData.blood_sugar_goals?.[0] || "Not specified",
      diet: userData.typical_diet
        ? userData.typical_diet.split(":")?.[0]
        : "Add your diet preferences",
      allergies: Array.isArray(userData.food_allergies)
        ? userData.food_allergies.join(", ")
        : typeof userData.food_allergies === "string"
        ? userData.food_allergies
        : "None",
      activity: userData.physical_activity_level || "Not specified",
    };

    // Function to render a consistent profile field row
    const renderProfileField = (
      label: string,
      value: any,
      isActionable: boolean = false
    ) => (
      <div className="flex justify-between text-xs sm:text-sm">
        <span className="text-gray-500">{label}</span>
        {isActionable ? (
          <button
            className="text-orange-500 font-medium cursor-pointer flex items-center"
            onClick={() => (window.location.href = "/settings")}
          >
            {value}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        ) : (
          <span className="font-medium">{value}</span>
        )}
      </div>
    );

    return (
      <div className="bg-white rounded-xl p-4 sm:p-5 h-full min-h-[300px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col items-center flex-1">
          <div
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 sm:mb-4 cursor-pointer group"
            onClick={handleAvatarClick}
          >
            {avatar ? (
              <>
                <img
                  src={avatar}
                  alt="User avatar"
                  className="w-full h-full rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md">
                  <Camera className="w-3.5 h-3.5 text-gray-600" />
                </div>
                {showAvatarMenu && (
                  <div className="absolute top-0 right-0 mt-20 w-32 bg-white rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={handleEditAvatar}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Photo
                    </button>
                    <button
                      onClick={handleDeleteAvatar}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-orange-100 rounded-full flex items-center justify-center relative">
                <Camera className="w-6 h-6 text-orange-500" />
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md">
                  <Camera className="w-3.5 h-3.5 text-gray-600" />
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <h2 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-center">
            {userDisplayData.name}
          </h2>
          <div className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full mb-4 sm:mb-6">
            Joined {userDisplayData.joinDate}
          </div>

          <div className="w-full space-y-2 sm:space-y-3 flex-1 flex flex-col justify-evenly">
            {renderProfileField("AGE", userDisplayData.age)}
            {renderProfileField("GENDER", userDisplayData.gender)}
            {renderProfileField("HEIGHT", userDisplayData.height)}
            {renderProfileField("WEIGHT", userDisplayData.weight)}
            {renderProfileField(
              "DIET",
              userDisplayData.diet,
              !userData.typical_diet
            )}
            {renderProfileField("BLOOD GLUCOSE", userDisplayData.bloodGlucose)}
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardContent = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
      {/* Profile Card */}
      <div className="sm:col-span-1 lg:col-span-3">{renderProfileCard()}</div>

      {/* Achievements Section */}
      <div className="sm:col-span-1 lg:col-span-5">
        <div className="bg-white rounded-xl p-4 sm:p-5 h-full min-h-[300px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
            {activeAchievementTab === "health" ? "Achievements" : "Community"}
          </h2>

          <div className="flex space-x-3 sm:space-x-4 border-b mb-3 sm:mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              className={`pb-2 text-xs sm:text-sm whitespace-nowrap ${
                activeAchievementTab === "health"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveAchievementTab("health")}
            >
              Health Behavior
            </button>
            <button
              className={`pb-2 text-xs sm:text-sm whitespace-nowrap ${
                activeAchievementTab === "community"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveAchievementTab("community")}
            >
              Community
            </button>
          </div>

          {activeAchievementTab === "health" ? (
            <div className="space-y-4 sm:space-y-5 flex-1 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
              {[
                {
                  title: "Diet Detective",
                  progress: 50,
                  color: "orange",
                  description: "Upload 10 photos based on app recipes.",
                  icon: (
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  ),
                },
                {
                  title: "Health Explorer",
                  progress: 33,
                  color: "teal",
                  description:
                    "Order 3 meals in restaurants based on app suggestions",
                  icon: (
                    <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500" />
                  ),
                },
                {
                  title: "Sugar Buster",
                  progress: 50,
                  color: "green",
                  description:
                    "Meet the recommended daily sugar intake for 7 days",
                  icon: (
                    <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  ),
                },
                {
                  title: "Fiber Hero",
                  progress: 50,
                  color: "yellow",
                  description:
                    "Meet or exceed the recommended daily fiber intake for 7 days",
                  icon: (
                    <Wheat className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                  ),
                },
              ].map((achievement, index) => (
                <div key={index} className="flex items-start">
                  <div className="p-2 sm:p-3 bg-orange-100 rounded-xl mr-3 sm:mr-4">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                      <h3 className="font-bold text-xs sm:text-sm">
                        {achievement.title}
                      </h3>
                      <span className="text-xs text-orange-500">
                        {achievement.progress}%
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mb-1 sm:mb-2">
                      {achievement.description}
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${achievement.color}-500`}
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5 flex-1 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
              {[
                {
                  username: "Sarah_Health",
                  time: "2 hours ago",
                  action: "completed a 7-day meal plan",
                  points: 150,
                  avatar: "S",
                  avatarColor: "bg-purple-500",
                },
                {
                  username: "Nutrition_Mark",
                  time: "Yesterday",
                  action: "shared a healthy recipe",
                  points: 75,
                  avatar: "M",
                  avatarColor: "bg-blue-500",
                },
                {
                  username: "Fitness_Julie",
                  time: "2 days ago",
                  action: "achieved a 14-day streak",
                  points: 200,
                  avatar: "J",
                  avatarColor: "bg-green-500",
                },
                {
                  username: "DietCoach_Sam",
                  time: "4 days ago",
                  action: "posted a success story",
                  points: 100,
                  avatar: "S",
                  avatarColor: "bg-red-500",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div
                    className={`${activity.avatarColor} text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-semibold mr-3 sm:mr-4 flex-shrink-0`}
                  >
                    {activity.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm">
                          {activity.username}
                        </h3>
                        <p className="text-gray-500 text-xs">{activity.time}</p>
                      </div>
                      <span className="text-orange-500 text-xs font-semibold">
                        +{activity.points} pts
                      </span>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm mt-1 sm:mt-2">
                      {activity.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Points Card */}
      <div className="sm:col-span-2 lg:col-span-4">
        <div className="bg-teal-800 rounded-xl p-4 sm:p-5 h-full min-h-[250px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white text-xs sm:text-sm">Mindfood Points</h3>
            <span className="text-teal-300 text-xs">Recent Changes</span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center my-4 sm:my-6">
            <span className="text-white text-5xl sm:text-7xl font-bold tracking-tight">
              5,212
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <span className="text-white text-xs sm:text-sm">
                Gain more points
              </span>
              <span className="text-teal-300 text-xs">See All</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button className="bg-teal-700/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-600/20 rounded-full mx-auto mb-1"></div>
                <span className="text-teal-200 text-[10px] sm:text-xs">
                  Upload your meal
                </span>
              </button>
              <button className="bg-teal-700/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-400/20 rounded-full mx-auto mb-1"></div>
                <span className="text-orange-200 text-[10px] sm:text-xs">
                  Order in restaurants
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Glucose Status Graph */}
      <div className="sm:col-span-2 lg:col-span-7">
        <div className="bg-white rounded-xl p-4 sm:p-5 h-full min-h-[300px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs sm:text-sm font-medium">Glucose Status</h3>
            <button className="text-[10px] sm:text-xs text-gray-500">
              This Year ▾
            </button>
          </div>

          <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockGlucoseData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorWithHabit"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#005B5C" stopOpacity={0.3} />
                    <stop
                      offset="100%"
                      stopColor="#005B5C"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorWithoutControl"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#D9D9D9" stopOpacity={0.3} />
                    <stop
                      offset="100%"
                      stopColor="#D9D9D9"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorWithMindfood"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#D8724A" stopOpacity={0.3} />
                    <stop
                      offset="100%"
                      stopColor="#D8724A"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                  strokeOpacity={0.5}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: isMobile ? 9 : 11 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: isMobile ? 9 : 11 }}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  dx={-10}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    fontSize: isMobile ? 10 : 12,
                  }}
                  labelStyle={{ color: "#64748B", fontWeight: 500 }}
                  itemStyle={{ color: "#64748B", fontSize: isMobile ? 10 : 12 }}
                />

                <Area
                  type="monotone"
                  dataKey="withoutControl"
                  stroke="#D9D9D9"
                  strokeWidth={2}
                  fill="url(#colorWithoutControl)"
                  dot={{
                    stroke: "#D9D9D9",
                    strokeWidth: 2,
                    r: isMobile ? 3 : 4,
                    fill: "white",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="withHabit"
                  stroke="#005B5C"
                  strokeWidth={2}
                  fill="url(#colorWithHabit)"
                  dot={{
                    stroke: "#005B5C",
                    strokeWidth: 2,
                    r: isMobile ? 3 : 4,
                    fill: "white",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="withMindfood"
                  stroke="#D8724A"
                  strokeWidth={2}
                  fill="url(#colorWithMindfood)"
                  dot={{
                    stroke: "#D8724A",
                    strokeWidth: 2,
                    r: isMobile ? 3 : 4,
                    fill: "white",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#005B5C" }}
              ></div>
              <span className="text-[10px] sm:text-xs text-gray-600">
                Current habit
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#D9D9D9" }}
              ></div>
              <span className="text-[10px] sm:text-xs text-gray-600">
                Without control
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#D8724A" }}
              ></div>
              <span className="text-[10px] sm:text-xs text-gray-600">
                With Mindfood
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="sm:col-span-2 lg:col-span-5">
        <div className="bg-white rounded-xl p-4 sm:p-5 h-full min-h-[300px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => handleMonthChange(-1)}
            >
              <svg
                width="6"
                height="10"
                viewBox="0 0 6 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 1L1 5L5 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex flex-col items-center">
              <div className="relative">
                <button 
                  className="text-sm sm:text-base font-semibold text-gray-900 flex items-center"
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                >
                  {monthNames[selectedMonth]}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMonthDropdown && (
                  <div className="absolute top-full mt-1 bg-white shadow-lg rounded-md py-1 z-10 max-h-48 overflow-y-auto w-32">
                    {monthNames.map((month, index) => (
                      <button
                        key={month}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          index === selectedMonth ? 'bg-orange-100 text-orange-500' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedMonth(index);
                          setShowMonthDropdown(false);
                        }}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button 
                  className="text-[10px] sm:text-xs text-gray-500 flex items-center" 
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                >
                  {selectedYear}
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showYearDropdown && (
                  <div className="absolute top-full mt-1 bg-white shadow-lg rounded-md py-1 z-10 max-h-48 overflow-y-auto w-24">
                    {Array.from({ length: 10 }, (_, i) => 2020 + i).map((year) => (
                      <button
                        key={year}
                        className={`w-full text-left px-4 py-2 text-xs ${
                          year === selectedYear ? 'bg-orange-100 text-orange-500' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedYear(year);
                          setShowYearDropdown(false);
                        }}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => handleMonthChange(1)}
            >
              <svg
                width="6"
                height="10"
                viewBox="0 0 6 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 9L5 5L1 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1 sm:mb-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
              <div
                key={day}
                className="text-[10px] sm:text-xs text-gray-400 font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center flex-1">
            {generateCalendarDays().map((day, i) => (
              <div
                key={i}
                className={`
                  flex items-center justify-center text-[10px] sm:text-xs py-1 sm:py-1.5 rounded-full
                  ${!day.isCurrentMonth ? "invisible" : day.isSelected ? "bg-orange-500 text-white" : day.isActive ? "bg-orange-100 text-gray-600" : "text-gray-600"}
                  ${day.isCurrentMonth ? "cursor-pointer hover:bg-orange-50 transition-colors" : ""}
                `}
                onClick={() => day.isCurrentMonth && handleDaySelect(day.day, day.isCurrentMonth)}
              >
                {day.isCurrentMonth ? day.day : ""}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 mb-2">
              Progress for {monthNames[selectedMonth]} {selectedDay}, {selectedYear}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Completed meals</span>
                <span className="text-xs font-medium">2/4</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: "50%" }}></div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Water intake</span>
                <span className="text-xs font-medium">1.2/2L</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: "60%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      default:
        return (
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="text-gray-600">Content coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        {/* Today's date in nice format */}
        <div className="text-gray-500">{currentDate}</div>
      </div>

      {/* Content continues... */}
      {renderMainContent()}
    </div>
  );
};

export default Dashboard;
