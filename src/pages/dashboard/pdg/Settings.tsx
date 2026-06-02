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

    // Subscription State
    const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

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
            const [historyRes, instRes] = await Promise.all([
                api.get(`/subscription/history/${user.id}`),
                api.get(`/institutions/ceo/${user.id}`)
            ]);
            setSubscriptionHistory(historyRes.data);
            setInstitutions(instRes.data);
        } catch (err) {
            console.error("Erreur lors de la récupération des données:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const hasActiveSubscription = institutions.some(inst => 
        inst.subscriptionType && inst.subscriptionType !== 'NONE' && 
        inst.subscriptionEndDate && new Date(inst.subscriptionEndDate) > new Date()
    );

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
                    <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[600px]">

                        {activeTab === 'profile' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Mon Profil</h3>
                                    <p className="text-slate-500 font-medium italic">Personnalisez vos informations publiques et privées.</p>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center text-white shadow-xl shadow-blue-600/20 relative group overflow-hidden cursor-pointer">
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
                                        <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
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
                                            className={`w-full py-5 bg-slate-900 text-white rounded-[24px] font-black shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 ${isUpdating && 'opacity-70 cursor-not-allowed'}`}
                                        >
                                            {isUpdating ? 'Mise à jour...' : 'Enregistrer les modifications'}
                                            {!isUpdating && <Save size={18} />}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'subscription' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Mon Abonnement</h3>
                                        <p className="text-slate-500 font-medium italic">Gérez vos plans et facturations pour tout votre réseau.</p>
                                    </div>
                                    {!hasActiveSubscription ? (
                                        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                            <button
                                                onClick={() => setIsYearly(false)}
                                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isYearly ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Mensuel
                                            </button>
                                            <button
                                                onClick={() => setIsYearly(true)}
                                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isYearly ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Annuel (-10%)
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-black text-xs uppercase tracking-widest">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            Abonnement Actif
                                        </div>
                                    )}
                                </div>

                                {hasActiveSubscription && (
                                    <div className="space-y-8">
                                        {/* Status Card */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="md:col-span-2 p-10 bg-slate-900 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-slate-900/30">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                                    <div className="relative z-10 space-y-6">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 block mb-4">Statut de votre réseau</span>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {institutions.map((inst: any) => (
                                                                <div key={inst.id} className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 overflow-hidden">
                                                                        {inst.logoUrl ? <img src={getFileUrl(inst.logoUrl)} alt={inst.name} className="w-full h-full object-cover" /> : <Building size={20} />}
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="font-bold text-sm truncate w-32">{inst.name}</h5>
                                                                        <p className="text-[10px] uppercase font-black text-blue-300">
                                                                            {inst.subscriptionType !== 'NONE' 
                                                                                ? `${inst.subscriptionType} — Exp : ${inst.subscriptionEndDate ? new Date(inst.subscriptionEndDate).toLocaleDateString() : 'N/A'}`
                                                                                : "Aucun abonnement"}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-center">
                                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                                                    <ShieldCheck size={28} />
                                                </div>
                                                <h5 className="font-black text-slate-800 mb-2">Renouvellement Auto</h5>
                                                <p className="text-slate-400 text-sm mb-6">Votre abonnement se renouvelle automatiquement via le mode de paiement par défaut.</p>
                                                <button className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline text-left">Gérer les paiements</button>
                                            </div>
                                        </div>

                                        {/* History */}
                                        <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
                                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Historique des Facturations</h4>
                                                {loadingHistory && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left font-medium">
                                                    <thead>
                                                        <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                                            <th className="px-8 py-4">Établissement</th>
                                                            <th className="px-8 py-4">Désignation</th>
                                                            <th className="px-8 py-4">Date</th>
                                                            <th className="px-8 py-4">Montant</th>
                                                            <th className="px-8 py-4 text-center">Statut</th>
                                                            <th className="px-8 py-4 text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {subscriptionHistory.length > 0 ? (
                                                            subscriptionHistory.map((record: any) => (
                                                                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                                                    <td className="px-8 py-6">
                                                                        <div className="flex items-center gap-2">
                                                                            <Building size={14} className="text-slate-300" />
                                                                            <span className="font-bold text-slate-600 text-sm whitespace-nowrap">{record.institution?.name || 'Academia Global'}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-6">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${record.type === 'FREE_TRIAL' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                                {record.type === 'FREE_TRIAL' ? <Clock size={16} /> : <Zap size={16} />}
                                                                            </div>
                                                                            <span className="font-bold text-slate-700 capitalize">Academia {record.type.replace('_', ' ').toLowerCase()}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-6 text-slate-500 text-sm">
                                                                        {new Date(record.startDate).toLocaleDateString('fr-FR')}
                                                                    </td>
                                                                    <td className="px-8 py-6 font-black text-slate-900">
                                                                        {record.type === 'FREE_TRIAL' ? '0 FCFA' : 
                                                                         record.type === 'SIMPLE' ? '55 000 FCFA' : 
                                                                         record.type === 'STANDARD' ? '95 000 FCFA' : '145 000 FCFA'}
                                                                    </td>
                                                                    <td className="px-8 py-6 text-center">
                                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                                            record.status === 'ACTIVE' 
                                                                                ? 'bg-emerald-50 text-emerald-600' 
                                                                                : record.status === 'COMPLETED' ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'
                                                                        }`}>
                                                                            {record.status === 'ACTIVE' ? 'Actif' : record.status === 'COMPLETED' ? 'Terminé' : record.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-8 py-6 text-right">
                                                                        <button className="text-slate-300 hover:text-blue-600 transition-colors">
                                                                            <Save size={18} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : !loadingHistory && (
                                                            <tr>
                                                                <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                                                                    Aucun historique de facturation trouvé pour ce compte.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="pt-12">
                                            <h4 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tighter italic">Changer de Plan</h4>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                    <PlanCard
                                        title="Gratuit"
                                        price="0 FCFA"
                                        duration="3 Mois"
                                        icon={Clock}
                                        color="slate"
                                        features={["Accès complet temporaire", "Toutes fonctionnalités Premium", "Support standard", "Offre unique"]}
                                        onClick={() => navigate(`${ROUTES.PAYMENT}?plan=Essai Gratuit&price=0 FCFA&duration=3 Mois`)}
                                        isDisabled={hasActiveSubscription}
                                    />
                                    <PlanCard
                                        title="Simple"
                                        price={isYearly ? "600 000 FCFA" : "55 000 FCFA"}
                                        duration={isYearly ? "/ an" : "/ mois"}
                                        icon={Zap}
                                        color="blue"
                                        features={["Messagerie interne (limite)", "Statistiques réseau de base", "Nombre d'utilisateurs restreint", "Stockage cloud limité"]}
                                        onClick={() => navigate(`${ROUTES.PAYMENT}?plan=Simple&price=${isYearly ? "600 000 FCFA" : "55 000 FCFA"}&duration=${isYearly ? "/ an" : "/ mois"}`)}
                                        isActive={user?.subscriptionType === 'SIMPLE'}
                                    />
                                    <PlanCard
                                        title="Standard"
                                        price={isYearly ? "1 080 000 FCFA" : "95 000 FCFA"}
                                        duration={isYearly ? "/ an" : "/ mois"}
                                        icon={Crown}
                                        color="indigo"
                                        isFeatured
                                        features={["Tout illimité (Users/Storage)", "Génération de bulletins", "Messagerie réseau complète", "Exports statistiques avancés"]}
                                        onClick={() => navigate(`${ROUTES.PAYMENT}?plan=Standard&price=${isYearly ? "1 080 000 FCFA" : "95 000 FCFA"}&duration=${isYearly ? "/ an" : "/ mois"}`)}
                                        isActive={user?.subscriptionType === 'STANDARD'}
                                    />
                                    <PlanCard
                                        title="Premium"
                                        price={isYearly ? "1 620 000 FCFA" : "145 000 FCFA"}
                                        duration={isYearly ? "/ an" : "/ mois"}
                                        icon={ShieldCheck}
                                        color="emerald"
                                        features={["Tout Illimité & Avancé", "Devoirs & Examens en ligne", "IA Prédiction Scolaire", "Support VIP & Dédié"]}
                                        onClick={() => navigate(`${ROUTES.PAYMENT}?plan=Premium&price=${isYearly ? "1 620 000 FCFA" : "145 000 FCFA"}&duration=${isYearly ? "/ an" : "/ mois"}`)}
                                    />
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
                                    <form onSubmit={handlePasswordUpdate} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
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
                                            className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
                                        >
                                            {isUpdating ? 'Traitement...' : 'Mettre à jour le mot de passe'}
                                        </button>
                                    </form>

                                    <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                                        <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Double Authentification</h4>
                                        <p className="text-slate-400 text-xs font-medium">Ajoutez une couche de sécurité supplémentaire à votre compte Academia.</p>
                                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
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
                        <div className={`p-6 rounded-[24px] shadow-2xl border flex items-center gap-4 backdrop-blur-xl ${feedback.type === 'success'
                            ? 'bg-emerald-500/90 border-emerald-400 text-white'
                            : 'bg-red-500/90 border-red-400 text-white'
                            }`}>
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                {feedback.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-xs uppercase tracking-widest opacity-70 mb-0.5">
                                    {feedback.type === 'success' ? 'Succès' : 'Erreur'}
                                </p>
                                <p className="font-bold text-sm leading-tight">{feedback.message}</p>
                            </div>
                            <button onClick={() => setFeedback(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
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
                className={`w-full bg-slate-50 border-none rounded-2xl py-4 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-bold text-slate-700
                    ${Icon ? 'pl-12 pr-6' : 'px-6'}`}
            />
        </div>
    </div>
);

const PlanCard = ({ title, price, duration, icon: Icon, color, features, isFeatured, onClick, isActive, isDisabled }: any) => {
    const colorStyles: any = {
        slate: 'bg-slate-50 text-slate-600 border-slate-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    };

    return (
        <div className={`relative p-6 rounded-[32px] border-2 transition-all duration-500 ${isActive ? 'border-emerald-500 bg-emerald-50/10' : isFeatured ? 'border-indigo-600 shadow-2xl shadow-indigo-200 bg-white' : 'border-slate-100 bg-white shadow-xl shadow-slate-100/50'} ${isDisabled && 'opacity-50 grayscale'}`}>
            {isFeatured && !isActive && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Conseillé
                </div>
            )}
            {isActive && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Plan Actuel
                </div>
            )}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colorStyles[color]}`}>
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
                        <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={10} strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-600 leading-tight">{f}</span>
                    </div>
                ))}
            </div>
            <button
                onClick={onClick}
                disabled={isDisabled || isActive}
                className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all 
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
