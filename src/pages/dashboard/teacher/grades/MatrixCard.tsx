import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MatrixCardProps {
    label: string;
    value: string;
    trend: string;
    icon: LucideIcon;
    color: string;
}

const MatrixCard: React.FC<MatrixCardProps> = ({ label, value, trend, icon: Icon, color }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{value}</h4>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {trend}
                </span>
            </div>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
            <Icon size={22} />
        </div>
    </div>
);

export default MatrixCard;
