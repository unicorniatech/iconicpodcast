/**
 * Reset Password Page
 * 
 * Allows users to set a new password after clicking the reset link.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const t = {
    'cs-CZ': {
      title: 'Nové heslo',
      subtitle: 'Zadejte své nové heslo.',
      password_label: 'Nové heslo',
      confirm_label: 'Potvrdit heslo',
      password_placeholder: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
      submit: 'Nastavit heslo',
      saving: 'Ukládám...',
      success_title: 'Heslo změněno!',
      success_message: 'Vaše heslo bylo úspěšně změněno. Nyní se můžete přihlásit.',
      go_to_login: 'Přejít na přihlášení',
      back_to_home: '\u2190 Zpět na hlavní stránku',
      error_mismatch: 'Hesla se neshodují.',
      error_short: 'Heslo musí mít alespoň 6 znaků.',
      error_invalid: 'Neplatný nebo expirovaný odkaz. Požádejte o nový.',
      error_generic: 'Něco se pokazilo. Zkuste to prosím znovu.',
    },
    'en-US': {
      title: 'New Password',
      subtitle: 'Enter your new password.',
      password_label: 'New Password',
      confirm_label: 'Confirm Password',
      password_placeholder: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
      submit: 'Set Password',
      saving: 'Saving...',
      success_title: 'Password Changed!',
      success_message: 'Your password has been successfully changed. You can now sign in.',
      go_to_login: 'Go to Login',
      back_to_home: '\u2190 Back to home',
      error_mismatch: 'Passwords do not match.',
      error_short: 'Password must be at least 6 characters.',
      error_invalid: 'Invalid or expired link. Please request a new one.',
      error_generic: 'Something went wrong. Please try again.',
    },
    'es-MX': {
      title: 'Nueva contraseña',
      subtitle: 'Ingresa tu nueva contraseña.',
      password_label: 'Nueva contraseña',
      confirm_label: 'Confirmar contraseña',
      password_placeholder: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
      submit: 'Guardar contraseña',
      saving: 'Guardando...',
      success_title: '\u00a1Contraseña cambiada!',
      success_message: 'Tu contraseña se ha cambiado correctamente. Ahora puedes iniciar sesión.',
      go_to_login: 'Ir a iniciar sesión',
      back_to_home: '\u2190 Volver al inicio',
      error_mismatch: 'Las contraseñas no coinciden.',
      error_short: 'La contraseña debe tener al menos 6 caracteres.',
      error_invalid: 'Enlace no válido o expirado. Solicita uno nuevo.',
      error_generic: 'Algo salió mal. Inténtalo de nuevo.',
    },
  }[lang] || {
    title: 'New Password',
    subtitle: 'Enter your new password.',
    password_label: 'New Password',
    confirm_label: 'Confirm Password',
    password_placeholder: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
    submit: 'Set Password',
    saving: 'Saving...',
    success_title: 'Password Changed!',
    success_message: 'Your password has been successfully changed. You can now sign in.',
    go_to_login: 'Go to Login',
    back_to_home: '\u2190 Back to home',
    error_mismatch: 'Passwords do not match.',
    error_short: 'Password must be at least 6 characters.',
    error_invalid: 'Invalid or expired link. Please request a new one.',
    error_generic: 'Something went wrong. Please try again.',
  };

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        setError(t.error_invalid);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t.error_short);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.error_mismatch);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Sign out after password change
        await supabase.auth.signOut();
      }
    } catch {
      setError(t.error_generic);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-iconic-pink/40 rounded-full blur-[140px]"></div>
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-iconic-blue/30 rounded-full blur-[130px]"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <span className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
              I<span className="text-iconic-pink">|</span>CONIC
            </span>
          </Link>
          <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-white">
            {t.title}
          </h2>
          <p className="mt-2 text-sm text-white/80">
            {t.subtitle}
          </p>
        </div>

        {success ? (
          <div className="bg-white/18 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/35 shadow-[0_16px_60px_rgba(0,0,0,0.75)] text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t.success_title}</h3>
            <p className="text-gray-300 mb-6">{t.success_message}</p>
            <Link
              to="/login"
              className="inline-block w-full bg-gradient-to-r from-iconic-pink to-purple-600 text-white font-bold py-3 sm:py-4 rounded-xl hover:shadow-[0_0_20px_rgba(183,6,109,0.6)] transition-all text-center"
            >
              {t.go_to_login}
            </Link>
          </div>
        ) : !isValidSession && error ? (
          <div className="bg-white/18 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/35 shadow-[0_16px_60px_rgba(0,0,0,0.75)] text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-400" size={32} />
            </div>
            <p className="text-red-200 mb-6">{error}</p>
            <Link
              to="/forgot-password"
              className="inline-block w-full bg-gradient-to-r from-iconic-pink to-purple-600 text-white font-bold py-3 sm:py-4 rounded-xl hover:shadow-[0_0_20px_rgba(183,6,109,0.6)] transition-all text-center"
            >
              Request New Link
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="bg-white/18 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/35 shadow-[0_16px_60px_rgba(0,0,0,0.75)]">
              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-5">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
                    {t.password_label}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 sm:py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/10 focus:border-iconic-pink transition-all text-base"
                      placeholder={t.password_placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
                    {t.confirm_label}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/10 focus:border-iconic-pink transition-all text-base"
                      placeholder={t.password_placeholder}
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-iconic-pink to-purple-600 text-white font-bold py-3 sm:py-4 rounded-xl hover:shadow-[0_0_20px_rgba(183,6,109,0.6)] hover:scale-[1.02] transition-all transform border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t.saving}
                  </span>
                ) : (
                  t.submit
                )}
              </button>
            </div>
          </form>
        )}

        {/* Back to home */}
        <div className="text-center">
          <Link to="/" className="text-gray-200 hover:text-white transition-colors text-sm">
            {t.back_to_home}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
