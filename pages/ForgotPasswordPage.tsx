/**
 * Forgot Password Page
 * 
 * Allows users to request a password reset email.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { lang } = useLanguage();

  const t = {
    'cs-CZ': {
      title: 'Zapomenuté heslo',
      subtitle: 'Zadejte svůj email a pošleme vám odkaz pro obnovení hesla.',
      email_label: 'Email',
      email_placeholder: 'vas@email.cz',
      submit: 'Odeslat odkaz',
      sending: 'Odesílám...',
      success_title: 'Email odeslán!',
      success_message: 'Zkontrolujte svou emailovou schránku a klikněte na odkaz pro obnovení hesla.',
      back_to_login: 'Zpět na přihlášení',
      back_to_home: '← Zpět na hlavní stránku',
      error_generic: 'Něco se pokazilo. Zkuste to prosím znovu.',
    },
    'en-US': {
      title: 'Forgot Password',
      subtitle: 'Enter your email and we\'ll send you a link to reset your password.',
      email_label: 'Email',
      email_placeholder: 'you@example.com',
      submit: 'Send Reset Link',
      sending: 'Sending...',
      success_title: 'Email sent!',
      success_message: 'Check your inbox and click the link to reset your password.',
      back_to_login: 'Back to login',
      back_to_home: '← Back to home',
      error_generic: 'Something went wrong. Please try again.',
    },
  }[lang] || {
    title: 'Forgot Password',
    subtitle: 'Enter your email and we\'ll send you a link to reset your password.',
    email_label: 'Email',
    email_placeholder: 'you@example.com',
    submit: 'Send Reset Link',
    sending: 'Sending...',
    success_title: 'Email sent!',
    success_message: 'Check your inbox and click the link to reset your password.',
    back_to_login: 'Back to login',
    back_to_home: '← Back to home',
    error_generic: 'Something went wrong. Please try again.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t.error_generic);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-iconic-black via-gray-900 to-iconic-black py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-iconic-pink/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-iconic-blue/10 rounded-full blur-[100px]"></div>

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
          <p className="mt-2 text-sm text-gray-400 px-4">
            {t.subtitle}
          </p>
        </div>

        {success ? (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t.success_title}</h3>
            <p className="text-gray-400 mb-6">{t.success_message}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-iconic-pink font-bold hover:underline"
            >
              <ArrowLeft size={18} />
              {t.back_to_login}
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl">
              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

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
                    className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-iconic-pink transition-all text-base"
                    placeholder={t.email_placeholder}
                  />
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
                    {t.sending}
                  </span>
                ) : (
                  t.submit
                )}
              </button>
            </div>

            {/* Back to login */}
            <p className="text-center">
              <Link to="/login" className="text-iconic-pink font-bold hover:underline inline-flex items-center gap-2">
                <ArrowLeft size={18} />
                {t.back_to_login}
              </Link>
            </p>
          </form>
        )}

        {/* Back to home */}
        <div className="text-center">
          <Link to="/" className="text-gray-500 hover:text-white transition-colors text-sm">
            {t.back_to_home}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
