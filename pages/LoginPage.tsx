/**
 * Login/Register Page
 * 
 * Handles user authentication with Supabase Auth.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

type AuthMode = 'login' | 'register';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const t = {
    'cs-CZ': {
      title_login: 'Vítej zpět',
      title_register: 'Vytvoř si účet',
      subtitle_login: 'Přihlas se ke svému účtu',
      subtitle_register: 'Přidej se ke komunitě ICONIC',
      email_label: 'Email',
      email_placeholder: 'ty@example.com',
      password_label: 'Heslo',
      password_placeholder: '••••••••',
      forgot_password: 'Zapomenuté heslo?',
      submit_login: 'Přihlásit se',
      submit_register: 'Vytvořit účet',
      submitting_login: 'Přihlašuji...',
      submitting_register: 'Vytvářím účet...',
      toggle_no_account: 'Nemáš účet?',
      toggle_signup: 'Zaregistrovat se',
      toggle_have_account: 'Už máš účet?',
      toggle_signin: 'Přihlásit se',
      back_home: '← Zpět na hlavní stránku',
      register_success: 'Registrace proběhla úspěšně! Zkontroluj email pro ověření účtu.',
    },
    'en-US': {
      title_login: 'Welcome back',
      title_register: 'Create your account',
      subtitle_login: 'Sign in to access your account',
      subtitle_register: 'Join the ICONIC community',
      email_label: 'Email',
      email_placeholder: 'you@example.com',
      password_label: 'Password',
      password_placeholder: '••••••••',
      forgot_password: 'Forgot password?',
      submit_login: 'Sign In',
      submit_register: 'Create Account',
      submitting_login: 'Signing in...',
      submitting_register: 'Creating account...',
      toggle_no_account: "Don't have an account?",
      toggle_signup: 'Sign up',
      toggle_have_account: 'Already have an account?',
      toggle_signin: 'Sign in',
      back_home: '← Back to home',
      register_success: 'Registration successful! Please check your email to verify your account.',
    },
    'es-MX': {
      title_login: 'Bienvenida de nuevo',
      title_register: 'Crea tu cuenta',
      subtitle_login: 'Inicia sesión para acceder a tu cuenta',
      subtitle_register: 'Únete a la comunidad ICONIC',
      email_label: 'Correo',
      email_placeholder: 'tu@ejemplo.com',
      password_label: 'Contraseña',
      password_placeholder: '••••••••',
      forgot_password: '¿Olvidaste tu contraseña?',
      submit_login: 'Iniciar sesión',
      submit_register: 'Crear cuenta',
      submitting_login: 'Iniciando sesión...',
      submitting_register: 'Creando cuenta...',
      toggle_no_account: '¿No tienes cuenta?',
      toggle_signup: 'Regístrate',
      toggle_have_account: '¿Ya tienes cuenta?',
      toggle_signin: 'Inicia sesión',
      back_home: '← Volver al inicio',
      register_success: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
    },
  }[lang] || {
    title_login: 'Welcome back',
    title_register: 'Create your account',
    subtitle_login: 'Sign in to access your account',
    subtitle_register: 'Join the ICONIC community',
    email_label: 'Email',
    email_placeholder: 'you@example.com',
    password_label: 'Password',
    password_placeholder: '••••••••',
    forgot_password: 'Forgot password?',
    submit_login: 'Sign In',
    submit_register: 'Create Account',
    submitting_login: 'Signing in...',
    submitting_register: 'Creating account...',
    toggle_no_account: "Don't have an account?",
    toggle_signup: 'Sign up',
    toggle_have_account: 'Already have an account?',
    toggle_signin: 'Sign in',
    back_home: '← Back to home',
    register_success: 'Registration successful! Please check your email to verify your account.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await login(email, password);
        if (error) {
          setError(error);
        } else {
          navigate(from, { replace: true });
        }
      } else {
        const { error } = await register(email, password);
        if (error) {
          setError(error);
        } else {
          setSuccess(t.register_success);
          setMode('login');
        }
      }
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
            {mode === 'login' ? t.title_login : t.title_register}
          </h2>
          <p className="mt-2 text-sm text-white/80">
            {mode === 'login' ? t.subtitle_login : t.subtitle_register}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white/18 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/35 shadow-[0_16px_60px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-start gap-3">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-green-200 text-sm">{success}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
                  {t.email_label}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/10 focus:border-iconic-pink transition-all text-base"
                    placeholder={t.email_placeholder}
                  />
                </div>
              </div>

              {/* Password */}
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
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
            </div>

            {/* Forgot password link */}
            {mode === 'login' && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-white/90 hover:text-iconic-pink hover:underline"
                >
                  {t.forgot_password}
                </Link>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-iconic-pink to-purple-600 text-white font-bold py-3 sm:py-4 rounded-xl hover:shadow-[0_0_20px_rgba(183,6,109,0.6)] hover:scale-[1.02] transition-all transform border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'login' ? t.submitting_login : t.submitting_register}
                </span>
              ) : (
                mode === 'login' ? t.submit_login : t.submit_register
              )}
            </button>
          </div>

          {/* Toggle mode */}
          <p className="text-center text-gray-300">
            {mode === 'login' ? (
              <>
                {t.toggle_no_account}{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                  className="text-iconic-pink font-bold hover:underline"
                >
                  {t.toggle_signup}
                </button>
              </>
            ) : (
              <>
                {t.toggle_have_account}{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                  className="text-iconic-pink font-bold hover:underline"
                >
                  {t.toggle_signin}
                </button>
              </>
            )}
          </p>
        </form>

        {/* Back to home */}
        <div className="text-center">
          <Link to="/" className="text-gray-200 hover:text-white transition-colors text-sm">
            {t.back_home}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
