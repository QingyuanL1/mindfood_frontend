import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, Star, Clock } from "lucide-react";
import { api } from "../api";

interface Recipe {
  id: number;
  title: string;
  description: string;
  rating: number;
  ratings_count: number;
  prep_time: string;
  cook_time: string;
  total_time: string;
  servings: string;
  nutrition_servings_per_recipe: number;
  nutrition_calories: number;
  cuisines: string[];
  allergens: string[];
  eating_styles: string[];
  health_concerns: string[];
  tags: string[];
  ingredients: string[];
  steps: {
    step_number: number;
    instruction: string;
  }[];
  nutrition_nutrients: {
    nutrient_name: string;
    value: string;
    daily_pct: string;
  }[];
}

interface ApiResponse {
  items: Recipe[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const RecipesPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedEatingStyle, setSelectedEatingStyle] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  const cuisineOptions = [
    "All",
    "Italian",
    "Chinese",
    "Mexican",
    "Indian",
    "Japanese",
    "Thai",
    "French",
    "Greek",
    "Spanish",
    "Korean",
    "Vietnamese",
    "Turkish",
    "Lebanese",
    "American",
  ];

  const eatingStyleOptions = [
    "All",
    "Vegetarian",
    "Vegan",
    "Pescatarian",
    "Keto",
    "Paleo",
    "Low-Carb",
    "Gluten-Free",
    "Dairy-Free",
  ];

  const allergenOptions = [
    "All",
    "Peanuts",
    "Tree Nuts",
    "Milk",
    "Eggs",
    "Fish",
    "Shellfish",
    "Soy",
    "Wheat",
    "Sesame",
  ];

