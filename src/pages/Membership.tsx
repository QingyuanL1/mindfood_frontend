import React from 'react';
import { Check, X } from 'lucide-react';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const Membership = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <section className="bg-[#227C70] pt-16 pb-20 px-4 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
            Join MindFood today and take control of your nutrition and blood sugar management with our personalized plans.
          </p>
        </div>
      </section>

      {/* Pricing section */}
      <section className="py-12 px-4 -mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Basic Plan</h2>
                <p className="text-gray-500 mt-1">Perfect for beginners</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">$9.99</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <FeatureItem included={true} text="Personalized meal suggestions" />
                  <FeatureItem included={true} text="Basic blood sugar tracking" />
                  <FeatureItem included={true} text="Limited recipe access (100+)" />
                  <FeatureItem included={true} text="Weekly nutrition reports" />
                  <FeatureItem included={false} text="Advanced analytics" />
                  <FeatureItem included={false} text="1-on-1 nutrition coaching" />
                  <FeatureItem included={false} text="Customized meal plans" />
                </ul>
                <div className="mt-8">
                  <button className="block w-full bg-gray-100 text-gray-800 text-center py-3 rounded-lg font-medium hover:bg-gray-200 transition">
                    Start Basic
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 border-[#FF9466] relative">
              <div className="absolute top-0 right-0">
                <div className="bg-[#FF9466] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              </div>
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Premium Plan</h2>
                <p className="text-gray-500 mt-1">For serious health enthusiasts</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">$19.99</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <FeatureItem included={true} text="Personalized meal suggestions" />
                  <FeatureItem included={true} text="Advanced blood sugar tracking" />
                  <FeatureItem included={true} text="Full recipe access (1000+)" />
                  <FeatureItem included={true} text="Daily nutrition reports" />
                  <FeatureItem included={true} text="Advanced analytics" />
                  <FeatureItem included={false} text="1-on-1 nutrition coaching" />
                  <FeatureItem included={true} text="Customized meal plans" />
                </ul>
                <div className="mt-8">
                  <button className="block w-full bg-[#FF9466] text-white text-center py-3 rounded-lg font-medium hover:bg-[#F08350] transition">
                    Join Premium
                  </button>
                </div>
              </div>
            </div>

            {/* Ultimate Plan */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Ultimate Plan</h2>
                <p className="text-gray-500 mt-1">Complete health solution</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">$29.99</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <FeatureItem included={true} text="Personalized meal suggestions" />
                  <FeatureItem included={true} text="Premium blood sugar tracking" />
                  <FeatureItem included={true} text="Full recipe access (1000+)" />
                  <FeatureItem included={true} text="Real-time nutrition reports" />
                  <FeatureItem included={true} text="Advanced analytics" />
                  <FeatureItem included={true} text="1-on-1 nutrition coaching" />
                  <FeatureItem included={true} text="Customized meal plans" />
                </ul>
                <div className="mt-8">
                  <button className="block w-full bg-[#227C70] text-white text-center py-3 rounded-lg font-medium hover:bg-[#1B6459] transition">
                    Get Ultimate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <FAQ 
              question="How does the billing work?"
              answer="xxxxxx"
            />
            <FAQ 
              question="Can I switch between plans?"
              answer="xxxxxx"
            />
            <FAQ 
              question="Do you offer family plans?"
              answer="xxxxxx"
            />
            <FAQ 
              question="Is my data secure?"
              answer="xxxxxx"
            />
            <FAQ 
              question="Can I try before I subscribe?"
              answer="xxxxxx"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Helper component for feature list items
const FeatureItem = ({ included, text }: { included: boolean; text: string }) => {
  return (
    <li className="flex items-start">
      <div className="flex-shrink-0">
        {included ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <X className="h-5 w-5 text-gray-300" />
        )}
      </div>
      <p className={`ml-3 text-sm ${included ? 'text-gray-700' : 'text-gray-400'}`}>
        {text}
      </p>
    </li>
  );
};

// Helper component for FAQ items
const FAQ = ({ question, answer }: { question: string; answer: string }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="font-semibold text-lg text-gray-800 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
};

export default Membership; 