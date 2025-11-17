import React, { useEffect, useState } from 'react';
import { getCookie } from '../components/AuthDialog';
import { recipesData } from '../mockdata/recipesData';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFavorites = async () => {
      const username = getCookie('username');
      if (!username) {
        setError('You must be logged in to view favorites.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/favorites/${encodeURIComponent(username)}`);
        
        if (!res.ok) {
          // Handle specific HTTP errors
          if (res.status === 404) {
            // No favorites found - this is normal for new users
            setFavorites([]);
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setFavorites(data.favorites || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading favorites:', err);
        // If fetch fails completely, just show empty favorites instead of error
        setFavorites([]);
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const favoriteRecipes = recipesData.filter((r) => favorites.includes(r.id));

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Favorite Recipes ⭐</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">⭐</div>
          <div className="text-gray-600 text-lg font-medium mb-2">
            You don't have any favorite recipes yet
          </div>
          <div className="text-gray-500 text-sm">
            Start adding recipes to your favorites to see them here!
          </div>
        </div>
      ) : favoriteRecipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">⚠️</div>
          <div className="text-gray-600 text-lg font-medium mb-2">
            No matching recipes found
          </div>
          <div className="text-gray-500 text-sm">
            Your favorites list contains recipe IDs that couldn't be found in our database.
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {favoriteRecipes.map((r) => (
            <li key={r.id} className="bg-white p-4 rounded shadow border">
              <div className="font-semibold text-lg">{r.title}</div>
              <div className="text-xs text-gray-500">{r.time} • {r.servings} servings</div>
              <div className="mt-2 text-sm text-gray-700">{r.description}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
