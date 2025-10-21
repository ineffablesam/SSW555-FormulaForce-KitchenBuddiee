import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignIn() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validate = () => {
        if (!username.trim()) {
            setError('Username is required.');
            return false;
        }
        if (!password) {
            setError('Password is required.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username.trim(), password }),
            });

            const body = await res.json().catch(() => ({}));

            if (res.ok) {
                setSuccess('Signed in successfully! Redirecting you home...');
                setError('');
                setTimeout(() => navigate('/'), 1200);
            } else {
                if (res.status === 404) {
                    setError(body.message || 'User not found.');
                } else if (res.status === 401) {
                    setError(body.message || 'Incorrect password.');
                } else if (res.status === 400) {
                    setError(body.message || 'Invalid request.');
                } else {
                    setError(body.message || `Server error (${res.status}).`);
                }
            }
        } catch (err) {
            setError('Network error or server unreachable.');
            if (import.meta.env.DEV) {
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-700">
            <h1 className="text-4xl font-bold mb-6 text-orange-600">Kitchen Buddiee</h1>

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8 shadow-md"
            >
                <h2 className="text-2xl font-semibold mb-4">Sign in to your account</h2>

                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Enter your username"
                    autoComplete="username"
                    aria-label="username"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-6 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-label="password"
                />

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-600 hover:underline"
                    >
                        Back to Home
                    </button>
                </div>

                <p className="mt-6 text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-orange-600 hover:underline">
                        Create one here
                    </Link>
                    .
                </p>
            </form>
        </div>
    );
}
