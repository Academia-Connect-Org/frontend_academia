import React, { useState, useEffect } from 'react';
import { Mail, Lock, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, API_ENDPOINTS } from '../constants/routes';
import api from '../api/axios';
import loginBg from '../assets/login-bg.png';
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
        <div className="min-h-screen lg:h-screen flex items-center justify-center bg-slate-50 relative py-12 lg:py-0 px-4 lg:overflow-hidden">
            <div className="bg-white/95 backdrop-blur-md shadow-2xl relative z-10 flex flex-col lg:flex-row w-full max-w-5xl lg:max-h-[90vh] lg:h-full rounded-none border-none">
                <div className="p-8 md:p-10 w-full lg:w-[600px] shrink-0 overflow-y-auto custom-scrollbar">
                    <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 text-sm font-semibold">
                        <ArrowLeft size={16} /> Retour à la connexion
                    </Link>

                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="bg-blue-50 p-4 mb-4">
                            <Mail className="w-12 h-12 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-blue-900">Vérifiez votre email</h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Nous avons envoyé un code de confirmation à <br />
                            <span className="text-blue-600 font-bold">{email || "votre email"}</span>
                        </p>
                    </div>

                    {success ? (
                        <div className="flex flex-col items-center py-8 animate-in fade-in zoom-in duration-500">
                            <div className="bg-green-100 p-4 mb-4">
                                <CheckCircle className="w-16 h-16 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Email vérifié !</h2>
                            <p className="text-slate-500 text-center mt-2 font-medium">
                                Votre compte a été activé avec succès. <br />
                                Redirection en cours...
                            </p>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Code de confirmation</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none text-center tracking-[0.5em] text-xl font-bold"
                                        placeholder="000000"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-800 to-indigo-700 text-white font-bold py-3 px-4 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed rounded-none"
                            >
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    "Vérifier mon compte"
                                )}
                            </button>

                            <p className="text-center text-slate-500 text-sm mt-4">
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
                                    className={`font-bold mt-2 transition-all inline-block ${
                                        timeLeft > 0 
                                            ? 'text-slate-400 cursor-not-allowed' 
                                            : 'text-blue-700 hover:text-blue-800 hover:scale-105 animate-pulse'
                                    }`}
                                >
                                    {timeLeft > 0 ? `Renvoyer l'email dans ${timeLeft}s` : "Renvoyer l'email"}
                                </button>
                            </p>
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

export default VerifyEmail;
