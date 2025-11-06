import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FolderPlus, Check, X, AlertCircle } from 'lucide-react';

export default function AddNewCategory({ onCancel, onSuccess }) {
    const { username } = useParams(); // get username from URL
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('Category name is required');
            return;
        }

        try {
            console.log('Creating category with:', {
                name,
                description,
                username
            });

            const res = await fetch('http://localhost:4000/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    username, // username from URL
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create category');

            if (onSuccess) onSuccess();
            onSuccess(); // refresh categories list
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
}


