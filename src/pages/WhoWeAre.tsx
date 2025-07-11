import React from "react";
import { SERVER_URL } from "../api";
import Footer from "../components/Footer";

const WhoWeAre = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-6xl mx-auto text-center pb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Who We Are</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            MindFood is dedicated to empowering individuals through personalized nutrition.
            We combine cutting-edge technology with scientific research to help you make better
            food choices for your cognitive and metabolic health.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="bg-gray-50 py-12 md:py-20 -mx-4 md:-mx-6 lg:-mx-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex items-center gap-12">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <img
                src={`${SERVER_URL}/static/images/team-working.jpg`}
                alt="Our story"
                className="rounded-xl shadow-md w-full h-auto max-h-96 object-cover"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 mb-6">
                MindFood was founded in 2021 by a team of nutritionists, data scientists, and healthcare 
                professionals united by a common vision: to make personalized nutrition accessible to everyone.
              </p>
              <p className="text-gray-600">
                We recognized that the existing one-size-fits-all approaches to nutrition often fail because 
                they don't account for individual differences in metabolism, health needs, and preferences. 
                Our platform leverages artificial intelligence to analyze your unique health profile and 
                provide tailored nutritional guidance that helps optimize your cognitive function and 
                metabolic health.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Empower Through Knowledge</h3>
              <p className="text-gray-600">
                We believe that understanding the relationship between nutrition and health is the first 
                step toward making better food choices. Our platform provides clear, science-based insights 
                that help you understand how different foods affect your body and brain.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Personalize Nutrition</h3>
              <p className="text-gray-600">
                We're committed to moving beyond generic dietary advice. By analyzing your unique health 
                profile, preferences, and goals, we create personalized nutrition plans that are effective 
                and sustainable for your lifestyle.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Promote Holistic Health</h3>
              <p className="text-gray-600">
                We recognize that nutrition is just one aspect of overall health. Our approach considers how 
                food choices interact with physical activity, sleep, stress, and other lifestyle factors to 
                support your complete wellbeing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team Section */}
      <div className="bg-gray-50 py-12 md:py-20 -mx-4 md:-mx-6 lg:-mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white flex flex-col">
              <div className="relative h-48">
                <img 
                  src={`${SERVER_URL}/static/images/team-member1.jpg`} 
                  alt="Dr. Sarah Chen" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 md:p-6 flex-grow bg-white">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">Dr. Sarah Chen</h3>
                <p className="text-sm text-gray-500 mb-2">Co-Founder & CEO</p>
                <p className="text-sm text-gray-600">
                  Neurologist with a passion for brain health optimization through nutrition. 
                  Sarah leads our research initiatives and product development.
                </p>
              </div>
            </div>
            
            <div className="bg-white flex flex-col">
              <div className="relative h-48">
                <img 
                  src={`${SERVER_URL}/static/images/team-member2.jpg`} 
                  alt="Dr. Michael Rodriguez" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 md:p-6 flex-grow bg-white">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">Dr. Michael Rodriguez</h3>
                <p className="text-sm text-gray-500 mb-2">Co-Founder & CTO</p>
                <p className="text-sm text-gray-600">
                  With a background in AI and data science, Michael leads our technology team in 
                  developing our personalized nutrition algorithms.
                </p>
              </div>
            </div>
            
            <div className="bg-white flex flex-col">
              <div className="relative h-48">
                <img 
                  src={`${SERVER_URL}/static/images/team-member3.jpg`} 
                  alt="Emma Thompson" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 md:p-6 flex-grow bg-white">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">Emma Thompson</h3>
                <p className="text-sm text-gray-500 mb-2">Chief Nutritionist</p>
                <p className="text-sm text-gray-600">
                  Registered dietitian specializing in metabolic health. Emma ensures all our 
                  nutritional recommendations are scientifically sound.
                </p>
              </div>
            </div>
            
            <div className="bg-white flex flex-col">
              <div className="relative h-48">
                <img 
                  src={`${SERVER_URL}/static/images/team-member4.jpg`} 
                  alt="James Wilson" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 md:p-6 flex-grow bg-white">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">James Wilson</h3>
                <p className="text-sm text-gray-500 mb-2">Head of Product</p>
                <p className="text-sm text-gray-600">
                  With 15 years of experience in digital health, James ensures our platform is 
                  user-friendly and delivers actionable insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Contact Us</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <p className="text-gray-600 mb-6">
                  Have questions about MindFood or interested in partnering with us? 
                  We'd love to hear from you. Reach out using the contact form or the 
                  information provided below.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-medium text-gray-900">Address</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        123 Health Avenue, San Francisco, CA 94107, USA
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-medium text-gray-900">Phone</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        +1 (415) 555-0123
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-medium text-gray-900">Email</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        info@mindfood.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <form action="#" method="POST" className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" id="name" name="name" className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="email" name="email" className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500" />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea id="message" name="message" rows={4} className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"></textarea>
                  </div>
                  
                  <div>
                    <button type="submit" className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition">Send Message</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WhoWeAre; 