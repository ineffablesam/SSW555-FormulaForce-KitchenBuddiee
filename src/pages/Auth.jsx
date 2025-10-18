import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-700">
            <h1 className="text-4xl font-bold mb-2 text-orange-600">Kitchen Buddiee</h1>
            <div className="border border-dashed border-orange-300 rounded-lg p-8 text-center max-w-sm">
                <p className="mb-4">
                    <span className="font-semibold">Yang Gao</span>
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition"
                >
                    Back to Home
                </button>
            </div>

            <p className="mt-10 text-xs text-gray-400">— Temporary Auth Screen —</p>
        </div>
    );
}
