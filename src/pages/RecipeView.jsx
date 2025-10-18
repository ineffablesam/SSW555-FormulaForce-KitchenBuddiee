import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, ChefHat } from 'lucide-react';
import { recipesData } from '../mockdata/recipesData';

export default function RecipeView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const recipe = recipesData.find(r => r.id === parseInt(id));
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!recipe) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div
                className={`
                   sticky sm:sticky top-[55px] sm:top-0 z-50 sm:z-20 transition-all duration-200 
                    ${scrolled
                        ? 'bg-white sm:bg-transparent sm:bg-gradient-to-b sm:from-black/60 sm:to-transparent'
                        : 'bg-gradient-to-b from-black/60 to-transparent'
                    }
                `}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full 
                            transition-all duration-300 relative overflow-hidden group border 
                            ${scrolled
                                ? 'bg-gray-100 border-none text-gray-800 hover:bg-gray-200 sm:bg-white/10 sm:text-white sm:hover:bg-white/20 sm:backdrop-blur-md'
                                : 'bg-white/10 border-transparent text-white hover:bg-white/20 backdrop-blur-md sm:bg-white/10  sm:text-white sm:hover:bg-white/20 sm:backdrop-blur-md'
                            }
                        `}
                    >
                        <div className={`absolute inset-0 rounded-full pointer-events-none ${scrolled ? 'hidden' : 'border border-white/10 group-hover:border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-transparent'}`}></div>
                        <ArrowLeft size={18} className="relative z-10" />
                        <span className="font-medium relative z-10">Back to Recipes</span>
                    </button>
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden -mt-20">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 lg:p-12 -mt-12 sm:-mt-16 md:-mt-20 relative z-10">
                    {/* Title */}
                    <div className="mb-8 md:mb-10">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
                            {recipe.title}
                        </h1>
                        <p className="text-gray-600 text-base sm:text-lg md:text-xl">
                            {recipe.description}
                        </p>
                    </div>

                    {/* Meta Cards */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-gray-200">
                        <div className="bg-orange-50 rounded-lg p-4 md:p-6 text-center hover:bg-orange-100 transition-colors">
                            <Clock size={24} className="text-orange-500 mx-auto mb-2 md:mb-3" />
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Prep Time</p>
                            <p className="font-bold text-sm sm:text-base md:text-lg text-gray-900">{recipe.time}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 md:p-6 text-center hover:bg-blue-100 transition-colors">
                            <Users size={24} className="text-blue-500 mx-auto mb-2 md:mb-3" />
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Servings</p>
                            <p className="font-bold text-sm sm:text-base md:text-lg text-gray-900">{recipe.servings}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 md:p-6 text-center hover:bg-green-100 transition-colors">
                            <ChefHat size={24} className="text-green-500 mx-auto mb-2 md:mb-3" />
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Difficulty</p>
                            <p className="font-bold text-sm sm:text-base md:text-lg text-gray-900">Easy</p>
                        </div>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <div className="bg-gray-50 rounded-xl p-6 md:p-8">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">Ingredients</h2>
                            <ul className="space-y-3 md:space-y-4">
                                {recipe.ingredients.map((ingredient, index) => (
                                    <li key={index} className="flex items-start gap-3 md:gap-4">
                                        <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm md:text-base font-bold mt-0.5">
                                            {index + 1}
                                        </span>
                                        <span className="text-gray-700 text-sm sm:text-base md:text-lg pt-1">{ingredient}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">Instructions</h2>
                            <ol className="space-y-5 md:space-y-6">
                                {recipe.instructions.map((instruction, index) => (
                                    <li key={index} className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm md:text-base shadow-md">
                                            {index + 1}
                                        </span>
                                        <p className="text-gray-700 text-sm sm:text-base md:text-lg pt-1 leading-relaxed">
                                            {instruction}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
