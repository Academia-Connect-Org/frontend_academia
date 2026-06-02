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
    Mail
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
            { name: 'Mon Profil', path: ROUTES.PROFILE, icon: UserCircle },
            { name: 'Paramètres', path: ROUTES.DASHBOARD.ADMIN.SETTINGS, icon: Settings },
        ],
        PDG: [
            { name: 'Tableau de bord', path: '/dashboard/pdg', icon: LayoutDashboard },
            { name: 'Statistiques Globales', path: '/dashboard/pdg/stats', icon: TrendingUp },
            { name: 'Établissements', path: '/dashboard/pdg/schools', icon: ShieldCheck },
            { name: 'Élèves & Effectifs', path: '/dashboard/pdg/students', icon: GraduationCap },
            { name: 'Assiduité Globale', path: '/dashboard/pdg/attendance', icon: Clock },
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
            { name: 'Gestion Cycles', path: '/dashboard/direction/cycles', icon: Layers },
            { name: 'Gestion des Classes', path: '/dashboard/direction/classes', icon: School },
            { name: 'Gestion des Matières', path: '/dashboard/direction/subjects', icon: BookOpen },
            { name: 'Liste Enseignants', path: ROUTES.DASHBOARD.DIRECTION.TEACHERS, icon: Users },
            { name: 'Gestion Elève', path: '/dashboard/direction/students', icon: GraduationCap },
            { name: 'Gestion des Présences', path: '/dashboard/direction/attendance', icon: Clock },
            { name: 'Emploi du temps', path: '/dashboard/direction/schedule', icon: Calendar },
            { name: 'Gestion des Salles', path: ROUTES.DASHBOARD.DIRECTION.ROOMS, icon: MapPin },
            { name: 'Messagerie', path: '/dashboard/direction/messages', icon: MessageSquare, badge: globalUnreadCount > 0 ? globalUnreadCount : undefined },
            { name: 'Annonce', path: '/dashboard/direction/announcements', icon: Bell },
            { name: 'Gestion des Bulletins', path: ROUTES.DASHBOARD.DIRECTION.REPORT_CARDS, icon: GraduationCap },
        ],
        Secretariat: [
            { name: 'Tableau de bord', path: '/dashboard/secretariat', icon: LayoutDashboard },
            { name: 'Gestion Cycles', path: ROUTES.DASHBOARD.SECRETARIAT.CYCLES, icon: Layers },
            { name: 'Gestion des Classes', path: ROUTES.DASHBOARD.SECRETARIAT.CLASSES, icon: School },
            { name: 'Gestion des Matières', path: ROUTES.DASHBOARD.SECRETARIAT.SUBJECTS, icon: BookOpen },
            { name: 'Personnel / Enseignants', path: ROUTES.DASHBOARD.SECRETARIAT.TEACHERS, icon: Users },
            { name: 'Inscriptions', path: '/dashboard/secretariat/enroll', icon: UserCircle },
            { name: 'Dossiers Élèves', path: '/dashboard/secretariat/students', icon: GraduationCap },
            { name: 'Présences', path: '/dashboard/secretariat/attendance', icon: Clock },
            { name: 'Emploi du temps', path: '/dashboard/secretariat/schedule', icon: Calendar },
            { name: 'Gestion des Salles', path: ROUTES.DASHBOARD.SECRETARIAT.ROOMS, icon: MapPin },
            { name: 'Gestion des Bulletins', path: ROUTES.DASHBOARD.SECRETARIAT.REPORT_CARDS, icon: GraduationCap },
            { name: 'Annonce', path: ROUTES.DASHBOARD.SECRETARIAT.ANNOUNCEMENTS, icon: Bell },
            { name: 'Messagerie', path: '/dashboard/secretariat/messages', icon: MessageSquare, badge: globalUnreadCount > 0 ? globalUnreadCount : undefined },
        ],
        Enseignant: [
            { name: 'Tableau de bord', path: '/dashboard/teacher', icon: LayoutDashboard },
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
            { name: 'Résultats & Bulletins', path: '/dashboard/parent/results', icon: BookOpen },
            { name: 'Emploi du temps', path: '/dashboard/parent/schedule', icon: Calendar },
            { name: 'Assiduité', path: '/dashboard/parent/attendance', icon: Clock },
            { name: 'Messagerie', path: '/dashboard/parent/messages', icon: MessageSquare, badge: globalUnreadCount > 0 ? globalUnreadCount : undefined },
        ],
        Eleve: [
            { name: 'Mon Espace', path: '/dashboard/student', icon: LayoutDashboard },
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

            <motion.aside
                initial={false}
                animate={{
                    width: (typeof window !== 'undefined' && window.innerWidth < 1024) ? 280 : (collapsed ? 80 : 280),
                    x: (typeof window !== 'undefined' && window.innerWidth < 1024) ? (mobileOpen ? 0 : -280) : 0
                }}
                className={`h-screen bg-slate-900 text-slate-300 flex flex-col fixed lg:sticky top-0 left-0 z-50 shadow-2xl overflow-hidden transition-all duration-300`}
            >
                <div className="p-6 flex items-center gap-3 border-b border-white/5">
                    <div className="bg-white p-1 rounded-xl shadow-lg shrink-0 overflow-hidden flex items-center justify-center text-slate-900">
                        {user?.institution?.logoUrl ? (
                            <img src={getFileUrl(user.institution.logoUrl)} alt="Logo" className="w-8 h-8 object-contain" />
                        ) : (
                            <School size={24} />
                        )}
                    </div>
                    {(!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-white truncate tracking-tight uppercase">
                                {user?.institution?.name || "NB-MIND School"}
                            </span>
                            <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest leading-none">
                                Espace Éducation
                            </span>
                        </div>
                    )}
                </div>

                <nav ref={navRef} onScroll={handleScroll} className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                    <div className="px-4 space-y-1.5">
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
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${isActive || item.subItems.some((s: any) => location.pathname + location.search === s.path)
                                                ? 'bg-white/10 text-white'
                                                : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/5'
                                                }`}
                                        >
                                            <item.icon size={22} className={`${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'} shrink-0`} />
                                            {(!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                                                <>
                                                    <span className="font-medium whitespace-nowrap flex-1 text-left">{item.name}</span>
                                                    {isExpanded ? <ChevronLeft size={16} className="-rotate-90 transition-transform" /> : <ChevronLeft size={16} className="transition-transform" />}
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            onClick={() => { if (window.innerWidth < 1024) setMobileOpen?.(false); }}
                                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-white/10'
                                                : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent hover:border-white/5'
                                                }`}
                                        >
                                            <item.icon size={22} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} shrink-0`} />
                                            {(!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                                                <span className="font-medium whitespace-nowrap flex-1">{item.name}</span>
                                            )}
                                            {item.badge && (!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 bg-red-500 text-white shadow-lg">
                                                    {item.badge}
                                                </span>
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
                                                className="overflow-hidden bg-white/5 rounded-2xl mx-1"
                                            >
                                                {item.subItems.map((sub: any, subIndex: number) => {
                                                    const isSubActive = location.pathname + location.search === sub.path;
                                                    const SubIcon = sub.icon;
                                                    return (
                                                        <Link
                                                            key={subIndex}
                                                            to={sub.path}
                                                            onClick={() => { if (window.innerWidth < 1024) setMobileOpen?.(false); }}
                                                            className={`flex items-center gap-3 px-8 py-3 text-xs font-bold transition-all relative ${isSubActive
                                                                ? 'text-white bg-white/5 shadow-inner'
                                                                : 'text-slate-500 hover:text-slate-300'
                                                                }`}
                                                        >
                                                            {isSubActive && <motion.div layoutId="subactive" className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />}
                                                            {SubIcon ? <SubIcon size={16} className={`${isSubActive ? 'text-blue-400' : 'text-slate-600'} shrink-0`} /> : <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubActive ? 'bg-blue-500' : 'bg-slate-700'}`} />}
                                                            <span className={isSubActive ? 'font-black' : 'font-medium'}>{sub.name}</span>
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

                <div className="p-4 border-t border-white/5 space-y-2">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group">
                        <LogOut size={22} className="group-hover:rotate-12 transition-transform shrink-0" />
                        {(!collapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && <span className="font-bold">Déconnexion</span>}
                    </button>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full lg:flex hidden items-center justify-center p-3 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
