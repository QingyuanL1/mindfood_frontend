import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Logo */}
      <div className="w-full pt-4">
        <Link 
          to="/" 
          className="text-orange-500 text-2xl font-neuton tracking-wide hover:text-orange-600 transition-colors flex justify-center"
        >
          MindFood
        </Link>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center">
        <div className="overflow-hidden h-[600px] flex items-center mt-4">
          <div className="text-[600px] font-neuton text-orange-500 leading-[0.8] select-text">
            404
          </div>
        </div>

        {/* Error Message and Links */}
        <div className="flex flex-col items-center mt-8">
          <h1 className="text-2xl text-gray-900 mb-8">
            Page does not exist
          </h1>

          <p className="text-gray-600 text-center max-w-lg mb-12">
            Maybe you got a broken link, or maybe you made a misprint in the address bar. 
            Try to start all over again in the main sections:
          </p>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
              home
            </Link>
            <Link to="/dashboard" className="text-orange-500 hover:text-orange-600 transition-colors">
              dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;