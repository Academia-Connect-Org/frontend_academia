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
    <div className="bg-white p-8 ] shadow-lg   group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/5 relative overflow-hidden">
        <div className={`w-14 h-14 ${color} text-white  flex items-center justify-center mb-6 transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-xl shadow-slate-900/10`}>
            <Icon size={26} />
        </div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">{label}</p>
        <div className="flex items-end justify-between">
            <h4 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{value}</h4>
            <span className="px-2.5 py-1  text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400  ">
                {trend}
            </span>
        </div>
    </div>
);

export default MatrixCard;
