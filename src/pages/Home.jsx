import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [ingredientChips, setIngredientChips] = useState([]);
    const [ingredientResults, setIngredientResults] = useState([]);
    const [searchingIngredients, setSearchingIngredients] = useState(false);
    const [ingredientError, setIngredientError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchMode, setSearchMode] = useState('recipe'); // 'recipe' or 'pantry'
    const username = getCookie('username');

    const getTagName = (tag) => {
        if (typeof tag === 'string') return tag;
        return (tag?.name || tag?.label || '').trim();
    };

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
        if (ingredientChips.length === 0) {
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
                const response = await fetch(`http://localhost:4000/api/recipes?ingredients=${encodeURIComponent(ingredientChips.join(','))}`, {
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
    }, [ingredientChips]);

    // Filter recipes when search, ingredient, or category data changes
    useEffect(() => {
        const hasIngredientSearch = ingredientChips.length > 0;
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
                    getTagName(tag).toLowerCase().includes(query)
                );

                return titleMatch || descriptionMatch || ingredientsMatch || tagsMatch;
            });
            setFilteredRecipes(filtered);
        }
    }, [searchQuery, recipes, ingredientChips, ingredientResults, selectedCategory]);

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

    const handleIngredientKeyDown = (e) => {
        if (e.key === 'Enter' && ingredientQuery.trim()) {
            e.preventDefault();
            const newIngredient = ingredientQuery.trim();
            if (!ingredientChips.includes(newIngredient)) {
                setIngredientChips([...ingredientChips, newIngredient]);
            }
            setIngredientQuery('');
        }
    };

    const removeIngredientChip = (chipToRemove) => {
        setIngredientChips(ingredientChips.filter(chip => chip !== chipToRemove));
    };

    const clearIngredientSearch = () => {
        setIngredientQuery('');
        setIngredientChips([]);
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
            <motion.div
                className="mb-8 sm:mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.2
                        }}
                    >
                        <ChefHat size={32} className="text-orange-500" />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Recipe Collection
                    </h1>
                </div>
                <p className="text-gray-600 text-base sm:text-lg mb-6">
                    Discover Delicious Recipes for every occasion
                </p>
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
                {/* Search Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-2xl inline-flex relative">
                        {['recipe', 'pantry'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => {
                                    setSearchMode(mode);
                                    if (mode === 'recipe') {
                                        setIngredientQuery('');
                                        setIngredientChips([]);
                                        setIngredientResults([]);
                                    } else {
                                        setSearchQuery('');
                                    }
                                }}
                                className={`relative px-8 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 z-10 ${searchMode === mode ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {mode === 'recipe' ? 'Recipe Search' : 'Pantry Search'}
                                {searchMode === mode && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-200/50 -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Area */}
                <div className="relative max-w-2xl mx-auto min-h-[120px]">
                    <AnimatePresence mode="wait">
                        {searchMode === 'recipe' ? (
                            <motion.div
                                key="recipe"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative"
                            >
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search recipes by name, ingredients, or tags..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-14 pr-12 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md hover:border-orange-200"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <AnimatePresence>
                                    {searchQuery && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-sm text-gray-600 mt-3 text-center font-medium"
                                        >
                                            Found {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="pantry"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative"
                            >
                                <motion.label
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm font-medium text-gray-600 block mb-3 text-center"
                                >
                                    What ingredients do you have?
                                </motion.label>
                                <div className="relative group">
                                    <Search className="absolute left-5 top-5 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors z-10" />
                                    <div className="w-full min-h-[56px] pl-14 pr-12 py-3 bg-white border-2 border-gray-100 rounded-2xl focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-orange-200">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <AnimatePresence>
                                                {ingredientChips.map((chip, index) => (
                                                    <motion.div
                                                        key={chip}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
                                                    >
                                                        <span>{chip}</span>
                                                        <button
                                                            onClick={() => removeIngredientChip(chip)}
                                                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                                            aria-label={`Remove ${chip}`}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            <input
                                                type="text"
                                                placeholder={ingredientChips.length === 0 ? "e.g., tomato, basil, garlic (press Enter to add)" : "Add more..."}
                                                value={ingredientQuery}
                                                onChange={(e) => setIngredientQuery(e.target.value)}
                                                onKeyDown={handleIngredientKeyDown}
                                                className="flex-1 min-w-[200px] outline-none bg-transparent text-gray-900 placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                    {(ingredientQuery || ingredientChips.length > 0) && (
                                        <button
                                            onClick={clearIngredientSearch}
                                            className="absolute right-4 top-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center justify-center gap-3 mt-3 text-sm text-gray-600 min-h-[1.5rem]">
                                    {searchingIngredients && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="inline-flex items-center gap-2 text-orange-600 font-medium"
                                        >
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Searching pantry recipes...
                                        </motion.span>
                                    )}
                                    {!searchingIngredients && ingredientChips.length > 0 && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="font-medium"
                                        >
                                            Found {ingredientResults.length} recipe{ingredientResults.length !== 1 ? 's' : ''} you can make
                                        </motion.span>
                                    )}
                                    {ingredientError && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full"
                                        >
                                            {ingredientError}
                                        </motion.span>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Loading State */}
            {
                loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <RecipeCardShimmer key={index} />
                        ))}
                    </div>
                )
            }
            {/* Error State */}
            {
                error && (
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
                )
            }

            {/* Empty State */}
            {
                !loading && !error && recipes.length === 0 && ingredientChips.length === 0 && (
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
                )
            }

            {/* No Ingredient Matches */}
            {
                !loading && !error && ingredientChips.length > 0 && !searchingIngredients && ingredientResults.length === 0 && (
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
                )
            }

            {/* No Search Results */}
            {
                !loading && !error && recipes.length > 0 && filteredRecipes.length === 0 && !(ingredientChips.length > 0 && ingredientResults.length === 0) && (
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
                )
            }

            {/* Recipe Grid */}
            {
                !loading && !error && filteredRecipes.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {filteredRecipes.map((recipe, index) => (
                            <motion.div
                                key={recipe._id || recipe.id}
                                initial={{
                                    opacity: 0,
                                    scale: 0.9,
                                    filter: "blur(10px)"
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    filter: "blur(0px)"
                                }}
                                transition={{
                                    delay: index * 0.1,
                                    duration: 0.5,
                                    ease: [0.25, 0.46, 0.45, 0.94], // iOS-style easing
                                    scale: {
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20
                                    }
                                }}
                                whileHover={{
                                    y: -8,
                                    transition: {
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 17
                                    }
                                }}
                            >
                                <RecipeCard
                                    recipe={recipe}
                                    currentUsername={"samuelphilip"}  // ← Add this line
                                />
                            </motion.div>
                        ))}
                    </div>
                )
            }

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
        </div >
    );
}
