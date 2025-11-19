import React, { useEffect, useState } from 'react';
import { ShoppingCart, Trash2, Clipboard } from 'lucide-react';
import { getCookie } from '../components/AuthDialog';

function aggregateIngredients(selectedRecipes) {
  const map = new Map();
  selectedRecipes.forEach((r) => {
    (r.ingredients || []).forEach((ing) => {
      const key = ing.trim();
      const prev = map.get(key) || { text: key, qty: 0, checked: false };
      prev.qty += 1; // simple count of occurrences
      map.set(key, prev);
    });
  });
  return Array.from(map.values());
}

export default function ViewCart() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [items, setItems] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [recipesError, setRecipesError] = useState(null);

  // Fetch user's recipes from database
  useEffect(() => {
    const fetchUserRecipes = async () => {
      const username = getCookie('username');
      if (!username) {
        setRecipesError('You must be logged in to view your recipes.');
        setLoadingRecipes(false);
        return;
      }

      try {
        const res = await fetch(`/api/recipes/user/${encodeURIComponent(username)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setUserRecipes([]);
            setLoadingRecipes(false);
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setUserRecipes(data.recipes || []);
        setLoadingRecipes(false);
      } catch (err) {
        console.error('Error loading user recipes:', err);
        setUserRecipes([]);
        setLoadingRecipes(false);
      }
    };

    fetchUserRecipes();
  }, []);

  // Load cart items from backend
  useEffect(() => {
    const load = async () => {
      const username = getCookie('username');
      if (username) {
        // try load from backend
        try {
          const res = await fetch(`/api/cart/${encodeURIComponent(username)}`);
          if (res.ok) {
            const body = await res.json();
            setItems((body.items || []).map((it) => ({ ...it })));
            return;
          }
        } catch (err) {
          // ignore and fallback to empty
          console.warn('Cart load failed', err);
        }
      }
      setItems([]);
    };
    load();
  }, []);

  // Update cart items when recipes are selected
  useEffect(() => {
    if (selectedIds.length === 0) {
      return;
    }
    const selectedRecipes = userRecipes.filter((r) => selectedIds.includes(r._id));
    const aggregated = aggregateIngredients(selectedRecipes);
    setItems(aggregated);
  }, [selectedIds, userRecipes]);

  // Save cart to backend when items change
  useEffect(() => {
    const username = getCookie('username');
    if (username && items.length > 0) {
      fetch(`/api/cart/${encodeURIComponent(username)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('Failed to save cart to backend', err);
      });
    }
  }, [items]);

  const toggleRecipe = (id) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const toggleItem = (text) => {
    setItems((prev) => prev.map((it) => (it.text === text ? { ...it, checked: !it.checked } : it)));
  };

  const clearChecked = () => {
    setItems((prev) => prev.filter((it) => !it.checked));
  };

  const exportClipboard = async () => {
    const lines = items.map((it) => `${it.checked ? '[x]' : '[ ]'} ${it.text} ${it.qty > 1 ? `(${it.qty})` : ''}`);
    const txt = lines.join('\n');
    try {
      await navigator.clipboard.writeText(txt);
      alert('Shopping list copied to clipboard');
    } catch (err) {
      alert('Unable to copy to clipboard');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart size={28} className="text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold">Shopping Cart 🛒</h1>
          <p className="text-sm text-gray-500">Collect ingredients from the recipes you plan to make and generate a grocery checklist.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: recipes */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="font-semibold mb-3">Your Recipes</h2>
          <p className="text-xs text-gray-500 mb-3">Select recipes to add their ingredients to the shopping list</p>
          
          {loadingRecipes ? (
            <div className="text-gray-500">Loading recipes...</div>
          ) : recipesError ? (
            <div className="text-red-500 text-sm">{recipesError}</div>
          ) : userRecipes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-3xl mb-2">📝</div>
              <div className="text-gray-600 text-sm">
                You currently have no saved recipes
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
              {userRecipes.map((r) => (
                <div key={r._id} className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(r._id)} 
                    onChange={() => toggleRecipe(r._id)} 
                    className="mt-2" 
                  />
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500">
                      {r.prepTime + r.cookTime} min • {r.servings} servings
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle: shopping list */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Your Grocery List</h2>
            <div className="flex items-center gap-2">
              <button onClick={exportClipboard} className="text-sm px-3 py-1 bg-orange-500 text-white rounded flex items-center gap-2"><Clipboard size={14}/> Copy</button>
              <button onClick={clearChecked} className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded flex items-center gap-2"><Trash2 size={14}/> Remove purchased</button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-gray-500">No items yet — select recipes to build your list.</div>
          ) : (
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.text} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={!!it.checked} onChange={() => toggleItem(it.text)} />
                    <span className={it.checked ? 'line-through text-gray-400' : ''}>{it.text}</span>
                  </label>
                  <div className="text-xs text-gray-500">{it.qty > 1 ? `${it.qty}×` : ''}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
