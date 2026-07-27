import React, { useState } from 'react';
import { Mail, Lock, User, UserCircle, LogIn, ArrowLeft, Loader2, Phone, Briefcase, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, API_ENDPOINTS } from '../constants/routes';
import api from '../api/axios';
import logo from '../assets/logo.png';
import registerIllustration from '../assets/register_illustration.png';

const Register: React.FC = () => {
    const { } = useAuth();
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

            // Redirect to verify email page with the email address
            navigate(ROUTES.VERIFY, { state: { email: formData.email } });
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative pt-24 pb-12 lg:pt-16 lg:pb-0 px-4 transition-colors duration-500">
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl dark:shadow-blue-900/20 border border-white/50 dark:border-slate-700/50 relative z-10 flex flex-col lg:flex-row w-full md:w-auto md:max-w-7xl overflow-y-auto lg:overflow-hidden max-h-[calc(100vh-6rem)] lg:max-h-[95vh] rounded-2xl lg:rounded-3xl">

                {/* Image on the left */}
                <div className="hidden lg:flex flex-1 items-center justify-center bg-blue-50/50 dark:bg-slate-800/50 relative min-w-[400px]">
                    <img src={registerIllustration} alt="Illustration d'inscription" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                </div>

                <div className="p-6 md:p-8 w-full lg:max-w-4xl shrink-0 overflow-y-auto custom-scrollbar relative">
                    <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4 text-sm font-semibold">
                        <ArrowLeft size={16} /> Retour à l'accueil
                    </Link>
                    <div className="flex flex-col items-center mb-6">
                        <div className="shadow-lg inline-block rounded-full bg-white/20 dark:bg-white p-2 backdrop-blur-sm mb-4">
                            <img src={logo} alt="Logo" className="w-16 h-16 object-contain rounded-full" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-blue-900 dark:text-blue-400">Inscription</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium text-center">Créez votre compte (PDG ou Parent).</p>
                    </div>

                    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="md:col-span-2 lg:col-span-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-bold border border-red-200 dark:border-red-800/50">
                                {error}
                            </div>
                        )}
                        <div className="col-span-1">
                            <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Prénom</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User size={18} />
                                </div>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none rounded-xl transition-all duration-200" placeholder="Nasaire" required />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Nom</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <UserCircle size={18} />
                                </div>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none rounded-xl transition-all duration-200" placeholder="BESSAN" required />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Téléphone</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Phone size={18} />
                                </div>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none rounded-xl transition-all duration-200" placeholder="+237 686 013 300" required />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Je suis un(e)</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none font-bold text-slate-900 dark:text-white rounded-xl transition-all duration-200 appearance-none">
                                <option value="PDG">PDG d'établissement</option>
                                <option value="PARENT">Parent d'élève</option>
                            </select>
                        </div>

                        {/* schoolCode removed for Parent registration as per new workflow */}

                        <div className="md:col-span-2">
                            <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Adresse Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none rounded-xl transition-all duration-200" placeholder="votre@email.com" required />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Adresse Géographique</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none rounded-xl transition-all duration-200" placeholder="Ex: Tchad, N'Djamena, Diguel" />
                        </div>

                        <div className="md:col-span-1 lg:col-span-2">
                            <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Mot de passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-12 py-2 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none rounded-xl transition-all duration-200" placeholder="••••••••" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-1 lg:col-span-2">
                            <label className="block text-slate-700 dark:text-slate-200 text-sm font-semibold mb-2 ml-1">Confirmer le mot de passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-12 py-2 bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:outline-none rounded-xl transition-all duration-200" placeholder="••••••••" required />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-4 space-y-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-800 to-indigo-700 dark:from-blue-600 dark:to-indigo-500 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-400 shadow-lg shadow-blue-900/20 dark:shadow-blue-900/40 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        <LogIn size={20} /> Créer mon compte
                                    </>
                                )}
                            </button>
                            <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
                                Déjà inscrit ? <Link to={ROUTES.LOGIN} className="text-blue-700 dark:text-blue-400 font-bold hover:underline">Connectez-vous</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
