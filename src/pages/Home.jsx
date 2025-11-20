import { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import { ChefHat, Loader2, AlertCircle, Search, X, Folder } from 'lucide-react';
import AddNewRecipe from './AddNewRecipe';
import FloatingAddRecipeButton from '../components/FloatingAddRecipeButton';
import RecipeCardShimmer from '../components/RecipeCardShimmer';
import AuthDialog, { getCookie } from '../components/AuthDialog';


export default function Home() {
    const [showAddRecipe, setShowAddRecipe] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [ingredientQuery, setIngredientQuery] = useState('');
    const [ingredientResults, setIngredientResults] = useState([]);
    const [searchingIngredients, setSearchingIngredients] = useState(false);
    const [ingredientError, setIngredientError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const username = getCookie('username');

    // Fetch all recipes and categories on component mount
    useEffect(() => {
        fetchRecipes();
        if (username) {
            fetchCategories();
        }
    }, [username]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/categories/${username}`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    // Ingredient search effect (debounced)
    useEffect(() => {
        const trimmed = ingredientQuery.trim();
        if (!trimmed) {
            setIngredientResults([]);
            setIngredientError(null);
            setSearchingIngredients(false);
            return;
        }

        const terms = trimmed
            .split(',')
            .map(term => term.trim())
            .filter(Boolean);

        if (terms.length === 0) {
            setIngredientResults([]);
            setIngredientError(null);
            setSearchingIngredients(false);
            return;
        }

        const controller = new AbortController();
        setSearchingIngredients(true);
        setIngredientError(null);
        setIngredientResults([]);

        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/recipes?ingredients=${encodeURIComponent(terms.join(','))}`, {
                    signal: controller.signal,
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Failed to search recipes by ingredient');
                }
                const data = await response.json();
                setIngredientResults(data.recipes || []);
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('Error searching recipes by ingredient:', err);
                setIngredientError(err.message);
                setIngredientResults([]);
            } finally {
                setSearchingIngredients(false);
            }
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [ingredientQuery]);

    // Filter recipes when search, ingredient, or category data changes
    useEffect(() => {
        const hasIngredientSearch = ingredientQuery.trim().length > 0;
        let sourceRecipes = hasIngredientSearch ? ingredientResults : recipes;

        // Filter by category if selected
        if (selectedCategory) {
            sourceRecipes = sourceRecipes.filter(recipe => {
                if (Array.isArray(recipe.category)) {
                    return recipe.category.some(cat => (cat.name || cat) === selectedCategory);
                }
                return recipe.category === selectedCategory;
            });
        }

        if (searchQuery.trim() === '') {
            setFilteredRecipes(sourceRecipes);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = sourceRecipes.filter((recipe) => {
                const titleMatch = recipe.title?.toLowerCase().includes(query);
                const descriptionMatch = recipe.description?.toLowerCase().includes(query);
                const ingredientsMatch = recipe.ingredients?.some(ing =>
                    ing.toLowerCase().includes(query)
                );
                const tagsMatch = recipe.tags?.some(tag =>
                    tag.toLowerCase().includes(query)
                );

                return titleMatch || descriptionMatch || ingredientsMatch || tagsMatch;
            });
            setFilteredRecipes(filtered);
        }
    }, [searchQuery, recipes, ingredientQuery, ingredientResults, selectedCategory]);

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:4000/api/recipes', { credentials: 'include' });

            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }

            const data = await response.json();

            // Assuming your API returns { success: true, recipes: [...] }
            // Adjust based on your actual API response structure
            const recipesArray = data.recipes || data;

            setRecipes(recipesArray);
            setFilteredRecipes(recipesArray);
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleAddRecipe = async (recipeData) => {
        if (!username) {
            setShowAuth(true);
            return;
        }
        console.log('New Recipe:', recipeData);
        setShowAddRecipe(true);
        await fetchRecipes();
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const clearIngredientSearch = () => {
        setIngredientQuery('');
        setIngredientResults([]);
        setIngredientError(null);
    };

    if (showAddRecipe) {
        return (
            <AddNewRecipe
                onSubmit={() => {
                    setShowAddRecipe(false);
                    fetchRecipes();
                }}
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
                <p className="text-gray-600 text-base sm:text-lg mb-6">
                    Discover Delicious Recipes for every occasion
                </p>

                {/* Search Bar */}
                <div className="relative max-w-2xl">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search recipes by name, ingredients, or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="text-sm text-gray-600 mt-2">
                            Found {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Categories Slider */}
                {categories.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Categories</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {/* 'All' Option */}
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`flex flex-col items-center min-w-[80px] p-2 rounded-lg transition-all ${selectedCategory === null
                                    ? 'bg-orange-100 scale-105'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 border-2 ${selectedCategory === null ? 'border-orange-500 bg-white' : 'border-gray-200 bg-gray-100'
                                    }`}>
                                    <ChefHat className={`w-8 h-8 ${selectedCategory === null ? 'text-orange-500' : 'text-gray-400'}`} />
                                </div>
                                <span className={`text-sm font-medium ${selectedCategory === null ? 'text-orange-700' : 'text-gray-600'}`}>
                                    All
                                </span>
                            </button>

                            {categories.map((category) => (
                                <button
                                    key={category._id}
                                    onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                                    className={`flex flex-col items-center min-w-[80px] p-2 rounded-lg transition-all ${selectedCategory === category.name
                                        ? 'bg-orange-50 scale-105'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div
                                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 border-2 overflow-hidden ${selectedCategory === category.name ? 'border-orange-500' : 'border-gray-200'
                                            }`}
                                        style={{ backgroundColor: category.color || '#f3f4f6' }}
                                    >
                                        {category.image ? (
                                            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Folder className={`w-8 h-8 ${selectedCategory === category.name ? 'text-orange-600' : 'text-gray-400'}`} />
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium truncate max-w-[100px] ${selectedCategory === category.name ? 'text-orange-700' : 'text-gray-600'
                                        }`}>
                                        {category.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ingredient Search */}
                <div className="relative max-w-2xl mt-6">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                        Search by ingredients (use commas for multiple items)
                    </label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="e.g., tomato, basil, garlic"
                            value={ingredientQuery}
                            onChange={(e) => setIngredientQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
                        />
                        {ingredientQuery && (
                            <button
                                onClick={clearIngredientSearch}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 min-h-[1.5rem]">
                        {searchingIngredients && (
                            <span className="inline-flex items-center gap-2 text-orange-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Searching ingredients...
                            </span>
                        )}
                        {!searchingIngredients && ingredientQuery && (
                            <span>
                                Showing {ingredientResults.length} recipe{ingredientResults.length !== 1 ? 's' : ''} with those ingredients
                            </span>
                        )}
                        {ingredientError && (
                            <span className="text-red-600">{ingredientError}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <RecipeCardShimmer key={index} />
                    ))}
                </div>
            )}
            {/* Error State */}
            {error && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <h3 className="text-lg font-semibold text-red-900">Error Loading Recipes</h3>
                        </div>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button
                            onClick={fetchRecipes}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && recipes.length === 0 && ingredientQuery.trim() === '' && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-8 max-w-md w-full text-center">
                        <ChefHat className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Recipes Yet</h3>
                        <p className="text-gray-600 mb-6">
                            Be the first to share a delicious recipe with the community!
                        </p>
                        <button
                            onClick={() => setShowAddRecipe(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Add Your First Recipe
                        </button>
                    </div>
                </div>
            )}

            {/* No Ingredient Matches */}
            {!loading && !error && ingredientQuery.trim() !== '' && !searchingIngredients && ingredientResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 max-w-md w-full text-center">
                        <ChefHat className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Ingredient Matches</h3>
                        <p className="text-gray-600 mb-6">
                            Try removing one ingredient or adjusting your list to see matching recipes.
                        </p>
                        <button
                            onClick={clearIngredientSearch}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Clear Ingredient Search
                        </button>
                    </div>
                </div>
            )}

            {/* No Search Results */}
            {!loading && !error && recipes.length > 0 && filteredRecipes.length === 0 && !(ingredientQuery.trim() !== '' && ingredientResults.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
                        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Recipes Found</h3>
                        <p className="text-gray-600 mb-6">
                            Try searching with different keywords or clear your search to see all recipes.
                        </p>
                        <button
                            onClick={clearSearch}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Clear Search
                        </button>
                    </div>
                </div>
            )}

            {/* Recipe Grid */}
            {!loading && !error && filteredRecipes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {filteredRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe._id || recipe.id}
                            recipe={recipe}
                        />
                    ))}
                </div>
            )}

            <FloatingAddRecipeButton onClick={() => handleAddRecipe({})} />
            <AuthDialog
                isOpen={showAuth}
                onClose={() => setShowAuth(false)}
                onSuccess={(username) => {
                    console.log('User signed in:', username);
                    setShowAuth(false);
                    setShowAddRecipe(true);
                }}
                title="Sign in to add your recipes"
                description="Sign in to add your delicious recipes"
                defaultMode="signin"
            />
        </div>
    );
}