  const ratingOptions = [
    { label: "All", value: 0 },
    { label: "4.5+ Stars", value: 4.5 },
    { label: "4+ Stars", value: 4 },
    { label: "3.5+ Stars", value: 3.5 },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".filter-dropdown")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [
    searchQuery,
    selectedCuisine,
    selectedEatingStyle,
    selectedAllergens,
    minRating,
    currentPage,
  ]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: "30",
        // random: "true",
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCuisine && { cuisine: selectedCuisine }),
        ...(selectedEatingStyle && { eating_style: selectedEatingStyle }),
        ...(minRating > 0 && { min_rating: minRating.toString() }),
      });

      selectedAllergens.forEach((allergen) => {
        params.append("allergen_free", allergen);
      });

      const response = await api.get<ApiResponse>(
        `/api/recipes/list?${params.toString()}`
      );
      if (response.data && Array.isArray(response.data.items)) {
        setRecipes(response.data.items);
        setTotalRecipes(response.data.total);
        setTotalPages(response.data.total_pages);
      } else {
        setError("Invalid response format from server");
      }
    } catch (err: any) {
      console.error("Error fetching recipes:", err);
      setError(err.response?.data?.detail || "Failed to fetch recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipeId: number) => {
    navigate(`/recipes/${recipeId}`);
  };

  const FilterDropdown = ({
    label,
    options,
    value,
    onChange,
    isMulti = false,
    id,
    isRating = false,
  }: {
    label: string;
    options: any[];
    value: any;
    onChange: (value: any) => void;
    isMulti?: boolean;
    id: string;
    isRating?: boolean;
  }) => {
    const isOpen = activeDropdown === id;

    return (
      <div className="relative filter-dropdown">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown(activeDropdown !== id ? id : null);
          }}
          className={`px-2 sm:px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm hover:bg-gray-50 flex items-center space-x-1 ${
            (value && value.length > 0) || (isRating && value > 0)
              ? "text-orange-500"
              : "text-gray-600"
          }`}
        >
          <span className="truncate max-w-[100px] sm:max-w-none">
            {isRating
              ? value > 0
                ? ratingOptions.find((opt) => opt.value === value)?.label
                : label
              : value && !isMulti
              ? value === "All"
                ? label
                : value
              : label}
          </span>
          <ChevronDown
            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setActiveDropdown(null)}
            />
            <div
              className="absolute z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-48 sm:max-h-64 overflow-y-auto mt-1 left-0 right-0 sm:right-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {isRating ? (
                <>
                  {ratingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onChange(value === option.value ? 0 : option.value);
                        setActiveDropdown(null);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 flex items-center justify-between ${
                        value === option.value
                          ? "text-orange-500"
                          : "text-gray-600"
                      }`}
                    >
                      {option.label}
                      {value === option.value && (
                        <span className="text-orange-500">✓</span>
                      )}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        if (isMulti) {
                          if (option === "All") {
                            onChange([]);
                          } else {
                            const newValue = selectedAllergens.includes(option)
                              ? selectedAllergens.filter(
                                  (item) => item !== option
                                )
                              : [...selectedAllergens, option];
                            onChange(newValue);
                          }
                        } else {
                          onChange(option === value ? "" : option);
                          setActiveDropdown(null);
                        }
                      }}
                      className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 flex items-center justify-between ${
                        isMulti
                          ? selectedAllergens.includes(option)
                            ? "text-orange-500"
                            : "text-gray-600"
                          : value === option
                          ? "text-orange-500"
                          : "text-gray-600"
                      }`}
                    >
                      {option}
                      {((isMulti && selectedAllergens.includes(option)) ||
                        (!isMulti && value === option)) && (
                        <span className="text-orange-500">✓</span>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    // Calculate difficulty
    const getDifficulty = () => {
      const prepTimeMinutes = parseInt(recipe.prep_time);
      const stepsCount = recipe.steps.length;

      if (prepTimeMinutes <= 15 && stepsCount <= 5) {
        return { text: "Super Easy", color: "text-green-500 bg-green-50" };
      } else if (prepTimeMinutes <= 30 && stepsCount <= 8) {
        return { text: "Easy", color: "text-blue-500 bg-blue-50" };
      } else if (prepTimeMinutes <= 60 && stepsCount <= 12) {
        return { text: "Moderate", color: "text-orange-500 bg-orange-50" };
      } else {
        return { text: "Complex", color: "text-red-500 bg-red-50" };
      }
    };

    const difficulty = getDifficulty();

    return (
      <div
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleRecipeClick(recipe.id)}
      >
        <div className="aspect-square bg-gray-200">
          <img
            src={`/api/recipes/${recipe.id}/image`}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.dataset.fallbackLoaded) {
                target.dataset.fallbackLoaded = "true";
                target.src = `https://dummyimage.com/300x300/f5f5f5/aaa&text=${encodeURIComponent(
                  recipe.title.split(" ")[0]
                )}`;
              }
            }}
          />
        </div>
        <div className="p-2 sm:p-3">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="font-medium text-xs sm:text-sm line-clamp-2 pr-1">
              {recipe.title}
            </h3>
            {recipe.rating > 0 && (
              <div className="flex items-center space-x-0.5 ml-1 shrink-0">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-orange-500 text-orange-500" />
                <span className="text-[10px] sm:text-xs font-medium text-orange-500">
                  {recipe.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center space-x-1 text-gray-500">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-[10px] sm:text-xs">
                {recipe.prep_time.replace(" mins", "")} min
              </span>
            </div>
            <span
              className={`px-1 sm:px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${difficulty.color}`}
            >
              {difficulty.text}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex items-baseline space-x-2">
          <h1 className="text-2xl font-semibold text-gray-800">Recipes</h1>
          <span className="text-sm text-gray-500">
            ({totalRecipes} recipes)
          </span>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            onClick={fetchRecipes}
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 md:mb-12">
        <FilterDropdown
          id="cuisine"
          label="Cuisine"
          options={cuisineOptions}
          value={selectedCuisine}
          onChange={setSelectedCuisine}
        />

        <FilterDropdown
          id="diet"
          label="Diet"
          options={eatingStyleOptions}
          value={selectedEatingStyle}
          onChange={setSelectedEatingStyle}
        />

        <FilterDropdown
          id="allergens"
          label="Allergen-Free"
          options={allergenOptions}
          value={selectedAllergens}
          onChange={setSelectedAllergens}
          isMulti={true}
        />

        <FilterDropdown
          id="rating"
          label="Rating"
          options={[]}
          value={minRating}
          onChange={setMinRating}
          isRating={true}
        />

        {(selectedCuisine ||
          selectedEatingStyle ||
          selectedAllergens.length > 0 ||
          minRating > 0) && (
          <button
            onClick={() => {
              setSelectedCuisine("");
              setSelectedEatingStyle("");
              setSelectedAllergens([]);
              setMinRating(0);
              setActiveDropdown(null);
            }}
            className="px-3 py-1.5 text-sm text-orange-500 hover:text-orange-600"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-x-6 md:gap-y-8 min-h-[500px] md:min-h-[1200px]">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : recipes.length === 0 ? (
        <div className="text-center text-gray-500">No recipes found</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-x-6 md:gap-y-8 min-h-[500px] md:min-h-[1200px]">
            {[...Array(30)].map((_, i) =>
              recipes[i] ? (
                <RecipeCard key={recipes[i].id} recipe={recipes[i]} />
              ) : (
                <div
                  key={i}
                  className="bg-gray-50 rounded-lg aspect-[1/1.2]"
                ></div>
              )
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-1 sm:space-x-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-100"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {currentPage > 2 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      1
                    </button>
                    {currentPage > 3 && (
                      <span className="text-gray-400">...</span>
                    )}
                  </>
                )}

                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    {currentPage - 1}
                  </button>
                )}

                <button className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-orange-500 text-white">
                  {currentPage}
                </button>

                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    {currentPage + 1}
                  </button>
                )}

                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && (
                      <span className="text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-100"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecipesPage;
