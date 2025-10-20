import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // small client-side validation rules
    const validate = () => {
        if (!username.trim() || !password) {
            setError('Username and password are required.');
            return false;
        }
        if (username.length < 3) {
            setError('Username must be at least 3 characters.');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return false;
        }
        if (password !== confirm) {
            setError("Passwords don't match.");
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
            // Adjust endpoint if your backend uses a different path
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username.trim(), password }),
            });

            const body = await res.json().catch(() => ({}));

            if (res.ok) {
                setSuccess('Account created. Redirecting to sign-in...');
                setError('');
                // short delay so user sees the success message
                setTimeout(() => navigate('/auth'), 1200);
            } else {
                // handle common server responses
                if (res.status === 409) {
                    // 409 Conflict => username already exists
                    setError(body.message || 'Username already exists.');
                } else if (res.status === 400) {
                    setError(body.message || 'Invalid request data.');
                } else {
                    setError(body.message || `Server error (${res.status}).`);
                }
            }
        } catch (err) {
            setError('Network error or server unreachable.');
            // eslint-disable-next-line no-console
            console.error(err);
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
                <h2 className="text-2xl font-semibold mb-4">Create an account</h2>

                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Choose a username"
                    autoComplete="username"
                    aria-label="username"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Enter a password"
                    autoComplete="new-password"
                    aria-label="password"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full mb-6 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    aria-label="confirm-password"
                />

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create account'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-600 hover:underline"
                    >
                        Back to Home
                    </button>
                </div>
            </form>

            <p className="mt-6 text-xs text-gray-400">We store credentials in MongoDB on the server. Usernames must be unique.</p>
        </div>
    );
}