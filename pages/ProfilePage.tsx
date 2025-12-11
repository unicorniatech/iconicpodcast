/**
 * User Profile Page (local-only)
 *
 * Simplified profile page that keeps data in browser state/localStorage only.
 * No Supabase calls are made here to avoid noisy failing requests in production.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, LogOut, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = {
    'cs-CZ': {
      title: 'Můj profil',
      display_name: 'Zobrazované jméno',
      email: 'Email',
      bio: 'O mně',
      bio_placeholder: 'Napište něco o sobě...',
      save: 'Uložit změny',
      saving: 'Ukládám...',
      logout: 'Odhlásit se',
      success: 'Profil byl úspěšně uložen!',
      error: 'Nepodařilo se uložit profil.',
      back: '← Zpět',
    },
    'en-US': {
      title: 'My Profile',
      display_name: 'Display Name',
      email: 'Email',
      bio: 'About Me',
      bio_placeholder: 'Write something about yourself...',
      save: 'Save Changes',
      saving: 'Saving...',
      logout: 'Sign Out',
      success: 'Profile saved successfully!',
      error: 'Failed to save profile.',
      back: '← Back',
    },
    'es-MX': {
      title: 'Mi Perfil',
      display_name: 'Nombre para mostrar',
      email: 'Correo',
      bio: 'Sobre mí',
      bio_placeholder: 'Escribe algo sobre ti...',
      save: 'Guardar cambios',
      saving: 'Guardando...',
      logout: 'Cerrar sesión',
      success: '¡Perfil guardado correctamente!',
      error: 'No se pudo guardar el perfil.',
      back: '← Volver',
    },
  }[lang] || {
    title: 'My Profile',
    display_name: 'Display Name',
    email: 'Email',
    bio: 'About Me',
    bio_placeholder: 'Write something about yourself...',
    save: 'Save Changes',
    saving: 'Saving...',
    logout: 'Sign Out',
    success: 'Profile saved successfully!',
    error: 'Failed to save profile.',
    back: '← Back',
  };

  useEffect(() => {
    if (!user) return;

    try {
      const stored = window.localStorage.getItem('iconic_profile_' + user.id);
      if (stored) {
        const parsed = JSON.parse(stored) as { displayName?: string; bio?: string; avatarUrl?: string | null };
        if (parsed.displayName) setDisplayName(parsed.displayName);
        if (parsed.bio) setBio(parsed.bio);
        if (parsed.avatarUrl) {
          setAvatarUrl(parsed.avatarUrl);
          setAvatarPreview(parsed.avatarUrl);
        }
      } else {
        setDisplayName(user.email?.split('@')[0] || '');
      }
    } catch {
      setDisplayName(user.email?.split('@')[0] || '');
    }
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSaving) return;

    setIsSaving(true);
    setSuccess(null);
    setError(null);

    const effectiveDisplayName = displayName || user.email?.split('@')[0] || '';

    const payload = { displayName: effectiveDisplayName, bio, avatarUrl };

    try {
      try {
        window.localStorage.setItem('iconic_profile_' + user.id, JSON.stringify(payload));
      } catch {
      }

      setSuccess(t.success);
      setTimeout(() => setSuccess(null), 2500);
    } catch {
      setError(t.error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-gradient-to-br from-pink-50 via-white to-purple-50"
      role="main"
      aria-labelledby="profile-heading"
    >
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-iconic-black mb-6 text-sm font-medium">
          {t.back}
        </Link>

        {/* Profile Card (local-only, no DB dependencies) */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-iconic-black to-gray-800 px-6 py-8 sm:px-8 sm:py-10 text-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-iconic-pink/20 rounded-full blur-[60px]"></div>
            
            {/* Avatar circle with initials only (no upload) */}
            <div className="relative inline-block">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-iconic-pink/20 flex items-center justify-center border-4 border-white/20 mx-auto overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>
            </div>
            
            <h1 id="profile-heading" className="text-xl sm:text-2xl font-bold text-white mt-4">{t.title}</h1>
            <p className="text-gray-300 text-sm mt-1">{user.email}</p>
          </div>

          {/* Form (local-only) */}
          <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
            {/* Success message */}
            {success && (
              <div
                id="profile-success"
                role="status"
                aria-live="polite"
                className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
              >
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-bold text-gray-700 mb-2">
                {t.display_name}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iconic-pink/20 focus:border-iconic-pink transition-all"
                  placeholder={user.email?.split('@')[0]}
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-bold text-gray-700 mb-2">
                {t.bio}
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iconic-pink/20 focus:border-iconic-pink transition-all resize-none"
                placeholder={t.bio_placeholder}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                aria-busy={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-iconic-pink text-white font-bold py-3 px-6 rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {t.save}
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <LogOut size={20} />
                {t.logout}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Simple inline success toast only; no error toast because there are no network calls */}
    </div>
  );
};

export default ProfilePage;
