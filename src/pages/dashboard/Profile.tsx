import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    Lock,
    ShieldCheck,
    Save,
    UserCircle,
    Info,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Eye,
    EyeOff,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
    const { user, login, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'security' | 'danger'>('info');

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        gender: ''
    });

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Visibility toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const validatePassword = (password: string) => {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecial = /[;!:?,&~/=*#]/.test(password);
        return password.length >= 8 && hasLetter && hasDigit && hasSpecial;
    };

    const getErrorMessage = (err: any) => {
        if (err.response?.data) {
            if (typeof err.response.data === 'string') return err.response.data;
            if (err.response.data.message) return err.response.data.message;
            if (err.response.data.error) return err.response.data.error;
            return JSON.stringify(err.response.data);
        }
        return "Une erreur est survenue. Veuillez réessayer.";
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                const data = res.data;
                setProfileForm({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    gender: data.gender || ''
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setMessage(null);
        try {
            await api.put('/users/profile', profileForm);
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: getErrorMessage(err)
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
            return;
        }

        if (!validatePassword(passwordForm.newPassword)) {
            setMessage({
                type: 'error',
                text: 'Le mot de passe doit contenir au moins 8 caractères, une lettre, un chiffre et un caractère spécial (; ! : ? , & ~ / = * #)'
            });
            return;
        }

        setUpdating(true);
        try {
            await api.put('/users/profile/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: getErrorMessage(err)
            });
        } finally {
            setUpdating(false);
        }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteAccount = async () => {
        setUpdating(true);
        try {
            await api.delete('/users/profile');
            logout();
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: getErrorMessage(err)
            });
            setUpdating(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 ] p-8 md:p-12 shadow-xl shadow-slate-200/40 dark:shadow-none   dark: mb-10 flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                    <div className="w-32 h-32 ] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <UserIcon size={56} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2    dark: shadow-lg">
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div className="text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            {profileForm.firstName} {profileForm.lastName}
                        </h2>
                        <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400  text-[10px] font-black uppercase tracking-widest self-center md:self-auto">
                            {user?.role}
                        </span>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-500 dark:text-slate-400 font-medium italic">
                        <div className="flex items-center gap-2">
                            <Mail size={16} className="text-indigo-600" />
                            <span>{profileForm.email}</span>
                        </div>
                        {profileForm.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-indigo-600" />
                                <span>{profileForm.phone}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-10 bg-slate-100 dark:bg-slate-800/50 p-2 ] w-fit">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`flex items-center gap-3 px-8 py-3.5 ] font-black transition-all ${activeTab === 'info'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md scale-105'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <UserCircle size={20} />
                    Informations
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-3 px-8 py-3.5 ] font-black transition-all ${activeTab === 'security'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md scale-105'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <ShieldCheck size={20} />
                    Sécurité
                </button>
                <button
                    onClick={() => setActiveTab('danger')}
                    className={`flex items-center gap-3 px-8 py-3.5 ] font-black transition-all ${activeTab === 'danger'
                        ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-md scale-105'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    <AlertCircle size={20} />
                    Zone Danger
                </button>
            </div>

            {/* Feedback Message */}
            <AnimatePresence mode='wait'>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`mb-8 p-6 ] flex items-center gap-4  ${message.type === 'success'
                            ? 'bg-emerald-50  text-emerald-700 dark:bg-emerald-900/20 dark: dark:text-emerald-400'
                            : 'bg-red-50  text-red-700 dark:bg-red-900/20 dark: dark:text-red-400'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <p className="font-bold flex-1">{message.text}</p>
                        <button onClick={() => setMessage(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 ">
                            <Save size={18} className="rotate-45" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form Sections */}
            <div className="bg-white dark:bg-slate-900 ] p-8 md:p-12 shadow-xl shadow-slate-200/40 dark:shadow-none   dark:">
                {activeTab === 'info' && (
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10  bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                <Info size={22} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Détails Personnels</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5">Prénom</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        type="text"
                                        value={profileForm.firstName}
                                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none ] pl-14 pr-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5">Nom</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        type="text"
                                        value={profileForm.lastName}
                                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none ] pl-14 pr-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5">Adresse Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none ] pl-14 pr-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5">Téléphone</label>
                                <div className="relative">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none ] pl-14 pr-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5">Adresse Résidentielle</label>
                                <div className="relative">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={profileForm.address}
                                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none ] pl-14 pr-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5">Genre</label>
                                <select
                                    value={profileForm.gender}
                                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none ] px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 dark:text-slate-200 appearance-none"
                                >
                                    <option value="">Non défini</option>
                                    <option value="MALE">Masculin</option>
                                    <option value="FEMALE">Féminin</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                disabled={updating}
                                type="submit"
                                className="bg-indigo-600 text-white px-10 py-4 ] font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                            >
                                {updating ? <Loader2 className="animate-spin" /> : <Save size={22} />}
                                Mettre à jour le profil
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'security' && (
                    <form onSubmit={handleChangePassword} className="space-y-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10  bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                <Lock size={22} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Changer le Mot de Passe</h3>
                        </div>

                        <div className="space-y-6 max-w-md">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5">Mot de passe actuel</label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none ] pl-14 pr-14 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 dark:text-slate-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5">Nouveau mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none ] pl-14 pr-14 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 dark:text-slate-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium ml-5 mt-1">
                                    Contraintes: 8+ car., 1 lettre, 1 chiffre, 1 spécial (; ! : ? , & ~ / = * #)
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5">Confirmer le nouveau mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none ] pl-14 pr-14 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 dark:text-slate-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                disabled={updating}
                                type="submit"
                                className="bg-indigo-600 text-white px-10 py-4 ] font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                            >
                                {updating ? <Loader2 className="animate-spin" /> : <Save size={22} />}
                                Mettre à jour le mot de passe
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'danger' && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10  bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                                <Trash2 size={22} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Zone de Danger</h3>
                        </div>

                        <div className="bg-red-50 dark:bg-red-950/20   dark: p-8 ]">
                            <h4 className="text-red-800 dark:text-red-400 font-black text-lg mb-4 uppercase tracking-tight">Supprimer définitivement le compte</h4>
                            <p className="text-red-600 dark:text-red-400/70 font-medium mb-8 leading-relaxed">
                                En supprimant votre compte, vous perdrez l'accès à toutes vos données, y compris vos messages, vos préférences et vos informations liées à ACADEMIA CONNECT. <br />
                                <strong>Cette action est irréversible et immédiate.</strong>
                            </p>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                disabled={updating}
                                className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 ] font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
                            >
                                <Trash2 size={22} />
                                Supprimer mon compte
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Account Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/60 animate-in fade-in duration-300">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md ] p-10 shadow-2xl text-center  dark:"
                        >
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 text-red-500  flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2 uppercase">Supprimer le compte ?</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                                Êtes-vous sûr de vouloir supprimer votre compte définitivement ? <br />
                                <strong className="text-red-500 uppercase">Toutes vos données seront perdues.</strong> Cette action est irréversible.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-4 ] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
                                    disabled={updating}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 py-4 ] font-black bg-red-500 text-white shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Confirmer la suppression"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
