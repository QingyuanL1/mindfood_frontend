import React, { useState, useEffect } from "react";
import { Star, Heart, Clock, Utensils, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

interface Recipe {
  id: number;
  title: string;
  description: string;
  rating: number;
  prep_time: string;
  ingredients: string[];
  nutrition_calories: number;
  steps: {
    step_number: number;
    instruction: string;
  }[];
  nutrition_nutrients: {
    nutrient_name: string;
    value: string;
  }[];
}

const LikedPage: React.FC = () => {
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikedRecipes = async () => {
      try {
        setLoading(true);

        // Get liked recipe IDs from both localStorage and API
        // First, try to get from localStorage for backward compatibility
        const storedLikedMeals = localStorage.getItem("likedMeals");
        let likedRecipeIds: number[] = [];

        if (storedLikedMeals) {
          const likedMealsMap = JSON.parse(storedLikedMeals) as Record<
            number,
            boolean
          >;
          const localLikedIds = Object.entries(likedMealsMap)
            .filter(([_, isLiked]) => isLiked)
            .map(([id]) => parseInt(id));

          likedRecipeIds = [...localLikedIds];
        }

        // Now also fetch from the database API
        try {
          const apiResponse = await api.get("/api/liked-recipes");
          if (apiResponse.data && apiResponse.data.liked_recipes) {
            const dbLikedIds = Object.keys(apiResponse.data.liked_recipes).map(
              (id) => parseInt(id)
            );

            // Merge with localStorage IDs (avoiding duplicates)
            dbLikedIds.forEach((id) => {
              if (!likedRecipeIds.includes(id)) {
                likedRecipeIds.push(id);
              }
            });

            // Update localStorage with the complete list for consistency
            const updatedLikedMeals = likedRecipeIds.reduce((acc, id) => {
              acc[id] = true;
              return acc;
            }, {} as Record<number, boolean>);

            localStorage.setItem(
              "likedMeals",
              JSON.stringify(updatedLikedMeals)
            );
          }
        } catch (apiError) {
          console.error("Error fetching liked recipes from API:", apiError);
          // Continue with localStorage data if API fails
        }

        if (likedRecipeIds.length === 0) {
          setLikedRecipes([]);
          setFilteredRecipes([]);
          setLoading(false);
          return;
        }

        // Fetch each liked recipe individually
        const recipePromises = likedRecipeIds.map((id) =>
          api.get(`/api/recipes/${id}`).then((res) => res.data)
        );
        const fetchedRecipes = await Promise.allSettled(recipePromises);

        const successfulRecipes: Recipe[] = [];
        fetchedRecipes.forEach((result) => {
          if (result.status === "fulfilled") {
            successfulRecipes.push(result.value as unknown as Recipe);
          }
        });

        setLikedRecipes(successfulRecipes);
        setFilteredRecipes(successfulRecipes);
      } catch (err) {
        console.error("Error fetching liked recipes:", err);
        setError("Failed to load your liked recipes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedRecipes();
  }, []);

  useEffect(() => {
    // Filter recipes based on search query
    if (searchQuery.trim() === "") {
      setFilteredRecipes(likedRecipes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = likedRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.description?.toLowerCase().includes(query)
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, likedRecipes]);

  const navigateToRecipe = (recipeId: number) => {
    navigate(`/recipes/${recipeId}`);
  };

  const removeLikedRecipe = (recipeId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    // Update localStorage
    const storedLikedMeals = localStorage.getItem("likedMeals");
    if (storedLikedMeals) {
      const likedMealsMap = JSON.parse(storedLikedMeals) as Record<
        number,
        boolean
      >;
      likedMealsMap[recipeId] = false;
      localStorage.setItem("likedMeals", JSON.stringify(likedMealsMap));

      // Update UI
      setLikedRecipes((prev) =>
        prev.filter((recipe) => recipe.id !== recipeId)
      );
    }

    // Also remove from database
    api
      .delete(`/api/liked-recipes/${recipeId}`)
      .then((response) => {
        console.log("Recipe unliked in database:", response.data);
      })
      .catch((error) => {
        console.error("Error unliking recipe in database:", error);
      });
  };

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    // Calculate difficulty
    const getDifficulty = () => {
      const prepTimeMinutes = parseInt(recipe.prep_time);
      const stepsCount = recipe.steps?.length || 0;

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
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
        onClick={() => navigateToRecipe(recipe.id)}
      >
        <div className="aspect-square bg-gray-200">
          <img
            src={`/api/recipes/${recipe.id}/image`}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={(e) => removeLikedRecipe(recipe.id, e)}
            className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm text-red-500"
            title="Remove from favorites"
          >
            <Heart className="w-4 h-4 fill-red-500" />
          </button>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="font-medium text-sm line-clamp-2">{recipe.title}</h3>
            {recipe.rating > 0 && (
              <div className="flex items-center space-x-1 ml-1.5 shrink-0">
                <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                <span className="text-xs font-medium text-orange-500">
                  {recipe.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">
                {recipe.prep_time.replace(" mins", "")} min
              </span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${difficulty.color}`}
            >
              {difficulty.text}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Liked Recipes
          </h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Liked Recipes
        </h1>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-baseline space-x-2">
          <h1 className="text-2xl font-semibold text-gray-800">
            Liked Recipes
          </h1>
          <span className="text-sm text-gray-500">
            ({likedRecipes.length} recipes)
          </span>
        </div>
        <div className="flex-1 max-w-md ml-4 relative">
          <input
            type="text"
            placeholder="Search liked recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-gray-400 mb-3">
            <Heart size={48} className="mx-auto mb-2" />
            <p className="text-lg">
              {likedRecipes.length === 0
                ? "No liked recipes yet"
                : "No recipes match your search"}
            </p>
            <p className="text-sm mt-2">
              {likedRecipes.length === 0
                ? "Visit your meal plan or recipes page and click the heart icon to save your favorites."
                : "Try adjusting your search terms"}
            </p>
          </div>
          {likedRecipes.length === 0 && (
            <button
              onClick={() => navigate("/recipes")}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Browse Recipes
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedPage;
