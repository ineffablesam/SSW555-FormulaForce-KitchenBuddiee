import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Categories from '../pages/Categories';
import CategoryView from '../pages/CategoryView';
import RecipeView from '../pages/RecipeView';
import { categoriesData } from '../mockdata/categoriesData';
import { recipesData } from '../mockdata/recipesData';

describe('Categories Page Navigation', () => {
  test('renders all categories on Categories page', () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    categoriesData.forEach((cat) => {
      expect(screen.getByText(cat.name)).toBeInTheDocument();
      expect(screen.getByText(cat.description)).toBeInTheDocument();
    });
  });

  test('clicking a category shows recipes in CategoryView', async () => {
    const user = userEvent.setup();
    const categoryName = 'Italian';
    const filteredRecipes = recipesData.filter(r => r.categoryName === categoryName);

    render(
      <MemoryRouter initialEntries={['/categories']}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:categoryName" element={<CategoryView />} />
        </Routes>
      </MemoryRouter>
    );

    // Click on the category card
    await user.click(screen.getByText(categoryName));

    // Check that filtered recipes appear
    filteredRecipes.forEach(recipe => {
      expect(screen.getByText(recipe.title)).toBeInTheDocument();
      expect(screen.getByText(recipe.description)).toBeInTheDocument();
    });

    // Check that category name is capitalized
    expect(screen.getByText(`${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Recipes`)).toBeInTheDocument();
  });

  test('clicking a recipe navigates to RecipeView', async () => {
    const user = userEvent.setup();
    const categoryName = 'Italian';
    const recipe = recipesData.find(r => r.categoryName === categoryName);

    render(
      <MemoryRouter initialEntries={['/categories']}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:categoryName" element={<CategoryView />} />
          <Route path="/recipe/:id" element={<RecipeView />} />
        </Routes>
      </MemoryRouter>
    );

    // Click on category
    await user.click(screen.getByText(categoryName));

    // Click on the first recipe title
    await user.click(screen.getByText(recipe.title));

    // Check that RecipeView displays the recipe
    expect(screen.getByText(recipe.title)).toBeInTheDocument();
    expect(screen.getByText(recipe.description)).toBeInTheDocument();
  });
});
