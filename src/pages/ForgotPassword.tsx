import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES, API_ENDPOINTS } from '../constants/routes';
import api from '../api/axios';
import logo from '../assets/logo.png';
import loginIllustration from '../assets/login_illustration.png';

const ForgotPassword: React.FC = () => {
    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (step === 'reset' && timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft, step]);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
            setStep('reset');
            setTimeLeft(60);
            setMessage('Un code de réinitialisation a été envoyé à votre adresse email.');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Impossible d'envoyer le code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
                email,
                code,
                newPassword
            });
            setStep('email');
            setMessage('Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Erreur lors de la réinitialisation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative py-12 px-4 transition-colors duration-500 overflow-x-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-80 bg-sky-500/10 dark:bg-sky-500/15 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl dark:shadow-sky-950/30 border border-slate-200/80 dark:border-slate-800 relative z-10 flex flex-col lg:flex-row w-full max-w-4xl overflow-hidden rounded-2xl md:rounded-3xl"
            >
                {/* Left Form Column */}
                <div className="p-6 md:p-10 w-full lg:w-[500px] shrink-0 relative flex flex-col justify-between">
                    <div>
                        <Link
                            to={ROUTES.LOGIN}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors mb-6"
                        >
                            <ArrowLeft size={14} /> Retour à la connexion
                        </Link>

                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="p-1 bg-transparent dark:bg-white rounded-xl transition-transform duration-300 mb-3 flex items-center justify-center">
                                <img
                                    src={logo}
                                    alt="Logo Academia Connect"
                                    className="h-10 w-10 object-contain rounded-lg"
                                />
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Récupération du mot de passe
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
                                {step === 'email'
                                    ? "Saisissez votre adresse email pour recevoir votre code"
                                    : "Saisissez le code reçu et choisissez votre nouveau mot de passe"}
                            </p>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-medium border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 mb-4"
                            >
                                <CheckCircle size={16} className="shrink-0 text-emerald-500" />
                                {message}
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs font-medium border border-red-200 dark:border-red-900/50 flex items-center gap-2 mb-4"
                            >
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {step === 'email' ? (
                            <form className="space-y-4" onSubmit={handleSendCode}>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5 ml-1">
                                        Email professionnel
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                            placeholder="nom@ecole.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Envoyer le code de vérification"}
                                </button>
                            </form>
                        ) : (
                            <form className="space-y-4" onSubmit={handleResetPassword}>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5 ml-1">
                                        Code de vérification (6 chiffres)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs font-mono tracking-widest transition-all rounded-xl"
                                            placeholder="000000"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5 ml-1">
                                        Nouveau mot de passe
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <KeyRound size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5 ml-1">
                                        Confirmer le mot de passe
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <KeyRound size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Réinitialiser le mot de passe"}
                                </button>

                                <button
                                    type="button"
                                    disabled={timeLeft > 0}
                                    onClick={() => setStep('email')}
                                    className={`w-full text-xs font-semibold transition-colors py-2 text-center block ${
                                        timeLeft > 0
                                            ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                            : 'text-sky-600 dark:text-sky-400 hover:underline'
                                    }`}
                                >
                                    {timeLeft > 0 ? `Renvoyer un code dans ${timeLeft}s` : "Renvoyer un code"}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="mt-8 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-slate-400 dark:text-slate-500 text-[11px]">
                            © 2026 Academia Connect. Excellence & Innovation Éducative.
                        </p>
                    </div>
                </div>

                {/* Right Illustration Column */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="hidden lg:flex flex-1 items-center justify-center bg-slate-100 dark:bg-slate-800/50 relative overflow-hidden"
                >
                    <img
                        src={loginIllustration}
                        alt="Illustration de récupération"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
