import React from 'react';
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
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            onClick={() => {
                if (isSelectable && onSelect) onSelect();
            }}
            className={`relative p-6 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col w-full flex-1 min-w-[300px] max-w-sm ${
                isSelectable ? 'cursor-pointer' : ''
            } ${
                isFeatured 
                ? 'bg-white dark:bg-slate-900 border-2 border-sky-500 dark:border-sky-400 shadow-xl shadow-sky-500/10 z-10' 
                : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-md hover:border-sky-300 dark:hover:border-sky-700'
            } ${
                isSelected ? 'ring-4 ring-sky-500/20 bg-sky-50/20 dark:bg-sky-950/30' : ''
            }`}
        >
            <div className="absolute -top-3.5 w-full flex justify-between px-4 left-0 pointer-events-none">
                {isFeatured ? (
                    <div className="px-4 py-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[11px] font-semibold tracking-wide uppercase shadow-md flex items-center gap-1.5 w-max rounded-full">
                        <Crown size={13} /> {highlight || "Recommandé"}
                    </div>
                ) : <div />}
                
                {forcedPeriod !== null && forcedPeriod !== undefined && (
                    <div className="px-3 py-1 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-semibold tracking-wider uppercase flex items-center w-max rounded-full border border-red-200/50 dark:border-red-900/50">
                        {forcedPeriod ? "Annuel Uniq." : "Mensuel Uniq."}
                    </div>
                )}
            </div>

            {isSelected && !isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold tracking-wide uppercase shadow-md flex items-center gap-1.5 w-max rounded-full">
                    <CheckCircle size={13} className="text-sky-400" /> Sélectionné
                </div>
            )}

            <div className="mt-2 mb-6">
                {Icon && (
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                        isFeatured ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                        <Icon size={24} />
                    </div>
                )}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
                {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
            </div>
            
            <div className="flex items-baseline gap-1.5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{price}</span>
                <span className="text-xs font-medium text-slate-400">{duration}</span>
            </div>

            <div className="space-y-3 mb-8 flex-1">
                <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-2">Inclus dans la formule :</p>
                {features?.map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={11} strokeWidth={3} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">{f}</span>
                    </div>
                ))}
                {isPublic && missing?.map((m: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 opacity-40">
                        <div className="w-4 h-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <X size={11} strokeWidth={3} />
                        </div>
                        <span className="text-xs font-normal text-slate-400 italic line-through leading-snug">{m}</span>
                    </div>
                ))}
            </div>

            {isPublic && onButtonClick && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onButtonClick();
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all duration-200 shadow-md ${
                        isFeatured
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sky-500/20 active:scale-[0.98]'
                        : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98]'
                    }`}
                >
                    Choisir ce plan
                </button>
            )}
        </motion.div>
    );
};

export default SubscriptionPlanCard;
