import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    Heart,
    GraduationCap,
    BookOpen,
    Clock,
    DollarSign,
    UserPlus,
    School,
    Calendar,
    LayoutDashboard,
    ArrowRight,
    SearchX
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

    // Global Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<{
        students: any[];
        teachers: any[];
        classes: any[];
        navigation: any[];
    }>({ students: [], teachers: [], classes: [], navigation: [] });

    const searchRef = useRef<HTMLDivElement>(null);

    const instId = typeof user?.institution === 'object' ? user?.institution?.id : user?.institution;

    const getRolePath = () => {
        const r = role.toLowerCase();
        if (r === 'pdg') return 'pdg';
        if (r === 'direction' || r === 'provisoriat') return 'direction';
        if (r === 'secretariat') return 'secretariat';
        if (r === 'enseignant') return 'teacher';
        if (r === 'parent' || r === 'parents') return 'parent';
        return 'student';
    };

    const navigationShortcuts = [
        { label: 'Tableau de bord', path: `/dashboard/${getRolePath()}`, category: 'Navigation', icon: LayoutDashboard },
        { label: 'Dossiers Élèves', path: `/dashboard/${getRolePath()}/students`, category: 'Navigation', icon: GraduationCap },
        { label: 'Gestion des Inscriptions', path: `/dashboard/${getRolePath()}/enroll`, category: 'Navigation', icon: UserPlus },
        { label: 'Finances & Scolarité', path: `/dashboard/${getRolePath()}/finances`, category: 'Navigation', icon: DollarSign },
        { label: 'Présences & Appels', path: `/dashboard/${getRolePath()}/attendance`, category: 'Navigation', icon: Clock },
        { label: 'Messagerie & Chat', path: `/dashboard/${getRolePath()}/messages`, category: 'Navigation', icon: Mail },
        { label: 'Emploi du Temps', path: `/dashboard/${getRolePath()}/schedule`, category: 'Navigation', icon: Calendar },
        { label: 'Gestion des Classes', path: `/dashboard/${getRolePath()}/classes`, category: 'Navigation', icon: School },
    ];

    const fetchUnreadCount = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/chat/unread/${user.id}`);
            setUnreadMessages(res.data.unreadCount || 0);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const handleRead = () => fetchUnreadCount();
        window.addEventListener('chat_read', handleRead);
        const interval = setInterval(fetchUnreadCount, 10000);
        return () => {
            window.removeEventListener('chat_read', handleRead);
            clearInterval(interval);
        };
    }, [user?.id]);

    // Handle Click Outside Search Input
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Perform Global Search on Query Change
    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            setSearchResults({ students: [], teachers: [], classes: [], navigation: [] });
            setSearchLoading(false);
            return;
        }

        // Filter navigation shortcuts
        const matchedNav = navigationShortcuts.filter(nav =>
            nav.label.toLowerCase().includes(query)
        );

        if (query.length < 2) {
            setSearchResults({ students: [], teachers: [], classes: [], navigation: matchedNav });
            return;
        }

        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const params = instId ? { params: { institutionId: instId } } : {};
                const [studentsRes, teachersRes, classesRes] = await Promise.all([
                    api.get('/students', params).catch(() => ({ data: [] })),
                    api.get('/teachers', params).catch(() => ({ data: [] })),
                    api.get('/classes', params).catch(() => ({ data: [] }))
                ]);

                const matchedStudents = (studentsRes.data || []).filter((s: any) =>
                    `${s.firstName} ${s.lastName}`.toLowerCase().includes(query) ||
                    (s.studentIdNumber && s.studentIdNumber.toLowerCase().includes(query))
                ).slice(0, 5);

                const matchedTeachers = (teachersRes.data || []).filter((t: any) =>
                    `${t.firstName} ${t.lastName}`.toLowerCase().includes(query) ||
                    (t.email && t.email.toLowerCase().includes(query))
                ).slice(0, 4);

                const matchedClasses = (classesRes.data || []).filter((c: any) =>
                    c.name?.toLowerCase().includes(query)
                ).slice(0, 4);

                setSearchResults({
                    navigation: matchedNav,
                    students: matchedStudents,
                    teachers: matchedTeachers,
                    classes: matchedClasses
                });
            } catch (err) {
                console.error("Global search error:", err);
            } finally {
                setSearchLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery, instId]);

    const hasResults = searchResults.navigation.length > 0 ||
        searchResults.students.length > 0 ||
        searchResults.teachers.length > 0 ||
        searchResults.classes.length > 0;

    const hasParentInfo = user?.fatherFirstName || user?.motherFirstName || user?.parent || user?.fatherAccount || user?.motherAccount;

    return (
        <header className="h-16 sm:h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-colors">
            <div className="flex items-center gap-3 lg:gap-5 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl transition-all lg:hidden"
                    title="Ouvrir le menu"
                >
                    <Menu size={18} />
                </button>

                <Link
                    to="/"
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl transition-all hover:scale-105 active:scale-95"
                    title="Retour à l'accueil"
                >
                    <Home size={18} />
                </Link>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap hidden sm:block tracking-tight">{title}</h2>

                {/* Interactive Global Search Input */}
                <div ref={searchRef} className="relative hidden md:block w-full max-w-sm">
                    <div className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all border ${
                        isSearchFocused 
                            ? 'bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                            : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50'
                    }`}>
                        <Search className={`shrink-0 transition-colors ${isSearchFocused ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            placeholder="Rechercher un élève, enseignant, classe ou page..."
                            className="bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-xs font-bold w-full"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); setSearchResults({ students: [], teachers: [], classes: [], navigation: [] }); }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white shrink-0"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Global Search Dropdown Overlay */}
                    <AnimatePresence>
                        {isSearchFocused && searchQuery.trim().length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[75vh] flex flex-col"
                            >
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Résultats de recherche</span>
                                    {searchLoading && <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                                </div>

                                <div className="p-3 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                                    {!searchLoading && !hasResults ? (
                                        <div className="py-8 text-center text-slate-400">
                                            <SearchX size={28} className="mx-auto mb-1.5 text-slate-300 dark:text-slate-600" />
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Aucun résultat trouvé</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Essayez avec un nom, prénom ou mot-clé différent.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Navigation Shortcuts */}
                                            {searchResults.navigation.length > 0 && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">Raccourcis Navigation</p>
                                                    {searchResults.navigation.map((nav, idx) => {
                                                        const IconComp = nav.icon;
                                                        return (
                                                            <div
                                                                key={idx}
                                                                onClick={() => {
                                                                    navigate(nav.path);
                                                                    setIsSearchFocused(false);
                                                                }}
                                                                className="p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between transition-colors group"
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                                        <IconComp size={14} />
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                        {nav.label}
                                                                    </span>
                                                                </div>
                                                                <ArrowRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Student Results */}
                                            {searchResults.students.length > 0 && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">Élèves ({searchResults.students.length})</p>
                                                    {searchResults.students.map((st) => (
                                                        <div
                                                            key={st.id}
                                                            onClick={() => {
                                                                navigate(`/dashboard/${getRolePath()}/students?studentId=${st.id}`);
                                                                setIsSearchFocused(false);
                                                            }}
                                                            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                                    {st.firstName?.[0]}{st.lastName?.[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{st.firstName} {st.lastName}</p>
                                                                    <p className="text-[10px] text-slate-400">Classe: {st.classe?.name || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                                                                Voir Dossier
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Teacher Results */}
                                            {searchResults.teachers.length > 0 && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">Enseignants ({searchResults.teachers.length})</p>
                                                    {searchResults.teachers.map((t) => (
                                                        <div
                                                            key={t.id}
                                                            onClick={() => {
                                                                navigate(`/dashboard/${getRolePath()}/teachers`);
                                                                setIsSearchFocused(false);
                                                            }}
                                                            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                                    {t.firstName?.[0]}{t.lastName?.[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{t.firstName} {t.lastName}</p>
                                                                    <p className="text-[10px] text-slate-400">{t.email || 'Enseignant'}</p>
                                                                </div>
                                                            </div>
                                                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                                                Enseignant
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Class Results */}
                                            {searchResults.classes.length > 0 && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">Classes ({searchResults.classes.length})</p>
                                                    {searchResults.classes.map((cls) => (
                                                        <div
                                                            key={cls.id}
                                                            onClick={() => {
                                                                navigate(`/dashboard/${getRolePath()}/classes`);
                                                                setIsSearchFocused(false);
                                                            }}
                                                            className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                                                    <School size={14} />
                                                                </div>
                                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{cls.name}</p>
                                                            </div>
                                                            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                                                Classe
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-all"
                    title={isDark ? "Mode clair" : "Mode sombre"}
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
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
                    className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-all relative"
                    title="Messagerie"
                >
                    <Mail size={18} />
                    {unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-md">
                            {unreadMessages > 99 ? '99+' : unreadMessages}
                        </span>
                    )}
                </button>

                {/* Help */}
                <button
                    onClick={() => navigate(ROUTES.SUPPORT)}
                    className="hidden sm:flex p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-all"
                    title="Support & Guide"
                >
                    <HelpCircle size={18} />
                </button>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 sm:mx-2"></div>

                {/* User Profile Trigger */}
                <div
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-3 pl-1 sm:pl-2 group cursor-pointer"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight leading-none mb-1">
                            {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">{role}</p>
                    </div>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all duration-200">
                            <User size={20} />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    </div>
                </div>
            </div>

            {/* Profile Detail Modal (Rendered via Portal to overlay ALL pages and sidebars) */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence mode="wait">
                    {isProfileOpen && (
                        <motion.div
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md overflow-y-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div
                                className="fixed inset-0"
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <motion.div
                                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden relative flex flex-col z-10 my-auto"
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            >
                                {/* Modal Banner Header */}
                                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white relative shrink-0">
                                    <button
                                        onClick={() => setIsProfileOpen(false)}
                                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all shadow-sm"
                                        title="Fermer"
                                    >
                                        <X size={18} />
                                    </button>

                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                        <div className="relative shrink-0">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-md p-1.5 shadow-xl">
                                                <div className="w-full h-full rounded-xl bg-white text-blue-600 dark:bg-slate-800 dark:text-blue-400 flex items-center justify-center font-bold">
                                                    <User size={36} />
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-md">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 pt-1">
                                            <span className="px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider inline-block">
                                                {user?.role || role}
                                            </span>
                                            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                                                {user?.firstName} {user?.lastName}
                                            </h3>
                                            <p className="text-xs text-blue-100 flex items-center justify-center sm:justify-start gap-1 font-medium">
                                                <MapPin size={12} /> {user?.institution?.name || 'Établissement Principal'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Scrollable Info */}
                                <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-6 flex-1">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="sm:col-span-2">
                                            <ProfileInfoCard icon={Mail} label="Adresse Email" value={user?.email || 'Non renseigné'} color="blue" />
                                        </div>
                                        <ProfileInfoCard icon={Phone} label="Téléphone" value={user?.phone || 'Non renseigné'} color="indigo" />
                                        <ProfileInfoCard icon={Shield} label="Rôle & Accès" value={user?.role || role} color="purple" />

                                        {user?.classe && (
                                            <ProfileInfoCard icon={Users} label="Classe" value={user.classe.name || 'Classe Assignée'} color="emerald" />
                                        )}
                                        {user?.address && (
                                            <div className="sm:col-span-2">
                                                <ProfileInfoCard icon={MapPin} label="Adresse" value={user.address} color="amber" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Parent Contacts Section */}
                                    {hasParentInfo && (
                                        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                <Heart size={16} className="text-rose-500" /> Contacts Responsables Légaux
                                            </h4>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {/* Father */}
                                                {(user?.fatherFirstName || user?.fatherAccount || (user?.parent && user.parent.firstName)) && (
                                                    <div className="space-y-3">
                                                        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">Père / Tuteur</div>
                                                        <div className="space-y-2 text-xs">
                                                            <p className="font-bold text-slate-900 dark:text-white">
                                                                {user.fatherFirstName || user.fatherAccount?.firstName || user.parent?.firstName} {user.fatherLastName || user.fatherAccount?.lastName || user.parent?.lastName}
                                                            </p>
                                                            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                                <Phone size={12} className="text-blue-500" /> {user.fatherPhone || user.fatherAccount?.phone || user.parent?.phone || 'Non renseigné'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Mother */}
                                                {(user?.motherFirstName || user?.motherAccount) && (
                                                    <div className="space-y-3">
                                                        <div className="px-3 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">Mère / Tutrice</div>
                                                        <div className="space-y-2 text-xs">
                                                            <p className="font-bold text-slate-900 dark:text-white">
                                                                {user.motherFirstName || user.motherAccount?.firstName} {user.motherLastName || user.motherAccount?.lastName}
                                                            </p>
                                                            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                                <Phone size={12} className="text-rose-500" /> {user.motherPhone || user.motherAccount?.phone || 'Non renseigné'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            navigate(ROUTES.PROFILE);
                                        }}
                                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
                                    >
                                        Mon Compte <User size={14} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            logout();
                                        }}
                                        className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
                                        title="Déconnexion"
                                    >
                                        <LogOut size={16} /> Déconnexion
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                `}
            </style>
        </header>
    );
};

const ProfileInfoCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => {
    const colors: Record<string, string> = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40',
        indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/40',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/40',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40',
        amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40',
    };

    return (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 border ${colors[color]}`}>
                <Icon size={16} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{value}</p>
        </div>
    );
};

export default Topbar;
