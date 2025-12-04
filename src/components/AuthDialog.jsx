import React, { useState } from 'react';
import { ChefHat, User, Lock, Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthDialog({
    isOpen,
    onClose,
    onSuccess,
    title,
    description,
    defaultMode = 'signin' // 'signin' or 'signup'
}) {
    const [isSignIn, setIsSignIn] = useState(defaultMode === 'signin');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Don't render if not open
    if (!isOpen) return null;

    // Cookie helper functions
    const setCookie = (name, value, days = 30) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    };

    const validate = () => {
        if (!username.trim()) {
            toast.error('Username is required');
            return false;
        }

        if (username.length < 3) {
            toast.error('Username must be at least 3 characters');
            return false;
        }

        if (!password) {
            toast.error('Password is required');
            return false;
        }

        if (!isSignIn) {
            if (password.length < 6) {
                toast.error('Password must be at least 6 characters');
                return false;
            }

            if (password !== confirmPassword) {
                toast.error("Passwords don't match");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const endpoint = isSignIn
                ? 'http://localhost:4000/api/auth/signin'
                : 'http://localhost:4000/api/auth/signup';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password
                }),
            });

            const body = await res.json().catch(() => ({}));

            if (res.ok) {
                if (isSignIn) {
                    // Save username to cookie
                    setCookie('username', username.trim());

                    toast.success('Signed in successfully!');

                    // Call success callback and close modal
                    setTimeout(() => {
                        onSuccess?.(username.trim());
                        onClose?.();
                    }, 500);
                } else {
                    toast.success('Account created! Please sign in.');
                    setIsSignIn(true);
                    setPassword('');
                    setConfirmPassword('');
                }
            } else {
                // Handle errors
                if (res.status === 409) {
                    toast.error(body.message || 'Username already exists');
                } else if (res.status === 404) {
                    toast.error(body.message || 'User not found');
                } else if (res.status === 401) {
                    toast.error(body.message || 'Incorrect password');
                } else if (res.status === 400) {
                    toast.error(body.message || 'Invalid request');
                } else {
                    toast.error(body.message || 'Something went wrong');
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsSignIn(!isSignIn);
        setPassword('');
        setConfirmPassword('');
    };

    // Get title and description
    const getTitle = () => {
        if (title) return title;
        return isSignIn ? 'Welcome Back  !' : 'Join Us!';
    };

    const getDescription = () => {
        if (description) return description;
        return isSignIn ? 'Sign in to access your recipes' : 'Create an account to get started';
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-600 to-yellow-500 p-8 text-white relative">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                            <ChefHat className="w-10 h-10" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center mb-2">
                        {getTitle()}
                    </h2>
                    <p className="text-orange-100 text-center text-sm">
                        {getDescription()}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8">
                    {/* Username */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="Enter your username"
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="Enter your password"
                                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password (Sign Up only) */}
                    {!isSignIn && (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {isSignIn ? 'Signing in...' : 'Creating account...'}
                            </span>
                        ) : (
                            isSignIn ? 'Sign In' : 'Create Account'
                        )}
                    </button>

                    {/* Switch Mode */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={switchMode}
                            className="text-sm text-gray-600 hover:text-orange-600 font-medium transition-colors"
                        >
                            {isSignIn ? (
                                <>Don't have an account? <span className="text-orange-600">Sign up</span></>
                            ) : (
                                <>Already have an account? <span className="text-orange-600">Sign in</span></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Helper function to get cookie value
export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Helper function to delete cookie
export const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};