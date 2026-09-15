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
        <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden transition-colors duration-300">
            {/* Subtle background glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-sky-500/10 blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">

                    {/* Brand Section */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-1 bg-transparent dark:bg-white rounded-xl transition-transform duration-300">
                                <img
                                    src={logo}
                                    alt="Logo Academia Connect"
                                    className="h-10 w-10 object-contain rounded-lg"
                                />
                            </div>
                            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                Academia<span className="text-sky-500">Connect</span>
                            </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-6 font-normal">
                            Digitaliser la passion d'apprendre. Une solution complète et intuitive pour la gestion des établissements scolaires modernes.
                        </p>
                        <div className="flex gap-2.5">
                            <a href="#" className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:bg-sky-600 hover:border-sky-600 hover:-translate-y-0.5 transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-white"><Facebook size={16} /></a>
                            <a href="#" className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:bg-sky-600 hover:border-sky-600 hover:-translate-y-0.5 transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-white"><Twitter size={16} /></a>
                            <a href="https://www.instagram.com/reel/DZ_DDHpu2Nu/?igsh=MTZtcWd0YnB1YjIxOA==" className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:bg-sky-600 hover:border-sky-600 hover:-translate-y-0.5 transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-white"><Instagram size={16} /></a>
                            <a href="#" className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:bg-sky-600 hover:border-sky-600 hover:-translate-y-0.5 transition-all duration-200 text-slate-600 dark:text-slate-300 hover:text-white"><Linkedin size={16} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-sm mb-4 tracking-tight">Liens utiles</h3>
                        <ul className="space-y-2.5 text-xs font-normal">
                            <li><Link to={ROUTES.HOME} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5 group"><ArrowRight size={13} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" /> Accueil</Link></li>
                            <li><Link to={ROUTES.FEATURES} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5 group"><ArrowRight size={13} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" /> Fonctionnalités</Link></li>
                            <li><Link to={ROUTES.PRICING} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5 group"><ArrowRight size={13} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" /> Tarif abonnement</Link></li>
                            <li><Link to={ROUTES.SUPPORT} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5 group"><ArrowRight size={13} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" /> Support client</Link></li>
                            <li><Link to={ROUTES.TERMS} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5 group"><ArrowRight size={13} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" /> Conditions d'utilisation</Link></li>
                            <li><Link to={ROUTES.PRIVACY} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5 group"><ArrowRight size={13} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" /> Confidentialité</Link></li>
                            <li><Link to={ROUTES.COOKIES} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5 group"><ArrowRight size={13} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" /> Cookies</Link></li>
                            <li><Link to={ROUTES.CONTACT} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5 group"><ArrowRight size={13} className="text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" />Contactez-nous</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-sm mb-4 tracking-tight">Contactez-nous</h3>
                        <ul className="space-y-3.5 text-xs font-normal">
                            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400 group">
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group-hover:bg-sky-500/20 group-hover:border-sky-500 transition-colors">
                                    <MapPin size={16} className="text-sky-500 dark:text-sky-400" />
                                </div>
                                <a href="https://www.google.com/maps/search/?api=1&query=Tchad,Benin,Cameroun" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors mt-0.5">Tchad, Bénin, Cameroun</a>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400 group">
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group-hover:bg-emerald-500/20 group-hover:border-emerald-500 transition-colors">
                                    <MessageSquare size={16} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="mt-0.5">
                                    WhatsApp : <a href="https://wa.me/237696731837" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">(+237 6 96 73 18 37)</a> / <a href="https://wa.me/22967004961" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">(+229 67 00 49 61)</a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400 group">
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group-hover:bg-sky-500/20 group-hover:border-sky-500 transition-colors">
                                    <Mail size={16} className="text-sky-500 dark:text-sky-400" />
                                </div>
                                <a href="mailto:academiaconnects@gmail.com" className="hover:text-slate-900 dark:hover:text-white transition-colors mt-0.5 break-all">academiaconnects@gmail.com</a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-sm mb-4 tracking-tight">Newsletter</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mb-3.5 font-normal">Restez informé de nos dernières nouveautés et mises à jour.</p>
                        <form className="flex flex-col gap-2.5" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="Votre adresse email"
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed shadow-sm"
                            >
                                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <>S'abonner <ArrowRight size={15} /></>}
                            </button>
                            {status === 'success' && <p className="text-emerald-600 dark:text-green-400 text-xs font-medium">Merci ! Vous êtes maintenant abonné.</p>}
                            {status === 'error' && <p className="text-red-500 dark:text-red-400 text-xs font-medium">Erreur lors de l'abonnement.</p>}
                        </form>
                    </div>

                </div>

                {/* Flags Marquee */}
                <div className="w-full overflow-hidden mt-6 pt-5 pb-5 border-y border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40">
                    <div className="animate-marquee gap-8 items-center cursor-default text-slate-600 dark:text-slate-400 font-normal">
                        <div className="flex gap-8 whitespace-nowrap px-4 text-xs">
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇨🇲 Cameroun</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇹🇩 Tchad</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇧🇯 Bénin</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇸🇳 Sénégal</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇨🇮 Côte d'Ivoire</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇲🇱 Mali</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇧🇫 Burkina Faso</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇹🇬 Togo</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇬🇳 Guinée</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇳🇪 Niger</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇨🇬 Congo</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇨🇩 RDC</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇬🇦 Gabon</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇲🇬 Madagascar</span>
                        </div>
                        <div className="flex gap-8 whitespace-nowrap px-4 text-xs">
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇨🇲 Cameroun</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇹🇩 Tchad</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇧🇯 Bénin</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇸🇳 Sénégal</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇨🇮 Côte d'Ivoire</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇲🇱 Mali</span>
                            <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇧🇫 Burkina Faso</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇹🇬 Togo</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇬🇳 Guinée</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇳🇪 Niger</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇨🇬 Congo</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇨🇩 RDC</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇬🇦 Gabon</span>
                            <span className="text-xs flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors">🇲🇬 Madagascar</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs font-normal text-slate-500 dark:text-slate-400 pt-6">
                    <p className="m-0">© 2026 Academia Connect. Tous droits réservés.</p>
                    <div className="flex gap-5">
                        <Link to={ROUTES.TERMS} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Conditions</Link>
                        <Link to={ROUTES.PRIVACY} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Confidentialité</Link>
                        <Link to={ROUTES.COOKIES} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;