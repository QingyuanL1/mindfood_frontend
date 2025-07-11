import React, { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const OurProduct = () => {
  const [slideIndex, setSlideIndex] = useState(1);

  const slideContent = [
    {
      title: "Smart Meal Planning",
      description:
        "Personalized meal recommendations based on your nutritional goals and health profile.",
      image: "/images/phone-mockup1.png",
    },
    {
      title: "Blood Sugar Insights",
      description:
        "Track how different foods affect your blood glucose and make informed choices.",
      image: "/images/phone-mockup2.png",
    },
    {
      title: "Recipe Suggestions",
      description:
        "Discover new, delicious recipes tailored to your nutritional needs.",
      image: "/images/phone-mockup3.png",
    },
    {
      title: "Progress Tracking",
      description:
        "Monitor your progress with detailed charts and personalized feedback.",
      image: "/images/phone-mockup4.png",
    },
  ];

  const nextSlide = () => {
    if (slideIndex !== slideContent.length) {
      setSlideIndex(slideIndex + 1);
    } else {
      setSlideIndex(1);
    }
  };

  const prevSlide = () => {
    if (slideIndex !== 1) {
      setSlideIndex(slideIndex - 1);
    } else {
      setSlideIndex(slideContent.length);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full Height */}
      <div className="relative w-full min-h-screen pt-16">
        {/* Background Colors - Split Screen with Adjusted Color */}
        <div className="absolute inset-0 w-full h-full">
          <div className="flex h-full">
            {/* Left Box - Exactly left half of the screen */}
            <div className="w-1/2 bg-white h-full"></div>

            {/* Right Box - Exactly right half of the screen */}
            <div className="w-1/2 bg-[#227C70] h-full"></div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 h-full">
          {/* Desktop Layout - Side by Side - CENTERED VERTICALLY */}
          <div className="hidden md:flex items-center h-[calc(100vh-4rem)] justify-between">
            {/* Left Box - Text Content - 40% width */}
            <div className="w-5/12">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Smart Nutrition for Better Blood Sugar Management
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Our science-based approach helps you understand how your diet
                affects your blood sugar levels, providing personalized
                recommendations for improved health.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg
                      className="h-4 w-4 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Personalized Meal Plans
                    </h3>
                    <p className="mt-1 text-gray-500">
                      Tailored specifically for your nutritional needs and health
                      goals
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg
                      className="h-4 w-4 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Blood Sugar Tracking
                    </h3>
                    <p className="mt-1 text-gray-500">
                      Understand how different foods affect your blood glucose
                      levels
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <svg
                      className="h-4 w-4 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recipe Suggestions
                    </h3>
                    <p className="mt-1 text-gray-500">
                      Delicious recipes optimized for your health needs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box - Phone Mockup - Exactly right half of the screen */}
            <div className="absolute left-1/2 right-0 h-full">
              <div className="bg-[#227C70] w-full h-full flex flex-col justify-end overflow-hidden relative">
                {/* Navigation buttons and page indicator - positioned in one row */}
                <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-between items-center px-4 md:px-6">
                  <button
                    onClick={prevSlide}
                    className="p-1.5 md:p-2.5 bg-white rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3 md:w-5 md:h-5 text-gray-700" />
                  </button>
                  
                  {/* Page indicator between control buttons */}
                  <div className="text-white font-semibold text-xs sm:text-sm md:text-base bg-transparent">
                    {slideIndex}/4
                  </div>
                  
                  <button
                    onClick={nextSlide}
                    className="p-1.5 md:p-2.5 bg-white rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 md:w-5 md:h-5 text-gray-700" />
                  </button>
                </div>
                
                {/* Phone container with fixed size - KEEP SAME */}
                <div
                  className="w-[260px] mx-auto mb-12 md:mb-16"
                  style={{
                    filter: "drop-shadow(0px 20px 50px rgba(0, 0, 0, 0.3))",
                  }}
                >
                  {/* Phone frame */}
                  <div className="relative bg-black rounded-[36px] p-2 transition-all duration-500">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl"></div>

                    {/* Slides */}
                    {slideContent.map((slide, index) => (
                      <div
                        key={index}
                        className={`${
                          slideIndex === index + 1 ? "block" : "hidden"
                        }`}
                      >
                        {/* Screen content */}
                        <div className="bg-white rounded-[30px] overflow-hidden">
                          {/* App header */}
                          <div className="bg-[#227C70] text-white p-4">
                            <div className="text-center font-semibold">
                              MindFood
                            </div>
                          </div>

                          {/* App content */}
                          <div className="p-3">
                            <h3 className="font-bold text-center mb-2">
                              {slide.title}
                            </h3>

                            {/* Placeholder image */}
                            <div className="bg-gray-200 rounded-lg h-48 mb-3 flex items-center justify-center">
                              <svg
                                className="w-12 h-12 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>

                            <p className="text-xs text-gray-600 mb-3">
                              {slide.description}
                            </p>

                            {/* Bottom action button */}
                            <button className="w-full bg-orange-500 text-white rounded-lg py-2 text-xs font-medium">
                              Learn More
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Stacked */}
          <div className="md:hidden pt-8 pb-12">
            {/* Text Content */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold mb-4 leading-tight">
                Smart Nutrition for Better Blood Sugar Management
              </h1>
              <p className="text-gray-600 mb-6">
                Our science-based approach helps you understand how your diet
                affects your blood sugar levels, providing personalized
                recommendations for improved health.
              </p>

              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <h3 className="text-base font-medium text-gray-900">
                      Personalized Meal Plans
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Tailored for your health goals
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <h3 className="text-base font-medium text-gray-900">
                      Blood Sugar Tracking
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Monitor glucose levels
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg
                      className="h-3 w-3 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <h3 className="text-base font-medium text-gray-900">
                      Recipe Suggestions
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Optimized for your health
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-only Phone Box - Full width version - REDUCED HEIGHT */}
            <div className="md:hidden w-full">
              <div className="bg-[#227C70] w-full flex flex-col justify-end overflow-hidden relative" style={{ paddingLeft: "4%", paddingRight: "4%", paddingTop: "2%", paddingBottom: "0", height: "250px" }}>
                {/* Navigation buttons and page indicator for mobile - positioned in one row */}
                <div className="absolute bottom-4 sm:bottom-5 left-0 right-0 flex justify-between items-center px-4 sm:px-5">
                  <button
                    onClick={prevSlide}
                    className="p-1.5 sm:p-2 bg-white rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                  </button>
                  
                  {/* Page indicator between control buttons for mobile */}
                  <div className="text-white font-semibold text-xs sm:text-sm bg-transparent">
                    {slideIndex}/4
                  </div>
                  
                  <button
                    onClick={nextSlide}
                    className="p-1.5 sm:p-2 bg-white rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                  </button>
                </div>
                
                {/* Phone container for mobile - Same fixed size */}
                <div
                  className="w-[180px] mx-auto mb-14"
                  style={{
                    filter: "drop-shadow(0px 20px 50px rgba(0, 0, 0, 0.3))",
                  }}
                >
                  {/* Phone frame */}
                  <div className="relative bg-black rounded-[24px] p-1.5 transition-all duration-500">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black rounded-b-xl"></div>

                    {/* Slides */}
                    {slideContent.map((slide, index) => (
                      <div
                        key={index}
                        className={`${
                          slideIndex === index + 1 ? "block" : "hidden"
                        }`}
                      >
                        {/* Screen content */}
                        <div className="bg-white rounded-[20px] overflow-hidden">
                          {/* App header */}
                          <div className="bg-[#227C70] text-white p-2">
                            <div className="text-center text-xs font-semibold">
                              MindFood
                            </div>
                          </div>

                          {/* App content */}
                          <div className="p-2">
                            <h3 className="font-bold text-xs text-center mb-1">
                              {slide.title}
                            </h3>

                            {/* Placeholder image */}
                            <div className="bg-gray-200 rounded-md h-28 mb-2 flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>

                            <p className="text-[9px] text-gray-600 mb-2">
                              {slide.description}
                            </p>

                            {/* Bottom action button */}
                            <button className="w-full bg-orange-500 text-white rounded-md py-1 text-[10px] font-medium">
                              Learn More
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Key Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Personalized Meal Plans
              </h3>
              <p className="text-gray-600">
                Receive custom meal plans based on your health profile, dietary
                preferences, and blood sugar management goals. Our AI
                continuously learns from your feedback to improve
                recommendations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Blood Sugar Analytics
              </h3>
              <p className="text-gray-600">
                Track how different foods affect your blood glucose levels with
                easy-to-understand visualizations. Identify patterns and make
                informed decisions about your diet with our comprehensive
                analytics.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Nutritional Education
              </h3>
              <p className="text-gray-600">
                Access a vast library of articles, videos, and research about
                nutrition and blood sugar management. Our educational content is
                vetted by healthcare professionals and nutritionists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            What Our Users Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Thompson</h4>
                  <p className="text-gray-500 text-sm">Type 2 Diabetes</p>
                </div>
              </div>
              <p className="text-gray-600">
                "MindFood has completely changed how I think about food. I've
                lowered my A1C by 1.2 points in just three months by following
                the personalized meal recommendations."
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">James Wilson</h4>
                  <p className="text-gray-500 text-sm">Prediabetes</p>
                </div>
              </div>
              <p className="text-gray-600">
                "I was diagnosed with prediabetes last year and was determined to
                reverse it. With MindFood's guidance, I've lost 30 pounds and my
                blood sugar is now in the normal range."
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Elena Rodriguez</h4>
                  <p className="text-gray-500 text-sm">Health Enthusiast</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Even though I don't have diabetes, I'm passionate about
                optimizing my health. MindFood has helped me understand how
                different foods affect my energy levels and overall wellbeing."
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#227C70] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Ready to Transform Your Nutrition?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who have improved their blood sugar
            management with our science-based approach.
          </p>
          <Link to="/membership" className="bg-white text-[#227C70] px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition inline-block">
            Get Started Today
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurProduct; 