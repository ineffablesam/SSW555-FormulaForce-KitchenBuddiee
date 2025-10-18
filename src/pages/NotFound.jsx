import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Lottie from 'lottie-react';
import bearAnimation from '../assets/bear.json';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-50 text-gray-800 px-6">
            {/* Left Section: Lottie Bear */}
            <div className="flex justify-center md:justify-end w-full md:w-1/2 mb-6 md:mb-0">
                <Lottie animationData={bearAnimation} loop={true} className="w-64 h-64 md:w-96 md:h-96" />
            </div>

            {/* Right Section: Text and Button */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-1/2">
                <h1 className="text-8xl font-bold mb-4">404</h1>
                <p className="text-2xl font-semibold mb-2">Oops... Lost in the woods 🐾</p>
                <p className="text-gray-500 mb-8 max-w-md">
                    Our adorable bear tried to find your page, but got distracted by honey. 🍯
                    Maybe let’s head back before it gets any hungrier?
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 transition-all duration-200"
                >
                    <ArrowLeft size={18} />
                    Take me home
                </button>

                <p className="mt-10 text-sm text-gray-400 max-w-sm">
                    (P.S. If you really think this page should exist, maybe the bear ate it. 🐻)
                </p>
            </div>
        </div>
    );
}
