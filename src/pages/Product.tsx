import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const Product = () => {
  const [slideIndex, setSlideIndex] = useState(1);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => setSlideIndex((prev) => (prev === 4 ? 1 : prev + 1));
  const prevSlide = () => setSlideIndex((prev) => (prev === 1 ? 4 : prev - 1));

  // Slide content data for all 4 slides
  const slideContents = [
    {
      title: "Personalized Meal Plans",
      content: [
        "Receive detailed recipes tailored to your health condition and goals.",
        "Enjoy the ease of step-by-step instructions and precise ingredient lists, ensuring you can effortlessly prepare diabetes-friendly meals without any hassle."
      ],
      image: `/src/plot/product%20phone%201.png`
    },
    {
      title: "Delicious Diets Just for You",
      content: [
        "Taste matters. That's why we creates custom-crafted meals that align with your unique preferences.",
        "Indulge in a variety of flavors and cuisines, each dish is designed to satisfy your palate while supporting your health goals."
      ],
      image: `/src/plot/product%20phone%202.png`
    },
    {
      title: "Calculation of Glucose Impact",
      content: [
        "We leverage advanced AI technology to analyze how the food you consume affects your glycemic levels.",
        "Gain insights into the relationship between your diet and glycemic response, empowering you to make informed choices."
      ],
      image: `/src/plot/product%20phone%203.png`
    },
    {
      title: "Restaurant Menu insights",
      content: [
        "Scan restaurant menus, and we'll provide personalized recommendations based on your health profile. Enjoy the freedom to explore new cuisines.",
        "Say goodbye to the stress of deciphering menus and hello to delightful, worry-free dining experiences."
      ],
      image: `/src/plot/product%20phone%204.png`
    }
  ];

  // Get current slide content
  const currentSlide = slideContents[slideIndex - 1];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Fully Responsive with viewport units */}
      <div className="w-full px-[3vw] sm:px-[4vw] md:px-[5vw] mx-auto py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col md:flex-row md:items-stretch md:justify-between">
          {/* Left Box - Fully responsive with fluid widths */}
          <div className="w-full md:w-1/2 md:pr-[2.5vw] mb-4 sm:mb-6 md:mb-0">
            <div className="bg-[#FFF6F2] rounded-lg w-full h-full flex flex-col justify-center overflow-hidden p-4 sm:p-5 md:p-6 lg:p-8">
              <div className="font-['Helvetica'] mb-2 overflow-hidden">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#D6724E] leading-tight text-left">
                  Transform Your Diet with MindFood
                </h2>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-700 leading-tight mt-1 sm:mt-2 text-left">
                  Savor the Joy of Eating While Controlling Your Glucose
                </h3>
              </div>
              <div className="space-y-0.5 sm:space-y-1 md:space-y-2 overflow-hidden">
                <div className="flex items-start">
                  <span className="text-[#D6724E] mr-1 sm:mr-1.5 md:mr-2 text-sm sm:text-base md:text-lg flex-shrink-0">•</span>
                  <p className="text-2xs sm:text-xs md:text-sm lg:text-base text-gray-700 pr-1">
                    Effortless Meal Prep with <b>Ready-to-Cook Recipes</b>
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-[#D6724E] mr-1 sm:mr-1.5 md:mr-2 text-sm sm:text-base md:text-lg flex-shrink-0">•</span>
                  <p className="text-2xs sm:text-xs md:text-sm lg:text-base text-gray-700 pr-1">
                    Custom-Crafted Meals That <b>Suit Your Taste</b>
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-[#D6724E] mr-1 sm:mr-1.5 md:mr-2 text-sm sm:text-base md:text-lg flex-shrink-0">•</span>
                  <p className="text-2xs sm:text-xs md:text-sm lg:text-base text-gray-700 pr-1">
                    Dine Out Fearlessly with <b>Menu Recommendations</b>
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-[#D6724E] mr-1 sm:mr-1.5 md:mr-2 text-sm sm:text-base md:text-lg flex-shrink-0">•</span>
                  <p className="text-2xs sm:text-xs md:text-sm lg:text-base text-[#D6724E] font-semibold pr-1">
                    Starting at $6.99/month, $69.99/year
                  </p>
                </div>
              </div>
              <Link 
                to="/membership" 
                className="mt-2 sm:mt-3 md:mt-4 px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 bg-[#D6724E] text-white text-2xs sm:text-xs md:text-sm font-medium rounded-md sm:rounded-lg hover:bg-[#b95e3e] transition inline-flex items-center w-fit whitespace-nowrap"
              >
                Get started today →
              </Link>
            </div>
          </div>

          {/* Right Box - Fully responsive with fluid widths */}
          <div className="w-full md:w-1/2 md:pl-[2.5vw]">
            <div className="bg-[#F0F8FF] rounded-lg w-full h-full flex items-center justify-center overflow-hidden">
              {/* Using a styled div with background image instead of img tag for better reliability */}
              <div 
                className="w-full h-full"
                style={{ 
                  background: `url(/src/plot/product%20plot.png) center center / cover no-repeat`
                }}
                role="img"
                aria-label="Product Features Chart"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Meal Plans Section - Edge-to-Edge Responsive Green Box */}
      <div className="bg-[#B9F0DA] w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] py-0 mt-2 sm:mt-3 lg:mt-5">
        <div className="w-full px-[3vw] sm:px-[4vw] md:px-[5vw] mx-auto">
          <div className="relative">
            {/* Left Box - Text Content - Only visible on mobile */}
            <div className="md:hidden w-full mb-4 sm:mb-6">
              <div className="bg-transparent rounded-lg w-full flex flex-col justify-center overflow-hidden p-4 sm:p-5">
                <div className="font-['Helvetica'] overflow-hidden">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight text-left">
                    {currentSlide.title}
                  </h2>
                </div>
                <div className="mt-2 sm:mt-3">
                  {currentSlide.content.map((paragraph, idx) => (
                    <p key={idx} className={`text-2xs sm:text-xs text-gray-700 ${idx < currentSlide.content.length - 1 ? 'mb-1.5 sm:mb-2' : ''} text-left`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Container for desktop layout - 50% text column on left side - REDUCED HEIGHT */}
            <div className="hidden md:block md:h-[240px] lg:h-[280px] xl:h-[320px] relative">
              {/* Left Box - Text Content - Desktop version */}
              <div className="absolute left-0 w-1/2 pr-[2.5vw] py-4 sm:py-6 lg:py-8">
                <div className="bg-transparent rounded-lg w-full h-full flex flex-col justify-center overflow-hidden p-4 lg:p-6 relative">
                  <div className="font-['Helvetica'] overflow-hidden">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight text-left">
                      {currentSlide.title}
                    </h2>
                  </div>
                  <div className="mt-2 lg:mt-3">
                    {currentSlide.content.map((paragraph, idx) => (
                      <p key={idx} className={`text-sm lg:text-base text-gray-700 ${idx < currentSlide.content.length - 1 ? 'mb-2' : ''} text-left`}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {/* Page indicator at extreme bottom right corner */}
                  <div className="absolute bottom-0 right-0 text-gray-600 font-semibold text-xs sm:text-sm md:text-base px-2 py-1 bg-white/50 rounded-tl-md">
                    {slideIndex}/4
                  </div>
                </div>
              </div>

              {/* Right Box - Phone Mockup - Exactly right half of the screen */}
              <div className="absolute left-1/2 right-0 h-full">
                <div className="bg-[#227C70] w-full h-full flex flex-col justify-end overflow-hidden relative">
                  {/* Navigation buttons - positioned near bottom */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 md:left-6 bottom-4 md:bottom-6 p-1.5 md:p-2.5 bg-white rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3 md:w-5 md:h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 md:right-6 bottom-4 md:bottom-6 p-1.5 md:p-2.5 bg-white rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 md:w-5 md:h-5 text-gray-700" />
                  </button>
                  
                  {/* Page indicator aligned with control buttons */}
                  <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 text-white font-semibold text-xs sm:text-sm md:text-base">
                    {slideIndex}/4
                  </div>
                  
                  {/* Phone container with fixed size - KEEP SAME */}
                  <div className="relative mx-auto mb-0 pb-0 flex justify-center items-end" style={{ width: "280px", paddingTop: "5px" }}>
                    {/* Authentic iPhone 13 mockup with fixed dimensions */}
                    <div className="relative overflow-hidden shadow-xl mb-0" style={{ 
                      width: "280px", 
                      marginBottom: "-1px", 
                      borderTopLeftRadius: "44px", 
                      borderTopRightRadius: "44px" 
                    }}>
                      {/* iPhone 13 frame with precise coloring */}
                      <div style={{ 
                        width: "280px", 
                        backgroundColor: "#0a0a0a", 
                        borderWidth: "3px", 
                        borderBottom: "0", 
                        borderColor: "#0a0a0a", 
                        borderTopLeftRadius: "40px", 
                        borderTopRightRadius: "40px" 
                      }}>
                        {/* Side buttons with accurate iPhone 13 positioning */}
                        <div style={{ 
                          position: "absolute", 
                          left: "0", 
                          top: "50px", 
                          width: "4px", 
                          height: "35px", 
                          backgroundColor: "#0a0a0a", 
                          borderTopRightRadius: "9999px", 
                          borderBottomRightRadius: "9999px" 
                        }}></div>
                        <div style={{ 
                          position: "absolute", 
                          left: "0", 
                          top: "95px", 
                          width: "4px", 
                          height: "35px", 
                          backgroundColor: "#0a0a0a", 
                          borderTopRightRadius: "9999px", 
                          borderBottomRightRadius: "9999px" 
                        }}></div>
                        <div style={{ 
                          position: "absolute", 
                          right: "0", 
                          top: "60px", 
                          width: "4px", 
                          height: "40px", 
                          backgroundColor: "#0a0a0a", 
                          borderTopLeftRadius: "9999px", 
                          borderBottomLeftRadius: "9999px" 
                        }}></div>
                        
                        {/* Screen with thin bezels like iPhone 13 */}
                        <div style={{ 
                          margin: "5px 5px 0 5px", 
                          borderTopLeftRadius: "36px", 
                          borderTopRightRadius: "36px", 
                          overflow: "hidden", 
                          backgroundColor: "white", 
                          position: "relative" 
                        }}>
                          {/* iPhone 13 notch - integrated with screen */}
                          <div style={{ 
                            position: "absolute", 
                            top: "0", 
                            left: "50%", 
                            transform: "translateX(-50%)", 
                            width: "130px", 
                            height: "25px", 
                            zIndex: "10" 
                          }}>
                            {/* Notch background - matches phone color */}
                            <div style={{ 
                              position: "absolute", 
                              inset: "0", 
                              backgroundColor: "#0a0a0a", 
                              borderBottomLeftRadius: "18px", 
                              borderBottomRightRadius: "18px" 
                            }}></div>
                            
                            {/* TrueDepth camera system details */}
                            <div style={{ 
                              position: "absolute", 
                              top: "9px", 
                              left: "36px", 
                              width: "10px", 
                              height: "10px", 
                              backgroundColor: "#262626", 
                              borderRadius: "9999px" 
                            }}></div>
                            <div style={{ 
                              position: "absolute", 
                              top: "8px", 
                              left: "52px", 
                              width: "26px", 
                              height: "7px", 
                              backgroundColor: "#1c1c1c", 
                              borderRadius: "2px" 
                            }}></div>
                            <div style={{ 
                              position: "absolute", 
                              top: "9px", 
                              right: "36px", 
                              width: "10px", 
                              height: "10px", 
                              backgroundColor: "#262626", 
                              borderRadius: "9999px" 
                            }}></div>
                          </div>
                          
                          {/* App screenshot - only image, no status bar */}
                          <div style={{ 
                            position: "relative", 
                            width: "100%", 
                            height: "270px",
                            background: `url(${currentSlide.image}) top center / cover no-repeat`
                          }}>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile-only Phone Box - Full width version - REDUCED HEIGHT */}
            <div className="md:hidden w-full">
              <div className="bg-[#227C70] w-full flex flex-col justify-end overflow-hidden relative" style={{ paddingLeft: "4%", paddingRight: "4%", paddingTop: "2%", paddingBottom: "0", height: "250px" }}>
                {/* Navigation buttons for mobile */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 sm:left-5 bottom-4 sm:bottom-5 p-1.5 sm:p-2 bg-white rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 sm:right-5 bottom-4 sm:bottom-5 p-1.5 sm:p-2 bg-white rounded-full shadow-md z-10 hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                </button>
                
                {/* Page indicator aligned with control buttons for mobile */}
                <div className="absolute bottom-4 sm:bottom-5 left-1/2 transform -translate-x-1/2 text-white font-semibold text-xs sm:text-sm">
                  {slideIndex}/4
                </div>
                
                {/* Phone container for mobile - Same fixed size */}
                <div className="relative flex justify-center items-end mx-auto mb-0 pb-0" style={{ width: "240px", paddingTop: "0px" }}>
                  {/* Same fixed iPhone 13 code for mobile */}
                  <div className="relative overflow-hidden shadow-xl mb-0" style={{ 
                    width: "240px", 
                    marginBottom: "-1px", 
                    borderTopLeftRadius: "38px", 
                    borderTopRightRadius: "38px" 
                  }}>
                    {/* iPhone 13 frame with precise coloring */}
                    <div style={{ 
                      width: "240px", 
                      backgroundColor: "#0a0a0a", 
                      borderWidth: "3px", 
                      borderBottom: "0", 
                      borderColor: "#0a0a0a", 
                      borderTopLeftRadius: "34px", 
                      borderTopRightRadius: "34px" 
                    }}>
                      {/* Side buttons with accurate iPhone 13 positioning */}
                      <div style={{ 
                        position: "absolute", 
                        left: "0", 
                        top: "43px", 
                        width: "4px", 
                        height: "30px", 
                        backgroundColor: "#0a0a0a", 
                        borderTopRightRadius: "9999px", 
                        borderBottomRightRadius: "9999px" 
                      }}></div>
                      <div style={{ 
                        position: "absolute", 
                        left: "0", 
                        top: "82px", 
                        width: "4px", 
                        height: "30px", 
                        backgroundColor: "#0a0a0a", 
                        borderTopRightRadius: "9999px", 
                        borderBottomRightRadius: "9999px" 
                      }}></div>
                      <div style={{ 
                        position: "absolute", 
                        right: "0", 
                        top: "52px", 
                        width: "4px", 
                        height: "34px", 
                        backgroundColor: "#0a0a0a", 
                        borderTopLeftRadius: "9999px", 
                        borderBottomLeftRadius: "9999px" 
                      }}></div>
                      
                      {/* Screen with thin bezels like iPhone 13 */}
                      <div style={{ 
                        margin: "5px 5px 0 5px", 
                        borderTopLeftRadius: "31px", 
                        borderTopRightRadius: "31px", 
                        overflow: "hidden", 
                        backgroundColor: "white", 
                        position: "relative" 
                      }}>
                        {/* iPhone 13 notch - integrated with screen */}
                        <div style={{ 
                          position: "absolute", 
                          top: "0", 
                          left: "50%", 
                          transform: "translateX(-50%)", 
                          width: "110px", 
                          height: "22px", 
                          zIndex: "10" 
                        }}>
                          {/* Notch background - matches phone color */}
                          <div style={{ 
                            position: "absolute", 
                            inset: "0", 
                            backgroundColor: "#0a0a0a", 
                            borderBottomLeftRadius: "15px", 
                            borderBottomRightRadius: "15px" 
                          }}></div>
                          
                          {/* TrueDepth camera system details */}
                          <div style={{ 
                            position: "absolute", 
                            top: "8px", 
                            left: "32px", 
                            width: "8px", 
                            height: "8px", 
                            backgroundColor: "#262626", 
                            borderRadius: "9999px" 
                          }}></div>
                          <div style={{ 
                            position: "absolute", 
                            top: "7px", 
                            left: "45px", 
                            width: "20px", 
                            height: "6px", 
                            backgroundColor: "#1c1c1c", 
                            borderRadius: "2px" 
                          }}></div>
                          <div style={{ 
                            position: "absolute", 
                            top: "8px", 
                            right: "32px", 
                            width: "8px", 
                            height: "8px", 
                            backgroundColor: "#262626", 
                            borderRadius: "9999px" 
                          }}></div>
                        </div>
                        
                        {/* App screenshot - only image, no status bar */}
                        <div style={{ 
                          position: "relative", 
                          width: "100%", 
                          height: "230px",
                          background: `url(${currentSlide.image}) top center / cover no-repeat`
                        }}>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials section with improved responsive grid */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-10 py-6 sm:py-10 lg:py-16">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-4 sm:mb-6 lg:mb-10 truncate">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
          {[
            {
              name: "Sarah K.",
              role: "Diabetic Patient",
              quote: "MindFood has transformed how I approach meal planning. My glucose levels are finally under control!"
            },
            {
              name: "Mark T.",
              role: "Fitness Enthusiast",
              quote: "The personalized recipes are amazing. I've been able to maintain my fitness goals while enjoying delicious meals."
            },
            {
              name: "Priya R.",
              role: "Busy Professional",
              quote: "As someone with little time to cook, the ready-to-make recipes have been a lifesaver for managing my health."
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <p className="text-2xs sm:text-xs md:text-sm text-gray-700 italic mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-4">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-[#D6724E] opacity-80 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="ml-2 sm:ml-3 min-w-0">
                  <h4 className="font-semibold text-2xs sm:text-xs md:text-sm truncate">{testimonial.name}</h4>
                  <p className="text-gray-500 text-2xs sm:text-xs truncate">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Footer without wrapper */}
      {Footer && <Footer />}
    </div>
  );
};

export default Product;
