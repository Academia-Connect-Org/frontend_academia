import React, { useState } from 'react';
import {
    Settings as SettingsIcon,
    User,
    Smartphone,
    Mail,
    Save,
    Check,
    Clock,
    Zap,
    Crown,
    ShieldCheck,
    MapPin,
    AlertCircle,
    CheckCircle,
    Building
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import api, { getFileUrl } from '../../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const Settings: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'profile';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [isYearly, setIsYearly] = useState(false);
    
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

    // Initialize profile form when user data is available
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

    const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);

    // Sync activeTab if query parameter changes & Refresh user data
    React.useEffect(() => {
        refreshUser();
        const tab = queryParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const [institutions, setInstitutions] = useState<any[]>([]);

    // Fetch subscription history and institutions
    React.useEffect(() => {
        if (activeTab === 'subscription' && user?.id) {
            fetchData();
        }
    }, [activeTab, user?.id]);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoadingHistory(true);
        try {
            const [historyRes, instRes, plansRes] = await Promise.all([
                api.get(`/subscription/history/${user.id}`),
                api.get(`/institutions/ceo/${user.id}`),
                api.get('/public/plans')
            ]);
            setSubscriptionHistory(historyRes.data);
            setInstitutions(instRes.data);
            const sortedPlans = plansRes.data.sort((a: any, b: any) => (a.monthlyPrice || 0) - (b.monthlyPrice || 0));
            setPlans(sortedPlans);
        } catch (err) {
            console.error("Erreur lors de la récupération des données:", err);
        } finally {
            setLoadingHistory(false);
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
        <>
            <div className="max-w-6xl mx-auto">
                <div className="w-full">
                    <div className="bg-white ] p-10 shadow-xl shadow-slate-200/50   min-h-[600px]">

                        {activeTab === 'profile' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Mon Profil</h3>
                                    <p className="text-slate-500 font-medium italic">Personnalisez vos informations publiques et privées.</p>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="p-8 bg-slate-50 ]   space-y-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-24 h-24 bg-blue-600 ] flex items-center justify-center text-white shadow-xl shadow-blue-600/20 relative group overflow-hidden cursor-pointer">
                                                    <User size={40} />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Save size={20} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-800 text-lg">Photo de profil</h4>
                                                    <p className="text-slate-400 text-sm">PNG ou JPG, max 2Mo</p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <InputField 
                                                    label="Nom de famille" 
                                                    value={profileForm.lastName}
                                                    onChange={(e: any) => setProfileForm({...profileForm, lastName: e.target.value})}
                                                    placeholder="NASSARAMADJI" 
                                                />
                                                <InputField 
                                                    label="Prénom" 
                                                    value={profileForm.firstName}
                                                    onChange={(e: any) => setProfileForm({...profileForm, firstName: e.target.value})}
                                                    placeholder="NASAIRE" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-8 bg-slate-50 ]   space-y-6">
                                            <InputField 
                                                label="Adresse Email" 
                                                value={profileForm.email}
                                                onChange={(e: any) => setProfileForm({...profileForm, email: e.target.value})}
                                                placeholder="pdg@academia.edu" 
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
                                                placeholder="Abidjan, Côte d'Ivoire" 
                                                icon={MapPin} 
                                            />
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={isUpdating}
                                            className={`w-full py-5 bg-slate-900 text-white ] font-black shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 ${isUpdating && 'opacity-70 cursor-not-allowed'}`}
                                        >
                                            {isUpdating ? 'Mise à jour...' : 'Enregistrer les modifications'}
                                            {!isUpdating && <Save size={18} />}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'subscription' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Mes Abonnements</h3>
                                        <p className="text-slate-500 font-medium italic">Gérez les abonnements et paiements de vos établissements.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {institutions.map((inst: any) => {
                                        const statusInfo = getStatusInfo(inst);
                                        return (
                                            <div key={inst.id} className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                                                            {inst.logoUrl ? <img src={getFileUrl(inst.logoUrl)} alt="Logo" className="w-full h-full object-cover" /> : <Building size={24} />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-slate-800 text-lg leading-tight mb-1">{inst.name}</h4>
                                                            <p className="text-sm font-bold text-slate-500">
                                                                Plan : <span className="text-indigo-600 uppercase tracking-wide">{inst.subscriptionType === 'NONE' ? 'Aucun' : inst.subscriptionType}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {statusInfo ? (
                                                        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
                                                            statusInfo.color === 'emerald' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                                                            statusInfo.color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                                            statusInfo.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                                                            'bg-red-50 border-red-200 text-red-800'
                                                        }`}>
                                                            <AlertCircle size={20} className={`shrink-0 mt-0.5 ${
                                                                statusInfo.color === 'emerald' ? 'text-emerald-500' :
                                                                statusInfo.color === 'amber' ? 'text-amber-500' :
                                                                statusInfo.color === 'orange' ? 'text-orange-500' :
                                                                'text-red-500'
                                                            }`} />
                                                            <div>
                                                                <p className="font-bold text-sm leading-snug">{statusInfo.message}</p>
                                                                <p className="text-xs mt-1 opacity-80 font-medium">Fin officielle : {new Date(inst.subscriptionEndDate).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 flex items-start gap-3">
                                                            <AlertCircle size={20} className="shrink-0 mt-0.5 text-slate-400" />
                                                            <p className="font-bold text-sm">Cet établissement n'a aucun abonnement actif.</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => navigate(`/dashboard/pdg/select-plan/${inst.id}`)}
                                                    className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors uppercase text-sm tracking-wider"
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
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Sécurité & Accès</h3>
                                    <p className="text-slate-500 font-medium italic">Protégez votre compte et gérez les accès à votre réseau.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <form onSubmit={handlePasswordUpdate} className="p-8 bg-slate-50 ]   space-y-6">
                                        <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Modifier le mot de passe</h4>
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
                                            className="w-full py-4 bg-white   text-slate-900  font-black shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
                                        >
                                            {isUpdating ? 'Traitement...' : 'Mettre à jour le mot de passe'}
                                        </button>
                                    </form>

                                    <div className="p-8 bg-slate-50 ]   space-y-6">
                                        <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Double Authentification</h4>
                                        <p className="text-slate-400 text-xs font-medium">Ajoutez une couche de sécurité supplémentaire à votre compte Academia.</p>
                                        <div className="flex items-center justify-between p-4 bg-white   ">
                                            <span className="text-sm font-bold text-slate-600">Désactivé</span>
                                            <button type="button" className="text-blue-600 font-black text-xs uppercase tracking-widest">Activer</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Global Feedback Notification */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] min-w-[320px]"
                    >
                        <div className={`p-6 ] shadow-2xl  flex items-center gap-4 backdrop-blur-xl ${feedback.type === 'success'
                            ? 'bg-emerald-500/90  text-white'
                            : 'bg-red-500/90  text-white'
                            }`}>
                            <div className="w-10 h-10  bg-white/20 flex items-center justify-center shrink-0">
                                {feedback.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-xs uppercase tracking-widest opacity-70 mb-0.5">
                                    {feedback.type === 'success' ? 'Succès' : 'Erreur'}
                                </p>
                                <p className="font-bold text-sm leading-tight">{feedback.message}</p>
                            </div>
                            <button onClick={() => setFeedback(null)} className="p-2 hover:bg-white/10  transition-colors">
                                <Save className="rotate-45" size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Internal Components
const InputField = ({ label, placeholder, icon: Icon, type = "text", value, onChange, name }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-slate-50 border-none  py-4 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-bold text-slate-700
                    ${Icon ? 'pl-12 pr-6' : 'px-6'}`}
            />
        </div>
    </div>
);

const PlanCard = ({ title, price, duration, icon: Icon, color, features, isFeatured, onClick, isActive, isDisabled }: any) => {
    const colorStyles: any = {
        slate: 'bg-slate-50 text-slate-600 ',
        blue: 'bg-blue-50 text-blue-600 ',
        indigo: 'bg-indigo-50 text-indigo-600 ',
        emerald: 'bg-emerald-50 text-emerald-600 ',
    };

    return (
        <div className={`relative p-6 ]  transition-all duration-500 ${isActive ? ' bg-emerald-50/10' : isFeatured ? ' shadow-2xl shadow-indigo-200 bg-white' : ' bg-white shadow-xl shadow-slate-100/50'} ${isDisabled && 'opacity-50 grayscale'}`}>
            {isFeatured && !isActive && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5  text-[10px] font-black uppercase tracking-widest">
                    Conseillé
                </div>
            )}
            {isActive && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1.5  text-[10px] font-black uppercase tracking-widest">
                    Plan Actuel
                </div>
            )}
            <div className={`w-12 h-12  flex items-center justify-center mb-4 ${colorStyles[color]}`}>
                <Icon size={24} />
            </div>
            <h4 className="text-lg font-black text-slate-800 mb-1">{title}</h4>
            <div className="flex items-baseline gap-1 mb-4">
                <span className="text-xl font-black text-slate-900">{price}</span>
                <span className="text-[10px] font-bold text-slate-400">{duration}</span>
            </div>
            <div className="space-y-3 mb-6">
                {features.map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4  bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={10} strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-600 leading-tight">{f}</span>
                    </div>
                ))}
            </div>
            <button
                onClick={onClick}
                disabled={isDisabled || isActive}
                className={`w-full py-3.5  font-black text-[10px] uppercase tracking-widest transition-all 
                    ${isActive ? 'bg-emerald-500 text-white cursor-default' : 
                      isFeatured ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20' : 
                      'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                    ${isDisabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''}`}
            >
                {isActive ? 'Plan Actuel' : isDisabled ? 'Indisponible' : isFeatured ? 'Mettre à niveau' : 'Sélectionner'}
            </button>
        </div>
    );
};

export default Settings;
