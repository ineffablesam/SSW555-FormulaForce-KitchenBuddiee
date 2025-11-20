import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ChefHat, Heart, Trash2, Lock, Globe } from 'lucide-react';

export const RecipeCard = ({ recipe, onDelete = null, onTogglePrivacy = null }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const recipeId = recipe._id || recipe.id;

  const isPartial =
    !recipe.title ||
    recipe.prepTime === undefined ||
    recipe.cookTime === undefined ||
    recipe.servings === undefined;

  const [fullRecipe, setFullRecipe] = useState(isPartial ? null : recipe);

  useEffect(() => {
    if (isPartial && recipeId) {
      (async () => {
        try {
          const res = await fetch(`http://localhost:4000/api/recipes/${recipeId}`);
          const data = await res.json();
          setFullRecipe(data.recipe);
        } catch (err) {
          console.error("Failed to load recipe:", err);
        }
      })();
    } else {
      setFullRecipe(recipe);
    }
  }, [recipeId, isPartial, recipe]);

  if (!fullRecipe) {
    return (
      <div className="p-6 bg-gray-100 rounded-xl shadow animate-pulse">
        <div className="h-48 bg-gray-300 mb-4 rounded-lg" />
        <div className="h-4 bg-gray-300 w-1/2 mb-2 rounded" />
        <div className="h-4 bg-gray-300 w-1/3 rounded" />
      </div>
    );
  }

  recipe = fullRecipe;

  return (
    <div
      className="bg-white rounded-xl shadow-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/recipe/${recipeId}`)}
    >
      <div className="relative overflow-hidden h-48 sm:h-56 md:h-64">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute top-3 inset-x-3 flex justify-between items-center gap-2 pointer-events-none">
          {typeof onDelete === 'function' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe);
              }}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-transform hover:scale-110 pointer-events-auto"
              title="Delete recipe"
            >
              <Trash2 size={18} />
            </button>
          )}
          {typeof onTogglePrivacy === 'function' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePrivacy(recipe);
              }}
              className={`rounded-full p-2 shadow-lg transition-transform hover:scale-110 pointer-events-auto ${recipe.isPrivate ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
              title={recipe.isPrivate ? "Set Recipe to Public" : "Set Recipe to Private"}
            >
              {recipe.isPrivate ? <Lock size={18} /> : <Globe size={18} />}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform pointer-events-auto ml-auto"
          >
            <Heart
              size={20}
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
            />
          </button>
        </div>

        {/* Category Badge */}
        {recipe.category && (
          <div className="absolute bottom-3 left-3">
            {recipe.category.map(cat => (
              <span
                key={cat._id}
                className="px-2 py-1 bg-white/90 backdrop-blur-sm text-orange-700 rounded-full text-xs font-semibold shadow-lg"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {recipe.title}
        </h3>

        {recipe.description && (
          <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-2">
            {recipe.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        {/* Username */}
        {recipe.username && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              by <span className="font-semibold text-gray-700">{recipe.username}</span>
            </p>
            {recipe.isPrivate && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                <Lock size={12} /> Private
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
