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
        const res = await fetch(`http://localhost:4000/api/favorites/${encodeURIComponent(username)}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Expected JSON response from server");
        }

        const data = await res.json();
        setFavorites(data.favorites || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading favorites:', err);
        setError('Failed to load favorites. Please try again later.');
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
      ) : favoriteRecipes.length === 0 ? (
        <div className="text-gray-500">No favorite recipes yet.</div>
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
