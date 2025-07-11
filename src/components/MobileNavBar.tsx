import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu as MenuIcon,
  X,
  ChevronDown,
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
  UserCircle,
  LogOut
} from "lucide-react";
import { api } from "../api";

// Match the sidebar items from Sidebar.tsx
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
    label: "Progress",
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

// Match the bottom items from Sidebar.tsx
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

const MobileNavBar = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch username on component mount
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("/api/user/profile");
        if (response.data && response.data.name) {
          setUsername(response.data.name);
        } else {
          // If no name in profile, use email or stored username as fallback
          const storedUsername = localStorage.getItem("username");
          setUsername(response.data.email || storedUsername || "User");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        const storedUsername = localStorage.getItem("username");
        setUsername(storedUsername || "User");
      }
    };

    fetchUsername();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // Get first letter of username for avatar
  const avatarLetter = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* Mobile Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <h1 className="text-lg font-semibold truncate max-w-[150px]">
              Hi, {username || "there"}!
            </h1>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${
                isMobileMenuOpen ? 'transform rotate-180' : ''
              }`}
            />
          </button>
          <button
            onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {isNavMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Navbar Mobile Menu */}
      <div className={`md:hidden fixed left-0 right-0 bg-white border-b border-gray-100 transition-all duration-300 z-30 ${isNavMenuOpen ? 'top-16' : '-top-96'}`}>
        <div className="flex flex-col space-y-4 p-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div
            className="text-sm text-gray-900 hover:text-[#FF9466] transition py-2"
            onClick={() => setIsNavMenuOpen(false)}
          >
            Our Science
          </div>
          <div
            className="text-sm text-gray-900 hover:text-[#FF9466] transition py-2"
            onClick={() => setIsNavMenuOpen(false)}
          >
            Our Product
          </div>
          <div
            className="text-sm text-gray-900 hover:text-[#FF9466] transition py-2"
            onClick={() => setIsNavMenuOpen(false)}
          >
            Who We Are
          </div>
        </div>
      </div>

      {/* Left Mobile Menu (Sidebar) */}
      <div
        className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden overflow-hidden`}
      >
        {/* Main container with flex column layout */}
        <div className="flex flex-col h-full">
          {/* Fixed header section */}
          <div className="flex-shrink-0 pt-16 px-4">
            {/* User section */}
            <div className="px-4 py-3 flex items-center space-x-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white">
                {avatarLetter}
              </div>
              <span className="font-medium">{username || "User"}</span>
              <button
                onClick={() => {
                  navigate("/settings");
                  setIsMobileMenuOpen(false);
                }}
                className="ml-auto w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
              >
                <Settings size={18} />
              </button>
            </div>
            
            {/* Special Explore Today's Plan Button */}
            <div className="px-3 py-4">
              <button
                onClick={() => {
                  navigate("/personal");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-lg bg-orange-100 hover:bg-orange-200 transition-colors"
              >
                <span className="text-black font-medium text-sm whitespace-nowrap">Explore Today's Plan</span>
              </button>
            </div>
            
            <div className="text-xs text-gray-500 px-4">Menu</div>
          </div>
          
          {/* Scrollable main navigation - now includes all items */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-2 custom-scrollbar">
            <nav className="space-y-1">
              {/* Main menu items */}
              {sidebarItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg ${
                    location.pathname === item.path
                      ? "bg-orange-50 text-orange-500"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Bottom items now part of the scrollable area */}
              {bottomItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              
              {/* Logout button */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Custom scrollbar styles */}
        <style>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #E2E8F0 transparent;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #E2E8F0;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #CBD5E0;
          }
        `}</style>
      </div>
    </>
  );
};

export default MobileNavBar; 