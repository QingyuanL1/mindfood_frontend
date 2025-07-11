import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { AlertCircle, Check, ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // This would connect to your actual password reset endpoint
      await api.post('/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset email');
    }
  };

  if (submitted) {
    return (
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
          <div className="w-full max-w-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-neuton font-bold text-gray-900 mb-2">
              Check your email
            </h1>
            
            <p className="text-gray-600 text-sm mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.open('https://mail.google.com', '_blank')}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>Open Gmail</span>
              </button>

              <Link 
                to="/login"
                className="text-orange-500 hover:text-orange-600 text-sm inline-flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to login</span>
              </Link>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => setSubmitted(false)} 
                className="text-orange-500 hover:text-orange-600"
              >
                try again
              </button>
            </p>
          </div>
        </div>

        {/* Right Panel - Image */}
        <div className="hidden lg:block lg:w-1/2 bg-orange-50">
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-lg">
              <h2 className="text-3xl font-neuton font-light text-gray-900 mb-4">
                Reset your password
              </h2>
              <p className="text-base text-gray-600 font-neuton">
                We'll help you get back into your account and continue your health journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center mb-6">
            <span className="text-orange-500 text-xl font-neuton tracking-wide">MindFood</span>
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-neuton font-bold text-gray-900 mb-1">
              Forgot your password?
            </h1>
            <p className="text-sm text-gray-600">
              Enter your email and we'll send you instructions to reset your password.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm bg-orange-500 text-white hover:bg-orange-600"
            >
              Send reset instructions
            </button>
          </form>

          {/* Back to Login */}
          <Link 
            to="/login"
            className="mt-4 inline-flex items-center space-x-1 text-orange-500 hover:text-orange-600 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to login</span>
          </Link>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-orange-50">
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-lg">
            <h2 className="text-3xl font-neuton font-light text-gray-900 mb-4">
              Reset your password
            </h2>
            <p className="text-base text-gray-600 font-neuton">
              We'll help you get back into your account and continue your health journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;