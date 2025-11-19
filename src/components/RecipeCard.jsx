import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ChefHat, Heart, Trash2 } from 'lucide-react';

export const RecipeCard = ({ recipe, onDelete = null }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const recipeId = recipe._id || recipe.id;

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
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-orange-700 rounded-full text-xs font-semibold shadow-lg">
              {recipe.category}
            </span>
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
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              by <span className="font-semibold text-gray-700">{recipe.username}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
