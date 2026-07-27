import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, CheckCircle, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export interface SubscriptionPlanCardProps {
    planType: string;
    title: string;
    description?: string;
    price: string | number;
    duration: string;
    icon?: React.ElementType;
    features: string[];
    missing: string[];
    isFeatured: boolean;
    highlight?: string;
    forcedPeriod?: boolean | null;
    
    // Configurable behavior
    mode?: 'public' | 'selectable';
    isSelected?: boolean;
    onSelect?: () => void;
    onButtonClick?: () => void;
}

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
    planType,
    title,
    description,
    price,
    duration,
    icon: Icon,
    features,
    missing,
    isFeatured,
    highlight,
    forcedPeriod,
    mode = 'public',
    isSelected = false,
    onSelect,
    onButtonClick
}) => {
    
    const isPublic = mode === 'public';
    const isSelectable = mode === 'selectable';

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={() => {
                if (isSelectable && onSelect) onSelect();
            }}
            className={`relative p-8 rounded-3xl transition-all duration-500 flex flex-col w-full flex-1 min-w-[320px] max-w-lg ${
                isSelectable ? 'cursor-pointer' : ''
            } ${
                isFeatured 
                ? 'bg-white shadow-2xl shadow-indigo-100 scale-105 z-10 border-2 border-indigo-500' 
                : 'bg-white/50 backdrop-blur-sm shadow-xl border-2 border-transparent hover:border-indigo-300'
            } ${
                isSelected ? 'ring-4 ring-indigo-600/20 bg-indigo-50/10' : ''
            }`}
        >
            <div className="absolute -top-4 w-full flex justify-between px-4 left-0">
                {isFeatured ? (
                    <div className="px-6 py-1.5 bg-indigo-600 text-white text-xs font-black tracking-widest uppercase shadow-lg flex items-center gap-2 w-max rounded-full">
                        <Crown size={14} /> {highlight || "Recommandé"}
                    </div>
                ) : <div></div>}
                
                {forcedPeriod !== null && forcedPeriod !== undefined && (
                    <div className="px-3 py-1.5 bg-red-100 text-red-600 text-[10px] font-black tracking-widest uppercase shadow-md flex items-center w-max rounded-full border border-red-200">
                        {forcedPeriod ? "Annuel Uniq." : "Mensuel Uniq."}
                    </div>
                )}
            </div>

            {isSelected && !isFeatured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-800 text-white text-xs font-black tracking-widest uppercase shadow-md flex items-center gap-2 w-max rounded-full">
                    <CheckCircle size={14} /> Sélectionné
                </div>
            )}

            <div className="mt-4 mb-8">
                {Icon && (
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isFeatured ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                        <Icon size={32} />
                    </div>
                )}
                <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">{title}</h3>
                {description && <p className="text-sm text-slate-500 font-medium h-10">{description}</p>}
            </div>
            
            <div className="flex items-baseline gap-1 mb-8 pb-8 border-b border-slate-100">
                <span className="text-4xl font-black text-slate-900">{price}</span>
                <span className="text-sm font-bold text-slate-400">{duration}</span>
            </div>

            <div className="space-y-4 mb-10 flex-1">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Inclus :</p>
                {features?.map((f: string, i: number) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-bold text-slate-600">{f}</span>
                    </div>
                ))}
                {isPublic && missing?.map((m: string, i: number) => (
                    <div key={i} className="flex gap-4 opacity-40">
                        <div className="w-5 h-5 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <X size={12} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-medium text-slate-400 italic line-through">{m}</span>
                    </div>
                ))}
            </div>

            {isPublic && onButtonClick && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onButtonClick();
                    }}
                    className={`w-full py-5 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                        isFeatured
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20'
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10'
                    }`}>
                    Sélectionner ce plan
                </button>
            )}
        </motion.div>
    );
};

export default SubscriptionPlanCard;
