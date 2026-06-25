import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { ROUTES } from '../constants/routes';

const Footer: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            await api.post('/newsletter/subscribe', { email });
            setStatus('success');
            setEmail('');
        } catch (error) {
            console.error('Subscription error', error);
            setStatus('error');
        }
    };

    return (
        <footer className="bg-slate-950 text-slate-300 pt-20 pb-8 border-t-4 border-blue-600 relative overflow-hidden">
            {/* Subtle background glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-blue-600/10 blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 mb-0">

                    {/* Brand Section */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white p-1.5 shadow-lg">
                                <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight uppercase">NB-MIND</span>
                        </div>
                        <p className="text-slate-400 mb-8 leading-relaxed font-medium">
                            Digitaliser la passion d'apprendre. Une solution complète et premium pour la gestion des établissements scolaires modernes.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-3 bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-1 transition-all duration-300 text-white"><Facebook size={18} /></a>
                            <a href="#" className="p-3 bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-1 transition-all duration-300 text-white"><Twitter size={18} /></a>
                            <a href="https://www.instagram.com/reel/DZ_DDHpu2Nu/?igsh=MTZtcWd0YnB1YjIxOA==" className="p-3 bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-1 transition-all duration-300 text-white"><Instagram size={18} /></a>
                            <a href="#" className="p-3 bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-1 transition-all duration-300 text-white"><Linkedin size={18} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-black text-lg mb-6 uppercase tracking-wider">Liens Utiles</h3>
                        <ul className="space-y-4 font-semibold">
                            <li><Link to={ROUTES.HOME} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" /> Accueil</Link></li>
                            <li><Link to={ROUTES.FEATURES} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" /> Fonctionnalités</Link></li>
                            <li><Link to={ROUTES.PRICING} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" /> Tarif Abonnement</Link></li>
                            <li><Link to={ROUTES.SUPPORT} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" /> Support Client</Link></li>
                            <li><Link to={ROUTES.PRIVACY} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" /> Confidentialité</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-black text-lg mb-6 uppercase tracking-wider">Contactez-nous</h3>
                        <ul className="space-y-5 font-medium">
                            <li className="flex items-start gap-4 text-slate-400 group">
                                <div className="p-2 bg-slate-900 border border-slate-800 group-hover:bg-blue-600/20 group-hover:border-blue-500 transition-colors">
                                    <MapPin size={20} className="text-blue-500" />
                                </div>
                                <a href="https://www.google.com/maps/search/?api=1&query=N'Djamena,Tchad" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors mt-1">N'Djamena, Tchad</a>
                            </li>
                            <li className="flex items-start gap-4 text-slate-400 group">
                                <div className="p-2 bg-slate-900 border border-slate-800 group-hover:bg-emerald-500/20 group-hover:border-emerald-500 transition-colors">
                                    <MessageSquare size={20} className="text-emerald-500" />
                                </div>
                                <div className="mt-1">
                                    WhatsApp : <a href="https://wa.me/237686013300" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">(+237 6 86 01 33 00)</a> / <a href="https://wa.me/22967004961" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">(+229 67 00 49 61)</a>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 text-slate-400 group">
                                <div className="p-2 bg-slate-900 border border-slate-800 group-hover:bg-blue-600/20 group-hover:border-blue-500 transition-colors">
                                    <Mail size={20} className="text-blue-500" />
                                </div>
                                <a href="mailto:contact.school@nb-mind.com" className="hover:text-white transition-colors mt-1 break-all">contact.school@nb-mind.com</a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter (New) */}
                    <div>
                        <h3 className="text-white font-black text-lg mb-6 uppercase tracking-wider">Newsletter</h3>
                        <p className="text-slate-400 mb-4 font-medium">Restez informé de nos dernières nouveautés et mises à jour.</p>
                        <form className="flex flex-col gap-3" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="Votre adresse email"
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full px-4 py-3 bg-blue-600 text-white font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-700 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <>S'abonner <ArrowRight size={18} /></>}
                            </button>
                            {status === 'success' && <p className="text-green-400 text-sm font-semibold">Merci ! Vous êtes maintenant abonné.</p>}
                            {status === 'error' && <p className="text-red-400 text-sm font-semibold">Erreur lors de l'abonnement.</p>}
                        </form>
                    </div>

                </div>

                {/* Flags Marquee */}
                <div className="w-full overflow-hidden mt-8 pt-6 pb-6 border-b border-slate-800 bg-slate-950/50">
                    <div className="animate-marquee gap-8 items-center cursor-default text-slate-500 font-semibold">
                        <div className="flex gap-8 whitespace-nowrap px-4">
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇨🇲 Cameroun</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇹🇩 Tchad</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇧🇯 Bénin</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇸🇳 Sénégal</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇨🇮 Côte d'Ivoire</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇲🇱 Mali</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇧🇫 Burkina Faso</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇹🇬 Togo</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇬🇳 Guinée</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇳🇪 Niger</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇨🇬 Congo</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇨🇩 RDC</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇬🇦 Gabon</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇲🇬 Madagascar</span>
                        </div>
                        <div className="flex gap-8 whitespace-nowrap px-4">
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇨🇲 Cameroun</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇹🇩 Tchad</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇧🇯 Bénin</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇸🇳 Sénégal</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇨🇮 Côte d'Ivoire</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇲🇱 Mali</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇧🇫 Burkina Faso</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇹🇬 Togo</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇬🇳 Guinée</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇳🇪 Niger</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇨🇬 Congo</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇨🇩 RDC</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇬🇦 Gabon</span>
                            <span className="text-lg flex items-center gap-2 hover:text-white transition-colors">🇲🇬 Madagascar</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-semibold text-slate-500 pt-8">
                    <p className="m-0">© 2026 NB-MIND School. Tous droits réservés.</p>
                    <div className="flex gap-6">
                        <Link to={ROUTES.TERMS} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Conditions</Link>
                        <Link to={ROUTES.PRIVACY} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Confidentialité</Link>
                        <Link to={ROUTES.COOKIES} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
