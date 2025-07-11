import React from 'react';
import { SERVER_URL } from '../api';
import Footer from '../components/Footer';

const OurScience = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="mt-20 relative h-[400px] w-full">
        <img
          src={`${SERVER_URL}/static/images/science-hero.jpg`}
          alt="Science background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">The Science Behind MindFood</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Discover how our evidence-based approach helps manage blood sugar through personalized nutrition.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How Our Technology Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Data Collection</h3>
            <p className="text-gray-600">
              We gather information about your health history, dietary preferences, and blood glucose patterns.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600">
              Our advanced algorithms analyze your data to identify patterns and determine your optimal nutrition plan.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalized Recommendations</h3>
            <p className="text-gray-600">
              We deliver customized meal plans and recommendations optimized for your blood sugar management.
            </p>
          </div>
        </div>
      </section>

      {/* Research Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Research-Backed Approach</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">The Glycemic Index and Blood Sugar</h3>
              <p className="text-gray-700 mb-6">
                Our approach is based on extensive research on the glycemic index and its impact on blood sugar levels. 
                Studies have shown that choosing low-glycemic foods can help prevent blood sugar spikes and contribute to 
                better overall metabolic health.
              </p>
              <p className="text-gray-700">
                Research published in prestigious journals like the American Journal of Clinical Nutrition demonstrates 
                that personalized nutrition based on glycemic response can be more effective than one-size-fits-all diets.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Nutritional Science and Brain Health</h3>
              <p className="text-gray-700 mb-6">
                There is growing evidence supporting the connection between blood sugar regulation and cognitive health. 
                Studies indicate that maintaining steady blood glucose levels may help protect against cognitive decline 
                and support overall brain function.
              </p>
              <p className="text-gray-700">
                Our recommendations incorporate findings from research on the Mediterranean diet, MIND diet, and other 
                eating patterns that have been associated with better brain health outcomes.
              </p>
            </div>
          </div>
          
          <div className="mt-12 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-center">Key Research Findings</h3>
            
            <div className="space-y-6">
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">1</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Individual Glycemic Responses Vary Significantly</h4>
                  <p className="text-gray-600">
                    Research from the Weizmann Institute of Science revealed that different people can have varied glycemic 
                    responses to the same foods, highlighting the importance of personalized nutrition.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">2</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Blood Sugar Stability and Cognitive Function</h4>
                  <p className="text-gray-600">
                    Studies published in Neurology suggest that higher glucose levels may be associated with poorer 
                    cognitive performance, even in individuals without diabetes.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">3</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Nutrient Timing and Metabolic Health</h4>
                  <p className="text-gray-600">
                    Research in Diabetes Care indicates that the timing of meals and their macronutrient composition 
                    can significantly impact blood glucose regulation and insulin sensitivity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Our Scientific Advisors</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <img 
              src={`${SERVER_URL}/static/images/scientist1.jpg`} 
              alt="Dr. Sarah Chen"
              className="w-full h-48 object-cover object-center"
            />
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-1">Dr. Sarah Chen</h3>
              <p className="text-sm text-gray-500 mb-3">Neuroscience & Nutrition Research</p>
              <p className="text-gray-700 text-sm">
                Dr. Chen's research focuses on the relationship between nutrition, blood sugar regulation, and brain health. 
                She has published over 50 papers in leading scientific journals.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <img 
              src={`${SERVER_URL}/static/images/scientist2.jpg`} 
              alt="Dr. Michael Rodriguez"
              className="w-full h-48 object-cover object-center"
            />
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-1">Dr. Michael Rodriguez</h3>
              <p className="text-sm text-gray-500 mb-3">Endocrinology & Metabolism</p>
              <p className="text-gray-700 text-sm">
                As a leading endocrinologist, Dr. Rodriguez specializes in glycemic management and metabolic health. 
                His work has helped shape modern approaches to personalized nutrition.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <img 
              src={`${SERVER_URL}/static/images/scientist3.jpg`} 
              alt="Dr. Amara Patel"
              className="w-full h-48 object-cover object-center"
            />
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-1">Dr. Amara Patel</h3>
              <p className="text-sm text-gray-500 mb-3">Data Science & Nutritional AI</p>
              <p className="text-gray-700 text-sm">
                Dr. Patel combines expertise in machine learning and nutritional science to develop algorithms that 
                predict individual responses to different foods and dietary patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurScience; 