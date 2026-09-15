import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    MessageSquare,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Layers,
    School,
    GraduationCap,
    Clock,
    ClipboardList,
    MapPin,
    ShieldCheck,
    Bell,
    UserCircle,
    User,
    Mail,
    CreditCard,
    PlusCircle,
    Building2,
    DollarSign,
    Printer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { getFileUrl } from '../../api/axios';
import api from '../../api/axios';

interface SidebarProps {
    role: string;
    collapsed: boolean;
    setCollapsed: (val: boolean) => void;
    mobileOpen?: boolean;
    setMobileOpen?: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const [globalUnreadCount, setGlobalUnreadCount] = React.useState<number>(0);

    const fetchGlobalUnread = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/chat/unread/${user.id}`);
            setGlobalUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
    const navRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
        fetchGlobalUnread();
        const handleRead = () => fetchGlobalUnread();
        window.addEventListener('chat_read', handleRead);
        const interval = setInterval(fetchGlobalUnread, 10000);

        const savedScroll = sessionStorage.getItem('sidebar-scroll');
        if (navRef.current && savedScroll) {
            navRef.current.scrollTop = parseInt(savedScroll, 10);
        }

        // Auto-expand menu if subitem is active
        Object.keys(menus).forEach(r => {
            menus[r].forEach(m => {
                if (m.subItems?.some((s: any) => location.pathname + location.search === s.path)) {
                    setExpandedItem(m.name);
                }
            });
        });

        return () => {
            window.removeEventListener('chat_read', handleRead);
            clearInterval(interval);
        };
    }, [user?.id, location.pathname, location.search]);

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        sessionStorage.setItem('sidebar-scroll', e.currentTarget.scrollTop.toString());
    };

    const menus: Record<string, any[]> = {
        APP_ADMIN: [
            { name: 'Tableau de bord', path: ROUTES.DASHBOARD.ADMIN.HOME, icon: LayoutDashboard },
            { name: 'Utilisateurs', path: ROUTES.DASHBOARD.ADMIN.USERS, icon: Users },
            { name: 'Bibliothèque', path: ROUTES.LIBRARY, icon: BookOpen },
            { name: 'Mon Profil', path: ROUTES.PROFILE, icon: UserCircle },
            { name: 'Paramètres', path: ROUTES.DASHBOARD.ADMIN.SETTINGS, icon: Settings },
        ],
        PDG: [
            { name: 'Tableau de bord', path: '/dashboard/pdg', icon: LayoutDashboard },
            { name: 'Statistiques Globales', path: '/dashboard/pdg/stats', icon: TrendingUp },
            { name: 'Établissements', path: '/dashboard/pdg/schools', icon: ShieldCheck },
            { name: 'Bibliothèque', path: ROUTES.LIBRARY, icon: BookOpen },
            { name: 'Finances & Analyses', path: '/dashboard/pdg/finances', icon: DollarSign },
            { name: 'Élèves & Effectifs', path: '/dashboard/pdg/students', icon: GraduationCap },
            { name: 'Enseignants', path: ROUTES.DASHBOARD.PDG.TEACHERS, icon: BookOpen },
            { name: 'Assiduité Globale', path: '/dashboard/pdg/attendance', icon: Clock },
            { name: 'Années Scolaires', path: ROUTES.DASHBOARD.PDG.ACADEMIC_YEARS, icon: Calendar },
            { name: 'Annonce', path: ROUTES.DASHBOARD.PDG.ANNOUNCEMENTS, icon: Bell },
            { name: 'Messagerie', path: '/dashboard/pdg/messages', icon: MessageSquare, badge: globalUnreadCount > 0 ? globalUnreadCount : undefined },
            {
                name: 'Paramètres',
                path: '/dashboard/pdg/settings',
                icon: Settings,
                subItems: [
                    { name: 'Profil & Identité', path: '/dashboard/pdg/settings?tab=profile', icon: User },
                    { name: 'Mon Abonnement', path: '/dashboard/pdg/settings?tab=subscription', icon: Mail },
                    { name: 'Sécurité & Accès', path: '/dashboard/pdg/settings?tab=security', icon: ShieldCheck },
                ]
            },
        ],
        Direction: [
            { name: 'Vue d\'ensemble', path: '/dashboard/direction', icon: LayoutDashboard },
            { name: 'Bibliothèque', path: ROUTES.LIBRARY, icon: BookOpen },
            { name: 'Gestion Cycles', path: '/dashboard/direction/cycles', icon: Layers },
            { name: 'Frais de scolarité', path: '/dashboard/direction/fees', icon: CreditCard },
            { name: 'Gestion des Classes', path: '/dashboard/direction/classes', icon: School },
            { name: 'Gestion des Matières', path: '/dashboard/direction/subjects', icon: BookOpen },
            { name: 'Liste Enseignants', path: ROUTES.DASHBOARD.DIRECTION.TEACHERS, icon: Users },
            { name: 'Gestion Elève', path: '/dashboard/direction/students', icon: GraduationCap },
            { name: 'Gestion des Présences', path: '/dashboard/direction/attendance', icon: Clock },
            { name: 'Finances & Analyses', path: '/dashboard/direction/finances', icon: DollarSign },
            { name: 'Modèle de Reçu', path: '/dashboard/direction/receipt-config', icon: Printer },
            { name: 'Emploi du temps', path: '/dashboard/direction/schedule', icon: Calendar },
            { name: 'Gestion des Salles', path: ROUTES.DASHBOARD.DIRECTION.ROOMS, icon: MapPin },
            { name: 'Messagerie', path: '/dashboard/direction/messages', icon: MessageSquare, badge: globalUnreadCount > 0 ? globalUnreadCount : undefined },
            { name: 'Annonce', path: '/dashboard/direction/announcements', icon: Bell },
            { name: 'Gestion des Bulletins', path: ROUTES.DASHBOARD.DIRECTION.REPORT_CARDS, icon: GraduationCap },
            { name: 'Années Scolaires', path: ROUTES.DASHBOARD.DIRECTION.ACADEMIC_YEARS, icon: Calendar },
        ],
        Secretariat: [
            { name: 'Tableau de bord', path: '/dashboard/secretariat', icon: LayoutDashboard },
            { name: 'Bibliothèque', path: ROUTES.LIBRARY, icon: BookOpen },
            { name: 'Gestion Cycles', path: ROUTES.DASHBOARD.SECRETARIAT.CYCLES, icon: Layers },
            { name: 'Frais de scolarité', path: '/dashboard/secretariat/fees', icon: CreditCard },
            { name: 'Gestion des Classes', path: ROUTES.DASHBOARD.SECRETARIAT.CLASSES, icon: School },
            { name: 'Gestion des Matières', path: ROUTES.DASHBOARD.SECRETARIAT.SUBJECTS, icon: BookOpen },
            { name: 'Personnel / Enseignants', path: ROUTES.DASHBOARD.SECRETARIAT.TEACHERS, icon: Users },
            { name: 'Inscriptions', path: '/dashboard/secretariat/enroll', icon: UserCircle },
            { name: 'Dossiers Élèves', path: '/dashboard/secretariat/students', icon: GraduationCap },
            { name: 'Présences', path: '/dashboard/secretariat/attendance', icon: Clock },
            { name: 'Finances & Analyses', path: '/dashboard/secretariat/finances', icon: DollarSign },
            { name: 'Emploi du temps', path: '/dashboard/secretariat/schedule', icon: Calendar },
            { name: 'Gestion des Salles', path: ROUTES.DASHBOARD.SECRETARIAT.ROOMS, icon: MapPin },
            { name: 'Gestion des Bulletins', path: ROUTES.DASHBOARD.SECRETARIAT.REPORT_CARDS, icon: GraduationCap },
            { name: 'Années Scolaires', path: ROUTES.DASHBOARD.SECRETARIAT.ACADEMIC_YEARS, icon: Calendar },
            { name: 'Annonce', path: ROUTES.DASHBOARD.SECRETARIAT.ANNOUNCEMENTS, icon: Bell },
            { name: 'Messagerie', path: '/dashboard/secretariat/messages', icon: MessageSquare, badge: globalUnreadCount > 0 ? globalUnreadCount : undefined },
        ],
        Enseignant: [
            { name: 'Tableau de bord', path: '/dashboard/teacher', icon: LayoutDashboard },
            { name: 'Bibliothèque', path: ROUTES.LIBRARY, icon: BookOpen },
            { name: 'Cahier de texte', path: '/dashboard/teacher/book', icon: BookOpen },
            { name: 'Gestion des Devoirs', path: ROUTES.DASHBOARD.TEACHER.HOMEWORK, icon: ClipboardList },
            { name: 'Notes & Évaluation', path: '/dashboard/teacher/grades', icon: TrendingUp },
            { name: 'Gestion des Bulletins', path: ROUTES.DASHBOARD.TEACHER.REPORT_CARDS, icon: GraduationCap },
            { name: 'Mes Classes', path: '/dashboard/teacher/classes', icon: Users },
            { name: 'Emploi du temps', path: '/dashboard/teacher/schedule', icon: Calendar },
            { name: 'Historique des Appels', path: '/dashboard/teacher/attendance', icon: Clock },
            { name: 'Messagerie', path: '/dashboard/teacher/messages', icon: MessageSquare, badge: globalUnreadCount > 0 ? globalUnreadCount : undefined },
        ],
        Parents: [
            { name: 'Mes Enfants', path: '/dashboard/parent', icon: Users },
            { name: 'Bibliothèque', path: ROUTES.LIBRARY, icon: BookOpen },
            { name: 'Inscrire un enfant', path: '/dashboard/parent/enroll', icon: PlusCircle },
            { name: 'Explorer les écoles', path: '/dashboard/parent/schools', icon: Building2 },
            { name: 'Finances & Reçus', path: '/dashboard/parent/payments', icon: CreditCard },
            { name: 'Résultats & Bulletins', path: '/dashboard/parent/results', icon: BookOpen },
            { name: 'Emploi du temps', path: '/dashboard/parent/schedule', icon: Calendar },
            { name: 'Assiduité', path: '/dashboard/parent/attendance', icon: Clock },
            { name: 'Messagerie', path: '/dashboard/parent/messages', icon: MessageSquare, badge: globalUnreadCount > 0 ? globalUnreadCount : undefined },
        ],
        Eleve: [
            { name: 'Mon Espace', path: '/dashboard/student', icon: LayoutDashboard },
            { name: 'Bibliothèque', path: ROUTES.LIBRARY, icon: BookOpen },
            { name: 'Mes Cours', path: '/dashboard/student/courses', icon: BookOpen },
            { name: 'Mes Notes', path: '/dashboard/student/results', icon: TrendingUp },
            { name: 'Devoirs', path: '/dashboard/student/homework', icon: Clock },
            { name: 'Emploi du temps', path: '/dashboard/student/schedule', icon: Calendar },
            { name: 'Messagerie', path: '/dashboard/student/messages', icon: MessageSquare, badge: globalUnreadCount > 0 ? globalUnreadCount : undefined },
        ]
    };

    const getMenuByRole = (r: string) => {
        const normalized = r.toUpperCase();
        let currentMenu: any[] = [];

        if (normalized === 'APP_ADMIN') currentMenu = [...menus.APP_ADMIN];
        else if (normalized === 'PDG') currentMenu = [...menus.PDG];
        else if (normalized === 'DIRECTION' || normalized === 'PROVISORIAT') currentMenu = [...menus.Direction];
        else if (normalized === 'SECRETARIAT') currentMenu = [...menus.Secretariat];
        else if (normalized === 'ENSEIGNANT') currentMenu = [...menus.Enseignant];
        else if (normalized === 'PARENT' || normalized === 'PARENTS') currentMenu = [...menus.Parents];
        else if (normalized === 'ELEVE') currentMenu = [...menus.Eleve];
        else currentMenu = [...menus.Eleve];

        return currentMenu;
    };
    const currentMenu = getMenuByRole(role);

    return (
        <>
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen?.(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside
                className={`h-screen bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex flex-col fixed lg:sticky top-0 left-0 z-50 shadow-xl border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ${
                    collapsed ? 'lg:w-[72px]' : 'lg:w-[240px]'
                } ${
                    mobileOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full lg:translate-x-0 w-[240px]'
                }`}
            >
                {/* Header Logo */}
                <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 group relative">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl shadow-sm shrink-0 overflow-hidden flex items-center justify-center text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-700">
                        {user?.institution?.logoUrl ? (
                            <img src={getFileUrl(user.institution.logoUrl)} alt="Logo" className="w-7 h-7 object-contain" />
                        ) : (
                            <School size={22} className="text-blue-600 dark:text-blue-400" />
                        )}
                    </div>
                    {(!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) ? (
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-slate-900 dark:text-white truncate tracking-tight uppercase">
                                {user?.institution?.name || "ACADEMIA CONNECT"}
                            </span>
                            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">
                                Espace Éducation
                            </span>
                        </div>
                    ) : (
                        <div className="fixed left-[80px] px-3.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white dark:text-white text-xs font-black rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-[9999] uppercase tracking-tight border border-slate-700 dark:border-slate-600">
                            <span className="text-white dark:text-white">{user?.institution?.name || "ACADEMIA CONNECT"}</span>
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800" />
                        </div>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav ref={navRef} onScroll={handleScroll} className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    <div className="px-3 space-y-1.5">
                        {currentMenu.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            const isExpanded = expandedItem === item.name;
                            const hasSubItems = item.subItems && item.subItems.length > 0;

                            return (
                                <div key={index} className="space-y-1">
                                    {hasSubItems ? (
                                        <button
                                            onClick={() => {
                                                if (collapsed && window.innerWidth >= 1024) {
                                                    setCollapsed(false);
                                                }
                                                setExpandedItem(isExpanded ? null : item.name);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                                                isActive || item.subItems.some((s: any) => location.pathname + location.search === s.path)
                                                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-800/60'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                                            }`}
                                        >
                                            <item.icon size={18} className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'} shrink-0`} />
                                            {(!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) ? (
                                                <>
                                                    <span className="text-xs whitespace-nowrap flex-1 text-left">{item.name}</span>
                                                    {isExpanded ? <ChevronLeft size={14} className="-rotate-90 transition-transform" /> : <ChevronLeft size={14} className="transition-transform" />}
                                                </>
                                            ) : (
                                                <div className="fixed left-[80px] px-3.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white dark:text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-[9999] flex items-center gap-2 border border-slate-700 dark:border-slate-600">
                                                    <span className="text-white dark:text-white">{item.name}</span>
                                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800" />
                                                </div>
                                            )}
                                        </button>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            onClick={() => { if (window.innerWidth < 1024) setMobileOpen?.(false); }}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                                                isActive
                                                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                                            }`}
                                        >
                                            <item.icon size={18} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'} shrink-0`} />
                                            {(!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) ? (
                                                <>
                                                    <span className="text-xs whitespace-nowrap flex-1">{item.name}</span>
                                                    {item.badge && (
                                                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 bg-red-500 text-white shadow-sm">
                                                            {item.badge > 99 ? '99+' : item.badge}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="fixed left-[80px] px-3.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white dark:text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-[9999] flex items-center gap-2 border border-slate-700 dark:border-slate-600">
                                                    <span className="text-white dark:text-white">{item.name}</span>
                                                    {item.badge && (
                                                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-red-500 text-white">
                                                            {item.badge > 99 ? '99+' : item.badge}
                                                        </span>
                                                    )}
                                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800" />
                                                </div>
                                            )}
                                        </Link>
                                    )}

                                    {/* Sub-menu items */}
                                    <AnimatePresence>
                                        {hasSubItems && isExpanded && (!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-slate-50 dark:bg-slate-800/50 rounded-xl mx-1 my-1 p-1 space-y-1 border border-slate-100 dark:border-slate-800"
                                            >
                                                {item.subItems.map((sub: any, subIndex: number) => {
                                                    const isSubActive = location.pathname + location.search === sub.path;
                                                    const SubIcon = sub.icon;
                                                    return (
                                                        <Link
                                                            key={subIndex}
                                                            to={sub.path}
                                                            onClick={() => { if (window.innerWidth < 1024) setMobileOpen?.(false); }}
                                                            className={`flex items-center gap-2.5 px-5 py-2 rounded-lg text-xs transition-all relative ${
                                                                isSubActive
                                                                    ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 font-bold shadow-sm'
                                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                                                            }`}
                                                        >
                                                            {isSubActive && <motion.div layoutId="subactive" className="absolute left-1 w-1 h-4 bg-blue-500 rounded-full" />}
                                                            {SubIcon ? <SubIcon size={14} className={`${isSubActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} shrink-0`} /> : <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubActive ? 'bg-blue-500' : 'bg-slate-400'}`} />}
                                                            <span className="truncate">{sub.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer / Controls */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1 shrink-0">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all group relative font-bold text-xs">
                        <LogOut size={18} className="group-hover:rotate-12 transition-transform shrink-0" />
                        {(!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) ? (
                            <span>Déconnexion</span>
                        ) : (
                            <div className="fixed left-[80px] px-3.5 py-1.5 bg-rose-600 dark:bg-rose-600 text-white dark:text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-[9999] flex items-center gap-1.5 border border-rose-500">
                                <span className="text-white dark:text-white">Déconnexion</span>
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-rose-600" />
                            </div>
                        )}
                    </button>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full lg:flex hidden items-center justify-center p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all group relative"
                        title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        {collapsed && (
                            <div className="fixed left-[80px] px-3.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white dark:text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-[9999] border border-slate-700 dark:border-slate-600">
                                <span className="text-white dark:text-white">Agrandir le menu</span>
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-800" />
                            </div>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
