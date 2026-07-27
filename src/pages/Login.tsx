import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, API_ENDPOINTS } from '../constants/routes';
import api from '../api/axios';
import loginBg from '../assets/login-bg.png';
import logo from '../assets/logo.png';
import loginIllustration from '../assets/login_illustration.png';

const Login: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Sanitization de l'entrée :
            // Si ça ressemble à un email (@), on enlève les espaces et on met en minuscules.
            // Si c'est un matricule, on supprime TOUS les espaces et on met en MAJUSCULES (ex: 2026 ac 123 -> 2026AC123)
            const sanitizedEmail = email.includes('@')
                ? email.trim().toLowerCase()
                : email.trim().replace(/\s+/g, '').toUpperCase();

            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
                email: sanitizedEmail,
                password
            });

            const data = response.data;
            console.log("Backend Login Response:", data);
            console.log("Extracted ID from response:", data.id);
            console.log("Role from response:", data.role);
            login(data.token, {
                id: data.id,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                role: data.role,
                institution: data.institution,
                classe: data.classe,
                classes: data.classes
            });
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Identifiants invalides');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative pt-24 pb-12 lg:pt-16 lg:pb-0 px-4 transition-colors duration-500">
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl dark:shadow-blue-900/20 border border-white/50 dark:border-slate-700/50 relative z-10 flex flex-col lg:flex-row w-full max-w-5xl overflow-y-auto lg:overflow-hidden max-h-[calc(100vh-6rem)] lg:max-h-[95vh] rounded-2xl lg:rounded-3xl">
                <div className="p-6 md:p-8 w-full lg:w-[600px] shrink-0 overflow-y-auto custom-scrollbar relative">
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4 text-sm font-semibold">
                        <ArrowLeft size={16} /> Retour à l'accueil
                    </Link>
                    <div className="flex flex-col items-center mb-6">
                        <div className="shadow-lg inline-block rounded-full bg-white/20 dark:bg-white p-2 backdrop-blur-sm mb-2">
                            <img src={logo} alt="Logo" className="w-16 h-16 object-contain rounded-full" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-700 dark:from-blue-400 dark:to-indigo-300">
                            ACADEMIA CONNECT
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Plateforme de Gestion Scolaire</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 text-sm font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-600"></span>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Email ou Matricule</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all duration-200 rounded-xl"
                                        placeholder="nom@ecole.com ou 2026AC..."
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Mot de passe</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all duration-200 rounded-xl"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-slate-600 dark:text-slate-300 cursor-pointer">
                                <input type="checkbox" className="mr-2 text-blue-600 focus:ring-blue-500 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700" />
                                Se souvenir de moi
                            </label>
                            <Link to={ROUTES.FORGOT_PASSWORD} className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors">Mot de passe oublié ?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-800 to-indigo-700 dark:from-blue-600 dark:to-indigo-500 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-400 shadow-lg shadow-blue-900/20 dark:shadow-blue-900/40 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Accéder au Dashboard
                                </>
                            )}
                        </button>

                        <p className="text-center text-slate-500 dark:text-slate-400 text-sm pt-2">
                            Pas de compte ? <Link to={ROUTES.REGISTER} className="text-blue-700 dark:text-blue-400 font-bold hover:underline">S'inscrire</Link>
                        </p>
                    </form>

                    <div className="mt-4 text-center pt-4 flex flex-col items-center gap-4 border-t border-slate-100 dark:border-slate-800/50">
                        <p className="text-slate-500 dark:text-slate-500 text-xs">
                            © 2026 ACADEMIA CONNECT. <br /> Excellence en Gestion Éducative.
                        </p>
                    </div>
                </div>

                {/* Image on the right */}
                <div className="hidden lg:flex flex-1 items-center justify-center bg-blue-50/50 dark:bg-slate-800/50 relative min-w-[400px]">
                    <img src={loginIllustration} alt="Illustration de connexion" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                </div>
            </div>
        </div>
    );
};

export default Login;
