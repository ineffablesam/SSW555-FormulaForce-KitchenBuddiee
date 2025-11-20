import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import RecipeCard from '../components/RecipeCard';
import RecipeCardShimmer from '../components/RecipeCardShimmer';
import { ChefHat, AlertCircle, X } from 'lucide-react';
import AuthDialog, { getCookie } from '../components/AuthDialog';
import AddNewRecipe from './AddNewRecipe';

export default function MyRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingPrivacy, setTogglingPrivacy] = useState(null);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const username = getCookie('username');
    const navigate = useNavigate();

    useEffect(() => {
        if (!username) {
            setShowAuth(true);
        } else {
            fetchMyRecipes();
        }
    }, [username]);

    const fetchMyRecipes = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const response = await fetch(`http://localhost:4000/api/recipes/user/${username}`);
            if (!response.ok) throw new Error('Failed to fetch your recipes');
            const data = await response.json();
            setRecipes(data.recipes || []);
        } catch (err) {
            setError(err.message);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleDeleteClick = (recipe) => {
        setDeleteConfirm(recipe);
    };

    const handleEditClick = (recipe) => {
        setEditingRecipe(recipe);
    };

    const handleEditComplete = () => {
        setEditingRecipe(null);
        fetchMyRecipes();
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;

        try {
            setDeleting(true);
            const recipeId = deleteConfirm._id || deleteConfirm.id;

            const response = await fetch(`http://localhost:4000/api/recipes/${recipeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete recipe');
            }

            // Remove recipe from state immediately
            setRecipes(prev => prev.filter(r => (r._id || r.id) !== recipeId));
            await fetchMyRecipes(false);
            setDeleteConfirm(null);
        } catch (err) {
            alert(`Error deleting recipe: ${err.message}`);
        } finally {
            setDeleting(false);
        }
    };

    const handlePrivacyToggle = async (recipe) => {
        if (togglingPrivacy) return;

        try {
            setTogglingPrivacy(recipe._id || recipe.id);
            const recipeId = recipe._id || recipe.id;
            const newPrivacyStatus = !recipe.isPrivate;

            const response = await fetch(`http://localhost:4000/api/recipes/${recipeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ isPrivate: newPrivacyStatus })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update privacy settings');
            }

            // Force a full refresh to ensure UI updates
            await fetchMyRecipes(true);

        } catch (err) {
            alert(`Error updating privacy: ${err.message}`);
            await fetchMyRecipes(true);
        } finally {
            setTogglingPrivacy(null);
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

    if (editingRecipe) {
        return (
            <AddNewRecipe
                initialRecipe={editingRecipe}
                onCancel={() => setEditingRecipe(null)}
                onSubmit={handleEditComplete}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                className="mb-8 flex items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
            >
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
                <h1 className="text-3xl font-bold text-gray-900">My Recipes</h1>
            </motion.div>

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
                        You haven't added any recipes yet. Start cooking something amazing!
                    </p>
                </div>
            )}

            {!loading && !error && recipes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe, index) => (
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
                                onDelete={handleDeleteClick}
                                onTogglePrivacy={handlePrivacyToggle}
                                onEdit={handleEditClick}
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Delete Recipe?</h3>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={deleting}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.title}"</span>? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
