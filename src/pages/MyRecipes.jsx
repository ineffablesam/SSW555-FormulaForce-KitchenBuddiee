import { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import RecipeCardShimmer from '../components/RecipeCardShimmer';
import { ChefHat, AlertCircle } from 'lucide-react';
import AuthDialog, { getCookie } from '../components/AuthDialog';

export default function MyRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const username = getCookie('username');

    useEffect(() => {
        if (!username) {
            setShowAuth(true);
        } else {
            fetchMyRecipes();
        }
    }, [username]);

    const fetchMyRecipes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:4000/api/recipes/user/${username}`);
            if (!response.ok) throw new Error('Failed to fetch your recipes');
            const data = await response.json();
            setRecipes(data.recipes || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!username) {
        return (
            <AuthDialog
                isOpen={showAuth}
                onClose={() => setShowAuth(false)}
                onSuccess={() => window.location.reload()}
                title="Sign in to view your recipes"
                description="You need to sign in to see your saved recipes."
                defaultMode="signin"
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex items-center gap-3">
                <ChefHat size={32} className="text-orange-500" />
                <h1 className="text-3xl font-bold text-gray-900">My Recipes</h1>
            </div>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <RecipeCardShimmer key={i} />
                    ))}
                </div>
            )}

            {error && (
                <div className="flex flex-col items-center justify-center py-20">
                    <AlertCircle className="text-red-500 w-8 h-8 mb-2" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchMyRecipes}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!loading && !error && recipes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                    <ChefHat className="w-16 h-16 text-orange-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Recipes Yet</h3>
                    <p className="text-gray-600 mb-6">
                        You haven’t added any recipes yet. Start cooking something amazing!
                    </p>
                </div>
            )}

            {!loading && !error && recipes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe._id || recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
}
