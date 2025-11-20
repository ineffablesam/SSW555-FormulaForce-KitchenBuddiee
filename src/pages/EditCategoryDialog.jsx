import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useParams } from 'react-router-dom';


export default function EditCategoryDialog({ category, onClose, onSuccess }) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color || '#FFFFFF');
  const [image, setImage] = useState(category.image || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { username } = useParams();

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
    setLoading(true);
    setError('');

    try {
      console.log('Updating category with:', {
        name,
        color,
        username,
        imageSize: image ? image.length : 0
      });

      const res = await fetch(`http://localhost:4000/api/categories/${category._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, image, username }),
      });

      if (!res.ok) {
        let errorMsg = 'Failed to update category';
        try {
          const data = await res.json();
          if (data?.message) errorMsg = data.message;
        } catch { }
        throw new Error(errorMsg);
      }

      const data = await res.json();

      if (onSuccess) onSuccess(data.category);

      if (onClose) onClose();
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-orange-500"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold mb-4">Edit Category</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded"
              minLength={3}
              maxLength={25}
              required
            />
          </label>

          <label className="flex flex-col">
            Color
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-10 p-0 border rounded"
            />
          </label>

          <label className="flex flex-col">
            Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-500 mt-1"
            />
            {image && (
              <img src={image} alt="Preview" className="mt-2 w-16 h-16 object-cover rounded-full border border-gray-300" />
            )}
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            {loading ? 'Updating...' : 'Update Category'}
          </button>
        </form>
      </div>
    </div>
  );
}
