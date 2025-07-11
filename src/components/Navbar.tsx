import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api";
import { Menu, X } from 'lucide-react'; // Import icons for mobile menu

const Navbar = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isPersonalPage = location.pathname === "/personal";

  const updateUsername = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUsername(null);
      return;
    }

    try {
      const response = await api.get("/api/user/profile");
      console.log("Navbar response:", response.data);
      if (response.data && response.data.name) {
        setUsername(response.data.name);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUsername(null);
    }
  };

  useEffect(() => {
    updateUsername();
    window.addEventListener("storage", updateUsername);

    return () => {
      window.removeEventListener("storage", updateUsername);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-[4.5rem] bg-white border-b border-gray-100 z-50">
      <div className="w-full h-16 px-4 md:px-6">
        <div className="flex items-center justify-between h-full">
          {/* Left Side: Logo */}
          <Link to={username ? "/home" : "/"} className="flex items-center">
            <img 
              src="/picture/LOGO.png"
              alt="Mind Food Logo" 
              className="h-12 w-auto object-contain" 
              style={{ maxHeight: '3rem' }}
            />
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 ml-auto">
            <Link
              to="/science"
              className="text-sm text-gray-900 hover:text-[#FF9466] transition"
            >
              Our Science
            </Link>
            <Link
              to="/product"
              className="text-sm text-gray-900 hover:text-[#FF9466] transition"
            >
              Our Product
            </Link>
            <Link
              to="/about"
              className="text-sm text-gray-900 hover:text-[#FF9466] transition"
            >
              Who We Are
            </Link>

            {username ? (
              <Link
                to="/personal"
                className="px-6 py-2 text-sm font-medium rounded-md bg-[#FF9466] text-white border-2 border-[#FF9466] hover:bg-white hover:text-[#FF9466] transition"
                state={{ from: "navbar" }}
              >
                Hi, {username}!
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 text-white text-sm font-medium rounded-md bg-[#FF9466] border-2 border-[#FF9466] hover:text-[#FF9466] hover:bg-white transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute left-0 right-0 bg-white border-b border-gray-100 transition-all duration-300 ${isMenuOpen ? 'top-16' : '-top-96'}`}>
          <div className="flex flex-col space-y-4 p-4">
            <Link
              to="/science"
              className="text-sm text-gray-900 hover:text-[#FF9466] transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Our Science
            </Link>
            <Link
              to="/product"
              className="text-sm text-gray-900 hover:text-[#FF9466] transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Our Product
            </Link>
            <Link
              to="/about"
              className="text-sm text-gray-900 hover:text-[#FF9466] transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Who We Are
            </Link>

            {username ? (
              <Link
                to="/personal"
                className="w-full text-center px-6 py-2 text-sm font-medium rounded-md bg-[#FF9466] text-white border-2 border-[#FF9466] hover:bg-white hover:text-[#FF9466] transition"
                state={{ from: "navbar" }}
                onClick={() => setIsMenuOpen(false)}
              >
                Hi, {username}!
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full text-center px-6 py-2 text-white text-sm font-medium rounded-md bg-[#FF9466] border-2 border-[#FF9466] hover:text-[#FF9466] hover:bg-white transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
