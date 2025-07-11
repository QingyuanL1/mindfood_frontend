import React from 'react';
import { Link } from 'react-router-dom';
import { SERVER_URL } from '../api';
import '../styles/landing.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="text-center px-4 py-8 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-[55px] font-neuton leading-tight text-gray-900 mb-4 font-bold tracking-tight">
            Mindful Meals
            <br />
            Healthy Habits
          </h1>
          <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-8">
            Your <em>personalized</em> nutrition assistant
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-md relative transition-all duration-300 group btn-hover text-orange-500 text-sm md:text-base"
          >
            <span className="relative z-10">Get started today</span>
            <svg
              className="ml-2 w-4 h-4 md:w-5 md:h-5 relative z-10 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16 space-y-8 md:space-y-20">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-16">
          <div className="w-full md:w-1/3">
            <img
              src={`${SERVER_URL}/api/images/laptop-meal.png`}
              alt="Laptop and healthy meal"
              className="rounded-2xl w-full shadow-lg"
            />
          </div>
          <div className="w-full md:w-2/3 space-y-3 md:space-y-6">
            <h2 className="text-xl md:text-[32px] font-neuton leading-[1.2] font-light">
              We are changing how people manage glucose and blood sugar
            </h2>
            <p className="text-sm md:text-[18px] leading-[1.5] text-gray-600 font-neuton">
              MindFood uses science to personalize food recommendations to
              control glucose level. Our technology and solutions help you
              develop sustainable healthy habits and learn how to eat in a more
              mindful way.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse items-center gap-6 md:gap-16">
          <div className="w-full md:w-1/3">
            <img
              src={`${SERVER_URL}/api/images/cooking-prep.png`}
              alt="Cooking preparation"
              className="rounded-2xl w-full shadow-lg"
            />
          </div>
          <div className="w-full md:w-2/3 space-y-3 md:space-y-6">
            <h2 className="text-xl md:text-[32px] font-neuton leading-[1.2] font-light">
              Provide guidance on cooking and meal planning
            </h2>
            <p className="text-sm md:text-[18px] leading-[1.5] text-gray-600 font-neuton">
              MindFood can provide you with a customized meal planning strategy
              based on our comprehensive database to better manage blood sugar
              level. We make the process of meal preparing and grocery shopping
              easy for you and more integrated into your existing lifestyle.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-16">
          <div className="w-full md:w-1/3">
            <img
              src={`${SERVER_URL}/api/images/restaurant.png`}
              alt="Restaurant dining"
              className="rounded-2xl w-full shadow-lg"
            />
          </div>
          <div className="w-full md:w-2/3 space-y-3 md:space-y-6">
            <h2 className="text-xl md:text-[32px] font-neuton leading-[1.2] font-light">
              Navigate menu items when dining at restaurants
            </h2>
            <p className="text-sm md:text-[18px] leading-[1.5] text-gray-600 font-neuton">
              MindFood offers menu scanning function when you eat out at
              restaurants to help you better understand food items and their
              impact on your body, so that you can make more mindful choices.
            </p>
          </div>
        </div>
        {/* Contact Section */}
        <div className="mt-12 text-center bg-gradient-to-b from-orange-50 to-transparent rounded-2xl p-4 sm:p-8 md:p-12">
          <h3 className="font-neuton text-xl sm:text-2xl mb-3 sm:mb-4">Let's get in touch</h3>
          <p className="text-gray-600 mb-4 sm:mb-6 font-neuton text-sm sm:text-base px-2">
            Be the first to learn about new recipes, offers, health management tips and more!
          </p>
          
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 sm:gap-2 px-4 sm:px-0">
            <input
              type="email"
              placeholder="Email"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
            />
            <button className="w-full sm:w-auto px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;