import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES, API_ENDPOINTS } from '../constants/routes';
import api from '../api/axios';
import loginBg from '../assets/login-bg.png';
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
        <div className="min-h-screen lg:h-screen flex items-center justify-center bg-slate-50 relative py-12 lg:py-0 px-4 lg:overflow-hidden">
            <div className="bg-white/95 backdrop-blur-md shadow-2xl relative z-10 flex flex-col lg:flex-row w-full max-w-5xl lg:max-h-[90vh] lg:h-full rounded-none border-none">
                <div className="p-8 md:p-10 w-full lg:w-[600px] shrink-0 overflow-y-auto custom-scrollbar">
                    <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 text-sm font-semibold">
                        <ArrowLeft size={16} /> Retour à la connexion
                    </Link>
                    
                    <div className="flex flex-col items-center mb-8">
                        <img src={logo} alt="Logo" className="w-20 h-20 mb-4 object-contain" />
                        <h1 className="text-2xl font-extrabold text-blue-900 text-center">
                            Mot de passe oublié
                        </h1>
                        <p className="text-slate-500 font-medium mt-1 text-center text-sm">
                            {step === 'email' 
                                ? "Entrez votre email pour recevoir un code de récupération." 
                                : "Entrez le code reçu par email et votre nouveau mot de passe."}
                        </p>
                    </div>

                    {message && (
                        <div className="bg-emerald-50 text-emerald-600 px-4 py-3 text-sm font-bold flex items-center gap-2 mb-6">
                            <CheckCircle size={18} />
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 text-sm font-bold flex items-center gap-2 mb-6">
                            <span className="w-1.5 h-1.5 bg-red-600"></span>
                            {error}
                        </div>
                    )}

                    {step === 'email' ? (
                        <form className="space-y-6" onSubmit={handleSendCode}>
                            <div>
                                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Email professionnel</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                        placeholder="nom@ecole.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-800 to-indigo-700 text-white font-bold py-4 hover:from-blue-700 hover:to-indigo-600 shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 rounded-none"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : "Envoyer le code"}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleResetPassword}>
                            <div>
                                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Code de vérification</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-mono tracking-widest text-lg"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Nouveau mot de passe</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <KeyRound size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Confirmer le mot de passe</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <KeyRound size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-800 to-indigo-700 text-white font-bold py-4 hover:from-blue-700 hover:to-indigo-600 shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2 rounded-none"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : "Réinitialiser"}
                            </button>
                            
                            <button 
                                type="button" 
                                disabled={timeLeft > 0}
                                onClick={() => setStep('email')}
                                className={`w-full text-sm font-semibold transition-colors py-2 inline-block ${
                                    timeLeft > 0 
                                        ? 'text-slate-400 cursor-not-allowed' 
                                        : 'text-slate-500 hover:text-blue-600 hover:scale-105 animate-pulse'
                                }`}
                            >
                                {timeLeft > 0 ? `Renvoyer un code dans ${timeLeft}s` : "Renvoyer un code"}
                            </button>
                        </form>
                    )}
                </div>
                <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-blue-900 to-[#0A192F] items-center justify-center p-12 overflow-hidden">
                    <img src={loginIllustration} alt="Illustration" className="relative z-10 w-full max-w-md object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
