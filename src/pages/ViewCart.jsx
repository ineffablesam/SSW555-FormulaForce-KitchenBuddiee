import React, { useEffect, useState } from 'react';
import { recipesData } from '../mockdata/recipesData';
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
  const [selectedIds, setSelectedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cartRecipeIds') || '[]');
    } catch {
      return [];
    }
  });

  const [items, setItems] = useState([]);

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
            // also set selectedIds from localStorage (we don't track recipes on server yet)
            const savedIds = JSON.parse(localStorage.getItem('cartRecipeIds') || '[]');
            setSelectedIds(savedIds);
            return;
          }
        } catch (err) {
          // ignore and fallback to local
          // eslint-disable-next-line no-console
          console.warn('Cart load failed, using local storage', err);
        }
      }

      const selectedRecipes = recipesData.filter((r) => selectedIds.includes(r.id));
      const aggregated = aggregateIngredients(selectedRecipes);
      // load checked state from localStorage
      const stored = JSON.parse(localStorage.getItem('cartItemsChecked') || '{}');
      const withChecked = aggregated.map((it) => ({ ...it, checked: !!stored[it.text] }));
      setItems(withChecked);
      localStorage.setItem('cartRecipeIds', JSON.stringify(selectedIds));
    };
    load();
  }, [selectedIds]);

  useEffect(() => {
    const map = {};
    items.forEach((it) => { map[it.text] = !!it.checked; });
    localStorage.setItem('cartItemsChecked', JSON.stringify(map));
    // persist to backend if user logged in
    const username = getCookie('username');
    if (username) {
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

  const toggleRecipe = async (id) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(id);
      const next = isSelected ? prev.filter((x) => x !== id) : [...prev, id];

      // After computing next selection, aggregate ingredients from remaining recipes
      const selectedRecipes = recipesData.filter((r) => next.includes(r.id));
      const aggregated = aggregateIngredients(selectedRecipes);

      // Preserve checked state for items that still exist
      const prevCheckedMap = new Map(items.map((it) => [it.text, !!it.checked]));
      const merged = aggregated.map((it) => ({
        ...it,
        checked: prevCheckedMap.get(it.text) || false,
      }));
      setItems(merged);

      // Persist cart to backend explicitly (items effect also handles, but do immediate for responsiveness)
      const username = getCookie('username');
      if (username) {
        fetch(`/api/cart/${encodeURIComponent(username)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: merged }),
        }).catch((err) => console.warn('Failed to sync cart after recipe toggle', err));
      }

      // Update localStorage selection
      localStorage.setItem('cartRecipeIds', JSON.stringify(next));
      return next;
    });
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
          <h2 className="font-semibold mb-3">Recipes</h2>
          <p className="text-xs text-gray-500 mb-3">Select recipes to add their ingredients to the shopping list</p>
          <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
            {recipesData.map((r) => (
              <div key={r.id} className="flex items-start gap-3">
                <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleRecipe(r.id)} className="mt-2" />
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.time} • {r.servings} servings</div>
                </div>
              </div>
            ))}
          </div>
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
