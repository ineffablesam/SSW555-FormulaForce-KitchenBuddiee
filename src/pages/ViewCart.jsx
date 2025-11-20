import React, { useEffect, useState } from 'react';
import { ShoppingCart, Trash2, Clipboard, Plus, X } from 'lucide-react';
import { getCookie } from '../components/AuthDialog';
import { toast } from 'sonner';

export default function ViewCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIngredient, setNewIngredient] = useState('');

  // Load cart items from backend
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const username = getCookie('username');
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/cart/${encodeURIComponent(username)}`);
      if (res.ok) {
        const body = await res.json();
        setItems((body.items || []).map((it) => ({ ...it })));
      }
    } catch (err) {
      console.warn('Cart load failed', err);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Save cart to backend when items change
  const saveCart = async (updatedItems) => {
    const username = getCookie('username');
    if (!username) return;

    try {
      await fetch(`http://localhost:4000/api/cart/${encodeURIComponent(username)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems }),
      });
    } catch (err) {
      console.warn('Failed to save cart to backend', err);
      toast.error('Failed to save cart');
    }
  };

  const toggleItem = (text) => {
    const updatedItems = items.map((it) =>
      it.text === text ? { ...it, checked: !it.checked } : it
    );
    setItems(updatedItems);
    saveCart(updatedItems);
  };

  const removeItem = async (text) => {
    const username = getCookie('username');
    if (!username) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/cart/${encodeURIComponent(username)}/items/${encodeURIComponent(text)}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setItems(prev => prev.filter(it => it.text !== text));
        toast.success('Item removed from cart');
      }
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error('Failed to remove item');
    }
  };

  const clearChecked = () => {
    const updatedItems = items.filter((it) => !it.checked);
    setItems(updatedItems);
    saveCart(updatedItems);
    toast.success('Removed checked items');
  };

  const addIngredient = async () => {
    const ingredient = newIngredient.trim();
    if (!ingredient) return;

    const username = getCookie('username');
    if (!username) {
      toast.error('Please log in to add items');
      return;
    }

    // Check if already exists
    if (items.some(it => it.text === ingredient)) {
      toast.error('Ingredient already in cart');
      return;
    }

    const updatedItems = [...items, { text: ingredient, qty: 1, checked: false }];
    setItems(updatedItems);
    setNewIngredient('');
    await saveCart(updatedItems);
    toast.success(`Added "${ingredient}" to cart`);
  };

  const exportClipboard = async () => {
    const lines = items.map((it) => `${it.checked ? '[x]' : '[ ]'} ${it.text} ${it.qty > 1 ? `(${it.qty})` : ''}`);
    const txt = lines.join('\n');
    try {
      await navigator.clipboard.writeText(txt);
      toast.success('Shopping list copied to clipboard');
    } catch (err) {
      toast.error('Unable to copy to clipboard');
    }
  };

  const clearAll = () => {
    setItems([]);
    saveCart([]);
    toast.success('Cart cleared');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  const username = getCookie('username');
  if (!username) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <ShoppingCart size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to use the shopping cart feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart size={28} className="text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold">Shopping Cart 🛒</h1>
          <p className="text-sm text-gray-500">Manage your grocery list and ingredients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Add Ingredient Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="font-semibold mb-3">Add Ingredient</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
              placeholder="Enter ingredient name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={addIngredient}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus size={18} />
              Add
            </button>
          </div>
        </div>

        {/* Shopping List */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Your Grocery List ({items.length} items)</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={exportClipboard}
                disabled={items.length === 0}
                className="text-sm px-3 py-1 bg-orange-500 text-white rounded flex items-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clipboard size={14} />
                Copy
              </button>
              <button
                onClick={clearChecked}
                disabled={!items.some(it => it.checked)}
                className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded flex items-center gap-2 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
                Remove Checked
              </button>
              <button
                onClick={clearAll}
                disabled={items.length === 0}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded flex items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={14} />
                Clear All
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add ingredients manually or from recipe pages</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => (
                <li
                  key={it.text}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <label className="flex items-center gap-3 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!it.checked}
                      onChange={() => toggleItem(it.text)}
                      className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                    />
                    <span className={`flex-1 ${it.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {it.text}
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    {it.qty > 1 && (
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {it.qty}×
                      </span>
                    )}
                    <button
                      onClick={() => removeItem(it.text)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
