import React from 'react';
import Footer from "../components/Footer";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="w-full max-w-6xl mx-auto py-10 md:py-16 px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Who We Are
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            AIM.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="bg-gray-50 py-12 md:py-20 -mx-4 md:-mx-6 lg:-mx-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              MindFood was founded in 2024 by a team of xxxx.
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Our journey began when we xxxx.
            </p>
            <p className="text-gray-700 leading-relaxed">
              After...
            </p>
          </div>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="md:flex md:items-center md:space-x-10">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img 
                src="https://images.unsplash.com/photo-1607962837359-5e7e89f86776?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80" 
                alt="Team working together" 
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                At MindFood, our mission is to.....
              </p>
              <p className="text-gray-700 leading-relaxed">
                We're committed to....
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team Section */}
      <div className="bg-gray-50 py-12 md:py-20 -mx-4 md:-mx-6 lg:-mx-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Team Member 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80" 
                  alt="Sarah Johnson" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 md:p-6 flex-grow">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">A</h3>
                <p className="text-[#FF9466] font-medium mb-3">Co-Founder</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  aaa.
                </p>
              </div>
            </div>
            
            {/* Team Member 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="Michael Chen" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 md:p-6 flex-grow">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">B</h3>
                <p className="text-[#FF9466] font-medium mb-3">Co-Founder</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  bbb..
                </p>
              </div>
            </div>
            
            {/* Team Member 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80" 
                  alt="Dr. Emily Rodriguez" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 md:p-6 flex-grow">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">C</h3>
                <p className="text-[#FF9466] font-medium mb-3">abc</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  ccc
                </p>
              </div>
            </div>

            {/* Team Member 4 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80" 
                  alt="Dr. Emily Rodriguez" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 md:p-6 flex-grow">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">D</h3>
                <p className="text-[#FF9466] font-medium mb-3">abc</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  ddd
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have questions about our platform, want to explore partnership opportunities, 
            or just want to say hello, please reach out.
          </p>
          <a 
            href="mailto:contact@mindfood.com" 
            className="inline-block px-8 py-3 bg-[#FF9466] text-white font-medium rounded-md hover:bg-[#e67e50] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About; 