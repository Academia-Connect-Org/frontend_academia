import React, { useState } from 'react';
import {
    User,
    Smartphone,
    Mail,
    Save,
    MapPin,
    AlertCircle,
    CheckCircle,
    Building
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { getFileUrl } from '../../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const Settings: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'profile';

    const [activeTab, setActiveTab] = useState(initialTab);
    
    // Profile State
    const [isUpdating, setIsUpdating] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });

    // Security State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    React.useEffect(() => {
        if (user) {
            setProfileForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const [institutions, setInstitutions] = useState<any[]>([]);

    React.useEffect(() => {
        refreshUser();
        const tab = queryParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [location.search]);

    React.useEffect(() => {
        if (activeTab === 'subscription' && user?.id) {
            fetchData();
        }
    }, [activeTab, user?.id]);

    const fetchData = async () => {
        if (!user?.id) return;
        try {
            const instRes = await api.get(`/institutions/ceo/${user.id}`);
            setInstitutions(instRes.data || []);
        } catch (err) {
            console.error("Erreur lors de la récupération des données:", err);
        }
    };

    const getStatusInfo = (inst: any) => {
        if (!inst.subscriptionEndDate || inst.subscriptionType === 'NONE') return null;
        const end = new Date(inst.subscriptionEndDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 5) {
            return { status: 'ACTIVE', color: 'emerald', message: `Actif, expire dans ${diffDays} jours` };
        } else if (diffDays >= 0 && diffDays <= 5) {
            return { status: 'WARNING', color: 'amber', message: `Expire bientôt dans ${diffDays} jours.` };
        } else if (diffDays < 0 && diffDays >= -5) {
            return { status: 'GRACE_PERIOD', color: 'orange', message: `Expiré (délai de grâce). Blocage dans ${5 - Math.abs(diffDays)} jours.` };
        } else {
            return { status: 'BLOCKED', color: 'red', message: `Bloqué. Renouvelez pour réactiver.` };
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setFeedback(null);
        try {
            await api.put('/users/profile', profileForm);
            setFeedback({ type: 'success', message: 'Profil mis à jour avec succès !' });
            refreshUser();
        } catch (err: any) {
            console.error(err);
            setFeedback({ 
                type: 'error', 
                message: err.response?.data?.message || 'Erreur lors de la mise à jour du profil' 
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setFeedback({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas.' });
            return;
        }
        
        setIsUpdating(true);
        setFeedback(null);
        try {
            await api.put('/users/profile/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setFeedback({ type: 'success', message: 'Mot de passe mis à jour avec succès !' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            console.error(err);
            setFeedback({ 
                type: 'error', 
                message: err.response?.data?.message || 'Erreur lors du changement de mot de passe' 
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">

                {activeTab === 'profile' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Mon Profil</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Personnalisez vos informations personnelles et coordonnées.</p>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md relative group overflow-hidden shrink-0">
                                        <User size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Photo de profil</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs">Utilise votre image de compte</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <InputField 
                                        label="Nom de famille" 
                                        value={profileForm.lastName}
                                        onChange={(e: any) => setProfileForm({...profileForm, lastName: e.target.value})}
                                        placeholder="Nom" 
                                    />
                                    <InputField 
                                        label="Prénom" 
                                        value={profileForm.firstName}
                                        onChange={(e: any) => setProfileForm({...profileForm, firstName: e.target.value})}
                                        placeholder="Prénom" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col justify-between">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-4">
                                    <InputField 
                                        label="Adresse Email" 
                                        value={profileForm.email}
                                        onChange={(e: any) => setProfileForm({...profileForm, email: e.target.value})}
                                        placeholder="email@domaine.com" 
                                        icon={Mail} 
                                    />
                                    <InputField 
                                        label="Numéro de Téléphone" 
                                        value={profileForm.phone}
                                        onChange={(e: any) => setProfileForm({...profileForm, phone: e.target.value})}
                                        placeholder="+225 07 00 00 00 00" 
                                        icon={Smartphone} 
                                    />
                                    <InputField 
                                        label="Localisation / Siège" 
                                        value={profileForm.address}
                                        onChange={(e: any) => setProfileForm({...profileForm, address: e.target.value})}
                                        placeholder="N'Djaména, Tchad" 
                                        icon={MapPin} 
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isUpdating}
                                    className={`w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${isUpdating && 'opacity-70 cursor-not-allowed'}`}
                                >
                                    {isUpdating ? 'Mise à jour...' : 'Enregistrer les modifications'}
                                    {!isUpdating && <Save size={16} />}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'subscription' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Mes Abonnements</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Gérez les abonnements et le statut de vos établissements.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {institutions.map((inst: any) => {
                                const statusInfo = getStatusInfo(inst);
                                return (
                                    <div key={inst.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                                                    {inst.logoUrl ? <img src={getFileUrl(inst.logoUrl)} alt="Logo" className="w-full h-full object-cover" /> : <Building size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{inst.name}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Plan : <span className="text-blue-600 dark:text-blue-400 font-bold uppercase">{inst.subscriptionType === 'NONE' ? 'Aucun' : inst.subscriptionType}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {statusInfo ? (
                                                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                                                    statusInfo.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' :
                                                    statusInfo.color === 'amber' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300' :
                                                    'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                                                }`}>
                                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-bold">{statusInfo.message}</p>
                                                        <p className="text-[10px] mt-0.5 opacity-80">Fin officielle : {new Date(inst.subscriptionEndDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2">
                                                    <AlertCircle size={16} className="shrink-0 text-slate-400" />
                                                    <p className="font-semibold">Aucun abonnement actif.</p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => navigate(`/dashboard/pdg/select-plan/${inst.id}`)}
                                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors uppercase tracking-wider"
                                        >
                                            Renouveler / Changer de plan
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Sécurité & Accès</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Protégez votre compte et votre mot de passe.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <form onSubmit={handlePasswordUpdate} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-4">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Modifier le mot de passe</h4>
                                <InputField 
                                    label="Ancien Mot de passe" 
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e: any) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                    placeholder="••••••••" 
                                />
                                <InputField 
                                    label="Nouveau Mot de passe" 
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e: any) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                    placeholder="••••••••" 
                                />
                                <InputField 
                                    label="Confirmez le nouveau Mot de passe" 
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e: any) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                    placeholder="••••••••" 
                                />
                                <button 
                                    type="submit"
                                    disabled={isUpdating}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
                                >
                                    {isUpdating ? 'Traitement...' : 'Mettre à jour le mot de passe'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-[400] max-w-sm"
                    >
                        <div className={`p-4 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md ${feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                            {feedback.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                            <p className="text-xs font-bold flex-1">{feedback.message}</p>
                            <button onClick={() => setFeedback(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                <Save size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InputField = ({ label, placeholder, icon: Icon, type = "text", value, onChange, name }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
            />
        </div>
    </div>
);

export default Settings;
