import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: string;
    title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role, title }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved === 'true';
    });

    const handleSetCollapsed = (val: boolean) => {
        setCollapsed(val);
        localStorage.setItem('sidebar-collapsed', val.toString());
    };

    return (
        <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
            {/* Sidebar */}
            <Sidebar
                role={role}
                collapsed={collapsed}
                setCollapsed={handleSetCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar
                    role={role}
                    title={title}
                    onMenuClick={() => setMobileOpen(true)}
                />
                <main className="flex-1 p-6 md:p-8 lg:p-10">
                    <div className="min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
