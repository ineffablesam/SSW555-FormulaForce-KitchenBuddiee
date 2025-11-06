import React, { useState, useEffect } from 'react';
import { X, Upload, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function EditProfileDialog({ isOpen, onClose, username, currentProfile, onSuccess }) {
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentProfile) {
            setBio(currentProfile.bio || '');
            setProfilePicture(currentProfile.profilePicture || '');
            setPreviewUrl(currentProfile.profilePicture || '');
        }
    }, [currentProfile]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setProfilePicture(base64String);
                setPreviewUrl(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:4000/api/auth/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    bio: bio.trim(),
                    profilePicture
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            toast.success('Profile updated successfully!');
            onSuccess(data.profile);
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveImage = () => {
        setProfilePicture('');
        setPreviewUrl('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close dialog"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">
                            Profile Picture
                        </label>

                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Profile preview"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-orange-100"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center border-4 border-orange-200">
                                        <UserIcon size={48} className="text-orange-500" />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md">
                                        <Upload size={18} />
                                        <span className="font-medium">Upload</span>
                                    </div>
                                </label>

                                {previewUrl && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                Max size: 5MB. Formats: JPG, PNG, GIF
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="bio" className="block text-sm font-semibold text-gray-700">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            maxLength={200}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Optional</span>
                            <span>{bio.length}/200</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}