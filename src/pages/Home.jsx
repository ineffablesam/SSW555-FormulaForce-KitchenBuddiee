import RecipeCard from '../components/RecipeCard'
import { ChefHat } from 'lucide-react';
import { recipesData } from '../mockdata/recipesData';
import { useState } from 'react';
import AddNewRecipe from './AddNewRecipe';
import FloatingAddRecipeButton from '../components/FloatingAddRecipeButton';

export default function Home() {
    const [showAddRecipe, setShowAddRecipe] = useState(false);
    const handleAddRecipe = (recipeData) => {
        console.log('New Recipe:', recipeData);
        setShowAddRecipe(false);
    };
    if (showAddRecipe) {
        return (
            <AddNewRecipe
                onSubmit={handleAddRecipe}
                onCancel={() => setShowAddRecipe(false)}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <ChefHat size={32} className="text-orange-500" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Recipe Collection
                    </h1>
                </div>
                <p className="text-gray-600 text-base sm:text-lg">
                    Discover Delicious Recipes for every occasion
                </p>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {recipesData.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </div>
            <FloatingAddRecipeButton onClick={() => setShowAddRecipe(true)} />
        </div>
    )
}
