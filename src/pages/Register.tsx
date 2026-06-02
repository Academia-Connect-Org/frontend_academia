import React, { useState } from 'react';
import { Mail, Lock, User, UserCircle, LogIn, ArrowLeft, Loader2, Phone, Briefcase, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, API_ENDPOINTS } from '../constants/routes';
import api from '../api/axios';
import loginBg from '../assets/login-bg.png';
import logo from '../assets/logo.png';

const Register: React.FC = () => {
    const { } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'PARENT',
        address: ''
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

            // Redirect to verify email page with the email address
            navigate(ROUTES.VERIFY, { state: { email: formData.email } });
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative py-20 lg:py-32"
            style={{ backgroundImage: `url(${loginBg})` }}>
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>

            <div className="bg-white/95 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-2xl w-[95%] md:w-full max-w-2xl relative z-10 border border-white/20 my-10 lg:my-0">
                <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 text-sm font-semibold">
                    <ArrowLeft size={16} /> Retour à l'accueil
                </Link>

                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="Logo" className="w-20 h-20 mb-4 object-contain" />
                    <h1 className="text-3xl font-extrabold text-blue-900">Inscription Parents & Responsables</h1>
                    <p className="text-slate-500 font-medium text-center">Les comptes élèves sont créés uniquement par l'administration.</p>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="col-span-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                            {error}
                        </div>
                    )}
                    <div className="col-span-1">
                        <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Prénom</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                placeholder="Jean"
                                required
                            />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Nom</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <UserCircle size={18} />
                            </div>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                placeholder="Dupont"
                                required
                            />
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Adresse Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                placeholder="votre@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Téléphone</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Phone size={18} />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                placeholder="+225 00 00 00 00"
                                required
                            />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Je suis un(e)</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900"
                        >
                            <option value="PARENT">Parent d'élève</option>
                            <option value="PDG">PDG d'établissement</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Adresse Géographique</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            placeholder="Ex: Abidjan, Cocody"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Mot de passe</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-12 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Confirmer le mot de passe</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full pl-10 pr-12 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="col-span-2 space-y-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-800 to-indigo-700 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={20} /> Créer mon compte
                                </>
                            )}
                        </button>
                        <p className="text-center text-slate-500 text-sm">
                            Déjà inscrit ? <Link to={ROUTES.LOGIN} className="text-blue-700 font-bold">Connectez-vous</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
