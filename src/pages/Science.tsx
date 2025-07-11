import React from 'react';
import { SERVER_URL } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Science  = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="mt-20 relative h-[400px] w-full">
        <img
          src={`${SERVER_URL}/api/images/salad.png`}
          alt="Fresh salad"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-['Newsreader'] text-[64px] font-semibold leading-[83px] text-white text-center">
            Introducing a new way<br />to manage glucose
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="font-neuton text-[48px] italic font-normal leading-[62.4px] text-center mb-6">
            How does MindFood work?
          </h2>
          <p className="font-neuton text-[24px] font-normal leading-[31px] text-center max-w-2xl mx-auto [text-underline-position:from-font] [text-decoration-skip-ink:none]">
            Personalization is the new luxury. MindFood will guide you on meal prepping and
            dining out based on your health profile and preferences. We make it easy for you to
            practice mindful eating throughout this journey.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Timeline */}
          <div className="w-full lg:w-1/2">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[13px] top-0 bottom-0 w-[2px] bg-orange-200"></div>

              {/* Timeline items */}
              <div className="space-y-20">
                {[
                  {
                    title: "Tell us more about yourself by completing the online user questionnaire",
                  },
                  {
                    title: "Upload your meals and restaurant menus to build up your MindFood habits",
                  },
                  {
                    title: "Track your glucose level and past progress on your dashboard",
                  },
                  {
                    title: "Consult our 24/7 chatbot if you have any questions or need any help",
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    {/* Dot Container */}
                    <div className="relative w-[25px] flex-shrink-0">
                      {/* Timeline dot */}
                      <div className="absolute left-[13px] top-2.5 -translate-x-1/2 w-6 h-6 bg-white rounded-full border-2 border-orange-200 z-10">
                        <div className="absolute inset-[3px] bg-orange-500 rounded-full"></div>
                      </div>
                    </div>
                    {/* Text content */}
                    <div className="flex-1 pl-4">
                      <p className="text-blue-950 text-xl font-neuton leading-normal">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image container */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <img
              src={`${SERVER_URL}/api/images/dinner.png`}
              alt="People enjoying dinner"
              className="rounded-2xl shadow-lg w-full"
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-24 text-center bg-gradient-to-b from-orange-50 to-transparent rounded-2xl p-4 sm:p-8 md:p-12">
          <h3 className="font-neuton text-xl sm:text-2xl mb-3 sm:mb-4">Let's get in touch</h3>
          <p className="text-gray-600 mb-4 sm:mb-6 font-neuton text-sm sm:text-base px-2">
            Be the first to know about new recipes, valuable health management tips and more!
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

export default Science;