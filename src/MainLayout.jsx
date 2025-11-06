import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ChefHat,
  Home,
  Info,
  User,
  Menu,
  X,
  BookOpen,
  Heart,
  Search,
  FolderOpen,
  ShoppingCart,
  LogOut,
  HelpCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import AuthDialog, { getCookie, deleteCookie } from './components/AuthDialog';
import DeleteAccountDialog from './components/DeleteAccountDialog';
import EditProfileDialog from './components/EditProfileDialog';

export default function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const dropdownRef = useRef(null);
  const username = getCookie('username');
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
    setShowDropdown(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/auth/profile/${username}`);
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleSignOut = () => {
    deleteCookie('username');
    window.location.reload();
  };

  const openDeleteAccountDialog = () => {
    if (!username) return;
    setShowDropdown(false);
    setIsOpen(false);
    setShowDeleteDialog(true);
  };

  const openEditProfile = () => {
    if (!username) return;
    setShowDropdown(false);
    setIsOpen(false);
    setShowEditProfile(true);
  };

  const handleAccountDeleted = () => {
    setShowDeleteDialog(false);
    deleteCookie('username');
    toast.success('Your account has been deleted.');
    setTimeout(() => {
      window.location.href = '/';
    }, 600);
  };

  const handleProfileUpdated = (updatedProfile) => {
    setUserProfile(updatedProfile);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/recipes', label: 'Recipes', icon: BookOpen },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { path: '/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/about', label: 'About', icon: Info },
    { path: `/categories/${username || ''}`, label: 'Categories', icon: FolderOpen }
  ];

  const isActive = (path) => location.pathname === path;

  const renderProfileAvatar = () => {
    if (userProfile?.profilePicture) {
      return (
        <img
          src={userProfile.profilePicture}
          alt={username}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-800">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white shadow-md'
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2 md:gap-3 group">
              <div className="relative">
                <ChefHat
                  size={32}
                  className="text-orange-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors duration-300">
                  Kitchen Buddiee
                </h1>
                <p className="hidden sm:block text-xs text-gray-500">Cook, Share, Enjoy</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${active ? 'text-orange-500 bg-orange-50' : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                      }`}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <button className="p-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300">
                <Search size={20} />
              </button>
              {username ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-md overflow-hidden"
                    aria-label="User menu"
                  >
                    {renderProfileAvatar()}
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden animate-fadeIn z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{username}</p>
                        {userProfile?.bio && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{userProfile.bio}</p>
                        )}
                      </div>
                      <button
                        onClick={openEditProfile}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <Edit size={18} />
                        <span>Edit Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <HelpCircle size={18} />
                        <span>Help</span>
                      </button>
                      <button
                        onClick={openDeleteAccountDialog}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={18} />
                        <span>Delete Account</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <User size={20} />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="py-4 space-y-2 border-t border-gray-100">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${active ? 'text-orange-500 bg-orange-50' : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                      }`}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300">
                  <Search size={20} />
                  <span>Search</span>
                </button>
                {username ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-50 text-orange-600 font-medium">
                      <span className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full font-bold overflow-hidden">
                        {userProfile?.profilePicture ? (
                          <img src={userProfile.profilePicture} alt={username} className="w-full h-full object-cover" />
                        ) : (
                          username.charAt(0).toUpperCase()
                        )}
                      </span>
                      <span>{username}</span>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          handleSignOut();
                        }}
                        className="ml-auto text-red-500 hover:underline"
                      >
                        Sign Out
                      </button>
                    </div>
                    <button
                      onClick={openEditProfile}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-all duration-300"
                    >
                      <Edit size={18} />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={openDeleteAccountDialog}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-all duration-300"
                    >
                      <Trash2 size={18} />
                      <span>Delete Account</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/signin"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all duration-300 shadow-md"
                  >
                    <User size={20} />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-16 md:pt-20">
        <Outlet />
      </main>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <AuthDialog
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(username) => {
          console.log('User signed in:', username);
          setShowAuth(false);
          window.location.reload();
        }}
        title="Sign in to continue"
        description="Sign in to access your recipes, or create an account to get started."
        defaultMode="signin"
      />

      <DeleteAccountDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        username={username}
        onDeleted={handleAccountDeleted}
      />

      <EditProfileDialog
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        username={username}
        currentProfile={userProfile}
        onSuccess={handleProfileUpdated}
      />
    </div>
  );
}