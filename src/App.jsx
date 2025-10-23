import React from 'react'
import Home from './pages/Home'
import { Routes, Route, Link } from 'react-router-dom'
import { Toaster } from "sonner";
import Auth from './pages/Auth';
import About from './pages/About';
import MainLayout from './MainLayout';
import RecipeView from './pages/RecipeView';
import NotFound from './pages/NotFound';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Categories from './pages/Categories'; 
import CategoryView from './pages/CategoryView';



export default function App() {
  return (
    <div className="font-sans min-h-screen w-full bg-gray-50 text-gray-800">
      <Toaster />
      <Routes>
        {/* Routes that use the header layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:categoryName" element={<CategoryView />} />
          <Route path="/recipe/:id" element={<RecipeView />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Route>

        {/* Routes without the header */}
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </div>
  )
}
