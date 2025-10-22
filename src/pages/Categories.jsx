import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoriesData } from '../mockdata/categoriesData';

export default function Categories() {

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-4">
          <FolderOpen size={32} className="text-orange-500" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Recipe Categories
          </h1>
        </div>
        <p className="text-gray-600 text-base sm:text-lg">
          Explore recipes grouped by your favorite meal types and cooking styles.
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {categoriesData.map((cat) => (
            <Link
                key={cat.id}
                to={`/categories/${cat.name.toLowerCase()}`}
                className="block border rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 hover:scale-[1.02]"
            >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{cat.name}</h2>
                <p className="text-gray-600 text-sm">{cat.description}</p>
          </Link>

        ))}
      </div>
    </div>
  );
}
