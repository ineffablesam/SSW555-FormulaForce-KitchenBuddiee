import React, { useState, useEffect } from 'react';
import { Edit, FolderPlus, Folder, AlertCircle, Trash} from 'lucide-react';
import AddNewCategory from './AddNewCategory';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import EditCategoryDialog from './EditCategoryDialog';
import DeleteCategoryModal from '../components/DeleteCategoryModal';


export default function Categories() {
    const { username: paramUsername, categoryName } = useParams();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoriesToDelete, setCategoriesToDelete] = useState([]);

    const username = paramUsername;

    useEffect(() => {
        console.log('Username:', username);
    }, [username, categoryName]);

    useEffect(() => {
        if (!username) return;

        if (categoryName) {
            // Fetch a single category
            fetchCategory(username, categoryName);
        } else {
            // Fetch all categories for this user
            fetchCategories(username);
        }
    }, [username, categoryName]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`http://localhost:4000/api/categories/${username}`);
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(data.categories || data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch single category (if needed)
    const fetchCategory = async (user, catName) => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`http://localhost:4000/api/categories/${user}/${catName}`);
            if (!res.ok) throw new Error('Failed to fetch category');
            const data = await res.json();
            setCategories([data.category]); // wrap in array to reuse rendering
        } catch (err) {
            console.error('Error fetching category:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Create new category
    const handleCreateCategory = async (name, description) => {
        if (!username) return alert('You must be signed in');
        try {
            const res = await fetch('http://localhost:4000/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, username })
            });
            if (!res.ok) throw new Error('Failed to create category');
            const data = await res.json();
            console.log('Created category:', data.category);
            fetchCategories(username); // refresh list
        } catch (err) {
            console.error('Error creating category:', err);
            alert(err.message);
        }
    };

    const handleDeleteCategories = async (idsToDelete) => {
        if (!idsToDelete || idsToDelete.length === 0) return;

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${idsToDelete.length} category(ies)?`
        );
        if (!confirmDelete) return;

        try {
            const res = await fetch("http://localhost:4000/api/categories/batch", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: idsToDelete, username }),
            });

            if (res.ok) {
                setShowDeleteModal(false);
                fetchCategories(username);
                return;
            }

            for (const id of idsToDelete) {
                await fetch(`http://localhost:4000/api/categories/${id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username }),
                });
            }

            setShowDeleteModal(false);
            fetchCategories(username);
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete categories.");
        }
    };

    if (showAddCategory) {
        return (
            <AddNewCategory
                onCancel={() => setShowAddCategory(false)}
                onSuccess={() => {
                    setShowAddCategory(false);
                    fetchCategories();
                }}
            />
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Folder className="text-orange-500" />
                    Categories
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddCategory(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                        + Add New Category
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-1"
                    >
                        <Trash size={23} />
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Categories</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchCategories}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && categories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                    <FolderPlus className="w-16 h-16 text-orange-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Categories Yet</h3>
                    <p className="text-gray-600 mb-6">
                        Start organizing your recipes by adding your first category.
                    </p>
                    <button
                        onClick={() => setShowAddCategory(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Add Your First Category
                    </button>
                </div>
            )}

            {/* Category List */}
            {!loading && !error && categories.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <div
                            key={category._id || category.name}
                            className="relative bg-white border-2 border-orange-100 p-6 rounded-lg shadow hover:shadow-md transition group flex flex-col items-center text-center"
                            style={{ backgroundColor: category.color || '#FFFFFF', borderColor: '#FFA500' }}
                        >
                            {/* Pencil icon (edit) */}
                            <button
                                onClick={() => setEditCategory(category)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-600 hover:text-orange-500 bg-white/50 rounded-full p-1"
                            >
                                <Edit size={18} />
                            </button>

                            {/* Category Image */}
                            {category.image ? (
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white shadow-sm"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                                    <Folder className="w-10 h-10 text-orange-400" />
                                </div>
                            )}

                            {/* Category name link */}
                            <Link
                                to={`/categories/${username}/${category.name}`}
                                className="block"
                            >
                                <h2 className="text-lg font-semibold text-gray-800 hover:text-orange-700 transition-colors">
                                    {category.name}
                                </h2>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {editCategory && (
                <EditCategoryDialog
                    category={editCategory}
                    onClose={() => setEditCategory(null)}
                    onSuccess={async (updatedCategory) => {
                        try {
                            const res = await fetch(`http://localhost:4000/api/categories/${updatedCategory._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(updatedCategory),
                            });
                            if (!res.ok) throw new Error('Failed to update category');
                            setEditCategory(null);
                            fetchCategories(username); // refresh list
                        } catch (err) {
                            console.error(err);
                            alert(err.message || 'Failed to update category');
                        }
                    }}
                />
            )}

            {showDeleteModal && (
                <DeleteCategoryModal
                    categories={categories}
                    onClose={() => setShowDeleteModal(false)}
                    onDelete={handleDeleteCategories}
                />
            )}
        </div>
    )
}