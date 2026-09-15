import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, API_ENDPOINTS } from '../constants/routes';
import api from '../api/axios';
import logo from '../assets/logo.png';
import loginIllustration from '../assets/login_illustration.png';

const VerifyEmail: React.FC = () => {
    const location = useLocation();
    const { login } = useAuth();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const email = location.state?.email || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Email manquant. Veuillez recommencer l'inscription.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post(API_ENDPOINTS.AUTH.VERIFY, {
                email,
                code
            });

            const data = response.data;
            setSuccess(true);

            setTimeout(() => {
                login(data.token, {
                    id: data.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role,
                    classe: data.classe,
                    classes: data.classes
                });
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Code invalide");
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
                                Vérification de votre compte
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">
                                Un code de confirmation à 6 chiffres a été envoyé à <br />
                                <span className="text-sky-600 dark:text-sky-400 font-semibold">{email || "votre adresse email"}</span>
                            </p>
                        </div>

                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="flex flex-col items-center text-center py-6"
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle size={36} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Compte vérifié avec succès !</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Redirection vers votre espace en cours...
                                </p>
                            </motion.div>
                        ) : (
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs font-medium border border-red-200 dark:border-red-900/50 flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
                                        {error}
                                    </motion.div>
                                )}

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5 text-center">
                                        Entrez votre code à 6 chiffres
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-center tracking-[0.4em] text-lg font-bold transition-all rounded-xl"
                                            placeholder="000000"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Vérifier mon compte"}
                                </button>

                                <div className="text-center pt-2">
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">
                                        Vous n'avez pas reçu le code ?
                                    </p>
                                    <button
                                        type="button"
                                        disabled={timeLeft > 0 || loading}
                                        onClick={async () => {
                                            setLoading(true);
                                            setError('');
                                            try {
                                                await api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
                                                setTimeLeft(60);
                                            } catch (err: any) {
                                                setError(err.response?.data?.message || err.message || "Impossible de renvoyer le code.");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className={`text-xs font-semibold transition-colors ${
                                            timeLeft > 0
                                                ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                                : 'text-sky-600 dark:text-sky-400 hover:underline'
                                        }`}
                                    >
                                        {timeLeft > 0 ? `Renvoyer l'email dans ${timeLeft}s` : "Renvoyer le code par email"}
                                    </button>
                                </div>
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
                        alt="Illustration de vérification"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
