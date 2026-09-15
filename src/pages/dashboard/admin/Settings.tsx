import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Save } from 'lucide-react';

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
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="w-full">
                <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-8">
                    {activeTab === 'system' && (
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Réglages Système</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Configurez les paramètres globaux de la plateforme ACADEMIA CONNECT.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Nom de la Plateforme" placeholder="ACADEMIA CONNECT Réseau" />
                                <InputField label="Version du Système" placeholder="v2.4.0-Stable" disabled />
                                <InputField label="URL du Serveur" placeholder="https://api.academia.edu" />
                                <InputField label="Temps de Session (min)" placeholder="60" />
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fonctionnalités Activées</h4>
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
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Sécurité Globale</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Protocoles d'accès et protection des données du réseau.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Longueur min. mot de passe" placeholder="8" />
                                <InputField label="Tentatives max. connexion" placeholder="5" />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Contrôles d'accès</h4>
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
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Stockage & API</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Gestion des services cloud et intégrations tierces.</p>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700 space-y-6">
                                <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Configuration AWS S3</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="S3 Bucket Name" placeholder="academia-connect-assets" />
                                    <InputField label="AWS Region" placeholder="eu-west-3" />
                                    <InputField label="Access Key ID" placeholder="AKIA..." />
                                    <InputField label="Secret Access Key" placeholder="••••••••••••••••" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'marketing' && (
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Email & SMS</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Configuration des passerelles de communication.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="SMTP Host" placeholder="smtp.sendgrid.net" />
                                <InputField label="SMTP Port" placeholder="587" />
                                <InputField label="Sender Name" placeholder="Academia Support" />
                                <InputField label="Gateway SMS (API)" placeholder="https://api.gateway.com" />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Notifications</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ToggleOption label="Email de Bienvenue auto" active />
                                    <ToggleOption label="Alerte SMS Absence" active />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4 items-center">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-black uppercase text-xs tracking-widest transition-all">
                            Restaurer défauts
                        </button>
                        <button className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 uppercase text-xs tracking-widest">
                            <Save size={18} />
                            Sauvegarder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Components
const InputField = ({ label, placeholder, disabled }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block ml-1">{label}</label>
        <input
            type="text"
            defaultValue={placeholder}
            disabled={disabled}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-sm text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
    </div>
);

const ToggleOption = ({ label, active }: any) => {
    const [isOn, setIsOn] = useState(Boolean(active));

    return (
        <div
            onClick={() => setIsOn(!isOn)}
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
        >
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">{label}</span>
            <div className={`w-12 h-6 rounded-full p-1 transition-all ${isOn ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isOn ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
        </div>
    );
};

export default AdminSettings;
