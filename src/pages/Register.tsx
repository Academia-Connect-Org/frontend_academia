import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserCircle, LogIn, ArrowLeft, Loader2, Phone, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, API_ENDPOINTS } from '../constants/routes';
import api from '../api/axios';
import logo from '../assets/logo.png';
import registerIllustration from '../assets/register_illustration.png';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'PDG',
        address: '',
        schoolCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (pass: string) => {
        const hasLetter = /[a-zA-Z]/.test(pass);
        const hasNumber = /\d/.test(pass);
        const hasSpecial = /[;!:?,&~/=*#]/.test(pass);
        const isValidLength = pass.length >= 8;
        return hasLetter && hasNumber && hasSpecial && isValidLength;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePassword(formData.password)) {
            setError('Le mot de passe doit contenir au moins 8 caractères, une lettre, un chiffre et un caractère spécial (; ! : ? , & ~ / = * #).');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { confirmPassword, ...registerData } = formData;
            await api.post(API_ENDPOINTS.AUTH.REGISTER, registerData);
            navigate(ROUTES.VERIFY, { state: { email: formData.email } });
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative pt-20 pb-6 px-4 transition-colors duration-500 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-sky-500/10 dark:bg-sky-500/15 blur-[130px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl dark:shadow-sky-950/30 border border-slate-200/80 dark:border-slate-800 relative z-10 flex flex-col lg:flex-row w-full max-w-5xl max-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl md:rounded-3xl"
            >
                {/* Left Illustration Column */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="hidden lg:flex flex-1 items-center justify-center bg-slate-100 dark:bg-slate-800/50 relative overflow-hidden"
                >
                    <img
                        src={registerIllustration}
                        alt="Illustration d'inscription"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </motion.div>

                {/* Right Form Column */}
                <div className="p-6 md:p-10 w-full lg:w-[600px] shrink-0 relative flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-7rem)]">
                    <div>
                        <Link
                            to={ROUTES.HOME}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors mb-6"
                        >
                            <ArrowLeft size={14} /> Retour à l'accueil
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
                                Créer votre compte
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
                                Choisissez votre rôle (Fondateur d'école ou Parent d'élève)
                            </p>
                        </div>

                        <GoogleLoginButton
                            label="S'inscrire avec Google"
                            role={formData.role}
                            schoolCode={formData.schoolCode}
                            askRole={true}
                            onError={(err) => setError(err)}
                        />

                        <div className="relative my-4 flex items-center justify-center">
                            <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
                            <span className="absolute bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                OU REMPLIR LE FORMULAIRE
                            </span>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-medium border border-red-200 dark:border-red-900/50 flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                        Prénom
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <User size={15} />
                                        </div>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                            placeholder="Nasaire"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                        Nom
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <UserCircle size={15} />
                                        </div>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                            placeholder="BESSAN"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                        Téléphone
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Phone size={15} />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                            placeholder="+237 696 73 18 37"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                        Je suis un(e)
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs font-semibold rounded-xl transition-all"
                                    >
                                        <option value="PDG">Fondateur d'école (PDG)</option>
                                        <option value="PARENT">Parent d'élève</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                    Adresse Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                        placeholder="votre@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                    Adresse Géographique
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                    placeholder="Ex: Tchad, N'Djamena, Diguel"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Lock size={15} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                        Confirmer le mot de passe
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Lock size={15} />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <LogIn size={16} />
                                        Créer mon compte
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-slate-500 dark:text-slate-400 text-xs pt-3">
                            Déjà un compte ?{' '}
                            <Link to={ROUTES.LOGIN} className="text-sky-600 dark:text-sky-400 font-bold hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-slate-400 dark:text-slate-500 text-[11px]">
                            © 2026 Academia Connect. Excellence & Innovation Éducative.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
