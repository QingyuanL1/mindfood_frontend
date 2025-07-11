import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  value,
  onChange,
  placeholder = "Enter your password",
  required = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm"
        placeholder={placeholder}
        required={required}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

const AuthPages: React.FC<{ mode?: "login" | "signup" }> = ({
  mode = "login",
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasNumber: false,
    hasLower: false,
    hasUpper: false,
    hasSpecial: false,
    matches: false,
  });

  useEffect(() => {
    if (mode === "signup") {
      setPasswordValidation({
        minLength: password.length >= 8,
        hasNumber: /\d/.test(password),
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        matches: password === confirmPassword && password !== "",
      });
    }
  }, [password, confirmPassword, mode]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!isPasswordValid) {
        setError("Please ensure all password requirements are met");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      if (mode === "login") {
        const res = await api.post("/api/user/login", { email, password });

        if (res.data.access_token) {
          // Save token
          localStorage.setItem("access_token", res.data.access_token);

          // Store username from email
          console.log("Email:", res);
          const username = email.split("@")[0];
          localStorage.setItem("username", username);

          // Notify other components
          window.dispatchEvent(new Event("storage"));

          console.log("Login successful, redirecting to dashboard...");
          navigate("/survey");
        } else {
          setError("Invalid login response from server");
        }
      } else {
        const res = await api.post("/api/user/signup", { email, password });
        if (res.data.access_token) {
          // Save token
          localStorage.setItem("access_token", res.data.access_token);

          // Store username from email
          const username = email.split("@")[0];
          localStorage.setItem("username", username);

          // Notify other components
          window.dispatchEvent(new Event("storage"));

          console.log("Signup successful, redirecting to dashboard...");
          navigate("/survey");
        } else {
          setError("Signup failed. Invalid response from server");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(
        err.response?.data?.detail ||
          `${mode === "login" ? "Login" : "Signup"} failed`
      );
    }
  };

  const RequirementIndicator: React.FC<{ met: boolean; text: string }> = ({
    met,
    text,
  }) => (
    <div className="flex items-center space-x-2 text-xs">
      {met ? (
        <Check className="w-3 h-3 text-green-500" />
      ) : (
        <AlertCircle className="w-3 h-3 text-gray-300" />
      )}
      <span className={met ? "text-green-700" : "text-gray-500"}>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex pt-[4.5rem]">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center mb-6">
            <span className="text-orange-500 text-xl font-neuton tracking-wide">
              MindFood
            </span>
          </Link>

          {/* Welcome Text */}
          <div className="mb-4">
            <h1 className="text-2xl font-neuton font-bold text-gray-900 mb-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-gray-600">
              {mode === "login"
                ? "Sign in to continue your health journey"
                : "Start your personalized nutrition journey today"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === "signup" && (
              <>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">
                    Password Requirements:
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <RequirementIndicator
                      met={passwordValidation.minLength}
                      text="8+ characters"
                    />
                    <RequirementIndicator
                      met={passwordValidation.hasNumber}
                      text="One number"
                    />
                    <RequirementIndicator
                      met={passwordValidation.hasLower}
                      text="One lowercase"
                    />
                    <RequirementIndicator
                      met={passwordValidation.hasUpper}
                      text="One uppercase"
                    />
                    <RequirementIndicator
                      met={passwordValidation.hasSpecial}
                      text="Special character"
                    />
                    <RequirementIndicator
                      met={passwordValidation.matches}
                      text="Passwords match"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-3 w-3 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 text-gray-600">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-orange-500 hover:text-orange-600"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm
                ${
                  mode === "signup" && !isPasswordValid
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              disabled={mode === "signup" && !isPasswordValid}
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </button>

            {/* Social Login Section */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gray-50 text-gray-500">
                  or continue with
                </span>
              </div>
            </div>

            <button
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                console.log("Google login clicked");
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-gray-600 text-xs font-medium">
                {mode === "login"
                  ? "Sign in with Google"
                  : "Sign up with Google"}
              </span>
            </button>
          </form>

          {/* Switch between Login/Signup */}
          <p className="mt-4 text-center text-xs text-gray-600">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-orange-50">
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-lg">
            <div className="space-y-2">
              <h2 className="text-4xl font-neuton font-light text-gray-900">
                {mode === "login" ? "Welcome Back" : "Join MindFood Today"}
              </h2>
              <p className="text-xl text-gray-600 font-neuton">
                {mode === "login"
                  ? "Continue Your Health Management Journey with MindFood"
                  : "Unlock Customized Nutrition Experience for a Healthy Lifestyle"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
