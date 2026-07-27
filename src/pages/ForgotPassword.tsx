import React, { useState, useEffect } from 'react';
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
            setMessage('Un code de réinitialisation a été envoyé à votre email.');
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
            setStep('email'); // Reset or redirect to login
            setMessage('Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Erreur lors de la réinitialisation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative pt-24 pb-12 lg:pt-16 lg:pb-0 px-4 transition-colors duration-500">
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl dark:shadow-blue-900/20 border border-white/50 dark:border-slate-700/50 relative z-10 flex flex-col lg:flex-row w-full max-w-5xl overflow-y-auto lg:overflow-hidden max-h-[calc(100vh-6rem)] lg:max-h-[95vh] rounded-2xl lg:rounded-3xl">
                <div className="p-6 md:p-8 w-full lg:w-[600px] shrink-0 overflow-y-auto custom-scrollbar relative">
                    <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4 text-sm font-semibold">
                        <ArrowLeft size={16} /> Retour à la connexion
                    </Link>

                    <div className="flex flex-col items-center mb-6">
                        <div className="shadow-lg inline-block rounded-full bg-white/20 dark:bg-white p-2 backdrop-blur-sm mb-2">
                            <img src={logo} alt="Logo" className="w-16 h-16 object-contain rounded-full" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-700 dark:from-blue-400 dark:to-indigo-300 text-center">
                            Mot de passe oublié
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-center text-sm">
                            {step === 'email'
                                ? "Entrez votre email pour recevoir un code de récupération."
                                : "Entrez le code reçu par email et votre nouveau mot de passe."}
                        </p>
                    </div>

                    {message && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 text-sm font-bold flex items-center gap-2 mb-4 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                            <CheckCircle size={18} />
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 text-sm font-bold flex items-center gap-2 mb-4 rounded-lg border border-red-200 dark:border-red-800/50">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                            {error}
                        </div>
                    )}

                    {step === 'email' ? (
                        <form className="space-y-4" onSubmit={handleSendCode}>
                            <div>
                                <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Email professionnel</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all duration-200 rounded-xl"
                                        placeholder="nom@ecole.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-800 to-indigo-700 dark:from-blue-600 dark:to-indigo-500 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-400 shadow-lg shadow-blue-900/20 dark:shadow-blue-900/40 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : "Envoyer le code"}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleResetPassword}>
                            <div>
                                <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Code de vérification</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all duration-200 rounded-xl font-mono tracking-widest text-lg"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Nouveau mot de passe</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <KeyRound size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all duration-200 rounded-xl"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Confirmer le mot de passe</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <KeyRound size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all duration-200 rounded-xl"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-800 to-indigo-700 dark:from-blue-600 dark:to-indigo-500 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-400 shadow-lg shadow-blue-900/20 dark:shadow-blue-900/40 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : "Réinitialiser"}
                            </button>

                            <button
                                type="button"
                                disabled={timeLeft > 0}
                                onClick={() => setStep('email')}
                                className={`w-full text-sm font-semibold transition-colors py-2 inline-block ${timeLeft > 0
                                    ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 animate-pulse'
                                    }`}
                            >
                                {timeLeft > 0 ? `Renvoyer un code dans ${timeLeft}s` : "Renvoyer un code"}
                            </button>
                        </form>
                    )}

                    <div className="mt-4 text-center pt-4 flex flex-col items-center gap-4 border-t border-slate-100 dark:border-slate-800/50">
                        <p className="text-slate-500 dark:text-slate-500 text-xs">
                            © 2026 ACADEMIA CONNECT. <br /> Excellence en Gestion Éducative.
                        </p>
                    </div>
                </div>

                {/* Image on the right */}
                <div className="hidden lg:flex flex-1 items-center justify-center bg-blue-50/50 dark:bg-slate-800/50 relative min-w-[400px]">
                    <img src={loginIllustration} alt="Illustration de récupération" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
