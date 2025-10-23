import React from 'react';
import { useParams } from 'react-router-dom';
import { recipesData } from '../mockdata/recipesData';
import { Link } from 'react-router-dom';

export default function CategoryView() {
  const { categoryName } = useParams();

  const filteredRecipes = recipesData.filter(
    (recipe) => recipe.categoryName?.toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 capitalize">
        {categoryName.charAt(0).toUpperCase()+categoryName.slice(1)} Recipes
      </h1>

      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/recipe/${recipe.id}`}
              className="block border rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition hover:scale-[1.02]"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {recipe.title}
              </h2>
              <p className="text-gray-600 text-sm">{recipe.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">
          No recipes found for this category yet.
        </p>
      )}
    </div>
  );
}
