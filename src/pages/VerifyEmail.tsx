import React, { useState, useEffect } from 'react';
import { Mail, Lock, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, API_ENDPOINTS } from '../constants/routes';
import api from '../api/axios';
import logo from '../assets/logo.png';
import loginIllustration from '../assets/login_illustration.png';

const VerifyEmail: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
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

    // Get email from location state (passed from Register page)
    const email = location.state?.email || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Email manquant. Veuillez vous réinscrire.");
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

            // Short delay to show success message before redirecting/logging in
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
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-700 dark:from-blue-400 dark:to-indigo-300">
                            Vérifiez votre email
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1 text-center">
                            Nous avons envoyé un code de confirmation à <br />
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{email || "votre email"}</span>
                        </p>
                    </div>

                    {success ? (
                        <div className="flex flex-col items-center py-8 animate-in fade-in zoom-in duration-500">
                            <div className="bg-green-100 dark:bg-green-900/30 p-4 mb-4 rounded-full">
                                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Email vérifié !</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-center mt-2 font-medium">
                                Votre compte a été activé avec succès. <br />
                                Redirection en cours...
                            </p>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 text-sm font-bold flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800/50">
                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Code de confirmation</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all duration-200 rounded-xl text-center tracking-[0.5em] text-xl font-bold"
                                        placeholder="000000"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-800 to-indigo-700 dark:from-blue-600 dark:to-indigo-500 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-400 shadow-lg shadow-blue-900/20 dark:shadow-blue-900/40 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    "Vérifier mon compte"
                                )}
                            </button>

                            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-4">
                                Vous n'avez pas reçu le code ? <br />
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
                                    className={`font-bold mt-2 transition-all inline-block ${timeLeft > 0
                                            ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                            : 'text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:scale-105 animate-pulse'
                                        }`}
                                >
                                    {timeLeft > 0 ? `Renvoyer l'email dans ${timeLeft}s` : "Renvoyer l'email"}
                                </button>
                            </p>
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
                    <img src={loginIllustration} alt="Illustration de vérification" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
