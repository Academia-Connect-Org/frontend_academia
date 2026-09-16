import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight, ShieldCheck, Zap, Users, Globe, Building, Briefcase,
    FileText, GraduationCap, Mail, Sparkles, CheckCircle2, Laptop,
    Smartphone, Download, ChevronDown, LayoutDashboard, Copy, Check,
    Activity, Send, Bell, Clock, ArrowRightLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';
import featAdmin from '../assets/feature-admin.png';
import featComm from '../assets/feature-comm.png';
import featPerf from '../assets/feature-perf.png';
import logoImg from '../assets/logo13.png';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

const AnimatedCounter = ({ from = 0, to, duration = 2, suffix = "" }: { from?: number, to: number, duration?: number, suffix?: string }) => {
    const [count, setCount] = useState(from);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

    useEffect(() => {
        if (isInView) {
            let startTimestamp: number | null = null;
            const step = (timestamp: number) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
                // easeOutQuart
                const easeProgress = 1 - Math.pow(1 - progress, 4);
                setCount(Math.floor(easeProgress * (to - from) + from));
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }
    }, [isInView, from, to, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
};

const RealtimeAcademicEcosystem = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'annonces' | 'notifications' | 'messages'>('all');
    const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);

    const SPATIAL_POSITIONS = {
        fondateur: { x: '50%', y: '8%', label: "Fondateur (PDG)" },
        direction: { x: '18%', y: '24%', label: "Direction Général" },
        teachers: { x: '82%', y: '24%', label: "Enseignants" },
        eleves: { x: '18%', y: '72%', label: "Élèves" },
        parents: { x: '82%', y: '72%', label: "Parents d'Élèves" },
        provisorat: { x: '50%', y: '88%', label: "Provisorat" }
    };

    const SCENARIOS = [
        {
            id: 'annonce-direction',
            type: 'annonces',
            badgeLabel: '📢 Annonce Générale',
            icon: Mail,
            color: 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 border-purple-300',
            origin: SPATIAL_POSITIONS.direction,
            destinations: [
                SPATIAL_POSITIONS.teachers,
                SPATIAL_POSITIONS.parents,
                SPATIAL_POSITIONS.eleves,
                SPATIAL_POSITIONS.provisorat
            ],
            text: "Direction : Annonce officielle diffusée simultanément à toute l'école",
            status: "Reçu en temps réel par les Enseignants, Parents & Élèves"
        },
        {
            id: 'notif-enseignant',
            type: 'notifications',
            badgeLabel: '🔔 Notification Push & SMS',
            icon: Bell,
            color: 'bg-amber-500 text-white shadow-lg shadow-amber-500/50 border-amber-300',
            origin: SPATIAL_POSITIONS.teachers,
            destinations: [
                SPATIAL_POSITIONS.parents,
                SPATIAL_POSITIONS.eleves,
                SPATIAL_POSITIONS.provisorat
            ],
            text: "Enseignants : Publication des devoirs & Clôture de l'appel numérique de 08h",
            status: "Alerte instantanée transmise sur le mobile des Familles"
        },
        {
            id: 'message-parent',
            type: 'messages',
            badgeLabel: '💬 Message Direct & Reçu PDF',
            icon: Send,
            color: 'bg-sky-500 text-white shadow-lg shadow-sky-500/50 border-sky-300',
            origin: SPATIAL_POSITIONS.parents,
            destinations: [
                SPATIAL_POSITIONS.direction,
                SPATIAL_POSITIONS.provisorat
            ],
            text: "Parents : Envoi du justificatif d'absence & Reçu de paiement scolarité",
            status: "Accusé de réception validé dans le portail Direction"
        },
        {
            id: 'annonce-fondateur',
            type: 'annonces',
            badgeLabel: '📢 Directive Stratégique',
            icon: Sparkles,
            color: 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 border-indigo-300',
            origin: SPATIAL_POSITIONS.fondateur,
            destinations: [
                SPATIAL_POSITIONS.direction,
                SPATIAL_POSITIONS.provisorat
            ],
            text: "Fondateur (PDG) : Orientations pédagogiques & Validation du budget annuel",
            status: "Diffusé aux instances de Direction & Provisorat"
        },
        {
            id: 'notif-provisorat',
            type: 'annonces',
            badgeLabel: '📢 Planning Examens',
            icon: ShieldCheck,
            color: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 border-emerald-300',
            origin: SPATIAL_POSITIONS.provisorat,
            destinations: [
                SPATIAL_POSITIONS.teachers,
                SPATIAL_POSITIONS.eleves
            ],
            text: "Provisorat : Calendrier officiel des épreuves du 2nd Trimestre",
            status: "Synchronisé dans les agendas des classes"
        },
        {
            id: 'devoir-eleve',
            type: 'messages',
            badgeLabel: '📝 Remise de Devoir',
            icon: FileText,
            color: 'bg-teal-500 text-white shadow-lg shadow-teal-500/50 border-teal-300',
            origin: SPATIAL_POSITIONS.eleves,
            destinations: [
                SPATIAL_POSITIONS.teachers
            ],
            text: "Élèves : Dépôt du projet de SVT numérisé dans le cahier de texte",
            status: "Enregistré dans l'espace Enseignant"
        }
    ];

    const filteredScenarios = activeTab === 'all'
        ? SCENARIOS
        : SCENARIOS.filter(s => s.type === activeTab);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveScenarioIdx((prev) => (prev + 1) % filteredScenarios.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [filteredScenarios.length]);

    const activeScenario = filteredScenarios[activeScenarioIdx] || SCENARIOS[0];
    const ScenarioIcon = activeScenario.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 max-w-6xl mx-auto p-5 sm:p-10 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden text-slate-800 dark:text-white transition-colors duration-300"
        >
            {/* Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/15 blur-[130px] animate-pulse" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 blur-[130px] animate-pulse" />
                <div className="absolute top-1/2 left-0 w-80 h-80 bg-sky-500/10 dark:bg-sky-500/15 blur-[110px]" />
                <div className="absolute top-1/2 right-0 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/15 blur-[110px]" />
            </div>

            {/* Header Title */}
            <div className="text-center max-w-2xl mx-auto mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold text-xs rounded-full mb-3 shadow-sm">
                    <Activity size={14} className="animate-pulse text-emerald-600 dark:text-emerald-400" /> Circulation d'Annonces & Notifications en Direct
                </div>
                <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                    L'Écosystème Scolaire Académique Interconnecté
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
                    Observatoire interactif des flux : Regardez les annonces, notifications et messages voyager physiquement entre le Fondateur (Haut), la Direction & Élèves (Gauche), le Provisorat (Bas) et les Enseignants & Parents (Droite).
                </p>
            </div>

            {/* FILTER CATEGORY TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 relative z-10">
                {[
                    { id: 'all', label: 'Tous les Flux', icon: Globe },
                    { id: 'annonces', label: '📢 Annonces Officiel', icon: Mail },
                    { id: 'notifications', label: '🔔 Notifications SMS & App', icon: Bell },
                    { id: 'messages', label: '💬 Messages Directs', icon: Send }
                ].map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setActiveScenarioIdx(0);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === tab.id
                                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 scale-105'
                                : 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-700'
                                }`}
                        >
                            <TabIcon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* LIVE REAL-TIME CIRCULATING EXCHANGE BANNER */}
            <div className="mb-8 relative z-10 bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-300">
                <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-200 dark:border-slate-700/60 pb-2.5">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${activeScenario.color}`}>
                            {activeScenario.badgeLabel}
                        </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <Clock size={12} /> Échange en direct
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-4 flex items-center gap-2.5 bg-slate-100/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                            <Send size={15} />
                        </div>
                        <div className="overflow-hidden">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Émetteur</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">{activeScenario.origin.label}</span>
                        </div>
                    </div>

                    <div className="md:col-span-4 flex flex-col items-center justify-center text-center px-2">
                        <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-xs font-bold mb-0.5">
                            <ArrowRightLeft size={14} className="animate-pulse" />
                            <span>Flux d'informations</span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium leading-tight text-center italic">
                            "{activeScenario.text}"
                        </p>
                    </div>

                    <div className="md:col-span-4 flex items-center gap-2.5 bg-slate-100/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                            <Bell size={15} />
                        </div>
                        <div className="overflow-hidden">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Destinataire(s)</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                                {activeScenario.destinations.map(d => d.label).join(', ')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* THE SPATIAL NETWORK CANVAS GRID (TOP, RIGHT, BOTTOM, LEFT) */}
            <div className="relative min-h-[540px] sm:min-h-[600px] w-full bg-slate-200/60 dark:bg-slate-950/80 rounded-2xl border border-slate-300/80 dark:border-slate-800/80 p-4 sm:p-8 flex items-center justify-center overflow-hidden transition-colors duration-300">

                {/* SVG Animated Connection Lines linking spatial nodes */}
                <svg className="absolute inset-0 w-full h-full stroke-sky-500/40 dark:stroke-sky-400/25 pointer-events-none" fill="none">
                    <line x1="50%" y1="12%" x2="18%" y2="30%" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1="50%" y1="12%" x2="82%" y2="30%" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1="18%" y1="30%" x2="18%" y2="72%" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1="18%" y1="30%" x2="50%" y2="88%" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1="82%" y1="30%" x2="82%" y2="72%" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1="82%" y1="30%" x2="50%" y2="88%" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1="50%" y1="88%" x2="18%" y2="72%" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1="50%" y1="88%" x2="82%" y2="72%" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1="18%" y1="30%" x2="82%" y2="30%" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1="18%" y1="72%" x2="82%" y2="72%" strokeWidth="2" strokeDasharray="6 6" />
                </svg>

                {/* DYNAMIC TRAVELING PACKET ICONS ANIMATING FROM ORIGIN TO DESTINATIONS */}
                {activeScenario.destinations.map((dest, destIdx) => (
                    <motion.div
                        key={`${activeScenario.id}-${destIdx}`}
                        initial={{
                            left: activeScenario.origin.x,
                            top: activeScenario.origin.y,
                            scale: 0.3,
                            opacity: 0
                        }}
                        animate={{
                            left: [activeScenario.origin.x, dest.x],
                            top: [activeScenario.origin.y, dest.y],
                            scale: [0.5, 1.15, 1, 1, 0],
                            opacity: [0, 1, 1, 0.9, 0]
                        }}
                        transition={{
                            duration: 2.2,
                            ease: "easeInOut",
                            delay: destIdx * 0.15
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border shadow-2xl flex items-center gap-1 sm:gap-1.5 backdrop-blur-md ${activeScenario.color}`}
                    >
                        <ScenarioIcon size={12} className="animate-bounce shrink-0" />
                        <span className="text-[9px] sm:text-[10px] font-bold whitespace-nowrap">{activeScenario.badgeLabel}</span>
                    </motion.div>
                ))}

                {/* NODE 1: EN HAUT (TOP) -> Fondateur d'École (PDG) */}
                <motion.div
                    animate={{
                        y: activeScenario.origin === SPATIAL_POSITIONS.fondateur ? [0, -6, 0] : [0, -2, 0],
                        scale: activeScenario.origin === SPATIAL_POSITIONS.fondateur ? 1.04 : 1
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute top-2 left-1/2 -translate-x-1/2 z-20 w-44 sm:w-60 p-2 sm:p-2.5 bg-white/95 dark:bg-slate-900/95 border rounded-2xl shadow-xl backdrop-blur-md text-center transition-all ${activeScenario.origin === SPATIAL_POSITIONS.fondateur
                        ? 'border-purple-500 ring-2 sm:ring-4 ring-purple-500/30 shadow-purple-500/30'
                        : 'border-purple-300 dark:border-purple-500/40'
                        }`}
                >
                    <div className="flex items-center gap-2 justify-center mb-0.5 sm:mb-1">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                            <Briefcase size={14} className="sm:hidden" />
                            <Briefcase size={16} className="hidden sm:block" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white">Fondateur (PDG)</h4>
                        </div>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Directeur Fondateur & Stratégie</span>
                </motion.div>

                {/* NODE 2: À GAUCHE (LEFT-TOP) -> Direction & Administration */}
                <motion.div
                    animate={{
                        scale: activeScenario.origin === SPATIAL_POSITIONS.direction ? 1.04 : 1
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute top-[22%] left-1 sm:left-6 z-20 w-32 sm:w-52 p-1.5 sm:p-2.5 bg-white/95 dark:bg-slate-900/95 border rounded-2xl shadow-xl backdrop-blur-md transition-all ${activeScenario.origin === SPATIAL_POSITIONS.direction
                        ? 'border-sky-500 ring-2 sm:ring-4 ring-sky-500/30 shadow-sky-500/30'
                        : 'border-sky-300 dark:border-sky-500/40'
                        }`}
                >
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                            <Building size={13} className="sm:hidden" />
                            <Building size={15} className="hidden sm:block" />
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-[10px] sm:text-[11px] text-slate-900 dark:text-white truncate">Direction</h4>
                        </div>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Gestion & Inscriptions</span>
                </motion.div>

                {/* NODE 3: À GAUCHE (LEFT-BOTTOM) -> Élèves */}
                <motion.div
                    animate={{
                        scale: activeScenario.origin === SPATIAL_POSITIONS.eleves ? 1.04 : 1
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute bottom-12 sm:bottom-14 left-1 sm:left-6 z-20 w-32 sm:w-52 p-1.5 sm:p-2.5 bg-white/95 dark:bg-slate-900/95 border rounded-2xl shadow-xl backdrop-blur-md transition-all ${activeScenario.origin === SPATIAL_POSITIONS.eleves
                        ? 'border-emerald-500 ring-2 sm:ring-4 ring-emerald-500/30 shadow-emerald-500/30'
                        : 'border-emerald-300 dark:border-emerald-500/40'
                        }`}
                >
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
                            <Sparkles size={13} className="sm:hidden" />
                            <Sparkles size={15} className="hidden sm:block" />
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-[10px] sm:text-[11px] text-slate-900 dark:text-white truncate">Élèves</h4>
                        </div>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Devoirs & Plannings</span>
                </motion.div>

                {/* NODE 4: À DROITE (RIGHT-TOP) -> Enseignants */}
                <motion.div
                    animate={{
                        scale: activeScenario.origin === SPATIAL_POSITIONS.teachers ? 1.04 : 1
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute top-[22%] right-1 sm:right-6 z-20 w-32 sm:w-52 p-1.5 sm:p-2.5 bg-white/95 dark:bg-slate-900/95 border rounded-2xl shadow-xl backdrop-blur-md transition-all ${activeScenario.origin === SPATIAL_POSITIONS.teachers
                        ? 'border-amber-500 ring-2 sm:ring-4 ring-amber-500/30 shadow-amber-500/30'
                        : 'border-amber-300 dark:border-amber-500/40'
                        }`}
                >
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shrink-0">
                            <GraduationCap size={13} className="sm:hidden" />
                            <GraduationCap size={15} className="hidden sm:block" />
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-[10px] sm:text-[11px] text-slate-900 dark:text-white truncate">Enseignants</h4>
                        </div>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Notes & Appels</span>
                </motion.div>

                {/* NODE 5: À DROITE (RIGHT-BOTTOM) -> Parents */}
                <motion.div
                    animate={{
                        scale: activeScenario.origin === SPATIAL_POSITIONS.parents ? 1.04 : 1
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute bottom-12 sm:bottom-14 right-1 sm:right-6 z-20 w-32 sm:w-52 p-1.5 sm:p-2.5 bg-white/95 dark:bg-slate-900/95 border rounded-2xl shadow-xl backdrop-blur-md transition-all ${activeScenario.origin === SPATIAL_POSITIONS.parents
                        ? 'border-rose-500 ring-2 sm:ring-4 ring-rose-500/30 shadow-rose-500/30'
                        : 'border-rose-300 dark:border-rose-500/40'
                        }`}
                >
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shrink-0">
                            <Users size={13} className="sm:hidden" />
                            <Users size={15} className="hidden sm:block" />
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-[10px] sm:text-[11px] text-slate-900 dark:text-white truncate">Parents</h4>
                        </div>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Notifications SMS</span>
                </motion.div>

                {/* NODE 6: EN BAS (BOTTOM) -> Provisorat */}
                <motion.div
                    animate={{
                        y: activeScenario.origin === SPATIAL_POSITIONS.provisorat ? [0, 6, 0] : [0, 2, 0],
                        scale: activeScenario.origin === SPATIAL_POSITIONS.provisorat ? 1.04 : 1
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-20 w-44 sm:w-60 p-2 sm:p-2.5 bg-white/95 dark:bg-slate-900/95 border rounded-2xl shadow-xl backdrop-blur-md text-center transition-all ${activeScenario.origin === SPATIAL_POSITIONS.provisorat
                        ? 'border-indigo-500 ring-2 sm:ring-4 ring-indigo-500/30 shadow-indigo-500/30'
                        : 'border-indigo-300 dark:border-indigo-500/40'
                        }`}
                >
                    <div className="flex items-center gap-2 justify-center mb-0.5 sm:mb-1">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-sky-700 text-white flex items-center justify-center shadow-md shrink-0">
                            <ShieldCheck size={14} className="sm:hidden" />
                            <ShieldCheck size={16} className="hidden sm:block" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white">Provisorat</h4>
                        </div>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Discipline & Absences</span>
                </motion.div>

                {/* CENTER REAL-TIME SYNERGY CORE BADGE */}
                <div className="z-10 p-2.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-sky-400/50 dark:border-sky-500/40 shadow-2xl text-center max-w-[140px] sm:max-w-xs backdrop-blur-xl transition-colors duration-300">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-xl bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center animate-pulse">
                        <Activity size={16} className="sm:hidden" />
                        <Activity size={22} className="hidden sm:block" />
                    </div>
                    <h5 className="font-bold text-[10px] sm:text-xs text-slate-900 dark:text-white mb-0.5">Synergie Temps Réel</h5>
                    <p className="text-[8px] sm:text-[10px] text-slate-600 dark:text-slate-400 font-normal leading-tight">
                        📢 Annonces • 🔔 Notifications • 💬 Messages
                    </p>
                </div>

            </div>
        </motion.div>
    );
};

const Home: React.FC = () => {
    const { isDark } = useTheme();
    const { user, isAuthenticated } = useAuth();
    const [copiedDeb, setCopiedDeb] = useState(false);

    const handleCopyDebCommand = () => {
        navigator.clipboard.writeText('sudo dpkg -i academia-connect_1.0.0_amd64.deb');
        setCopiedDeb(true);
        setTimeout(() => setCopiedDeb(false), 2000);
    };

    const isPdg = isAuthenticated && user?.role?.toString().toUpperCase() === 'PDG';

    const primaryCta = (() => {
        if (isAuthenticated) {
            if (isPdg) {
                return {
                    to: ROUTES.DASHBOARD.PDG.SCHOOLS,
                    text: 'Gestion de mes établissements',
                    icon: <Building size={16} />
                };
            }
            return {
                to: '/dashboard',
                text: 'Accéder à mon tableau de bord',
                icon: <LayoutDashboard size={16} />
            };
        }
        return {
            to: ROUTES.REGISTER,
            text: 'Créer mon école (Administration)',
            icon: <ArrowRight size={16} />
        };
    })();

    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
            {/* HERO SECTION */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 pt-16 md:pt-20 pb-12">
                {/* Elegant Hero Background Logo Watermark */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
                    <img
                        src={logoImg}
                        alt=""
                        className="absolute -top-16 -right-16 md:-top-24 md:-right-24 w-[500px] sm:w-[700px] lg:w-[850px] opacity-[0.045] dark:opacity-[0.075] grayscale dark:brightness-150 rotate-12 blur-[0.5px] pointer-events-none transition-opacity duration-500"
                    />
                    <img
                        src={logoImg}
                        alt=""
                        className="absolute -bottom-20 -left-20 w-[450px] sm:w-[650px] opacity-[0.03] dark:opacity-[0.055] grayscale dark:brightness-150 -rotate-12 blur-[0.5px] pointer-events-none transition-opacity duration-500"
                    />
                </div>

                {/* Decorative background glow elements */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-400/15 dark:bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-400/10 dark:bg-sky-600/10 blur-[110px] rounded-full pointer-events-none" />
                <div className="absolute top-10 left-10 w-[250px] h-[250px] bg-indigo-400/10 dark:bg-indigo-600/10 blur-[90px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                        {/* Left Column: Hero Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="lg:col-span-7 flex flex-col items-start"
                        >
                            {/* Main Heading */}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-[1.18] tracking-tight mb-5">
                                Digitalisez la passion d'apprendre avec{' '}
                                <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 dark:from-sky-300 dark:via-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                                    Academia Connect
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-normal max-w-2xl">
                                Une solution complète, intuitive et sécurisée qui relie l'administration, les enseignants, les élèves et les parents pour garantir le succès éducatif au quotidien.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
                                <Link
                                    to={primaryCta.to}
                                    className="px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {primaryCta.text}
                                    {primaryCta.icon}
                                </Link>
                                <Link
                                    to="/support"
                                    className="px-6 py-3 bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 font-medium text-sm rounded-xl backdrop-blur-md transition-all duration-200 text-center hover:shadow-sm hover:-translate-y-0.5"
                                >
                                    Découvrir la plateforme
                                </Link>
                            </div>

                            {/* Quick Feature Highlights */}
                            <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-3 gap-5 w-full max-w-md">
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">100%</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Digitalisé & Cloud</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">24/7</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Accès Multi-supports</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">IA</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">Emploi du temps intelligent</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Glassmorphic Visual Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                            className="lg:col-span-5 flex justify-center relative mt-6 lg:mt-0"
                        >
                            <div className="relative w-full max-w-xs sm:max-w-sm">
                                {/* Glass Card Container */}
                                <div className="p-4 sm:p-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 rounded-2xl shadow-xl shadow-sky-500/5 dark:shadow-black/40 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-sky-400/15 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                                    <div className="relative z-10 flex flex-col items-center text-center p-1 sm:p-3">
                                        <div className="w-20 h-20 sm:w-28 sm:h-28 mb-3 sm:mb-5 p-2 sm:p-2.5 bg-sky-500/10 dark:bg-white rounded-2xl border border-sky-200/50 dark:border-white shadow-sm flex items-center justify-center shrink-0">
                                            <img
                                                src={logoImg}
                                                alt="Logo Academia Connect"
                                                className="w-full h-full object-contain rounded-xl"
                                            />
                                        </div>

                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
                                            Gestion scolaire intelligente
                                        </h3>
                                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-4 sm:mb-5 leading-relaxed">
                                            Centralisez les paiements, les absences, le cahier de texte, les suivis, les communications et les notes dans une interface intuitive.
                                        </p>

                                        {/* Status items */}
                                        <div className="w-full space-y-1.5 sm:space-y-2">
                                            <div className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 rounded-xl text-[11px] sm:text-xs font-normal">
                                                <span className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-300">
                                                    <CheckCircle2 size={13} className="text-sky-500 shrink-0" />
                                                    Espace Fondateur, Direction et Provisorat
                                                </span>
                                                <span className="px-1.5 sm:px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded font-medium text-[9px] sm:text-[10px]">En ligne</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 rounded-xl text-[11px] sm:text-xs font-normal">
                                                <span className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-300">
                                                    <CheckCircle2 size={13} className="text-sky-500 shrink-0" />
                                                    Espace Secrétariat et Enseignants
                                                </span>
                                                <span className="px-1.5 sm:px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded font-medium text-[9px] sm:text-[10px]">En ligne</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 sm:p-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 rounded-xl text-[11px] sm:text-xs font-normal">
                                                <span className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-slate-300">
                                                    <CheckCircle2 size={13} className="text-sky-500 shrink-0" />
                                                    Portail Parents, Élèves et l'Appli Mobile
                                                </span>
                                                <span className="px-1.5 sm:px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded font-medium text-[9px] sm:text-[10px]">Temps réel</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* ECOSYSTEM SECTION - PROFILES */}
            <section className="py-16 md:py-24 bg-white dark:bg-slate-900 relative transition-colors duration-300 border-t border-slate-200/60 dark:border-slate-800/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Section Header */}
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-sky-100/70 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded-md text-xs font-medium mb-3">
                            Écosystème éducatif
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                            Un espace conçu pour chaque intervenant
                        </h2>
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-normal">
                            Des fonctionnalités adaptées à votre rôle au sein de l'établissement scolaire.
                        </p>
                    </div>

                    {/* Profiles Flex/Grid Centered Layout */}
                    <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">

                        {/* PDG Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="w-full sm:max-w-md md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/70 p-5 sm:p-6 rounded-xl hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 group flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-11 h-11 bg-sky-500/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                                    <Briefcase size={22} />
                                </div>
                                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">Supervision & audit</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-2">Le profil PDG (Fondateur)</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-5 font-normal">
                                    Gestion globale multi-écoles, pilotage financier stratégique et audit complet de vos établissements.
                                </p>
                            </div>
                            <ul className="space-y-2 pt-3.5 border-t border-slate-100 dark:border-slate-700/40 text-xs font-normal text-slate-700 dark:text-slate-300">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-sky-500 shrink-0" />
                                    Gestion multi-établissements
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-sky-500 shrink-0" />
                                    Tableaux de bord financiers & statistiques
                                </li>
                            </ul>
                            {isPdg && (
                                <Link
                                    to={ROUTES.DASHBOARD.PDG.SCHOOLS}
                                    className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-medium text-xs rounded-lg border border-sky-400/30 transition-colors"
                                >
                                    Gérer mes établissements
                                    <ArrowRight size={14} />
                                </Link>
                            )}
                        </motion.div>

                        {/* Direction Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.25, delay: 0.08 }}
                            className="w-full sm:max-w-md md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/70 p-5 sm:p-6 rounded-xl hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 group flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-11 h-11 bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                    <Building size={22} />
                                </div>
                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Pilotage académique</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-2">Direction & Provisauriat</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-5 font-normal">
                                    Configuration des cycles et classes, gestion des enseignants, des élèves et génération d'emplois du temps optimisés.
                                </p>
                            </div>
                            <ul className="space-y-2 pt-3.5 border-t border-slate-100 dark:border-slate-700/40 text-xs font-normal text-slate-700 dark:text-slate-300">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-indigo-500 shrink-0" />
                                    Emplois du temps intelligents
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-indigo-500 shrink-0" />
                                    Gestion des enseignants & classes
                                </li>
                            </ul>
                        </motion.div>

                        {/* Secrétariat Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.25, delay: 0.16 }}
                            className="w-full sm:max-w-md md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/70 p-5 sm:p-6 rounded-xl hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 group flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-11 h-11 bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                    <FileText size={22} />
                                </div>
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Gestion administrative</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-2">Secrétariat</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-5 font-normal">
                                    Fluidifiez les admissions, gérez les dossiers d'élèves et éditez automatiquement certificats et bulletins.
                                </p>
                            </div>
                            <ul className="space-y-2 pt-3.5 border-t border-slate-100 dark:border-slate-700/40 text-xs font-normal text-slate-700 dark:text-slate-300">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                    Inscriptions fluides
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                    Génération instantanée de documents PDF
                                </li>
                            </ul>
                        </motion.div>

                        {/* Enseignant Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="w-full sm:max-w-md md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/70 p-5 sm:p-6 rounded-xl hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 group flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-11 h-11 bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                                    <GraduationCap size={22} />
                                </div>
                                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Espace pédagogique</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-2">Enseignants</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-5 font-normal">
                                    Saisie rapide des notes, appel numérique en un clic, cahier de texte électronique et partage de devoirs.
                                </p>
                            </div>
                            <ul className="space-y-2 pt-3.5 border-t border-slate-100 dark:border-slate-700/40 text-xs font-normal text-slate-700 dark:text-slate-300">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-amber-500 shrink-0" />
                                    Carnet de notes & évaluations faciles
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-amber-500 shrink-0" />
                                    Cahier de texte numérique
                                </li>
                            </ul>
                        </motion.div>

                        {/* Parent & Élève Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.25, delay: 0.08 }}
                            className="w-full sm:max-w-md md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/70 p-5 sm:p-6 rounded-xl hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 group flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-11 h-11 bg-purple-500/10 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                    <Users size={22} />
                                </div>
                                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Suivi famille</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-2">Parents & élèves</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-5 font-normal">
                                    Consultation des résultats, présences et devoirs en temps réel via l'application mobile et suivi financier.
                                </p>
                            </div>
                            <ul className="space-y-2 pt-3.5 border-t border-slate-100 dark:border-slate-700/40 text-xs font-normal text-slate-700 dark:text-slate-300">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-purple-500 shrink-0" />
                                    Notifications mobile instantanées
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 size={13} className="text-purple-500 shrink-0" />
                                    Transparence de la scolarité
                                </li>
                            </ul>
                        </motion.div>

                    </div>

                    {/* REAL-TIME ACADEMIC ECOSYSTEM INTERCONNECTED FLOW ANIMATION */}
                    <RealtimeAcademicEcosystem />
                </div>
            </section>

            {/* PERFORMANCE & SECURITY SECTION */}
            <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative border-t border-slate-200/60 dark:border-slate-800/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

                        {/* Left Column: Interactive Image & Floating Glass Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -25 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-6"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="relative group rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/15"
                            >
                                <img src={featPerf} alt="Performance et sécurité" className="w-full object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />

                                {/* Floating Badge */}
                                <motion.div
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute bottom-4 left-4 right-4 p-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/50 dark:border-slate-700/50 shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Protection des données scolaires</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Stockage sécurisé et accès chiffré de bout en bout.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Right Column: Features & Animated Feature Cards */}
                        <motion.div
                            initial={{ opacity: 0, x: 25 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-6 space-y-5"
                        >
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-sky-100/70 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded-md text-xs font-medium">
                                Haute rigueur technique
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                                Sécurité, rapidité & disponibilité garanties
                            </h2>
                            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                Déployée sur des serveurs sécurisés avec une architecture résiliente, l'application reste accessible 24/7 sur tous vos appareils.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

                                {/* Card 1: Chiffrement */}
                                <motion.div
                                    whileHover={{ y: -6, scale: 1.03 }}
                                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                                    className="p-4.5 bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-400 rounded-xl shadow-sm hover:shadow-xl hover:shadow-sky-500/15 transition-all duration-300 group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="p-2 bg-sky-500/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400 rounded-lg w-fit mb-3 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                            Chiffrement bancaire
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Protection des échanges et des données d'établissement.
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Card 2: Disponibilité */}
                                <motion.div
                                    whileHover={{ y: -6, scale: 1.03 }}
                                    transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.05 }}
                                    className="p-4.5 bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-400 rounded-xl shadow-sm hover:shadow-xl hover:shadow-amber-500/15 transition-all duration-300 group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="p-2 bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 rounded-lg w-fit mb-3 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                                            <Zap size={20} />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                            99.9% de disponibilité
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Chargement instantané et continu des données.
                                        </p>
                                    </div>
                                </motion.div>

                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* KEY STATS SECTION */}
            <section className="py-14 md:py-16 bg-slate-50/60 dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-40 bg-sky-500/10 blur-[110px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">

                        {/* Stat 1: Sécurité */}
                        <motion.div
                            initial={{ opacity: 0, y: 25, scale: 0.92 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, scale: 1.04 }}
                            transition={{ type: "spring", stiffness: 350, damping: 22 }}
                            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-sky-500/20 hover:border-sky-400 dark:hover:border-sky-400 flex flex-col items-center text-center group transition-all duration-300"
                        >
                            <div className="w-11 h-11 bg-sky-500/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-sky-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-sky-500/30 transition-all duration-300">
                                <ShieldCheck size={22} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-300 dark:to-sky-400 bg-clip-text text-transparent mb-1 transition-transform duration-300 group-hover:scale-105">
                                <AnimatedCounter to={100} suffix="%" />
                            </h3>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Sécurité des données</p>
                        </motion.div>

                        {/* Stat 2: Abonnés */}
                        <motion.div
                            initial={{ opacity: 0, y: 25, scale: 0.92 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, scale: 1.04 }}
                            transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.08 }}
                            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-sky-500/20 hover:border-sky-400 dark:hover:border-sky-400 flex flex-col items-center text-center group transition-all duration-300"
                        >
                            <div className="w-11 h-11 bg-sky-500/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-sky-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-sky-500/30 transition-all duration-300">
                                <Mail size={22} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-300 dark:to-sky-400 bg-clip-text text-transparent mb-1 transition-transform duration-300 group-hover:scale-105">
                                <AnimatedCounter to={15} suffix="K+" />
                            </h3>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Abonnés actifs</p>
                        </motion.div>

                        {/* Stat 3: Utilisateurs */}
                        <motion.div
                            initial={{ opacity: 0, y: 25, scale: 0.92 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, scale: 1.04 }}
                            transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.16 }}
                            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-sky-500/20 hover:border-sky-400 dark:hover:border-sky-400 flex flex-col items-center text-center group transition-all duration-300"
                        >
                            <div className="w-11 h-11 bg-sky-500/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-sky-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-sky-500/30 transition-all duration-300">
                                <Users size={22} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-300 dark:to-sky-400 bg-clip-text text-transparent mb-1 transition-transform duration-300 group-hover:scale-105">
                                <AnimatedCounter to={50} suffix="K+" />
                            </h3>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Utilisateurs quotidiens</p>
                        </motion.div>

                        {/* Stat 4: Écoles partenaires */}
                        <motion.div
                            initial={{ opacity: 0, y: 25, scale: 0.92 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, scale: 1.04 }}
                            transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.24 }}
                            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-sky-500/20 hover:border-sky-400 dark:hover:border-sky-400 flex flex-col items-center text-center group transition-all duration-300"
                        >
                            <div className="w-11 h-11 bg-sky-500/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-sky-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-sky-500/30 transition-all duration-300">
                                <Building size={22} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-300 dark:to-sky-400 bg-clip-text text-transparent mb-1 transition-transform duration-300 group-hover:scale-105">
                                <AnimatedCounter to={120} />
                            </h3>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Écoles partenaires</p>
                        </motion.div>

                        {/* Stat 5: Établissements */}
                        <motion.div
                            initial={{ opacity: 0, y: 25, scale: 0.92 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, scale: 1.04 }}
                            transition={{ type: "spring", stiffness: 350, damping: 22, delay: 0.32 }}
                            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-sky-500/20 hover:border-sky-400 dark:hover:border-sky-400 flex flex-col items-center text-center group transition-all duration-300 col-span-2 md:col-span-1"
                        >
                            <div className="w-11 h-11 bg-sky-500/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-sky-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-sky-500/30 transition-all duration-300">
                                <GraduationCap size={20} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-300 dark:to-sky-400 bg-clip-text text-transparent mb-1">
                                <AnimatedCounter to={450} />
                            </h3>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Établissements</p>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* DOWNLOAD SECTION */}
            <section className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800 transition-colors duration-300" id="download">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                    <div className="max-w-2xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-sky-100/70 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded-md text-xs font-medium mb-3">
                            Applications multi-plateformes
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                            Téléchargez Academia Connect
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-normal">
                            Une suite complète disponible sur tous vos systèmes d'exploitation et appareils mobiles.
                        </p>
                    </div>

                    {/* 4-OS Uniform Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">

                        {/* Windows Card */}
                        <motion.div
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-xl shadow-sm hover:shadow-xl hover:shadow-sky-500/10 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-400 flex flex-col justify-between text-left transition-all duration-300 group"
                        >
                            <div>
                                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                                    <svg viewBox="0 0 23 23" className="w-6 h-6 shrink-0">
                                        <path fill="#f25022" d="M1 1h10v10H1z" />
                                        <path fill="#7fba00" d="M12 1h10v10H1z" />
                                        <path fill="#00a4ef" d="M1 12h10v10H1z" />
                                        <path fill="#ffb900" d="M12 12h10v10H1z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Windows</span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 mb-1.5">Version Bureau (.exe)</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mb-5 leading-relaxed font-normal">
                                    Application optimale pour Windows 10 & 11 avec gestion hors-ligne et notifications.
                                </p>
                            </div>
                            <a
                                href="https://academia.nb-mind.com/downloads/Academia%20Connect%20Setup%201.0.0.exe"
                                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5"
                            >
                                Télécharger .exe
                                <Download size={14} />
                            </a>
                        </motion.div>

                        {/* Linux (Ubuntu) Card */}
                        <motion.div
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.25, delay: 0.08 }}
                            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-xl shadow-sm hover:shadow-xl hover:shadow-sky-500/10 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-400 flex flex-col justify-between text-left transition-all duration-300 group"
                        >
                            <div>
                                <div className="p-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform flex items-center justify-center">
                                    {/* Tux Penguin Mascot Logo */}
                                    <svg viewBox="0 0 128 128" className="w-7 h-7 shrink-0">
                                        {/* Yellow Feet */}
                                        <path fill="#FFC107" d="M18 102c-8 6-12 14-8 18 4 4 18 0 28-8 8-6 12-14 8-18-4-4-18 0-28 8zm92 0c8 6 12 14 8 18-4 4-18 0-28-8-8-6-12-14-8-18 4-4 18 0 28 8z" />
                                        <path fill="#FFA000" d="M22 104c-6 5-9 11-6 14 3 3 14 0 22-6 6-5 9-11 6-14-3-3-14 0-22 6zm84 0c6 5 9 11 6 14-3 3-14 0-22-6-6-5-9-11-6-14 3-3 14 0 22 6z" />
                                        {/* Black Body */}
                                        <path fill="#1E1E24" d="M64 8c-18 0-28 16-28 34 0 10 4 18 4 28-8 10-14 22-14 34 0 12 14 18 38 18s38-6 38-18c0-12-6-24-14-34 0-10 4-18 4-28 0-18-10-34-28-34z" />
                                        {/* White Belly */}
                                        <ellipse cx="64" cy="80" rx="24" ry="32" fill="#FFFFFF" />
                                        {/* White Eye Sockets */}
                                        <ellipse cx="56" cy="32" rx="6" ry="8" fill="#FFFFFF" />
                                        <ellipse cx="72" cy="32" rx="6" ry="8" fill="#FFFFFF" />
                                        {/* Pupils */}
                                        <ellipse cx="57" cy="33" rx="3" ry="4" fill="#000000" />
                                        <ellipse cx="71" cy="33" rx="3" ry="4" fill="#000000" />
                                        <circle cx="58" cy="32" r="1" fill="#FFFFFF" />
                                        <circle cx="72" cy="32" r="1" fill="#FFFFFF" />
                                        {/* Beak */}
                                        <path fill="#FFC107" d="M50 42c0 0 14 12 28 0 0 8-14 14-28 0z" />
                                        <path fill="#FFA000" d="M52 42c0 0 12 8 24 0 0 5-12 9-24 0z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Linux (Debian/Ubuntu)</span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 mb-1.5">Package Debian (.deb)</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mb-5 leading-relaxed font-normal">
                                    Package natif pour distributions Ubuntu, Debian et dérivées 64-bit.
                                </p>
                            </div>
                            <a
                                href="https://academia.nb-mind.com/downloads/academia-connect_1.0.0_amd64.deb"
                                className="w-full py-2.5 px-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5"
                            >
                                Télécharger .deb
                                <Download size={14} />
                            </a>
                        </motion.div>

                        {/* Android Mobile Card */}
                        <motion.div
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.25, delay: 0.16 }}
                            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-xl shadow-sm hover:shadow-xl hover:shadow-sky-500/10 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 flex flex-col justify-between text-left transition-all duration-300 group"
                        >
                            <div>
                                <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                                    <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0 fill-[#3DDC84]">
                                        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997zm11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1521-.5676.416.416 0 0 0-.5676.1521l-2.0223 3.503C15.5902 8.2408 13.8533 7.828 12 7.828s-3.5902.4128-5.1368 1.1217L4.8409 5.4467a.416.416 0 0 0-.5676-.1521.416.416 0 0 0-.1521.5676l1.9973 3.4592C2.6889 11.1867.3438 14.3414.3438 18.0163h23.3124c0-3.6749-2.3451-6.8296-5.7767-8.6949z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Android</span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 mb-1.5">Application APK (v1.0.2)</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mb-5 leading-relaxed font-normal">
                                    Suivi des notes, absences et notifications push en temps réel.
                                </p>
                            </div>
                            <a
                                href={`https://academia.nb-mind.com/downloads/${import.meta.env.VITE_APK_FILENAME || 'academia-connect_v1.0.2.apk'}`}
                                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:-translate-y-0.5"
                            >
                                Télécharger .apk
                                <Download size={14} />
                            </a>
                        </motion.div>

                        {/* iOS (Apple) Card */}
                        <motion.div
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.25, delay: 0.24 }}
                            className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-xl shadow-sm hover:shadow-xl hover:shadow-sky-500/10 border border-slate-200 dark:border-slate-800 flex flex-col justify-between text-left transition-all duration-300 group"
                        >
                            <div>
                                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                                    <svg viewBox="0 0 170 170" className="w-6 h-6 shrink-0 fill-slate-900 dark:fill-white">
                                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.33.13-9.13-1.9-14.4-6.08-3.48-2.81-7.39-7.5-11.75-14.07-6.02-9.05-10.87-19.26-14.54-30.64-3.67-11.39-5.51-22.18-5.51-32.38 0-14.28 3.73-25.99 11.19-35.13 7.46-9.13 16.73-13.78 27.81-13.95 4.88 0 10.12 1.2 15.72 3.6 5.6 2.4 9.53 3.65 11.78 3.75 2.05 0 6.13-1.32 12.24-3.96 6.11-2.64 11.39-3.88 15.84-3.72 8.78.35 16.58 3.03 23.4 8.04 6.82 5.01 11.55 11.66 14.19 19.95-7.81 4.7-11.67 11.41-11.58 20.13.09 8.72 3.96 15.75 11.61 21.09 3.09 2.21 6.53 3.82 10.32 4.83-2.07 6.11-4.71 12.28-7.92 18.51zM119.22 31.09c0-6.49 2.37-12.59 7.11-18.3 4.74-5.71 10.74-9.33 18.01-10.87.61 7.23-1.74 13.9-7.05 20.01-5.31 6.11-11.4 9.6-18.07 10.47-.14-.44-.21-.88-.21-1.31z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">iOS Apple</span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 mb-1.5">App Store (iPhone)</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mb-5 leading-relaxed font-normal">
                                    En cours de révision et validation sur l'Apple App Store.
                                </p>
                            </div>
                            <span className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium text-xs rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 cursor-not-allowed">
                                Bientôt disponible
                            </span>
                        </motion.div>

                    </div>

                    {/* Installation Guide Details */}
                    <div className="mt-12 max-w-3xl mx-auto bg-white dark:bg-slate-900/80 backdrop-blur-md p-5 md:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-left">
                        <details className="group">
                            <summary className="flex justify-between items-center text-base font-bold text-slate-800 dark:text-slate-100 cursor-pointer list-none border-b border-slate-200/80 dark:border-slate-800 pb-3">
                                <span className="flex items-center gap-2">
                                    <Download size={18} className="text-sky-500" />
                                    Guide d'installation pas à pas
                                </span>
                                <ChevronDown size={18} className="text-slate-400 group-open:rotate-180 transition-transform duration-200" />
                            </summary>
                            <div className="space-y-4 mt-4 text-xs text-slate-600 dark:text-slate-300">
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
                                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 bg-sky-500 rounded-full" />
                                        Windows (.exe)
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Téléchargez l'installateur. Si Windows SmartScreen signale l'exécutable, cliquez sur <em>"Informations complémentaires"</em> puis sur <em>"Exécuter quand même"</em>.
                                    </p>
                                </div>

                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
                                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                                        Linux Ubuntu / Debian (.deb)
                                    </h4>
                                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                                        <li>Téléchargez d'abord le fichier <code>.deb</code> ci-dessus.</li>
                                        <li>Ouvrez votre terminal dans le dossier où se trouve le fichier téléchargé (ex : <code>cd ~/Téléchargements</code>).</li>
                                        <li>Lancez la commande d'installation suivante :</li>
                                    </ol>
                                    <div className="relative group">
                                        <code className="block p-3 pr-24 bg-slate-950 text-sky-300 rounded-xl text-[11px] font-mono select-all border border-slate-800">
                                            sudo dpkg -i academia-connect_1.0.0_amd64.deb
                                        </code>
                                        <button
                                            type="button"
                                            onClick={handleCopyDebCommand}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-medium text-[11px] rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 shadow-sm"
                                        >
                                            {copiedDeb ? (
                                                <>
                                                    <Check size={12} className="text-emerald-400" />
                                                    <span className="text-emerald-400">Copié !</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} />
                                                    <span>Copier</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
                                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        Android (.apk)
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Téléchargez l'APK sur votre téléphone. Lors de l'installation, autorisez les <em>"Sources inconnues"</em> dans les paramètres de sécurité si demandé par votre système.
                                    </p>
                                </div>
                            </div>
                        </details>
                    </div>

                </div>
            </section>

            {/* FOOTER */}
            <div className="mt-auto w-full">
                <Footer />
            </div>
        </div>
    );
};

export default Home;
