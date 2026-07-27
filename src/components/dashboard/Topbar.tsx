import React, { useState } from 'react';
import {
    Bell,
    Search,
    User,
    HelpCircle,
    Home,
    Sun,
    Moon,
    X,
    Mail,
    Shield,
    Phone,
    Menu,
    LogOut,
    Check,
    MapPin,
    Users,
    Heart
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import api from '../../api/axios';

interface TopbarProps {
    role: string;
    title: string;
    onMenuClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ role, title, onMenuClick }) => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState<number>(0);

    const fetchUnreadCount = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/chat/unread/${user.id}`);
            setUnreadMessages(res.data.unreadCount || 0);
        } catch (err) {
            console.error(err);
        }
    };

    React.useEffect(() => {
        fetchUnreadCount();
        const handleRead = () => fetchUnreadCount();
        window.addEventListener('chat_read', handleRead);
        const interval = setInterval(fetchUnreadCount, 10000);
        return () => {
            window.removeEventListener('chat_read', handleRead);
            clearInterval(interval);
        };
    }, [user?.id]);

    const hasParentInfo = user?.fatherFirstName || user?.motherFirstName || user?.parent || user?.fatherAccount || user?.motherAccount;

    return (
        <header className="h-20 bg-white dark:bg-slate-900   dark: flex items-center justify-between px-8 sticky top-0 z-30 transition-colors">
            <div className="flex items-center gap-4 lg:gap-6 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400  transition-all lg:hidden"
                    title="Ouvrir le menu"
                >
                    <Menu size={20} />
                </button>

                <Link
                    to="/"
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400  transition-all hover:scale-105 active:scale-95"
                    title="Retour à l'accueil"
                >
                    <Home size={20} />
                </Link>

                <h2 className="text-xl font-black text-blue-900 dark:text-blue-400 whitespace-nowrap hidden sm:block">{title}</h2>

                <div className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2.5  w-full max-w-md group focus-within:ring-2 focus-within:ring-blue-500 transition-all   focus-within:bg-white dark:focus-within:bg-slate-900 focus-within: dark:focus-within:">
                    <Search className="text-slate-400 group-focus-within:text-blue-500" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="bg-transparent border-none outline-none text-slate-600 dark:text-slate-300 placeholder-slate-400 text-sm w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20  transition-all"
                    title={isDark ? "Mode clair" : "Mode sombre"}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Messages */}
                <button
                    onClick={() => {
                        const r = role.toLowerCase();
                        let path = '/dashboard/messages';
                        if (r === 'pdg') path = '/dashboard/pdg/messages';
                        else if (r === 'direction' || r === 'provisoriat') path = '/dashboard/direction/messages';
                        else if (r === 'secretariat') path = '/dashboard/secretariat/messages';
                        else if (r === 'enseignant') path = '/dashboard/teacher/messages';
                        else if (r === 'parent' || r === 'parents') path = '/dashboard/parent/messages';
                        else if (r === 'eleve') path = '/dashboard/student/messages';
                        navigate(path);
                    }}
                    className="p-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20  transition-all relative"
                    title="Messagerie"
                >
                    <Mail size={20} />
                    {unreadMessages > 0 && (
                        <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white    dark: text-[10px] font-black flex items-center justify-center shadow-lg">
                            {unreadMessages > 9 ? '9+' : unreadMessages}
                        </span>
                    )}
                </button>

                {/* Help */}
                <button
                    onClick={() => navigate(ROUTES.SUPPORT)}
                    className="hidden sm:flex p-3 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20  transition-all"
                    title="Support & Guide"
                >
                    <HelpCircle size={20} />
                </button>

                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2"></div>

                {/* User Profile Trigger */}
                <div
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-3 pl-2 group cursor-pointer"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors tracking-tight leading-none mb-1">
                            {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{role}</p>
                    </div>
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700  flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                            <User size={24} />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500   dark: "></div>
                    </div>
                </div>
            </div>

            {/* Profile Detail Modal */}
            <AnimatePresence mode="wait">
                {isProfileOpen && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-slate-900/30 backdrop-blur-xl transition-all"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsProfileOpen(false)}
                        />
                        <motion.div
                            layoutId="profile-modal"
                            className="bg-white/95 dark:bg-slate-900/98 backdrop-blur-3xl w-full max-w-2xl max-h-[85vh] ] shadow-2xl overflow-hidden relative   dark: flex flex-col"
                            initial={{ scale: 0.98, y: 15, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.98, y: 15, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            {/* Scrollable Content Container */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {/* Decorative Header with Hero Section */}
                                <div className="h-44 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative">
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                                    <div className="absolute -bottom-px left-0 right-0 h-16 bg-gradient-to-t from-white/95 dark:from-slate-900/98 to-transparent"></div>

                                    <button
                                        onClick={() => setIsProfileOpen(false)}
                                        className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white  transition-all hover:rotate-90   z-10"
                                    >
                                        <X size={18} />
                                    </button>

                                    <div className="absolute -bottom-10 left-12 flex items-end gap-6">
                                        <div className="relative">
                                            <div className="w-32 h-32 bg-white dark:bg-slate-900 p-2 ] shadow-2xl transition-transform hover:scale-105">
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 ] flex items-center justify-center text-white shadow-inner">
                                                    <User size={56} className="drop-shadow-lg" />
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 ]   dark: shadow-xl">
                                                <Check size={18} strokeWidth={4} />
                                            </div>
                                        </div>

                                        <div className="pb-3">
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="flex flex-col gap-1"
                                            >
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none outline-none">
                                                    {user?.firstName} {user?.lastName}
                                                </h3>
                                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-2 tracking-tight">
                                                    <MapPin size={14} /> {user?.institution?.name || 'Établissement Principal'}
                                                </p>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Hub Content */}
                                <div className="pt-16 p-12 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        <div className="md:col-span-2">
                                            <ProfileInfoCard icon={Mail} label="Adresse Email Officielle" value={user?.email || 'Non renseigné'} color="blue" delay={0.3} />
                                        </div>
                                        <ProfileInfoCard icon={Phone} label="Contact Téléphonique" value={user?.phone || 'Non renseigné'} color="indigo" delay={0.4} />
                                        <ProfileInfoCard icon={Shield} label="Rôle & Accès" value={user?.role || role} color="purple" delay={0.5} />

                                        {user?.classe && (
                                            <ProfileInfoCard icon={Users} label="Ma Classe" value={user.classe.name || 'Classe Assignée'} color="emerald" delay={0.6} />
                                        )}
                                        {user?.address && (
                                            <div className="md:col-span-2">
                                                <ProfileInfoCard icon={MapPin} label="Localisation" value={user.address} color="amber" delay={0.7} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Legal Guardians / Parents Section (No finance info here) */}
                                    {hasParentInfo && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.8 }}
                                            className="bg-slate-50 dark:bg-slate-800/40 ] p-8   dark: space-y-8"
                                        >
                                            <h4 className="flex items-center gap-3 text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                                <Heart size={18} className="text-rose-500" /> Contacts Responsables Légaux
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Father Column */}
                                                {(user?.fatherFirstName || user?.fatherAccount || (user?.parent && user.parent.firstName)) && (
                                                    <div className="space-y-4">
                                                        <div className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400  text-[9px] font-black uppercase tracking-widest inline-block">Père / Tuteur</div>
                                                        <div className="space-y-3">
                                                            <div className="flex gap-3">
                                                                <div className="w-8 h-8  bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shrink-0"><User size={14} /></div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nom</p>
                                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                        {user.fatherFirstName || user.fatherAccount?.firstName || user.parent?.firstName} {user.fatherLastName || user.fatherAccount?.lastName || user.parent?.lastName}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <div className="w-8 h-8  bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shrink-0"><Phone size={14} /></div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Téléphone</p>
                                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{user.fatherPhone || user.fatherAccount?.phone || user.parent?.phone || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Mother Column */}
                                                {(user?.motherFirstName || user?.motherAccount) && (
                                                    <div className="space-y-4   dark: md:pl-8">
                                                        <div className="px-4 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400  text-[9px] font-black uppercase tracking-widest inline-block">Mère / Tutrice</div>
                                                        <div className="space-y-3">
                                                            <div className="flex gap-3">
                                                                <div className="w-8 h-8  bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shrink-0"><User size={14} /></div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nom</p>
                                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                        {user.motherFirstName || user.motherAccount?.firstName} {user.motherLastName || user.motherAccount?.lastName}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <div className="w-8 h-8  bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shrink-0"><Phone size={14} /></div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Téléphone</p>
                                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{user.motherPhone || user.motherAccount?.phone || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Sticky Buttons (Removed any finance links) */}
                            <div className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl   dark: flex items-center justify-between gap-5 px-12 group/footer">
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        navigate(ROUTES.PROFILE);
                                    }}
                                    className="flex-1 py-4.5 bg-slate-900 dark:bg-indigo-600 text-white ] font-black shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3  "
                                >
                                    Mon Compte <User size={14} />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        logout();
                                    }}
                                    className="px-8 py-4.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 ] font-black hover:bg-red-600 hover:text-white transition-all text-[10px] uppercase tracking-widest   dark:"
                                >
                                    <LogOut size={18} />
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; -radius: 10px; }
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
                `}
            </style>
        </header>
    );
};

