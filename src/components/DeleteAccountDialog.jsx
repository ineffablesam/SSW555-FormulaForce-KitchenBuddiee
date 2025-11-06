import React, { useState } from 'react';
import { Trash2, ShieldAlert, Eye, EyeOff, X, Loader2 } from 'lucide-react';

export default function DeleteAccountDialog({ isOpen, onClose, username, onDeleted }) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password) {
            setError('Password is required to delete your account.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:4000/api/auth/delete-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const body = await res.json().catch(() => ({}));

            if (res.ok) {
                setPassword('');
                onDeleted?.();
            } else {
                setError(body.message || 'Failed to delete account. Please try again.');
            }
        } catch (err) {
            console.error('Delete account error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setPassword('');
        setError('');
        setShowPassword(false);
        onClose?.();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="relative bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                        aria-label="Close delete account dialog"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Delete Account</h2>
                            <p className="text-orange-100 text-sm">
                                This will permanently remove your account and recipes.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                        <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-red-700">
                                You are about to delete <span className="font-semibold">@{username}</span>. This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm with password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold shadow-lg hover:from-red-700 hover:to-orange-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Account'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
