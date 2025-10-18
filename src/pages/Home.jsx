import RecipeCard from '../components/RecipeCard'
import { ChefHat } from 'lucide-react';
import { recipesData } from '../mockdata/recipesData';

export default function Home() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <ChefHat size={32} className="text-orange-500" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Recipe Collection
                    </h1>
                </div>
                <p className="text-gray-600 text-base sm:text-lg">
                    Discover delicious recipes for every occasion
                </p>
            </div> */}
            <div className="border border-dashed border-orange-300 rounded-lg p-8 text-center w-full mb-3">
                <p className="mb-4">
                    <span className="font-semibold">Aisiri</span> is working on this page
                </p>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {recipesData.slice(0, 1).map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </div>
        </div>
    )
}
