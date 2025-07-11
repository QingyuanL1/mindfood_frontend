import React from "react";
import { ChevronLeft, Clock, Utensils, Star, Share2, Edit, Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MealDetails: React.FC = () => {
  const navigate = useNavigate();
  const [servings, setServings] = React.useState(2);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="h-5 w-5 mr-1" />
        <span>Back</span>
      </button>

      {/* Grid Layout - Four Quadrants with left column wider */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upper Left - Meal Info (span 2 columns) */}
        <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
          {/* Meal Title & Share Button */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Roasted Sweet Potato & Eggplant Pitas</h1>
            <button className="px-3 py-1.5 bg-[#FF9466] text-white text-sm font-medium rounded-lg hover:bg-[#e68450] flex items-center">
              <Share2 className="w-4 h-4 mr-1" />
              <span>Share</span>
            </button>
          </div>

          {/* Meal Image */}
          <div className="relative mb-4">
            <img
              src="https://images.unsplash.com/photo-1626458554884-0ba2293fc00b"
              alt="Meal"
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>

          {/* Single line for all info and controls */}
          <div className="flex items-center justify-between mb-3">
            {/* Time, Ingredients, and Stars on left side */}
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-[#FF9466] mr-1" />
              <span className="text-sm text-gray-600 mr-4">20 minutes</span>
              
              <Utensils className="w-5 h-5 text-[#FF9466] mr-1" />
              <span className="text-sm text-gray-600 mr-4">8 ingredients</span>
              
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            
            {/* Edit/Delete Buttons on right side */}
            <div className="flex space-x-4">
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <Edit className="w-5 h-5 mr-1" />
                <span className="text-sm">Edit</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-red-600">
                <Trash2 className="w-5 h-5 mr-1" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upper Right - Nutrition Info (span 1 column) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Nutrition</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Calories</span>
              <span className="font-semibold">248 kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fat</span>
              <span className="font-semibold">6g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Carbs</span>
              <span className="font-semibold">48g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fiber</span>
              <span className="font-semibold">12g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Protein</span>
              <span className="font-semibold">13g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cholesterol</span>
              <span className="font-semibold">13mg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sugar</span>
              <span className="font-semibold">14g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vitamin C</span>
              <span className="font-semibold">13mg</span>
            </div>
          </div>

          {/* Nutrition Tags */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Health Benefits</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">High Fiber</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Low Fat</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">Low Glycemic</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Plant-based</span>
            </div>
          </div>
        </div>

        {/* Lower Left - Directions (span 2 columns) */}
        <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Directions</h2>
          <ol className="space-y-4">
            <li className="flex">
              <span className="h-8 w-8 bg-[#FF9466] text-white flex items-center justify-center rounded-full mr-3 flex-shrink-0">1</span>
              <div>
                <p className="text-gray-700">Preheat the oven to 425°F and line a baking sheet with parchment paper.</p>
              </div>
            </li>
            <li className="flex">
              <span className="h-8 w-8 bg-[#FF9466] text-white flex items-center justify-center rounded-full mr-3 flex-shrink-0">2</span>
              <div>
                <p className="text-gray-700">Spread the sweet potato and eggplant over the parchment paper. Bake for 15-17 minutes.</p>
              </div>
            </li>
            <li className="flex">
              <span className="h-8 w-8 bg-[#FF9466] text-white flex items-center justify-center rounded-full mr-3 flex-shrink-0">3</span>
              <div>
                <p className="text-gray-700">Cut the pitas in half and stuff them with roasted veggies.</p>
              </div>
            </li>
            <li className="flex">
              <span className="h-8 w-8 bg-[#FF9466] text-white flex items-center justify-center rounded-full mr-3 flex-shrink-0">4</span>
              <div>
                <p className="text-gray-700">Serve with dressing and enjoy!</p>
              </div>
            </li>
          </ol>

          {/* Tips Section */}
          <div className="mt-6 bg-amber-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-amber-800 mb-2">Tips</h3>
            <p className="text-sm text-amber-700">
              Make sure to cut the sweet potatoes and eggplant into uniform pieces for even cooking. 
              For extra flavor, drizzle with olive oil and sprinkle with salt before roasting.
            </p>
          </div>
        </div>

        {/* Lower Right - Ingredients (span 1 column) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Ingredients</h2>

          {/* Serving Size Slider */}
          <div className="flex items-center space-x-4 mb-6 bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-600">Servings:</span>
            <button
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-gray-800 font-semibold">{servings}</span>
            <button
              onClick={() => setServings((s) => s + 1)}
              className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Ingredients List */}
          <ul className="space-y-3">
            <li className="flex items-center py-2 border-b border-gray-100">
              <span className="w-2 h-2 bg-[#FF9466] rounded-full mr-3"></span>
              <span className="text-gray-700">1 Sweet Potato (chopped)</span>
            </li>
            <li className="flex items-center py-2 border-b border-gray-100">
              <span className="w-2 h-2 bg-[#FF9466] rounded-full mr-3"></span>
              <span className="text-gray-700">1 Eggplant (cubed)</span>
            </li>
            <li className="flex items-center py-2 border-b border-gray-100">
              <span className="w-2 h-2 bg-[#FF9466] rounded-full mr-3"></span>
              <span className="text-gray-700">1 tsp Za'atar Spice</span>
            </li>
            <li className="flex items-center py-2 border-b border-gray-100">
              <span className="w-2 h-2 bg-[#FF9466] rounded-full mr-3"></span>
              <span className="text-gray-700">2 Mini Whole Wheat Pita</span>
            </li>
            <li className="flex items-center py-2 border-b border-gray-100">
              <span className="w-2 h-2 bg-[#FF9466] rounded-full mr-3"></span>
              <span className="text-gray-700">2 tbsp Cilantro</span>
            </li>
            <li className="flex items-center py-2 border-b border-gray-100">
              <span className="w-2 h-2 bg-[#FF9466] rounded-full mr-3"></span>
              <span className="text-gray-700">2 tbsp Olive Oil</span>
            </li>
            <li className="flex items-center py-2 border-b border-gray-100">
              <span className="w-2 h-2 bg-[#FF9466] rounded-full mr-3"></span>
              <span className="text-gray-700">Salt and Pepper to taste</span>
            </li>
          </ul>

          <button className="mt-6 w-full py-2 bg-[#FF9466] text-white font-medium rounded-lg hover:bg-[#e68450]">
            Add Ingredients to Shopping List
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealDetails;
