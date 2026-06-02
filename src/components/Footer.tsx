import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import logo from '../assets/logo.png';
import { ROUTES } from '../constants/routes';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12 mb-8">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <img src={logo} alt="Logo" className="h-10 w-10 bg-white rounded-lg p-1" />
                        <span className="text-xl font-bold text-white">NB-MIND School</span>
                    </div>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                        Digitaliser la passion d'apprendre. Une solution complète et premium pour la gestion des établissements scolaires modernes.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors"><Facebook size={20} /></a>
                        <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors"><Linkedin size={20} /></a>
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg mb-6">Plateforme</h3>
                    <ul className="space-y-4">
                        <li><Link to={ROUTES.HOME} className="hover:text-white transition-colors">Accueil</Link></li>
                        <li><Link to={ROUTES.FEATURES} className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                        <li><Link to={ROUTES.PRICING} className="hover:text-white transition-colors">Tarif Abonnement</Link></li>
                        <li><Link to={ROUTES.SUPPORT} className="hover:text-white transition-colors">Support</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg mb-6">Légal</h3>
                    <ul className="space-y-4">
                        <li><Link to={ROUTES.PRIVACY} className="hover:text-white transition-colors">Confidentialité</Link></li>
                        <li><Link to={ROUTES.TERMS} className="hover:text-white transition-colors">Conditions d'utilisation</Link></li>
                        <li><Link to={ROUTES.COOKIES} className="hover:text-white transition-colors">Gestion des cookies</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg mb-6">Contact</h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-slate-400">
                            <MapPin size={20} className="text-blue-500 shrink-0" />
                            <a href="https://www.google.com/maps/search/?api=1&query=Yaoundé,Cameroun" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Yaoundé, Cameroun</a>
                        </li>
                        <li className="flex gap-3 text-slate-400">
                            <MessageSquare size={20} className="text-emerald-500 shrink-0" />
                            <a href="https://wa.me/237686013300" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discuter sur WhatsApp avec l'équipe</a>
                        </li>
                        <li className="flex gap-3 text-slate-400">
                            <Mail size={20} className="text-blue-500 shrink-0" />
                            <a href="mailto:contact.school@nb-mind.com" className="hover:text-white transition-colors">contact.school@nb-mind.com</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
                <p>© 2026 NB-MIND School. Tous droits réservés.</p>
            </div>
        </footer>
    );
};

export default Footer;
