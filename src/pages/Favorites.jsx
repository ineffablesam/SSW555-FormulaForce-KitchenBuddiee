import React, { useEffect, useState } from 'react';
import { getCookie } from '../components/AuthDialog';
import RecipeCard from '../components/RecipeCard';
import { Heart, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const username = getCookie('username');

  useEffect(() => {
    const loadFavorites = async () => {
      if (!username) {
        setError('You must be logged in to view favorites.');
        setLoading(false);
        return;
      }

      try {
        // Fetch favorites list
        const favRes = await fetch(`http://localhost:4000/api/favorites/${encodeURIComponent(username)}`, {
          credentials: 'include'
        });

        if (!favRes.ok) {
          if (favRes.status === 404) {
            setFavorites([]);
            setRecipes([]);
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${favRes.status}`);
        }

        const favData = await favRes.json();
        const favoriteIds = favData.favorites || [];
        setFavorites(favoriteIds);

        if (favoriteIds.length === 0) {
          setRecipes([]);
          setLoading(false);
          return;
        }

        // Fetch all recipes from backend
        const recipesRes = await fetch('http://localhost:4000/api/recipes', {
          credentials: 'include'
        });

        if (!recipesRes.ok) {
          throw new Error('Failed to fetch recipes');
        }

        const recipesData = await recipesRes.json();
        const allRecipes = recipesData.recipes || [];

        // Filter recipes that are in favorites
        const favoriteRecipes = allRecipes.filter(recipe =>
          favoriteIds.includes(recipe._id || recipe.id)
        );

        setRecipes(favoriteRecipes);
        setLoading(false);
      } catch (err) {
        console.error('Error loading favorites:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadFavorites();
  }, [username]);

  const handleRemoveFavorite = async (recipeId) => {
    try {
      const updatedFavorites = favorites.filter(id => id !== recipeId);

      const res = await fetch(`http://localhost:4000/api/favorites/${username}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ favorites: updatedFavorites })
      });

      if (!res.ok) {
        throw new Error('Failed to update favorites');
      }

      setFavorites(updatedFavorites);
      setRecipes(recipes.filter(recipe => (recipe._id || recipe.id) !== recipeId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Error</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div
        className="mb-8 sm:mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Your Favorite Recipes
          </h1>
        </div>
        <p className="text-gray-600 text-base sm:text-lg">
          {recipes.length > 0
            ? `You have ${recipes.length} favorite recipe${recipes.length !== 1 ? 's' : ''}`
            : 'Start adding recipes to your favorites!'}
        </p>
      </motion.div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-8 max-w-md w-full text-center">
            <Heart className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Favorites Yet</h3>
            <p className="text-gray-600 mb-6">
              Click the heart icon on any recipe to add it to your favorites!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {recipes.map((recipe, index) => (
            <motion.div
              key={recipe._id || recipe.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <RecipeCard
                recipe={recipe}
                currentUsername={username}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}