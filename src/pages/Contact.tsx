import React, { useState } from 'react';
import { Mail, User, Phone, Send, MessageSquare, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { ROUTES } from '../constants/routes';

const Contact: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        whatsapp: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            await api.post('/contact', formData);
            setStatus('success');
            setFormData({ firstName: '', lastName: '', email: '', whatsapp: '', message: '' });
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.response?.data || "Une erreur s'est produite lors de l'envoi de votre message.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 px-4 transition-colors duration-500 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-sky-500/10 dark:bg-sky-500/15 blur-[130px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link
                    to={ROUTES.HOME}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors mb-6"
                >
                    <ArrowLeft size={14} /> Retour à l'accueil
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl dark:shadow-sky-950/30 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Left Info Column */}
                    <div className="bg-gradient-to-br from-sky-900 to-blue-950 p-8 md:p-10 text-white md:w-2/5 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 blur-[100px] pointer-events-none" />

                        <div className="relative z-10">
                            <div className="p-1 bg-white rounded-xl shadow-sm mb-6 w-fit flex items-center justify-center">
                                <img src={logo} alt="Logo Academia Connect" className="h-9 w-9 object-contain rounded-lg" />
                            </div>

                            <h2 className="text-2xl font-bold tracking-tight mb-3">Contactez-nous</h2>
                            <p className="text-xs text-sky-200/90 leading-relaxed mb-8 font-normal">
                                Une question sur nos fonctionnalités, nos tarifs ou besoin d'une démonstration personnalisée ? Notre équipe vous répond sous 24h.
                            </p>

                            <div className="space-y-4 text-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Mail size={15} className="text-sky-300" />
                                    </div>
                                    <span className="font-medium text-sky-100">academiaconnects@gmail.com</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                        <Phone size={15} className="text-sky-300" />
                                    </div>
                                    <div className="font-medium text-sky-100 leading-relaxed">
                                        +237 6 86 01 33 00<br />
                                        +229 67 00 49 61
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-8 mt-8 border-t border-white/10">
                            <p className="text-[11px] text-sky-300/70 font-medium">
                                © 2026 Academia Connect. Tous droits réservés.
                            </p>
                        </div>
                    </div>

                    {/* Right Form Column */}
                    <div className="p-8 md:p-10 md:w-3/5">
                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8"
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                                    <CheckCircle2 size={36} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Message envoyé !</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                                    Nous avons bien reçu votre demande et nous vous recontacterons très rapidement.
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-4 px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors"
                                >
                                    Envoyer un autre message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {status === 'error' && (
                                    <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl border border-red-200 dark:border-red-900/50">
                                        {errorMessage}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                            Prénom <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                                placeholder="Narcisse"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                            Nom <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                                placeholder="Hell-Bina"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                        Adresse Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                            placeholder="narcisse.hellbina@ecole.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                        WhatsApp <span className="text-slate-400 font-normal">(Optionnel)</span>
                                    </label>
                                    <div className="relative">
                                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl"
                                            placeholder="+237 696 73 18 37"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1 ml-1">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MessageSquare size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                        <textarea
                                            required
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs transition-all rounded-xl resize-y"
                                            placeholder="Expliquez-nous votre besoin..."
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                >
                                    {status === 'loading' ? 'Envoi en cours...' : (
                                        <>Envoyer le message <Send size={15} /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
