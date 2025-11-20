import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FolderPlus, Check, X, AlertCircle } from 'lucide-react';

export default function AddNewCategory({ onCancel, onSuccess }) {
    const { username } = useParams(); // get username from URL
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#FFFFFF');
    const [image, setImage] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('File selected:', file.name, file.size);
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('File read result (start):', reader.result?.substring(0, 50));
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

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
                username,
                color,
                imageSize: image ? image.length : 0
            });

            const res = await fetch('http://localhost:4000/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    username,
                    color: color || '#FFFFFF',
                    image,
                }),
            });

            const data = await res.json();

            console.log(data);
            if (!res.ok) throw new Error(data.error || 'Failed to create category');

            if (onSuccess) onSuccess();
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

                <div>
                    <label className="block text-gray-700 mb-1">Color</label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-16 h-10 p-0 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-1">Category Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-orange-50 file:text-orange-700
                        hover:file:bg-orange-100"
                    />
                    {image && (
                        <img src={image} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-full border-2 border-orange-200" />
                    )}
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


