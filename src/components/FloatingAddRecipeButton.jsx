import React, { useState, useEffect } from 'react';
import { Plus, ChefHat } from 'lucide-react';

const FloatingAddRecipeButton = ({ onClick }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Hide button when scrolling down, show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <>
            {/* Desktop Version - Bottom Right */}
            <button
                onClick={onClick}
                className={`hidden md:flex fixed bottom-8 right-8 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 items-center gap-3 z-50 group ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
                    }`}
            >
                <div className="relative">
                    <Plus className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" />
                </div>
                <span className="font-bold text-lg">Add Recipe</span>
                <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>

            {/* Mobile Version - Bottom Center */}
            <button
                onClick={onClick}
                className={`md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-4 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-3 z-50 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
                    }`}
            >
                <Plus className="w-6 h-6" />
                <span className="font-bold text-base">Add Recipe</span>
            </button>

            {/* Alternative Compact Mobile Version */}
            {/* Uncomment this and remove above mobile button for a more compact design */}
            {/* 
      <button
        onClick={onClick}
        className={`md:hidden fixed bottom-6 right-6 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white p-5 rounded-full shadow-2xl transition-all duration-300 z-50 ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-75 pointer-events-none'
        }`}
      >
        <Plus className="w-7 h-7" />
      </button>
      */}
        </>
    );
};

export default FloatingAddRecipeButton;