import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { AlertCircle } from 'lucide-react';

export default function CategoryDetail() {
  const { username, categoryName } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username || !categoryName) return;
    fetchRecipes();
  }, [username, categoryName]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `http://localhost:4000/api/recipes?username=${username}&category=${encodeURIComponent(categoryName)}`
      );
      if (!res.ok) throw new Error('Failed to fetch recipes');
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Recipes in "{categoryName}"
      </h1>

      {loading && <p>Loading recipes...</p>}

      {error && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!loading && recipes.length === 0 && (
        <p className="text-gray-600">No recipes found in this category.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe._id || recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

