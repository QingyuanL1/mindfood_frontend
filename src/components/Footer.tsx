import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <div className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-gray-50 border-t border-gray-200">
      <footer className="mt-4 md:mt-6 pb-4 md:pb-6">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4 md:py-6">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 md:gap-6">
            <div>
              <div className="text-sm md:text-base font-neuton tracking-wide text-orange-500 font-medium mb-1 md:mb-2">
                MindFood
              </div>
              <p className="text-[10px] md:text-sm text-gray-500 mb-2 md:mb-4">
                800 Soldiers Field Road<br />Boston, MA 02163, USA
              </p>
              <div className="flex space-x-2 md:space-x-4">
                <a href="https://x.com/" className="text-gray-400 hover:text-gray-600" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">X</span>
                  <svg className="h-3 w-3 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com/" className="text-gray-400 hover:text-gray-600" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-3 w-3 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zm-11 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764 0-.974.784-1.764 1.75-1.764s1.75.79 1.75 1.764c0 .974-.784 1.764-1.75 1.764zM19 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z"/>
                  </svg>
                </a>
                <a href="https://instagram.com/" className="text-gray-400 hover:text-gray-600" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-3 w-3 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-neuton text-sm md:text-base font-medium mb-1 md:mb-2">Company</h3>
              <ul className="space-y-[2px] md:space-y-1.5">
                <li><Link to="#" className="text-[10px] md:text-sm text-gray-500 hover:text-gray-900">About</Link></li>
                <li><Link to="#" className="text-[10px] md:text-sm text-gray-500 hover:text-gray-900">Careers</Link></li>
                <li><Link to="#" className="text-[10px] md:text-sm text-gray-500 hover:text-gray-900">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-neuton text-sm md:text-base font-medium mb-1 md:mb-2">Support</h3>
              <ul className="space-y-[2px] md:space-y-1.5">
                <li><Link to="#" className="text-[10px] md:text-sm text-gray-500 hover:text-gray-900">Help Center</Link></li>
                <li><Link to="#" className="text-[10px] md:text-sm text-gray-500 hover:text-gray-900">Contact</Link></li>
                <li><a href="mailto:hello@mindfood.com" className="text-[10px] md:text-sm text-gray-500 hover:text-gray-900">Email us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-neuton text-sm md:text-base font-medium mb-1 md:mb-2">Legal</h3>
              <ul className="space-y-[2px] md:space-y-1.5">
                <li><Link to="#" className="text-[10px] md:text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link to="#" className="text-[10px] md:text-sm text-gray-500 hover:text-gray-900">Terms of Service</Link></li>
                <li><Link to="#" className="text-[10px] md:text-sm text-gray-500 hover:text-gray-900">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-4 md:mt-6 pt-3 md:pt-4 text-[8px] md:text-xs text-gray-500">
            <p>© 2024 MindFood, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;