const ProfileInfoCard = ({ icon: Icon, label, value, color, delay }: { icon: any, label: string, value: string, color: string, delay: number }) => {
    const colors: Record<string, string> = {
        blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20  dark:',
        indigo: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20  dark:',
        purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20  dark:',
        emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20  dark:',
        amber: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20  dark:',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="p-5 bg-white dark:bg-slate-900/40 ]   dark: shadow-sm transition-all"
        >
            <div className={`w-10 h-10  flex items-center justify-center mb-3 ${colors[color]}`}>
                <Icon size={16} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 tracking-tight break-all">{value}</p>
        </motion.div>
    );
};

const ShortcutButton = ({ icon: Icon, label, sub, color, onClick }: { icon: any, label: string, sub: string, color: string, onClick?: () => void }) => {
    const iconColors: Record<string, string> = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
        slate: 'text-slate-600 bg-slate-50 dark:bg-slate-800/30',
    };

    return (
        <button
            onClick={onClick}
            className="flex-1 flex items-center gap-4 p-4 bg-white dark:bg-slate-900/30 ]   dark: hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/btn"
        >
            <div className={`w-10 h-10  flex items-center justify-center shrink-0 ${iconColors[color]}`}>
                <Icon size={16} />
            </div>
            <div className="text-left">
                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-0.5">{label}</p>
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{sub}</p>
            </div>
        </button>
    );
};

export default Topbar;
