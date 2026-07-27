import React, { useState } from 'react';
import { Mail, User, Phone, Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';

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
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold uppercase tracking-widest text-xs transition-colors"
                >
                    <ArrowLeft size={16} /> Retour
                </button>

                <div className="bg-white rounded-none shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row">
                    {/* Left Section - Info */}
                    <div className="bg-blue-900 p-12 text-white md:w-2/5 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Contactez-nous</h2>
                            <p className="text-blue-200/80 mb-12 font-medium">
                                Remplissez ce formulaire pour toute question concernant nos tarifs, la mise en place de la plateforme, ou une demande de devis personnalisé.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-blue-100">
                                    <div className="w-10 h-10 bg-white/10 flex items-center justify-center shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <span className="font-medium">academiaconnects@gmail.com</span>
                                </div>
                                <div className="flex items-center gap-4 text-blue-100">
                                    <div className="w-10 h-10 bg-white/10 flex items-center justify-center shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <span className="font-medium">+237 6 86 01 33 00<br />+229 67 00 49 61</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Form */}
                    <div className="p-12 md:w-3/5">
                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12"
                            >
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                                    <Send size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800">Message envoyé !</h3>
                                <p className="text-slate-500 font-medium">Nous avons bien reçu votre demande et nous vous contacterons dans les plus brefs délais.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-8 px-6 py-3 bg-slate-900 text-white font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors"
                                >
                                    Envoyer un autre message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {status === 'error' && (
                                    <div className="p-4 bg-red-50 text-red-600 font-medium text-sm border-l-4 border-red-500">
                                        {errorMessage}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Prénom <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nom <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Adresse Email <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
                                            placeholder="john.doe@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Contact WhatsApp <span className="text-slate-300">(Optionnel)</span></label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium"
                                            placeholder="+237 600 00 00 00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Message <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <MessageSquare size={18} className="absolute left-4 top-4 text-slate-400" />
                                        <textarea
                                            required
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={5}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium resize-y"
                                            placeholder="Comment pouvons-nous vous aider ?"
                                        ></textarea>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 disabled:bg-slate-400"
                                >
                                    {status === 'loading' ? 'Envoi en cours...' : (
                                        <>Envoyer le message <Send size={16} /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
