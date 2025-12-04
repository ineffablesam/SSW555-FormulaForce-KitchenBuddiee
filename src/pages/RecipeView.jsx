import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, ChefHat, Loader2, AlertCircle, ShoppingCart, Trash2, Lock, Unlock, Tag, X } from 'lucide-react';
import { getCookie } from '../components/AuthDialog';

export default function RecipeView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categoryError, setCategoryError] = useState('');
    const [categoryLoading, setCategoryLoading] = useState(false);

    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState(null);
    const [ingredientCartStatus, setIngredientCartStatus] = useState({});
    const [addingIngredient, setAddingIngredient] = useState({});
    const [deletingImage, setDeletingImage] = useState(false);
    const [togglingPrivacy, setTogglingPrivacy] = useState(false);
    const [removingTag, setRemovingTag] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchRecipe();
    }, [id]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Load cart status when recipe changes
    useEffect(() => {
        if (recipe) {
            loadCartStatus();
        }
    }, [recipe]);

    const fetchRecipe = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:4000/api/recipes/${id}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Recipe not found');
                }
                throw new Error('Failed to fetch recipe');
            }

            const data = await response.json();
            setRecipe(data.recipe);
        } catch (err) {
            console.error('Error fetching recipe:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadCartStatus = async () => {
        const username = getCookie('username');
        if (!username || !recipe) return;

        try {
            const response = await fetch(`http://localhost:4000/api/cart/${encodeURIComponent(username)}`);
            if (response.ok) {
                const data = await response.json();
                const cartItems = data.items || [];

                // Create a map of ingredients in cart
                const statusMap = {};
                recipe.ingredients?.forEach(ingredient => {
                    const inCart = cartItems.some(item => item.text === ingredient);
                    statusMap[ingredient] = inCart;
                });
                setIngredientCartStatus(statusMap);
            }
        } catch (err) {
            console.error('Error loading cart status:', err);
        }
    };

    const toggleIngredientInCart = async (ingredient) => {
        const username = getCookie('username');
        if (!username) {
            setCartMessage({ type: 'error', text: 'Please log in to add items to cart' });
            setTimeout(() => setCartMessage(null), 3000);
            return;
        }

        const isInCart = ingredientCartStatus[ingredient];
        setAddingIngredient(prev => ({ ...prev, [ingredient]: true }));

        try {
            if (isInCart) {
                // Remove from cart
                const response = await fetch(
                    `http://localhost:4000/api/cart/${encodeURIComponent(username)}/items/${encodeURIComponent(ingredient)}`,
                    { method: 'DELETE' }
                );

                if (!response.ok) throw new Error('Failed to remove from cart');

                setIngredientCartStatus(prev => ({ ...prev, [ingredient]: false }));
                setCartMessage({ type: 'success', text: `Removed "${ingredient}" from cart` });
            } else {
                // Add to cart
                const response = await fetch(`http://localhost:4000/api/cart/${encodeURIComponent(username)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: [
                            ...(await getCurrentCartItems()),
                            { text: ingredient, qty: 1, checked: false }
                        ]
                    })
                });

                if (!response.ok) throw new Error('Failed to add to cart');

                setIngredientCartStatus(prev => ({ ...prev, [ingredient]: true }));
                setCartMessage({ type: 'success', text: `Added "${ingredient}" to cart` });
            }
            setTimeout(() => setCartMessage(null), 3000);
        } catch (err) {
            console.error('Error toggling ingredient in cart:', err);
            setCartMessage({ type: 'error', text: 'Failed to update cart' });
            setTimeout(() => setCartMessage(null), 3000);
        } finally {
            setAddingIngredient(prev => ({ ...prev, [ingredient]: false }));
        }
    };

    const togglePrivacy = async () => {
        if (!recipe) return;
        const username = getCookie('username');
        if (!username || username !== recipe.username) {
            setCartMessage({ type: 'error', text: 'Only the owner can change privacy' });
            setTimeout(() => setCartMessage(null), 3000);
            return;
        }

        try {
            setTogglingPrivacy(true);
            const nextPrivacy = !recipe.isPrivate;
            const response = await fetch(`http://localhost:4000/api/recipes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ isPrivate: nextPrivacy })
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to update privacy');
            }

            setRecipe(prev => ({ ...prev, isPrivate: nextPrivacy }));
            setCartMessage({
                type: 'success',
                text: `Recipe is now ${nextPrivacy ? 'private' : 'public'}`
            });
            setTimeout(() => setCartMessage(null), 2500);
        } catch (err) {
            console.error('Error updating privacy:', err);
            setCartMessage({ type: 'error', text: err.message || 'Failed to update privacy' });
            setTimeout(() => setCartMessage(null), 3000);
        } finally {
            setTogglingPrivacy(false);
        }
    };

    const handleDeleteTag = async (tag) => {
        if (!recipe) return;
        const username = getCookie('username');
        if (!username || username !== recipe.username) {
            setCartMessage({ type: 'error', text: 'Only the owner can delete tags' });
            setTimeout(() => setCartMessage(null), 3000);
            return;
        }

        try {
            setRemovingTag(tag);
            const response = await fetch(`http://localhost:4000/api/recipes/tags/${encodeURIComponent(tag)}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to delete tag');
            }

            setRecipe(prev => ({
                ...prev,
                tags: (prev.tags || []).filter(t => t.toLowerCase() !== tag.toLowerCase())
            }));

            setCartMessage({
                type: 'success',
                text: `Removed tag "${tag}" from your recipes`
            });
            setTimeout(() => setCartMessage(null), 2500);
        } catch (err) {
            console.error('Error deleting tag:', err);
            setCartMessage({ type: 'error', text: err.message || 'Failed to delete tag' });
            setTimeout(() => setCartMessage(null), 3000);
        } finally {
            setRemovingTag(null);
        }
    };

    const getCurrentCartItems = async () => {
        const username = getCookie('username');
        if (!username) return [];

        try {
            const response = await fetch(`http://localhost:4000/api/cart/${encodeURIComponent(username)}`);
            if (response.ok) {
                const data = await response.json();
                return data.items || [];
            }
        } catch (err) {
            console.error('Error getting cart items:', err);
        }
        return [];
    };

    const fetchCategories = async () => {
        if (!recipe?.username) {
            console.error("No username available for fetching categories");
            setCategoryError("Cannot load categories: no username found");
            return false;
        }
        try {
            setCategoryLoading(true);
            const response = await fetch(`http://localhost:4000/api/categories/${recipe.username}`);
            if (!response.ok) throw new Error("Failed to fetch categories");
            const data = await response.json();
            setCategories(data.categories || []);
            setCategoryError('');
            return true;
        } catch (err) {
            console.error("Error fetching categories:", err);
            setCategoryError("Failed to load categories");
            setCategories([]);
            return false;
        } finally {
            setCategoryLoading(false);
        }
    };

    const openCategoryModal = async () => {
        setShowCategoryModal(true);
        fetchCategories();
    };

    const updateRecipeCategory = async () => {
        if (selectedCategories.length === 0) {
            setCategoryError("Please select at least one category");
            return;
        }

        const newCategories = selectedCategories.filter(catId => {
            return !recipe.category.some(c => c.id?.toString() === catId.toString() || c._id?.toString() === catId.toString());
        });

        if (newCategories.length === 0) {
            setCategoryError("Selected categories are already added.");
            return;
        }

        const fullCategoryObjects = newCategories.map(catId => {
            const cat = categories.find(c => c._id === catId);
            return {
                id: cat._id,
                name: cat.name
            };
        });
        setCategoryLoading(true);
        setCategoryError('');
        try {
            const response = await fetch(`http://localhost:4000/api/recipes/${id}/category`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ category: fullCategoryObjects })
            });
            const data = await response.json();

            if (!response.ok) {
                setCategoryError(data.message || "Failed to update category");
                return;
            }

            setRecipe(prev => ({
                    ...prev,
                    category: [...prev.category, ...fullCategoryObjects]
            }));

            setShowCategoryModal(false);
            fetchRecipe(); // Refresh recipe
        } catch (err) {
            console.error("Error updating category:", err);
            setCategoryError("Unexpected error");
        } finally {
            setCategoryLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'bg-green-50 hover:bg-green-100 text-green-500';
            case 'medium':
                return 'bg-yellow-50 hover:bg-yellow-100 text-yellow-500';
            case 'hard':
                return 'bg-red-50 hover:bg-red-100 text-red-500';
            default:
                return 'bg-green-50 hover:bg-green-100 text-green-500';
        }
    };

    const addToCart = async () => {
        const username = getCookie('username');
        if (!username) {
            setCartMessage({ type: 'error', text: 'Please log in to add items to cart' });
            setTimeout(() => setCartMessage(null), 3000);
            return;
        }

        if (!recipe) {
            setCartMessage({ type: 'error', text: 'Recipe not loaded' });
            setTimeout(() => setCartMessage(null), 3000);
            return;
        }

        try {
            setAddingToCart(true);
            const response = await fetch(`/api/cart/${encodeURIComponent(username)}/add-recipe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipe }),
            });

            if (!response.ok) {
                throw new Error('Failed to add to cart');
            }

            const data = await response.json();
            setCartMessage({
                type: 'success',
                text: `Added ${data.addedCount} ingredients to cart!`
            });
            setTimeout(() => setCartMessage(null), 3000);
        } catch (err) {
            console.error('Error adding to cart:', err);
            setCartMessage({ type: 'error', text: 'Failed to add to cart' });
            setTimeout(() => setCartMessage(null), 3000);
        } finally {
            setAddingToCart(false);
        }
    };

    const deleteRecipeImage = async () => {
        const username = getCookie('username');
        if (!username) {
            setCartMessage({ type: 'error', text: 'Please log in to delete the image' });
            setTimeout(() => setCartMessage(null), 3000);
            return;
        }

        if (!recipe?.image) {
            return; // No image to delete
        }

        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            setDeletingImage(true);
            const response = await fetch(`http://localhost:4000/api/recipes/${id}/image`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            const data = await response.json();
            
            // Update local recipe state immediately
            setRecipe(prev => ({ ...prev, image: null }));
            
            setCartMessage({
                type: 'success',
                text: 'Image deleted successfully!'
            });
            setTimeout(() => setCartMessage(null), 3000);
        } catch (err) {
            console.error('Error deleting image:', err);
            setCartMessage({ type: 'error', text: 'Failed to delete image' });
            setTimeout(() => setCartMessage(null), 3000);
        } finally {
            setDeletingImage(false);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading recipe...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !recipe) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            {error === 'Recipe not found' ? 'Recipe Not Found' : 'Error Loading Recipe'}
                        </h2>
                        <p className="text-gray-600 mb-6">{error || 'Something went wrong'}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isOwner = getCookie('username') === recipe?.username;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* MODAL */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl p-6 w-11/12 max-w-md shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Select Categories</h3>

                        <div className="mb-4 max-h-60 overflow-y-auto">
                            {categoryLoading ? (
                                <p>Loading categories...</p>
                            ) : (
                                categories.map(cat => (
                                    <label key={cat._id} className="flex items-center gap-2 mb-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={cat._id}
                                            checked={selectedCategories.includes(cat._id)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setSelectedCategories(prev => {
                                                    if (checked) {
                                                        return [...prev, cat._id];
                                                    } else {
                                                        return prev.filter(id => id !== cat._id);
                                                    }
                                                });
                                            }}
                                            className="w-4 h-4"
                                        />
                                        <span>{cat.name}</span>
                                    </label>
                                ))
                            )}
                        </div>

                        {categoryError && <p className="text-red-500 mb-2">{categoryError}</p>}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCategoryModal(false)}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateRecipeCategory}
                                disabled={selectedCategories.length === 0 || categoryLoading}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {categoryLoading ? "Adding..." : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Back Button */}
            <div
                className={`
                   sticky sm:sticky top-[55px] sm:top-0 z-50 sm:z-20 transition-all duration-200 
                    ${scrolled
                        ? 'bg-white sm:bg-transparent sm:bg-gradient-to-b sm:from-black/60 sm:to-transparent'
                        : 'bg-gradient-to-b from-black/60 to-transparent'
                    }
                `}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full 
                            transition-all duration-300 relative overflow-hidden group border 
                            ${scrolled
                                ? 'bg-gray-100 border-none text-gray-800 hover:bg-gray-200 sm:bg-white/10 sm:text-white sm:hover:bg-white/20 sm:backdrop-blur-md'
                                : 'bg-white/10 border-transparent text-white hover:bg-white/20 backdrop-blur-md sm:bg-white/10  sm:text-white sm:hover:bg-white/20 sm:backdrop-blur-md'
                            }
                        `}
                    >
                        <div className={`absolute inset-0 rounded-full pointer-events-none ${scrolled ? 'hidden' : 'border border-white/10 group-hover:border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-transparent'}`}></div>
                        <ArrowLeft size={18} className="relative z-10" />
                        <span className="font-medium relative z-10">Back to Recipes</span>
                    </button>
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden -mt-20">
                {recipe.image ? (
                    <>
                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                        {/* Delete Image Button */}
                        <button
                            onClick={deleteRecipeImage}
                            disabled={deletingImage}
                            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
                            title="Delete image"
                        >
                            <Trash2 size={20} />
                        </button>
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
                        <ChefHat className="w-24 h-24 text-white opacity-50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 lg:p-12 -mt-12 sm:-mt-16 md:-mt-20 relative z-10">
                    {/* Title */}
                    <div className="mb-8 md:mb-10">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
                            {recipe.title}
                        </h1>
                        {recipe.description && (
                            <p className="text-gray-600 text-base sm:text-lg md:text-xl">
                                {recipe.description}
                            </p>
                        )}
                        <div className="flex items-center gap-3 mt-4">
                            {recipe.category?.map(cat => (
                                <span
                                    key={cat._id}
                                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                                >
                                    {cat.name}
                                </span>
                            ))}
                            <button
                                onClick={openCategoryModal}
                                className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition"
                            >
                                Add to Category
                            </button>
                            {recipe.username && (
                                <span className="text-sm text-gray-500">
                                    by <span className="font-semibold text-gray-700">{recipe.username}</span>
                                </span>
                            )}
                            {getCookie('username') === recipe.username && (
                                <button
                                    onClick={togglePrivacy}
                                    disabled={togglingPrivacy}
                                    className={`px-4 py-2 ${recipe.isPrivate ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                    title={recipe.isPrivate ? 'Make recipe public' : 'Make recipe private'}
                                >
                                    {recipe.isPrivate ? <Unlock size={18} /> : <Lock size={18} />}
                                    {togglingPrivacy ? 'Updating...' : (recipe.isPrivate ? 'Make Public' : 'Make Private')}
                                </button>
                            )}
                            <button
                                onClick={addToCart}
                                disabled={addingToCart}
                                className="ml-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart size={18} />
                                {addingToCart ? 'Adding...' : 'Add to Cart'}
                            </button>
                        </div>
                        {cartMessage && (
                            <div className={`mt-4 px-4 py-3 rounded-lg ${cartMessage.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {cartMessage.text}
                            </div>
                        )}
                        {recipe.externalLink && (
                            <div className="mt-4">
                                <a
                                    href={recipe.externalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-blue-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                        <path d="M10 13a5 5 0 0 0 7.07 0l3.54-3.54a5 5 0 0 0-7.07-7.07L12 3" />
                                        <path d="M14 11a5 5 0 0 0-7.07 0L3.39 14.54a5 5 0 0 0 7.07 7.07L12 21" />
                                    </svg>
                                    <span className="font-medium">Open External Link</span>
                                </a>
                            </div>
                        )}

                        {recipe.tags && recipe.tags.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {recipe.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm border border-gray-200"
                                    >
                                        <Tag size={14} className="text-orange-500" />
                                        <span>{tag}</span>
                                        {isOwner && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTag(tag)}
                                                disabled={removingTag === tag}
                                                className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                                                title="Delete tag"
                                            >
                                                {removingTag === tag ? '...' : <X size={14} />}
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            isOwner && (
                                <p className="mt-3 text-sm text-gray-500">No tags yet. Add some when editing your recipe.</p>
                            )
                        )}
                    </div>

                    {/* Meta Cards */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-gray-200">
                        <div className="bg-orange-50 rounded-lg p-4 md:p-6 text-center hover:bg-orange-100 transition-colors">
                            <Clock size={24} className="text-orange-500 mx-auto mb-2 md:mb-3" />
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Prep Time</p>
                            <p className="font-bold text-sm sm:text-base md:text-lg text-gray-900">{recipe.prepTime} min</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 md:p-6 text-center hover:bg-blue-100 transition-colors">
                            <Clock size={24} className="text-blue-500 mx-auto mb-2 md:mb-3" />
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Cook Time</p>
                            <p className="font-bold text-sm sm:text-base md:text-lg text-gray-900">{recipe.cookTime} min</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 md:p-6 text-center hover:bg-purple-100 transition-colors">
                            <Users size={24} className="text-purple-500 mx-auto mb-2 md:mb-3" />
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Servings</p>
                            <p className="font-bold text-sm sm:text-base md:text-lg text-gray-900">{recipe.servings}</p>
                        </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="mb-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getDifficultyColor(recipe.difficulty)} transition-colors`}>
                            <ChefHat size={20} />
                            <span className="font-semibold capitalize">{recipe.difficulty || 'Easy'}</span>
                        </div>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <div className="bg-gray-50 rounded-xl p-6 md:p-8">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">Ingredients</h2>
                            <ul className="space-y-3 md:space-y-4">
                                {recipe.ingredients?.map((ingredient, index) => (
                                    <li key={index} className="flex items-start gap-3 md:gap-4 group">
                                        <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm md:text-base font-bold mt-0.5">
                                            {index + 1}
                                        </span>
                                        <span className="text-gray-700 text-sm sm:text-base md:text-lg pt-1 flex-1">{ingredient}</span>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={ingredientCartStatus[ingredient] || false}
                                                onChange={() => toggleIngredientInCart(ingredient)}
                                                disabled={addingIngredient[ingredient]}
                                                className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer disabled:opacity-50"
                                                title={ingredientCartStatus[ingredient] ? "Remove from cart" : "Add to cart"}
                                            />
                                            <ShoppingCart
                                                size={18}
                                                className={`transition-colors ${ingredientCartStatus[ingredient]
                                                    ? 'text-orange-500'
                                                    : 'text-gray-400 group-hover:text-orange-400'
                                                    }`}
                                            />
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">Instructions</h2>
                            <ol className="space-y-5 md:space-y-6">
                                {recipe.steps?.map((step, index) => (
                                    <li key={index} className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm md:text-base shadow-md">
                                            {index + 1}
                                        </span>
                                        <p className="text-gray-700 text-sm sm:text-base md:text-lg pt-1 leading-relaxed">
                                            {step}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
