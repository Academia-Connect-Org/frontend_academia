import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: string;
    title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role, title }) => {
    const location = useLocation();
    const isMessagesPage = location.pathname.includes('/messages');
    const isReceiptConfigPage = location.pathname.includes('/receipt-config');
    const isAcademicYearClosePage = location.pathname.includes('/close');
    const isImmersivePage = isMessagesPage || isReceiptConfigPage || isAcademicYearClosePage;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved === 'true';
    });
    const [topbarVisible, setTopbarVisible] = useState(() => !isImmersivePage);
    const [sidebarHidden, setSidebarHidden] = useState(false);

    const handleSetCollapsed = (val: boolean) => {
        setCollapsed(val);
        localStorage.setItem('sidebar-collapsed', val.toString());
    };

    // Auto-collapse sidebar & hide topbar when navigating to immersive routes (Messages, Receipt Studio, Academic Year Close)
    useEffect(() => {
        if (isImmersivePage) {
            setTopbarVisible(false);
            setCollapsed(true);
        } else {
            setTopbarVisible(true);
            setSidebarHidden(false);
        }
    }, [location.pathname, isImmersivePage]);

    return (
        <div className={`flex bg-slate-50 dark:bg-slate-950 transition-colors ${isMessagesPage ? 'h-screen overflow-hidden' : 'min-h-screen'
            }`}>
            {/* Sidebar */}
            {!sidebarHidden && (
                <Sidebar
                    role={role}
                    collapsed={collapsed}
                    setCollapsed={handleSetCollapsed}
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                />
            )}

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 ${isMessagesPage ? 'h-full overflow-hidden' : 'min-h-screen'
                }`}>
                {/* Topbar with Slide Animation (Sticky Header) */}
                <AnimatePresence mode="wait">
                    {topbarVisible && (
                        <motion.div
                            key="topbar"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="sticky top-0 z-30 shrink-0"
                        >
                            <Topbar
                                role={role}
                                title={title}
                                onMenuClick={() => setMobileOpen(true)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Animated Control Bar for Immersive Pages (Messages, Receipt Studio & Academic Year Closure) */}
                {isImmersivePage && (
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="px-3.5 py-2 bg-blue-50/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-md border-b border-blue-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs shrink-0 z-20 transition-colors shadow-xs"
                    >
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400"></span>
                            </span>
                            <span className="font-bold text-[11px] text-blue-950 dark:text-blue-100 hidden sm:inline-flex items-center gap-1.5">
                                {isReceiptConfigPage
                                    ? "Mode Studio Reçu Immersif (Style Word / LibreOffice)"
                                    : isAcademicYearClosePage
                                        ? "Mode Clôture d'Année Immersif (Espace Maximisé)"
                                        : "Mode Messagerie Immersif"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Sidebar toggle button */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    if (sidebarHidden) {
                                        setSidebarHidden(false);
                                        setCollapsed(false);
                                    } else if (collapsed) {
                                        setCollapsed(false);
                                    } else {
                                        setCollapsed(true);
                                    }
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-blue-100/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all border border-blue-200/80 dark:border-slate-700 shadow-xs cursor-pointer"
                                title="Afficher ou masquer le menu latéral"
                            >
                                {collapsed || sidebarHidden ? <PanelLeftOpen size={13} className="text-blue-600 dark:text-blue-400" /> : <PanelLeftClose size={13} className="text-amber-600 dark:text-amber-400" />}
                                <span>{sidebarHidden ? "Voir Menu" : collapsed ? "Menu Rétracté" : "Menu Étendu"}</span>
                            </motion.button>

                            {/* Topbar toggle button */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setTopbarVisible(!topbarVisible)}
                                className="px-2.5 py-1 bg-white hover:bg-blue-100/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all border border-blue-200/80 dark:border-slate-700 shadow-xs cursor-pointer"
                                title="Afficher ou masquer la barre supérieure"
                            >
                                {topbarVisible ? <ChevronUp size={13} className="text-emerald-600 dark:text-emerald-400" /> : <ChevronDown size={13} className="text-emerald-600 dark:text-emerald-400" />}
                                <span>{topbarVisible ? "Masquer Topbar" : "Voir Topbar"}</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                <main className={`flex-1 min-h-0 ${isReceiptConfigPage ? 'p-2 sm:p-3 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100' : isMessagesPage ? 'p-2 sm:p-3 overflow-hidden flex flex-col' : isAcademicYearClosePage ? 'p-2 sm:p-4 overflow-y-auto flex flex-col' : 'p-6 md:p-8 lg:p-10'}`}>
                    <div className={isImmersivePage ? 'h-full w-full flex-1 flex flex-col min-h-0' : 'min-h-full'}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
