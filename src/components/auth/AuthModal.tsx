'use client';

import React, { useState } from 'react';
import { useAuthStore, AuthModalMode } from '@/store/useAuthStore';
import { usePlaylistStore } from '@/store/usePlaylistStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  UserPlus,
  Cloud,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

interface AuthModalContentProps {
  initialMode: AuthModalMode;
}

function AuthModalContent({ initialMode }: AuthModalContentProps) {
  const {
    setAuthModalOpen,
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
    isLoading,
    error,
    isCloudConnected,
  } = useAuthStore();

  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessNotice(null);

    if (mode === 'signup') {
      const res = await signUp(email, password, displayName);
      if (res.success) {
        if (res.requiresEmailConfirmation) {
          setEmailConfirmationPending(true);
          setSuccessNotice(res.message || 'Confirmation email sent! Please check your inbox.');
        } else {
          usePlaylistStore.getState().loadPlaylists();
          const data = useAuthStore.getState().getUserData();
          usePlayerStore.getState().hydrateAccountData(data);
        }
      } else if (res.error) {
        setLocalError(res.error);
      }
    } else if (mode === 'signin') {
      const res = await signIn(email, password);
      if (res.success) {
        usePlaylistStore.getState().loadPlaylists();
        const data = useAuthStore.getState().getUserData();
        usePlayerStore.getState().hydrateAccountData(data);
      } else if (res.error) {
        setLocalError(res.error);
      }
    } else if (mode === 'reset') {
      const res = await resetPassword(email);
      if (res.success) {
        setSuccessNotice(res.message || 'Password reset link sent! Please check your inbox.');
      } else if (res.error) {
        setLocalError(res.error);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setSuccessNotice(null);
    const res = await signInWithGoogle();
    if (!res.success && res.error) {
      if (res.error.includes('provider is not enabled') || res.error.includes('Unsupported provider')) {
        setLocalError('Google OAuth is not yet enabled in this Supabase project. Please use email & password or configure Google in the Supabase Dashboard.');
      } else {
        setLocalError(res.error);
      }
    }
  };

  const handleClose = () => {
    setAuthModalOpen(false);
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-[99999] z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-[32px] glass-panel bg-theme-surface/95 border border-theme-subtle p-6 md:p-8 shadow-2xl backdrop-blur-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
            {mode === 'reset' ? <KeyRound className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <h2 id="auth-modal-title" className="text-xl md:text-2xl font-black text-theme-primary tracking-tight">
            {mode === 'signin'
              ? 'Welcome Back to AyahFlow'
              : mode === 'signup'
              ? 'Join AyahFlow'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-theme-secondary max-w-xs">
            {mode === 'signin'
              ? 'Sign in to access your personal playlists and synced listening history across all devices.'
              : mode === 'signup'
              ? 'Sign up with Google in one tap to instantly sync your surahs and playlists anywhere.'
              : 'Enter your account email address and we will send you a password reset link.'}
          </p>
        </div>

        {/* EMAIL CONFIRMATION PENDING SCREEN */}
        {emailConfirmationPending ? (
          <div className="flex flex-col items-center text-center gap-4 py-4 px-2 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Mail className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-theme-primary">Check Your Inbox</h3>
              <p className="text-xs text-theme-secondary leading-relaxed">
                We sent a confirmation link to <span className="font-semibold text-emerald-600 dark:text-emerald-400">{email}</span>.
              </p>
              <p className="text-[11px] text-theme-muted">
                Click the link in the email to activate your account, then come back here to sign in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmailConfirmationPending(false);
                setMode('signin');
                setSuccessNotice('Account created! Sign in once you have verified your email link.');
              }}
              className="mt-2 py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* HERO GOOGLE OAUTH BUTTON (SPOTIFY / 1-CLICK STYLE) */}
            {mode !== 'reset' && isCloudConnected && (
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="group relative w-full py-3.5 px-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 text-zinc-800 dark:text-zinc-100 text-sm font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/5 hover:shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {/* Google SVG Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
                  <span className="hidden sm:inline-block ml-auto text-[10px] font-semibold uppercase tracking-wider py-0.5 px-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    1-Click
                  </span>
                </button>

                <p className="text-[11px] text-center text-theme-muted">
                  No password required • Instant cross-device playlist sync
                </p>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-1">
                  <div className="w-full border-t border-theme-subtle" />
                  <span className="absolute bg-theme-surface px-3 text-[10px] font-bold uppercase tracking-wider text-theme-muted">
                    Or with email & password
                  </span>
                </div>
              </div>
            )}

            {/* Mode Selector Tabs (Sign In / Create Account) */}
            {mode !== 'reset' ? (
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-theme-elevated border border-theme-subtle">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setLocalError(null);
                    setSuccessNotice(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'signin'
                      ? 'bg-theme-surface text-theme-primary shadow-sm'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setLocalError(null);
                    setSuccessNotice(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'signup'
                      ? 'bg-theme-surface text-theme-primary shadow-sm'
                      : 'text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setLocalError(null);
                  setSuccessNotice(null);
                }}
                className="self-start text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            )}

            {/* Error Alert */}
            {displayError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                <span className="shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{displayError}</span>
              </div>
            )}

            {/* Success Notice */}
            {successNotice && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successNotice}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {mode === 'signup' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-theme-secondary">Display Name</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-theme-muted absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ashar"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-theme-elevated border border-theme-subtle text-xs md:text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-theme-secondary">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-theme-muted absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-theme-elevated border border-theme-subtle text-xs md:text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-theme-secondary">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('reset');
                          setLocalError(null);
                          setSuccessNotice(null);
                        }}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-theme-muted absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 rounded-xl bg-theme-elevated border border-theme-subtle text-xs md:text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 text-theme-muted hover:text-theme-primary transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin mr-1">⌛</span>
                ) : mode === 'signin' ? (
                  <LogIn className="w-4 h-4" />
                ) : mode === 'signup' ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                <span>
                  {isLoading
                    ? 'Connecting...'
                    : mode === 'signin'
                    ? 'Sign In'
                    : mode === 'signup'
                    ? 'Create Account'
                    : 'Send Reset Link'}
                </span>
              </button>
            </form>
          </>
        )}

        {/* Security Notice & Guest Dismiss */}
        <div className="flex flex-col items-center gap-2 pt-2 border-t border-theme-subtle">
          <div className="flex items-center gap-1.5 text-[10px] text-theme-muted text-center">
            {isCloudConnected ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Supabase Cloud Sync Active • Encrypted Cross-Device Access</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Local Sanctuary Mode • Client-Side Cryptography</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-[11px] text-theme-secondary hover:text-theme-primary underline underline-offset-4 cursor-pointer"
          >
            Continue as Guest Listener
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode } = useAuthStore();
  if (!isAuthModalOpen) return null;
  return <AuthModalContent key={authModalMode} initialMode={authModalMode} />;
}
