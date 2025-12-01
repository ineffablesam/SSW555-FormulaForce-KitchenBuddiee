import React, { useState } from "react";

export default function DeleteCategoryModal({ categories, onClose, onDelete }) {
    const [selected, setSelected] = useState([]);

    const toggle = (id) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
                
                <h2 className="text-xl font-bold mb-4">Delete Categories</h2>

                <div className="max-h-64 overflow-y-auto mb-6">
                    {categories.map((cat) => (
                        <label
                            key={cat._id}
                            className="flex items-center gap-3 mb-2 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={selected.includes(cat._id)}
                                onChange={() => toggle(cat._id)}
                            />
                            <span className="text-gray-800">{cat.name}</span>
                        </label>
                    ))}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={selected.length === 0}
                        onClick={() => onDelete(selected)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition"
                    >
                        Delete {selected.length > 0 ? `(${selected.length})` : ""}
                    </button>
                </div>
            </div>
        </div>
    );
}
