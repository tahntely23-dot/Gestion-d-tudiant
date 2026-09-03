import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Users,
  Award,
  CalendarCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabaseConfigError } from '../../lib/supabase';

export const LoginView: React.FC = () => {
  const { login, signup, loginWithOAuth, resetPassword } = useSchool();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form States
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // General Loading & Status States
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(supabaseConfigError);

  // Validation States
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
    registerEmail?: string;
    registerPassword?: string;
    confirmPassword?: string;
    forgotEmail?: string;
  }>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const validateEmailFormat = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    const errors = { ...fieldErrors };

    if (field === 'email') {
      if (!email.trim()) {
        errors.email = 'Veuillez renseigner votre adresse email.';
      } else if (!validateEmailFormat(email)) {
        errors.email = 'Format d\'adresse email invalide.';
      } else {
        delete errors.email;
      }
    }

    if (field === 'password') {
      if (!password) {
        errors.password = 'Veuillez saisir votre mot de passe.';
      } else if (password.length < 6) {
        errors.password = 'Le mot de passe doit comporter au moins 6 caractères.';
      } else {
        delete errors.password;
      }
    }

    if (field === 'fullName') {
      if (!fullName.trim()) {
        errors.fullName = 'Veuillez renseigner votre nom complet.';
      } else if (fullName.trim().length < 3) {
        errors.fullName = 'Le nom doit comporter au moins 3 caractères.';
      } else {
        delete errors.fullName;
      }
    }

    if (field === 'registerEmail') {
      if (!registerEmail.trim()) {
        errors.registerEmail = 'Veuillez renseigner votre adresse email.';
      } else if (!validateEmailFormat(registerEmail)) {
        errors.registerEmail = 'Format d\'adresse email invalide.';
      } else {
        delete errors.registerEmail;
      }
    }

    if (field === 'registerPassword') {
      if (!registerPassword) {
        errors.registerPassword = 'Veuillez définir un mot de passe.';
      } else if (registerPassword.length < 6) {
        errors.registerPassword = 'Le mot de passe doit comporter au moins 6 caractères.';
      } else {
        delete errors.registerPassword;
      }
    }

    if (field === 'confirmPassword') {
      if (!confirmPassword) {
        errors.confirmPassword = 'Veuillez confirmer votre mot de passe.';
      } else if (confirmPassword !== registerPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
      } else {
        delete errors.confirmPassword;
      }
    }

    if (field === 'forgotEmail') {
      if (!forgotEmail.trim()) {
        errors.forgotEmail = 'Veuillez renseigner votre adresse email.';
      } else if (!validateEmailFormat(forgotEmail)) {
        errors.forgotEmail = 'Format d\'adresse email invalide.';
      } else {
        delete errors.forgotEmail;
      }
    }

    setFieldErrors(errors);
    return !errors[field as keyof typeof errors];
  };

  // Login Submit Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedFields({ email: true, password: true });

    const isEmailValid = email.trim() && validateEmailFormat(email);
    const isPassValid = password && password.length >= 6;

    if (!isEmailValid || !isPassValid) {
      setFieldErrors({
        email: !email.trim() ? 'Veuillez renseigner votre adresse email.' : (!isEmailValid ? 'Format d\'adresse email invalide.' : undefined),
        password: !password ? 'Veuillez saisir votre mot de passe.' : (password.length < 6 ? 'Le mot de passe doit comporter au moins 6 caractères.' : undefined),
      });
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        setErrorMessage(result.error || 'Email ou mot de passe incorrect.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register Submit Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedFields({
      fullName: true,
      registerEmail: true,
      registerPassword: true,
      confirmPassword: true,
    });

    const isNameValid = fullName.trim().length >= 3;
    const isEmailValid = registerEmail.trim() && validateEmailFormat(registerEmail);
    const isPassValid = registerPassword.length >= 6;
    const isConfirmValid = registerPassword === confirmPassword;

    if (!isNameValid || !isEmailValid || !isPassValid || !isConfirmValid) {
      setFieldErrors({
        fullName: !isNameValid ? 'Le nom doit comporter au moins 3 caractères.' : undefined,
        registerEmail: !isEmailValid ? 'Format d\'adresse email invalide.' : undefined,
        registerPassword: !isPassValid ? 'Le mot de passe doit comporter au moins 6 caractères.' : undefined,
        confirmPassword: !isConfirmValid ? 'Les mots de passe ne correspondent pas.' : undefined,
      });
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await signup(registerEmail, registerPassword, fullName);
      if (result.success) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setErrorMessage(result.error || 'Impossible de créer le compte. Veuillez réessayer.');
      }
    } catch (err) {
      setErrorMessage('Une erreur est survenue lors de l\'inscription.');
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth Handler (Google / Facebook)
  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setErrorMessage(null);
    setOauthLoading(provider);

    try {
      const result = await loginWithOAuth(provider);
      if (result.success) {
        // The browser is redirected to the provider; the session is restored on callback.
        return;
      }
      setErrorMessage(
        result.error ||
          (provider === 'google'
            ? 'Connexion Google impossible. Veuillez réessayer.'
            : 'Connexion Facebook impossible. Veuillez réessayer.')
      );
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          (provider === 'google'
            ? 'Connexion Google impossible. Veuillez réessayer.'
            : 'Connexion Facebook impossible. Veuillez réessayer.')
      );
    } finally {
      setOauthLoading(null);
    }
  };

  // Forgot Password Handler
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedFields((prev) => ({ ...prev, forgotEmail: true }));

    if (!forgotEmail.trim() || !validateEmailFormat(forgotEmail)) {
      setFieldErrors((prev) => ({
        ...prev,
        forgotEmail: !forgotEmail.trim()
          ? 'Veuillez renseigner votre adresse email.'
          : 'Format d\'adresse email invalide.',
      }));
      return;
    }

    setForgotLoading(true);
    setErrorMessage(null);

    try {
      await resetPassword(forgotEmail);
      setForgotSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(false);
        setForgotEmail('');
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.forgotEmail;
          return next;
        });
      }, 2500);
    } catch (err) {
      setFieldErrors((prev) => ({
        ...prev,
        forgotEmail: 'Erreur lors de l\'envoi du lien. Veuillez réessayer.',
      }));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden text-[#1F2937] font-sans antialiased"
      style={{ backgroundColor: '#EAF5F4' }}
    >
      {/* Subtle Pastel Ambient Glows & Gradients */}
      <div
        className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-60 pointer-events-none"
        style={{ backgroundColor: '#A9DDE1' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-50 pointer-events-none"
        style={{ backgroundColor: '#CDE8DC' }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[420px] h-[420px] rounded-full blur-[110px] opacity-40 pointer-events-none"
        style={{ backgroundColor: '#C9C9E8' }}
      />
      {/* Very faint pink glow touch as requested */}
      <div
        className="absolute bottom-1/4 left-1/3 w-[360px] h-[360px] rounded-full blur-[130px] opacity-35 pointer-events-none"
        style={{ backgroundColor: '#F6E8F0' }}
      />

      {/* Main Container: 2-Column Responsive Layout */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: Clean Identity & Soft Showcase Presentation     */}
        {/* ============================================================ */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4">
          
          {/* Brand Header */}
          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-md shadow-[#1597A3]/20"
                style={{ backgroundColor: '#1597A3' }}
              >
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1597A3]">
                  Plateforme Scolaire
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937]">
                  Student Management System
                </h1>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="text-3xl xl:text-4xl font-extrabold text-[#1F2937] leading-tight">
                Une gestion scolaire <br />
                <span className="text-[#1597A3]">simple</span> et <span className="text-[#7C83D9]">moderne</span>.
              </h2>
              <p className="text-base text-[#64748B] leading-relaxed max-w-md">
                Gérez facilement les étudiants, les classes, les notes et les absences au sein d’une interface douce et intuitive.
              </p>
            </div>
          </div>

          {/* Discreet Pastel Floating Elements */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs transition-all hover:bg-white/85">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#1597A3] shrink-0"
                style={{ backgroundColor: '#EAF5F4' }}
              >
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F2937]">Suivi des élèves & classes</h4>
                <p className="text-xs text-[#64748B]">Registres centralisés et fiches détaillées</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs transition-all hover:bg-white/85">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#7C83D9] shrink-0"
                style={{ backgroundColor: '#C9C9E8' }}
              >
                <Award className="w-5 h-5 text-[#4B52B0]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F2937]">Évaluations & bulletins</h4>
                <p className="text-xs text-[#64748B]">Calculs automatiques des moyennes trimestrielles</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs transition-all hover:bg-white/85">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-700 shrink-0"
                style={{ backgroundColor: '#CDE8DC' }}
              >
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F2937]">Feuilles de présences</h4>
                <p className="text-xs text-[#64748B]">Pointage rapide en temps réel et justificatifs</p>
              </div>
            </div>
          </div>

          {/* Bottom simple footnote */}
          <p className="text-xs text-[#64748B] pt-2">
            © {new Date().getFullYear()} Student Management System • Espace d’administration sécurisé
          </p>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Modern Pastel Glassmorphism Login / Sign Up Card */}
        {/* ============================================================ */}
        <div className="w-full lg:col-span-6">
          <div className="rounded-3xl p-6 sm:p-9 md:p-10 bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_20px_50px_rgba(21,151,163,0.09)] transition-all">
            
            {/* Mobile Brand Identifier */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: '#1597A3' }}
              >
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-[#1F2937]">
                  Student Management System
                </h1>
                <p className="text-[11px] text-[#64748B]">Gestion scolaire moderne</p>
              </div>
            </div>

            {/* Header of the Card */}
            <div className="mb-6 space-y-1">
              <div className="inline-block text-sm font-semibold text-[#1597A3]">
                {mode === 'login' ? 'Bienvenue 👋' : 'Nouveau compte 👋'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
                {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créer un compte'}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                {mode === 'login'
                  ? 'Accédez à votre espace de gestion scolaire.'
                  : 'Rejoignez votre plateforme de gestion scolaire.'}
              </p>
            </div>

            {/* Global Error Alert Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="flex-1">{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-400 hover:text-rose-700 font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ============================================================ */}
            {/* OAUTH BUTTONS: Google & Facebook                             */}
            {/* ============================================================ */}
            <div className="space-y-2.5 mb-5">
              {/* Google OAuth Button */}
              <button
                type="button"
                id="btn-oauth-google"
                disabled={isLoading || oauthLoading !== null}
                onClick={() => handleOAuth('google')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-gray-50/90 active:bg-gray-100 text-[#1F2937] text-xs sm:text-sm font-semibold rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1597A3]" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                )}
                <span>Continuer avec Google</span>
              </button>

              {/* Facebook OAuth Button */}
              <button
                type="button"
                id="btn-oauth-facebook"
                disabled={isLoading || oauthLoading !== null}
                onClick={() => handleOAuth('facebook')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-gray-50/90 active:bg-gray-100 text-[#1F2937] text-xs sm:text-sm font-semibold rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'facebook' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1877F2]" />
                ) : (
                  <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
                <span>Continuer avec Facebook</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="w-full border-t border-gray-200" />
              <span className="absolute px-3 bg-white/90 text-[11px] font-medium text-[#64748B] uppercase tracking-wider rounded-full backdrop-blur-xs">
                {mode === 'login'
                  ? 'Ou continuer avec votre adresse email'
                  : 'Ou inscrivez-vous avec votre adresse email'}
              </span>
            </div>

            {/* ============================================================ */}
            {/* MODE 1: LOGIN FORM                                           */}
            {/* ============================================================ */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#1F2937]">
                      Adresse email
                    </label>
                    {touchedFields.email && !fieldErrors.email && email.trim() && (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Email valide
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                        fieldErrors.email ? 'text-rose-500' : 'text-[#64748B]'
                      }`}
                    />
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (touchedFields.email) {
                          const errs = { ...fieldErrors };
                          if (!e.target.value.trim()) {
                            errs.email = 'Veuillez renseigner votre adresse email.';
                          } else if (!validateEmailFormat(e.target.value)) {
                            errs.email = 'Format d\'adresse email invalide.';
                          } else {
                            delete errs.email;
                          }
                          setFieldErrors(errs);
                        }
                      }}
                      onBlur={() => handleFieldBlur('email')}
                      placeholder="Entrez votre adresse email"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        fieldErrors.email
                          ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30'
                          : 'bg-white border border-gray-200 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1597A3]/30 focus:border-[#1597A3]'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#1F2937]">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(true);
                        setErrorMessage(null);
                      }}
                      className="text-xs font-semibold text-[#1597A3] hover:text-[#107680] hover:underline cursor-pointer"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                        fieldErrors.password ? 'text-rose-500' : 'text-[#64748B]'
                      }`}
                    />
                    <input
                      id="input-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (touchedFields.password) {
                          const errs = { ...fieldErrors };
                          if (!e.target.value) {
                            errs.password = 'Veuillez saisir votre mot de passe.';
                          } else if (e.target.value.length < 6) {
                            errs.password = 'Le mot de passe doit comporter au moins 6 caractères.';
                          } else {
                            delete errs.password;
                          }
                          setFieldErrors(errs);
                        }
                      }}
                      onBlur={() => handleFieldBlur('password')}
                      placeholder="Entrez votre mot de passe"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        fieldErrors.password
                          ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30'
                          : 'bg-white border border-gray-200 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1597A3]/30 focus:border-[#1597A3]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{fieldErrors.password}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isLoading || oauthLoading !== null}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #1597A3 0%, #11818B 60%, #7C83D9 100%)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ============================================================ */
              /* MODE 2: REGISTER FORM                                        */
              /* ============================================================ */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5" noValidate>
                {/* Full Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#1F2937]">
                      Nom complet
                    </label>
                    {touchedFields.fullName && !fieldErrors.fullName && fullName.trim().length >= 3 && (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valide
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <User
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                        fieldErrors.fullName ? 'text-rose-500' : 'text-[#64748B]'
                      }`}
                    />
                    <input
                      id="input-register-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (touchedFields.fullName) {
                          const errs = { ...fieldErrors };
                          if (!e.target.value.trim()) {
                            errs.fullName = 'Veuillez renseigner votre nom complet.';
                          } else if (e.target.value.trim().length < 3) {
                            errs.fullName = 'Le nom doit comporter au moins 3 caractères.';
                          } else {
                            delete errs.fullName;
                          }
                          setFieldErrors(errs);
                        }
                      }}
                      onBlur={() => handleFieldBlur('fullName')}
                      placeholder="Entrez votre nom complet"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        fieldErrors.fullName
                          ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30'
                          : 'bg-white border border-gray-200 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1597A3]/30 focus:border-[#1597A3]'
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{fieldErrors.fullName}</span>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#1F2937]">
                      Adresse email
                    </label>
                    {touchedFields.registerEmail && !fieldErrors.registerEmail && registerEmail.trim() && (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Email valide
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                        fieldErrors.registerEmail ? 'text-rose-500' : 'text-[#64748B]'
                      }`}
                    />
                    <input
                      id="input-register-email"
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => {
                        setRegisterEmail(e.target.value);
                        if (touchedFields.registerEmail) {
                          const errs = { ...fieldErrors };
                          if (!e.target.value.trim()) {
                            errs.registerEmail = 'Veuillez renseigner votre adresse email.';
                          } else if (!validateEmailFormat(e.target.value)) {
                            errs.registerEmail = 'Format d\'adresse email invalide.';
                          } else {
                            delete errs.registerEmail;
                          }
                          setFieldErrors(errs);
                        }
                      }}
                      onBlur={() => handleFieldBlur('registerEmail')}
                      placeholder="Entrez votre adresse email"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        fieldErrors.registerEmail
                          ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30'
                          : 'bg-white border border-gray-200 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1597A3]/30 focus:border-[#1597A3]'
                      }`}
                    />
                  </div>
                  {fieldErrors.registerEmail && (
                    <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{fieldErrors.registerEmail}</span>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                        fieldErrors.registerPassword ? 'text-rose-500' : 'text-[#64748B]'
                      }`}
                    />
                    <input
                      id="input-register-password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      value={registerPassword}
                      onChange={(e) => {
                        setRegisterPassword(e.target.value);
                        if (touchedFields.registerPassword) {
                          const errs = { ...fieldErrors };
                          if (!e.target.value) {
                            errs.registerPassword = 'Veuillez définir un mot de passe.';
                          } else if (e.target.value.length < 6) {
                            errs.registerPassword = 'Le mot de passe doit comporter au moins 6 caractères.';
                          } else {
                            delete errs.registerPassword;
                          }
                          setFieldErrors(errs);
                        }
                      }}
                      onBlur={() => handleFieldBlur('registerPassword')}
                      placeholder="Créez votre mot de passe (min. 6 car.)"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        fieldErrors.registerPassword
                          ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30'
                          : 'bg-white border border-gray-200 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1597A3]/30 focus:border-[#1597A3]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.registerPassword && (
                    <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{fieldErrors.registerPassword}</span>
                    </div>
                  )}
                </div>

                {/* Password Confirmation Field */}
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    Confirmation du mot de passe
                  </label>
                  <div className="relative">
                    <Lock
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                        fieldErrors.confirmPassword ? 'text-rose-500' : 'text-[#64748B]'
                      }`}
                    />
                    <input
                      id="input-register-confirm"
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (touchedFields.confirmPassword) {
                          const errs = { ...fieldErrors };
                          if (!e.target.value) {
                            errs.confirmPassword = 'Veuillez confirmer votre mot de passe.';
                          } else if (e.target.value !== registerPassword) {
                            errs.confirmPassword = 'Les mots de passe ne correspondent pas.';
                          } else {
                            delete errs.confirmPassword;
                          }
                          setFieldErrors(errs);
                        }
                      }}
                      onBlur={() => handleFieldBlur('confirmPassword')}
                      placeholder="Confirmez votre mot de passe"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        fieldErrors.confirmPassword
                          ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30'
                          : 'bg-white border border-gray-200 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1597A3]/30 focus:border-[#1597A3]'
                      }`}
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{fieldErrors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                {/* Submit Register Button */}
                <button
                  id="btn-register-submit"
                  type="submit"
                  disabled={isLoading || oauthLoading !== null}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #1597A3 0%, #11818B 60%, #7C83D9 100%)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Création du compte...</span>
                    </>
                  ) : (
                    <>
                      <span>Créer mon compte</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Switch between Login & Register */}
            <div className="mt-6 pt-5 border-t border-gray-200/80 text-center">
              {mode === 'login' ? (
                <p className="text-xs sm:text-sm text-[#64748B]">
                  Vous n'avez pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-[#1597A3] hover:text-[#107680] hover:underline cursor-pointer transition-colors ml-1"
                  >
                    Créer un compte
                  </button>
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-[#64748B]">
                  Vous avez déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="font-bold text-[#1597A3] hover:text-[#107680] hover:underline cursor-pointer transition-colors ml-1"
                  >
                    Se connecter
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FORGOT PASSWORD MODAL                                        */}
      {/* ============================================================ */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-2xl p-6 sm:p-7 relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess(false);
              }}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: '#1597A3' }}
              >
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1F2937]">Mot de passe oublié</h3>
                <p className="text-xs text-[#64748B]">Récupération sécurisée de compte</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#1F2937]">Email envoyé avec succès</h4>
                <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                  Un lien de réinitialisation sécurisé a été transmis à votre adresse email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4" noValidate>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Entrez votre adresse email ci-dessous. Nous vous enverrons les instructions pour réinitialiser votre mot de passe.
                </p>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#1F2937]">
                      Adresse email
                    </label>
                    {touchedFields.forgotEmail && !fieldErrors.forgotEmail && forgotEmail.trim() && (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Email valide
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                        fieldErrors.forgotEmail ? 'text-rose-500' : 'text-[#64748B]'
                      }`}
                    />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (touchedFields.forgotEmail) {
                          const errs = { ...fieldErrors };
                          if (!e.target.value.trim()) {
                            errs.forgotEmail = 'Veuillez renseigner votre adresse email.';
                          } else if (!validateEmailFormat(e.target.value)) {
                            errs.forgotEmail = 'Format d\'adresse email invalide.';
                          } else {
                            delete errs.forgotEmail;
                          }
                          setFieldErrors(errs);
                        }
                      }}
                      onBlur={() => handleFieldBlur('forgotEmail')}
                      placeholder="Entrez votre adresse email"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all ${
                        fieldErrors.forgotEmail
                          ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30'
                          : 'bg-white border border-gray-200 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1597A3]/30 focus:border-[#1597A3]'
                      }`}
                    />
                  </div>
                  {fieldErrors.forgotEmail && (
                    <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{fieldErrors.forgotEmail}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1F2937] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-2"
                    style={{ backgroundColor: '#1597A3' }}
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <span>Envoyer le lien</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
