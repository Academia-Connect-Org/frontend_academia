import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Save,
} from 'lucide-react';

const AdminSettings: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'system';

    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync activeTab if query parameter changes
    React.useEffect(() => {
        const tab = queryParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [location.search]);

    return (
        <>
            <div className="max-w-6xl mx-auto">
                {/* Contenu Principal */}
                <div className="w-full">
                    <div className="bg-white rounded-[48px] p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
                        {activeTab === 'system' && (
                            <div className="space-y-12">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Réglages Système</h3>
                                    <p className="text-slate-500 font-medium italic">Configurez les paramètres globaux de la plateforme NB-MIND School.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <InputField label="Nom de la Plateforme" placeholder="NB-MIND School Réseau" />
                                    <InputField label="Version du Système" placeholder="v2.4.0-Stable" disabled />
                                    <InputField label="URL du Serveur" placeholder="https://api.academia.edu" />
                                    <InputField label="Temps de Session (min)" placeholder="60" />
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Fonctionnalités Activées</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <ToggleOption label="Auto-inscription des PDGs" active />
                                        <ToggleOption label="Notifications Push" active />
                                        <ToggleOption label="Paiement en ligne" active />
                                        <ToggleOption label="Messagerie Inter-écoles" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Sécurité Globale</h3>
                                    <p className="text-slate-500 font-medium italic">Protocoles d'accès et protection des données du réseau.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <InputField label="Longueur min. mot de passe" placeholder="8" />
                                    <InputField label="Tentatives max. connexion" placeholder="5" />
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Contrôles d'accès</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <ToggleOption label="Authentification 2FA" active />
                                        <ToggleOption label="Verrouillage IP suspectes" active />
                                        <ToggleOption label="Logs d'audit temps réel" active />
                                        <ToggleOption label="Expiration automatique JWT" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'storage' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Stockage & API</h3>
                                    <p className="text-slate-500 font-medium italic">Gestion des services cloud et intégrations tierces.</p>
                                </div>
                                <div className="space-y-10">
                                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6">AWS S3 Configuration</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <InputField label="S3 Bucket Name" placeholder="academia-connect-assets" />
                                            <InputField label="AWS Region" placeholder="eu-west-3" />
                                            <InputField label="Access Key ID" placeholder="AKIA..." />
                                            <InputField label="Secret Access Key" placeholder="••••••••••••••••" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'marketing' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Email & SMS</h3>
                                    <p className="text-slate-500 font-medium italic">Configuration des passerelles de communication.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <InputField label="SMTP Host" placeholder="smtp.sendgrid.net" />
                                    <InputField label="SMTP Port" placeholder="587" />
                                    <InputField label="Sender Name" placeholder="Academia Support" />
                                    <InputField label="Gateway SMS (API)" placeholder="https://api.gateway.com" />
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Notifications</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <ToggleOption label="Email de Bienvenue auto" active />
                                        <ToggleOption label="Alerte SMS Absence" active />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-10 border-t border-slate-50 flex justify-end gap-6 items-center">
                            <button className="text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-600 transition-all underline-offset-4 hover:underline">Restaurer défauts</button>
                            <button className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black flex items-center gap-3 shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all uppercase text-xs tracking-widest group">
                                <Save size={20} className="group-hover:scale-110 transition-transform" />
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Components
const InputField = ({ label, placeholder, disabled }: any) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">{label}</label>
        <input
            type="text"
            defaultValue={placeholder}
            disabled={disabled}
            className={`w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        />
    </div>
);

const ToggleOption = ({ label, active }: any) => (
    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{label}</span>
        <div className={`w-12 h-6 rounded-full p-1 transition-all ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
    </div>
);

export default AdminSettings;
