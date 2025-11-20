import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        onClick={onClick}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{
                            scale: 1.1,
                            boxShadow: "0 25px 50px -12px rgba(249, 115, 22, 0.5)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                        }}
                        className="hidden md:flex fixed bottom-8 right-8 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-4 rounded-full shadow-2xl items-center gap-3 z-50 group"
                    >
                        <motion.div
                            whileHover={{ rotate: 90 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                            <Plus className="w-6 h-6" />
                        </motion.div>
                        <span className="font-bold text-lg">Add Recipe</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Mobile Version - Bottom Center */}
            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        onClick={onClick}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25
                        }}
                        className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 z-50"
                    >
                        <Plus className="w-6 h-6" />
                        <span className="font-bold text-base">Add Recipe</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingAddRecipeButton;