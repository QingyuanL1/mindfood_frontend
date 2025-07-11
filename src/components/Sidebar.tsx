import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Settings,
  Share2,
  HelpCircle,
  Users,
  Grid,
  BookOpen,
  MessageSquare,
  Target,
  Utensils,
  Award,
  Gift,
  Coffee,
  BarChart,
  Heart,
  LayoutDashboard,
  UtensilsCrossed,
  MessageCircle,
  UserCircle
} from "lucide-react";

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
  [key: string]: any;
}

const sidebarItems = [
  {
    icon: <Grid className="w-5 h-5" />,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: "Recipes",
    path: "/recipes",
  },
  {
    icon: <Target className="w-5 h-5" />,
    label: "Meal Progress",
    path: "/progress",
  },
  { icon: <Heart className="w-5 h-5" />, label: "Liked", path: "/liked" },
  { icon: <Users className="w-5 h-5" />, label: "Team", path: "/team" },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    label: "Chatting",
    path: "/chat",
    badge: 2,
  },
  {
    icon: <UserCircle className="w-5 h-5" />,
    label: "My Profile",
    path: "/myprofile",
  },
];

const bottomItems = [
  {
    icon: <Award className="w-5 h-5" />,
    label: "Membership",
    path: "/membership",
  },
  {
    icon: <Share2 className="w-5 h-5" />,
    label: "Share Feedback",
    path: "/feedback",
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    label: "Help Center",
    path: "/help",
  },
  {
    icon: <Gift className="w-5 h-5" />,
    label: "Refer a Friend",
    path: "/refer",
  },
];

const weekDays = [
  { id: "monday", label: "Mon" },
  { id: "tuesday", label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday", label: "Thu" },
  { id: "friday", label: "Fri" },
  { id: "saturday", label: "Sat" },
  { id: "sunday", label: "Sun" },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string>("User");
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Get username from API on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("access_token");

        if (!token) {
          console.log("No authentication token found");
          setLoading(false);
          return;
        }

        // Fetch user profile data from API
        const profileResponse = await fetch(
          "http://localhost:8000/api/user/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error(
            `Failed to fetch profile data: ${profileResponse.status}`
          );
        }

        const profileData: UserData = await profileResponse.json();

        // Set username from profile data
        if (profileData && profileData.name) {
          setUsername(profileData.name);
        }

        // Check if user is admin
        setIsAdmin(profileData.email === "xili@hsph.harvard.edu");

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Get first letter of username for avatar
  const avatarLetter = username.charAt(0).toUpperCase();

  return (
    <div className="h-full bg-white flex flex-col">
      {/* User Section */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white">
            {avatarLetter}
          </div>
          <span className="font-medium">{username}</span>
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Special Explore Today's Plan Button */}
      <div className="px-3 mb-2">
        <button
          onClick={() => navigate("/personal")}
          className="w-full py-2 px-3 rounded-lg bg-orange-100 hover:bg-orange-200 transition-colors"
        >
          <span className="text-black font-medium text-sm whitespace-nowrap">Explore Today's Plan</span>
        </button>
      </div>

      <div className="text-xs text-gray-500 px-4">Menu</div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2">
        {sidebarItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 px-2 py-2 rounded-lg mb-1 ${
              location.pathname === item.path
                ? "bg-orange-50 text-orange-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              {item.icon}
            </span>
            <span className="text-sm">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Links */}
      <div className="mt-auto border-t border-gray-100 p-2">
        {bottomItems.map((item) => (
          <button 
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center space-x-3 px-2 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
