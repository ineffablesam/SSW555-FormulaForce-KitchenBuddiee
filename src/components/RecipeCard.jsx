import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, Clock, Users, ArrowLeft, Heart } from 'lucide-react'

export const RecipeCard = ({ recipe }) => {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);

    return (
        <div
            className="bg-white rounded-xl shadow-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            onClick={() => navigate(`/recipe/${recipe.id}`)}
        >
            {/* <div className="relative overflow-hidden h-48 sm:h-56 md:h-64">
                <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsFavorite(!isFavorite);
                    }}
                    className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                >
                    <Heart
                        size={20}
                        className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                    />
                </button>
            </div> */}
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


export default RecipeCard