import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MobileNavBar from "./components/MobileNavBar";
import LandingPage from "./pages/LandingPage";
import LandingPageAfterLogin from "./pages/LandingPageAfterLogin";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Survey from "./pages/Survey";
import SurveyPrediabetes from "./pages/SurveyPrediabetes";
import Dashboard from "./pages/Dashboard";
import RecipesPage from "./pages/RecipesPage";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/SettingsPage";
import ForgotPassword from "./pages/ForgotPassword";
import Science from "./pages/Science";
import RecipeDetail from "./pages/RecipeDetail";
import Progress from "./pages/Progress";
import MealDetails from "./pages/MealDetails";
import Product from "./pages/Product";
import About from "./pages/About";
import LikedPage from "./pages/LikedPage";
import TeamPage from "./pages/TeamPage";
import ChatPage from "./pages/ChatPage";
import MealsPage from "./pages/MealsPage";
import PersonalPage from "./pages/PersonalPage";
import MyProfile from "./pages/MyProfile";
import Membership from "./pages/Membership";

// Layout component for authenticated routes
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [navigate]);

  // Check if user is authenticated
  const token = localStorage.getItem("access_token");

  // If not authenticated, redirect to login
  if (!token) {
    return null;
  }

  return (
    <>
      <MobileNavBar />
      <div className="pt-[4.5rem] flex min-h-[calc(100vh-4.5rem)]">
        <div className="w-64 border-r border-gray-100 hidden md:block">
          <div className="sticky top-[4.5rem] h-[calc(100vh-4.5rem)] overflow-y-auto">
            <Sidebar />
          </div>
        </div>
        <div className="flex-1 overflow-x-hidden">{children}</div>
      </div>
    </>
  );
};

// Layout component for pages with Navbar
const NavbarLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="relative min-h-screen">
        <Routes>
          {/* Routes without Navbar */}
          <Route path="/survey" element={<Survey />} />

          {/* Routes with Navbar */}
          <Route element={<NavbarLayout />}>
            {/* Auth routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Public routes */}
            <Route
              path="/"
              element={
                <div className="pt-[4.5rem] px-4 md:px-8 lg:px-12">
                  <LandingPage />
                </div>
              }
            />
            <Route
              path="/home"
              element={
                <div className="pt-[4.5rem] px-4 md:px-8 lg:px-12">
                  <LandingPageAfterLogin />
                </div>
              }
            />
            <Route
              path="/science"
              element={
                <div className="pt-[4.5rem] px-4 md:px-8 lg:px-12">
                  <Science />
                </div>
              }
            />
            <Route
              path="/product"
              element={
                <div className="pt-[4.5rem] px-4 md:px-8 lg:px-12">
                  <Product />
                </div>
              }
            />
            <Route
              path="/about"
              element={
                <div className="pt-[4.5rem] px-4 md:px-8 lg:px-12">
                  <About />
                </div>
              }
            />
            <Route
              path="/membership"
              element={
                <div className="pt-[4.5rem] px-4 md:px-8 lg:px-12">
                  <Membership />
                </div>
              }
            />

            {/* Prediabetes Risk Assessment */}
            <Route
              path="/survey-prediabetes"
              element={
                <div className="pt-[4.5rem]">
                  <SurveyPrediabetes />
                </div>
              }
            />

            {/* Authenticated routes with Sidebar */}
            <Route
              path="/dashboard"
              element={
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/recipes"
              element={
                <AuthenticatedLayout>
                  <RecipesPage />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/recipes/:id"
              element={
                <AuthenticatedLayout>
                  <RecipeDetail />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthenticatedLayout>
                  <SettingsPage />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/progress"
              element={
                <AuthenticatedLayout>
                  <Progress />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/meal-details"
              element={
                <AuthenticatedLayout>
                  <MealDetails />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/liked"
              element={
                <AuthenticatedLayout>
                  <LikedPage />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/team"
              element={
                <AuthenticatedLayout>
                  <TeamPage />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/chat"
              element={
                <AuthenticatedLayout>
                  <ChatPage />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/meals"
              element={
                <AuthenticatedLayout>
                  <MealsPage />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/personal"
              element={
                <AuthenticatedLayout>
                  <PersonalPage />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/membership"
              element={
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/feedback"
              element={
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/help"
              element={
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              }
            />
            <Route
              path="/refer"
              element={
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              }
            />

            {/* My Profile route */}
            <Route
              path="/myprofile"
              element={
                <AuthenticatedLayout>
                  <MyProfile />
                </AuthenticatedLayout>
              }
            />

            {/* Profile route */}
            <Route
              path="/profile"
              element={
                <AuthenticatedLayout>
                  <MyProfile />
                </AuthenticatedLayout>
              }
            />

            {/* Admin routes */}
            <Route
              path="*"
              element={
                <div className="pt-[4.5rem] px-4 md:px-8 lg:px-12">
                  <NotFound />
                </div>
              }
            />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
