import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';

export const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-xl shadow-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
