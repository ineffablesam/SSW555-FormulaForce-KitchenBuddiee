import React, { useState, useEffect } from 'react';
import { ChefHat, X, AlertCircle, Check, Plus, Clock, Users, GripVertical, Trash2, ImageIcon, Save } from 'lucide-react';

const AddNewRecipe = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        difficulty: 'medium',
        category: '',
        description: '',
        ingredients: [{ id: Date.now(), text: '' }],
        steps: [{ id: Date.now() + 1, text: '' }],
        image: null,
        imagePreview: null
    });

    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedType, setDraggedType] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Recipe title is required';
        }

        const validIngredients = formData.ingredients.filter(ing => ing.text.trim());
        if (validIngredients.length === 0) {
            newErrors.ingredients = 'At least one ingredient is required';
        }

        const validSteps = formData.steps.filter(step => step.text.trim());
        if (validSteps.length === 0) {
            newErrors.steps = 'At least one step is required';
        }

        if (!formData.prepTime || formData.prepTime <= 0) {
            newErrors.prepTime = 'Prep time is required';
        }

        if (!formData.cookTime || formData.cookTime <= 0) {
            newErrors.cookTime = 'Cook time is required';
        }

        if (!formData.servings || formData.servings <= 0) {
            newErrors.servings = 'Servings is required';
        }

        if (!formData.category.trim()) {
            newErrors.category = 'Category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            const cleanedData = {
                ...formData,
                ingredients: formData.ingredients.filter(ing => ing.text.trim()).map(ing => ing.text),
                steps: formData.steps.filter(step => step.text.trim()).map(step => step.text)
            };

            console.log('Recipe Data:', cleanedData);
            setShowSuccess(true);

            setTimeout(() => {
                onSubmit(cleanedData);
            }, 1500);
        } else {
            const firstError = document.querySelector('.border-red-300');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    // Image handling
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    };

    const removeImage = () => {
        setFormData({ ...formData, image: null, imagePreview: null });
    };

    // Drag and Drop for Ingredients
    const handleDragStart = (e, index, type) => {
        setDraggedItem(index);
        setDraggedType(type);
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
        setDraggedItem(null);
        setDraggedType(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, dropIndex, type) => {
        e.preventDefault();

        if (draggedItem === null || draggedType !== type) return;

        const items = type === 'ingredient' ? [...formData.ingredients] : [...formData.steps];
        const draggedItemContent = items[draggedItem];

        items.splice(draggedItem, 1);
        items.splice(dropIndex, 0, draggedItemContent);

        if (type === 'ingredient') {
            setFormData({ ...formData, ingredients: items });
        } else {
            setFormData({ ...formData, steps: items });
        }
    };

    // Ingredient handlers
    const handleIngredientChange = (id, value) => {
        const newIngredients = formData.ingredients.map(ing =>
            ing.id === id ? { ...ing, text: value } : ing
        );
        setFormData({ ...formData, ingredients: newIngredients });
        if (errors.ingredients) {
            setErrors({ ...errors, ingredients: null });
        }
    };

    const addIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { id: Date.now(), text: '' }]
        });
    };

    const removeIngredient = (id) => {
        if (formData.ingredients.length > 1) {
            const newIngredients = formData.ingredients.filter(ing => ing.id !== id);
            setFormData({ ...formData, ingredients: newIngredients });
        }
    };

    // Step handlers
    const handleStepChange = (id, value) => {
        const newSteps = formData.steps.map(step =>
            step.id === id ? { ...step, text: value } : step
        );
        setFormData({ ...formData, steps: newSteps });
        if (errors.steps) {
            setErrors({ ...errors, steps: null });
        }
    };

    const addStep = () => {
        setFormData({
            ...formData,
            steps: [...formData.steps, { id: Date.now(), text: '' }]
        });
    };

    const removeStep = (id) => {
        if (formData.steps.length > 1) {
            const newSteps = formData.steps.filter(step => step.id !== id);
            setFormData({ ...formData, steps: newSteps });
        }
    };

    if (showSuccess) {
        return (
            <div className="fixed inset-0 flex items-center justify-center px-4 bg-gradient-to-br from-orange-50 via-white to-yellow-50">
                <div className="text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Check className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Recipe Added Successfully!</h2>
                    <p className="text-gray-600 text-lg">Redirecting to your recipes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 overflow-auto">
            <div className="min-h-screen">
                {/* Header - Fixed */}
                <div className="mt-14 sm:mt-20 bg-gradient-to-r from-orange-600 to-yellow-500 shadow-lg">
                    <div className="max-w-7xl mx-auto px-6 py-6 sm:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                    <ChefHat className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white">Add New Recipe</h2>
                                    <p className="text-orange-100 mt-1">Share your delicious creation with the world</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} >
                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
                        <div className="space-y-8">
                            {/* Image Upload Section */}
                            <div className="bg-white shadow-lg p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-10 h-10 bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">
                                        <ImageIcon className="w-5 h-5" />
                                    </span>
                                    <h3 className="text-2xl font-bold text-gray-900">Recipe Image</h3>
                                    <span className="text-sm text-gray-400">(Optional)</span>
                                </div>

                                {formData.imagePreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={formData.imagePreview}
                                            alt="Recipe preview"
                                            className="w-full max-w-md h-64 object-cover border-4 border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="block w-full max-w-md cursor-pointer">
                                        <div className="border-3 border-dashed border-gray-300 hover:border-orange-500 transition-colors p-12 text-center bg-gray-50 hover:bg-orange-50">
                                            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 font-semibold mb-1">Click to upload an image</p>
                                            <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Basic Information */}
                            <div className="bg-white shadow-lg p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-10 h-10 bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">1</span>
                                    <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Recipe Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => {
                                                setFormData({ ...formData, title: e.target.value });
                                                if (errors.title) setErrors({ ...errors, title: null });
                                            }}
                                            className={`w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-orange-300'
                                                }`}
                                            placeholder="e.g., Grandma's Chocolate Chip Cookies"
                                        />
                                        {errors.title && (
                                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{errors.title}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Description <span className="text-gray-400 text-xs">(Optional)</span>
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 hover:border-orange-300 transition-all resize-none"
                                            placeholder="Brief description of your recipe..."
                                            rows="4"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Category <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, category: e.target.value });
                                                    if (errors.category) setErrors({ ...errors, category: null });
                                                }}
                                                className={`w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-orange-300'
                                                    }`}
                                                placeholder="e.g., Italian, Dessert, Breakfast"
                                            />
                                            {errors.category && (
                                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>{errors.category}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Difficulty Level
                                            </label>
                                            <select
                                                value={formData.difficulty}
                                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 hover:border-orange-300 transition-all"
                                            >
                                                <option value="easy">Easy - Beginner Friendly</option>
                                                <option value="medium">Medium - Some Experience</option>
                                                <option value="hard">Hard - Advanced Skills</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <Clock className="w-4 h-4 inline mr-1" />
                                                Prep Time (min) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.prepTime}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, prepTime: e.target.value });
                                                    if (errors.prepTime) setErrors({ ...errors, prepTime: null });
                                                }}
                                                className={`w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${errors.prepTime ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-orange-300'
                                                    }`}
                                                placeholder="15"
                                                min="0"
                                            />
                                            {errors.prepTime && (
                                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>{errors.prepTime}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <Clock className="w-4 h-4 inline mr-1" />
                                                Cook Time (min) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.cookTime}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, cookTime: e.target.value });
                                                    if (errors.cookTime) setErrors({ ...errors, cookTime: null });
                                                }}
                                                className={`w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${errors.cookTime ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-orange-300'
                                                    }`}
                                                placeholder="30"
                                                min="0"
                                            />
                                            {errors.cookTime && (
                                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>{errors.cookTime}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <Users className="w-4 h-4 inline mr-1" />
                                                Servings <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.servings}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, servings: e.target.value });
                                                    if (errors.servings) setErrors({ ...errors, servings: null });
                                                }}
                                                className={`w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${errors.servings ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-orange-300'
                                                    }`}
                                                placeholder="4"
                                                min="1"
                                            />
                                            {errors.servings && (
                                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>{errors.servings}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ingredients with Drag & Drop */}
                            <div className="bg-white shadow-lg p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-10 h-10 bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">2</span>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Ingredients <span className="text-red-500">*</span>
                                    </h3>
                                    <span className="text-sm text-gray-500 ml-2">(Drag to reorder)</span>
                                </div>

                                <div className="space-y-3">
                                    {formData.ingredients.map((ingredient, index) => (
                                        <div
                                            key={ingredient.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index, 'ingredient')}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index, 'ingredient')}
                                            className="flex gap-3 items-start bg-gray-50 p-3 hover:bg-gray-100 transition-colors cursor-move"
                                        >
                                            <div className="flex-shrink-0 pt-3">
                                                <GripVertical className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="flex-shrink-0 w-10 h-11 bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm">
                                                {index + 1}
                                            </div>
                                            <input
                                                type="text"
                                                value={ingredient.text}
                                                onChange={(e) => handleIngredientChange(ingredient.id, e.target.value)}
                                                className="flex-1 px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 hover:border-orange-300 transition-all"
                                                placeholder={`e.g., 2 cups flour, 1 tsp salt`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeIngredient(ingredient.id)}
                                                className="flex-shrink-0 p-3 bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={formData.ingredients.length === 1}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {errors.ingredients && (
                                    <div className="flex items-center gap-1 mt-3 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.ingredients}</span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={addIngredient}
                                    className="mt-5 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-all hover:gap-3 px-4 py-2 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Another Ingredient
                                </button>
                            </div>

                            {/* Steps with Drag & Drop */}
                            <div className="bg-white shadow-lg p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-10 h-10 bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">3</span>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Cooking Instructions <span className="text-red-500">*</span>
                                    </h3>
                                    <span className="text-sm text-gray-500 ml-2">(Drag to reorder)</span>
                                </div>

                                <div className="space-y-4">
                                    {formData.steps.map((step, index) => (
                                        <div
                                            key={step.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index, 'step')}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index, 'step')}
                                            className="flex gap-3 items-start bg-orange-50 p-4 hover:bg-orange-100 transition-colors cursor-move"
                                        >
                                            <div className="flex-shrink-0 pt-3">
                                                <GripVertical className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                                {index + 1}
                                            </div>
                                            <textarea
                                                value={step.text}
                                                onChange={(e) => handleStepChange(step.id, e.target.value)}
                                                className="flex-1 px-4 py-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 hover:border-orange-300 transition-all resize-none"
                                                placeholder={`Describe step ${index + 1} in detail...`}
                                                rows="3"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeStep(step.id)}
                                                className="flex-shrink-0 p-3 bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={formData.steps.length === 1}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {errors.steps && (
                                    <div className="flex items-center gap-1 mt-3 text-red-600 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errors.steps}</span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={addStep}
                                    className="mt-5 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-all hover:gap-3 px-4 py-2 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Another Step
                                </button>
                            </div>

                        </div>

                    </div>

                    {/* Submit Buttons - Sticky Footer */}
                    <div className="sticky bottom-0 bg-white shadow-2xl border-t-4 border-orange-500 p-6">
                        <div className="max-w-7xl mx-auto flex flex-col sm:justify-end sm:flex-row gap-4">
                            <button
                                type="submit"
                                className="flex-1 sm:flex-none bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-4 font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
                            >
                                <Save className="w-6 h-6" />
                                Save Recipe
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="sm:w-40 bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-4 font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default AddNewRecipe;